const express = require('express');
const router = express.Router();
const Toilet = require('../models/toilet');
const axios = require('axios');


//fetching toilets data from google API
router.get('/fetch-toilets', async (req, res) => {
  const { lat, lng } = req.query;

  // add location requirement， prevent error
  if (!lat || !lng) {
    return;
  }

  try {
    // fetch public toilet data from google API
    const publicToiletFromGoogleRes = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 5000,
        keyword: 'public toilet',
        key: 'REMOVED',
      }
    });

    // deal data to mongoDB's data format
    const publicToiletFromGoogle = publicToiletFromGoogleRes.data.results
      .filter(toilet => toilet.geometry && toilet.geometry.location) // filter toilet without geometry data to prevent error
      .map(toilet => ({
        place_id: toilet.place_id,
        toilet_name: toilet.name || 'Unknown Toilet',
        toilet_description: toilet.vicinity || 'No description',
        location: {
          type: 'Point',
          coordinates: [toilet.geometry.location.lng, toilet.geometry.location.lat],
        },
        type: 'public',
        price: 0,
        toilet_paper_accessibility: false,
      }));


    //define a upsert function
    const upsertGoogleToiletDataToDB = async (toilet) => {
      //use mongoDB’s updateOne method to update toilet data
      return Toilet.updateOne(
        { place_id: toilet.place_id },
        { $set: toilet },
        { upsert: true }
      );
    };
    // Execute all asynchronous operations in parallel
    await Promise.all(publicToiletFromGoogle.map(toilet => upsertGoogleToiletDataToDB(toilet)));

    // return all toilet's JSON data
    res.json(await Toilet.find());
  } catch (error) {
    console.error(error.message);
  }
});



module.exports = router;

