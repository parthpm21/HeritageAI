require('dotenv').config();
const mongoose = require('mongoose');
const Monument = require('../models/Monument');
const monumentsData = require('../data/monuments');

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Clear existing data
    await Monument.deleteMany({});
    console.log('Cleared existing monuments collection.');

    // Insert new data
    await Monument.insertMany(monumentsData);
    console.log(`Successfully seeded ${monumentsData.length} monuments.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
