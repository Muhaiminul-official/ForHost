import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blood-donation');
  const DirectRequest = (await import('./backend/models/DirectRequest.js')).default;
  const User = (await import('./backend/models/User.js')).default;
  
  const user = await User.findOne();
  if (!user) { console.log('No user'); process.exit(0); }
  
  const dr = new DirectRequest({
    requester: user._id,
    donor: user._id,
    contactInfo: '123',
    message: 'test'
  });
  await dr.save();
  console.log('Saved direct request');
  
  const requests = await DirectRequest.find({ donor: user._id })
        .populate('requester', 'name phone bloodGroup')
        .sort({ createdAt: -1 });
        
  console.log('Results:', requests);
  process.exit(0);
})();
