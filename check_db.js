import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://muhaiminulofficial_db_user:zdOJulp1MjWIe1Y4@cluster0.pjvoqti.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const Notification = mongoose.connection.collection('notifications');
  const User = mongoose.connection.collection('users');
  const Request = mongoose.connection.collection('bloodrequests');
  
  const notifs = await Notification.find({}).toArray();
  const users = await User.find({}).toArray();
  const reqs = await Request.find({}).toArray();
  
  console.log("Users count:", users.length);
  console.log("Requests count:", reqs.length);
  console.log("Notifications:");
  console.log(notifs);
  
  process.exit(0);
}

check();
