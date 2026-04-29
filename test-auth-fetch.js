import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign({ id: new mongoose.Types.ObjectId().toString(), role: 'user' }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: "1h" });

fetch('http://localhost:3000/api/direct-requests?type=received', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(async res => {
  console.log('Status', res.status);
  console.log(await res.text());
}).catch(err => {
  console.error('Fetch error:', err);
});
