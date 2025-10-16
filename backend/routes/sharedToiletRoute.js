const express = require('express');
const router = express.Router();
const axios = require('axios'); //for http
const SharedToilet = require('../models/sharedToilet');
const Toilet = require('../models/toilet');


//transfer eircode from frontend form and return a location
const transferEircodeToLocation = async (eircode) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: eircode,
        key: 'XXXXXX'
      }
    });
    const location = response.data.results[0].geometry.location;
    //return the location data
    return {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    };
  } catch (error) {
    console.log(error)
  }
};


//get shared toilet by approved_by_admin filter-can pass parameter on frontend
//admin-page
router.get('/', async (req, res) => {
  try {
    const filter = {
      approved_by_admin: false, 
      rejected: false 
    };

    res.json(await SharedToilet.find(filter));
  } catch (error) {
    console.log(error);
  }
});



//get shared toilet by user id
//shared your toielt page
router.get('/user/:userId', async (req, res) => {
  try {
    res.json(await SharedToilet.find(req.params));
  } catch (error) {
    console.log(error);
  }
});



//post sharedtoilet data to data base
//sharedtoilet page
router.post('/', async (req, res) => {
  try {
    const location = await transferEircodeToLocation(req.body.eircode);
    const newSharedToiletData = new SharedToilet({
      ...req.body,
      location,
    });
    res.json(await newSharedToiletData.save());
  } catch (error) {
    console.error(error);
  }
});



//update shared toilet info by id
//shared toilet page
router.put('/:id', async (req, res) => {
  try {
    // reset approval status
    const { approved_by_admin } = await SharedToilet.findById(req.params.id);
    const updateData = approved_by_admin ? { ...req.body, approved_by_admin: false } : { ...req.body };

    //Updated shared Toilet data in form
    const updatedSharedToiletInForm = await SharedToilet.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );


    // If the toilet is approved, update it in the MongoDB toilets collection
    if (req.body.approved_by_admin) {
      // Find and delete the existing approved shared toilet in the toilets collection
      await Toilet.findOneAndDelete({ place_id: updatedSharedToiletInForm._id.toString() });
      // Insert the updated shared toilet into the toilets collection
      const newToilet = new Toilet({
        place_id: updatedSharedToiletInForm._id.toString(),
        toilet_name: updatedSharedToiletInForm.toilet_name,
        toilet_description: updatedSharedToiletInForm.toilet_description,
        eircode: updatedSharedToiletInForm.eircode,

        type: updatedSharedToiletInForm.type,  // 包含类型
        price: updatedSharedToiletInForm.price, // 包含价格

        toilet_paper_accessibility: updatedSharedToiletInForm.toilet_paper_accessibility,
        contact_number: updatedSharedToiletInForm.contact_number,
        location: updatedSharedToiletInForm.location,
        userId: updatedSharedToiletInForm.userId
      });

      //save these updated data in mongoDB database
      await newToilet.save();
    }

    // send the updated shared toilet data back as a json response
    res.json(updatedSharedToiletInForm);
  } catch (error) {
    console.error(error);
  }
});




// for update admin page reject status
router.put('/reject/:id', async (req, res) => {
  try {
    const updateRejectStatus = await SharedToilet.findByIdAndUpdate(
      req.params.id,
      { $set: { rejected: true } }, //set reject field to true
      { new: true, runValidators: true }// return the updated document and run validation
    );
    res.status(200).json(updateRejectStatus);
  } catch (error) {
    console.error(error);
  }
});



//delete toilet by id
//shared toilet page
router.delete('/:id', async (req, res) => {
  try {
     // 1. delete shared toilet data by id
    const sharedToilet = await SharedToilet.findByIdAndDelete(req.params.id);
    //2. make sure sharedToilet has been deleted , delete sharedToilet from toilets collection
    if (sharedToilet) {
      await Toilet.findOneAndDelete({ place_id: req.params.id });
    }
    res.status(200).json({ message: 'deleted successfully' });
  } catch (error) {
    console.log(error);
  }
});






module.exports = router;
