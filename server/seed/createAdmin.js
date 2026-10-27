// Run with:  npm run seed:admin
// Creates (or promotes) an admin account. You can also do this by editing
// the "role" field to "admin" in MongoDB Compass.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN = {
  name: 'Hostel Warden',
  email: 'admin@campuscare.com',
  password: 'admin123', // for demo only - change it for real use
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    let user = await User.findOne({ email: ADMIN.email });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log('Existing user promoted to admin:', ADMIN.email);
    } else {
      user = await User.create({
        name: ADMIN.name,
        email: ADMIN.email,
        password: await bcrypt.hash(ADMIN.password, 10),
        role: 'admin',
      });
      console.log(`Admin created -> email: ${ADMIN.email}  password: ${ADMIN.password}`);
    }
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
