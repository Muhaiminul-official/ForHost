import express from "express";
import BloodRequest from "../models/BloodRequest.ts";
import Notification from "../models/Notification.ts";
import User from "../models/User.ts";
import { verifyToken } from "../middleware/auth.ts";
import { checkEligibility } from "../utils/eligibility.ts";
import { sendPushNotification } from "../utils/firebaseAdmin.ts";

const router = express.Router();

// Get all requests
router.get("/", async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate("createdBy", "name email phone")
      .populate("acceptedBy", "name phone")
      .populate("donorResponses.donor", "name phone bloodGroup")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Create a new request
router.post("/", async (req, res) => {
  try {
    const { patientName, bloodGroup, hospitalName, contactNumber, division, district, upazila, requiredDate, message, createdBy } = req.body;
    
    const newRequest = new BloodRequest({
      patientName,
      bloodGroup,
      hospitalName,
      contactNumber,
      division,
      district,
      upazila,
      requiredDate,
      message,
      createdBy
    });

    await newRequest.save();
    
    // Populate createdBy before emitting so the frontend gets the full object
    await newRequest.populate("createdBy", "name email");
    
    const io = req.app.get("io");
    if (io) {
      io.emit("new-blood-request", newRequest);
    }

    // --- NEW: Broadcast Notification to users (filtering by blood group compatibility if wanted, but for now all users) ---
    try {
      // Find all users except the creator who have push subscriptions or need a notification doc
      const targetUsers = await User.find({ _id: { $ne: createdBy } });
      
      if (targetUsers.length > 0) {
        // 1. Create notification documents in bulk
        const notificationDocs = targetUsers.map(u => ({
          user: u._id,
          message: `Urgent! Blood request for ${bloodGroup} needed at ${hospitalName}, ${upazila}.`,
          type: 'NewRequest',
          link: `/request-blood?highlight=${newRequest._id}`,
          createdAt: new Date()
        }));
        
        const insertedNotifications = await Notification.insertMany(notificationDocs);
        
        // 2. Emit via Socket.IO to connected users
        const io = req.app.get("io");
        if (io) {
          insertedNotifications.forEach(notif => {
            io.to(notif.user.toString()).emit("notification", notif);
          });
        }
        
        // 3. Collect all FCM tokens and send ONE multicast push
        const allTokens = targetUsers.reduce((tokens: string[], user: any) => {
          if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
            return [...tokens, ...user.pushSubscriptions];
          }
          return tokens;
        }, []);

        if (allTokens.length > 0) {
          // We use a dummy user object for sendPushNotification to maintain compatibility
          // or we can update the utility to handle an array of tokens directly.
          // For now, let's just use the utility since it handles multicast internals.
          await sendPushNotification({
            pushSubscriptions: allTokens,
            save: async () => { /* No-op for bulk broadcast save for now */ }
          }, {
            title: 'Blood Link: New Urgent Request',
            message: `Urgent! ${bloodGroup} needed at ${hospitalName}, ${upazila}.`,
            link: `/request-blood?highlight=${newRequest._id}`
          });
        }
      }
    } catch (notifErr) {
      console.error("Failed to broadcast notifications:", notifErr);
    }
    
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Donor responds to a blood request
router.post("/:id/respond", verifyToken, async (req: any, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('donorResponses.donor', 'name phone bloodGroup');
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Active") {
      return res.status(400).json({ message: "Request is no longer active" });
    }

    if (request.createdBy._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot respond to your own request" });
    }

    const donorUser = await User.findById(req.user.id);
    if (!donorUser || !checkEligibility(donorUser)) {
      return res.status(400).json({ message: "You are not eligible to donate right now." });
    }

    const alreadyResponded = request.donorResponses.some((r: any) => r.donor._id.toString() === req.user.id || r.donor.toString() === req.user.id);
    if (alreadyResponded) {
      return res.status(400).json({ message: "You have already responded to this request" });
    }

    request.donorResponses.push({
      donor: req.user.id,
      status: "Pending",
      createdAt: new Date()
    });

    await request.save();
    await request.populate("donorResponses.donor", "name phone bloodGroup");

    // Send a notification to the creator
    const notification = new Notification({
      user: request.createdBy._id,
      message: `${req.user.name || 'A donor'} has offered to donate blood for ${request.patientName}! Review their response.`,
      type: 'DonorResponse',
      link: `/request-blood?highlight=${request._id}`
    });
    await notification.save();

    const io = req.app.get("io");
    if (io) {
      io.to(request.createdBy._id.toString()).emit("notification", notification);
      io.emit("blood-request-updated", request);
    }
    
    const creatorUserToPush = await User.findById(request.createdBy._id.toString());
    if (creatorUserToPush) {
      await sendPushNotification({
        pushSubscriptions: creatorUserToPush.pushSubscriptions,
        save: () => creatorUserToPush.save()
      }, {
        title: 'Blood Link: Donor Responded',
        message: `${req.user.name || 'A donor'} has offered to donate blood for ${request.patientName}! review their response.`,
        link: `/request-blood?highlight=${request._id}`
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Creator accepts or rejects a donor's response
router.put("/:id/responses/:donorId/status", verifyToken, async (req: any, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const request = await BloodRequest.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('acceptedBy', 'name phone')
      .populate('donorResponses.donor', 'name phone bloodGroup');

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the request creator can review responses" });
    }

    const responseIndex = request.donorResponses.findIndex((r: any) => 
      (r.donor && r.donor._id && r.donor._id.toString() === req.params.donorId) || 
      (r.donor && typeof r.donor === 'string' && r.donor === req.params.donorId) ||
      (r.donor && r.donor._id && typeof r.donor._id === 'string' && r.donor._id === req.params.donorId)
    );
    if (responseIndex === -1) {
      return res.status(404).json({ message: "Donor response not found" });
    }

    if (status === 'Accepted') {
      if (request.status === 'Accepted' && request.acceptedBy?._id?.toString() !== req.params.donorId && request.acceptedBy?.toString() !== req.params.donorId) {
        return res.status(400).json({ message: "Another donor is already accepted for this request" });
      }
      
      request.donorResponses[responseIndex].status = 'Accepted';
      request.status = 'Accepted';
      request.acceptedBy = request.donorResponses[responseIndex].donor._id || req.params.donorId;
    } else {
       // Rejected
       request.donorResponses[responseIndex].status = 'Rejected';
       // If rejecting a previously accepted donor (backing out), revert main status to Active
       if (request.acceptedBy?._id?.toString() === req.params.donorId || request.acceptedBy?.toString() === req.params.donorId) {
         request.status = 'Active';
         request.acceptedBy = undefined;
       }
    }

    await request.save();
    
    // Repopulate explicitly as assigning ID wipes populated document locally
    if (status === 'Accepted') {
      await request.populate('acceptedBy', 'name phone');
    }
    await request.populate('donorResponses.donor', 'name phone bloodGroup');

    // Send a notification to the assigned donor
    const notification = new Notification({
      user: req.params.donorId,
      message: `Your offer to donate blood for ${request.patientName} was ${status.toLowerCase()} by the requester.`,
      type: 'ResponseReviewed',
      link: `/request-blood?highlight=${request._id}`
    });
    await notification.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.donorId).emit("notification", notification);
      io.emit("blood-request-updated", request);
    }
    
    const donorUser = await User.findById(req.params.donorId);
    if (donorUser) {
      await sendPushNotification({ 
        pushSubscriptions: donorUser.pushSubscriptions, 
        save: () => donorUser.save() 
      }, {
        title: 'Blood Link: Offer ' + status,
        message: `Your offer to donate for ${request.patientName} was ${status.toLowerCase()}.`,
        link: `/request-blood?highlight=${request._id}`
      });
    }

    res.json(request);
  } catch (error) {
    console.error("Error confirming response:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Update request status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update request priority
router.put("/:id/priority", async (req, res) => {
  try {
    const { priority } = req.body;
    const request = await BloodRequest.findByIdAndUpdate(req.params.id, { priority }, { new: true });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete a request
router.delete("/:id", verifyToken, async (req: any, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('donorResponses.donor', '_id');
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    const dbUser = await User.findById(req.user.id);
    
    if (request.createdBy.toString() !== req.user.id && dbUser?.role !== 'Admin') {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }
    
    await BloodRequest.findByIdAndDelete(req.params.id);

    // Notify donors who responded
    const io = req.app.get("io");
    if (request.donorResponses && request.donorResponses.length > 0) {
      for (const response of request.donorResponses) {
        const donorId = response.donor._id?.toString() || response.donor.toString();
        
        const notification = new Notification({
          user: donorId,
          message: `The blood request for ${request.patientName} has been cancelled by the creator.`,
          type: 'RequestCancelled',
          link: '/request-blood'
        });
        await notification.save();
        
        if (io) {
          io.to(donorId).emit("notification", notification);
        }
        
        const donorUserForPush = await User.findById(donorId);
        if (donorUserForPush) {
          await sendPushNotification({ 
            pushSubscriptions: donorUserForPush.pushSubscriptions, 
            save: () => donorUserForPush.save() 
          }, {
            title: 'Blood Link: Request Cancelled',
            message: `The request for ${request.patientName} was cancelled.`,
            link: '/request-blood'
          });
        }
      }
    }
    
    if (io) {
      io.emit("blood-request-deleted", req.params.id);
    }
    
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
