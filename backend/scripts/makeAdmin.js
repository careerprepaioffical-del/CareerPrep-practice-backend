/* eslint-disable no-console */
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepiq';

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`User not found for email: ${email}`);
      process.exitCode = 1;
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Promoted to admin: ${user.email} (${user._id})`);
  } catch (err) {
    console.error('❌ Failed to promote admin:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();
