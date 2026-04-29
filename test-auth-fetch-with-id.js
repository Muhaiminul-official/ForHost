import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const token = jwt.sign({ id: '60c72b2f9b1d8e001c8e4d3a', role: 'user' }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: "1h" });

  const res = await fetch('http://localhost:3000/api/direct-requests?type=received', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Status', res.status);
  console.log(await res.text());
})();
