const express = require('express');
const router = express.Router();
const axios = require('axios'); //for http
const SharedToilet = require('../models/SharedToilet');
const Toilet = require('../models/toilet'); 


const transferEircodeToLocation = async (eircode) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: eircode,
        key: 'REMOVED'
      }
    });
    const location = response.data.results[0].geometry.location;
    return {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    };
  } catch (error) {
    console.log(error)
  }
};


//get shared toilet by filter approved-admin page
router.get('/', async (req, res) => {
  try {
    const filter = req.query.approved_by_admin !== undefined 
      ? { approved_by_admin: req.query.approved_by_admin } 
      : {};
    const approvedSharedToilet = await SharedToilet.find(filter);
    res.json(approvedSharedToilet);
  } catch (error) {
    console.log(error);
  }
});


/*
//get shared toilet by filter user id
router.get('/:id', async (req, res) => {
  try {
    const toiletWithUserId = await SharedToilet.find({ userId: req.query.userId });
    res.json(toiletWithUserId);
  } catch (error) {
    console.log(error)
  }
});
*/


//post sharedtoilet data-sharedtoilet page
router.post('/', async (req, res) => {
  try {
    const location = await transferEircodeToLocation(req.body.eircode);
    const newSharedToiletData = await new SharedToilet({
      ...req.body, 
      location  
    }).save();
    res.status(201).json(newSharedToiletData);
  } catch (error) {
    console.log(error)
  }
});



//update shared toilet info by id
router.put('/:id', async (req, res) => {
  try {
    const { toilet_name, toilet_description, eircode, price, toilet_paper_accessibility, contact_number, approved_by_admin, userId } = req.body;
    const updatedToilet = await SharedToilet.findByIdAndUpdate(
      req.params.id,
      { $set: { toilet_name, toilet_description, eircode, price, toilet_paper_accessibility, contact_number, approved_by_admin, userId } },
      { new: true, runValidators: true }
    );

    if (approved_by_admin) {
      const toiletData = {
        toilet_id: updatedToilet._id.toString(),
        toilet_name: updatedToilet.toilet_name,
        toilet_description: updatedToilet.toilet_description,
        eircode: updatedToilet.eircode,
        price: updatedToilet.price,
        toilet_paper_accessibility: updatedToilet.toilet_paper_accessibility,
        contact_number: updatedToilet.contact_number,
        location: updatedToilet.location,
        userId: updatedToilet.userId,
        type: 'shared'
    };
    

      const newToilet = new Toilet(toiletData);
      await newToilet.save();
    }

    res.json(updatedToilet);
  } catch (error) {
    console.log(error)
  }
});


//delete toilet by id
router.delete('/:id', async (req, res) => {
  try {
    await SharedToilet.findByIdAndDelete(req.params.id);
    await Toilet.findOneAndDelete({ toilet_id: req.params.id });
    res.status(204).end();
  } catch (error) {
    console.log(error)
  }
});



/*
//get approved toiletsahred
router.get('/approved', async (req, res) => {
  try {
    const toilets = await SharedToilet.find({ approved_by_admin: true });
    res.json(toilets);
  } catch (error) {
    console.log(error)
  }
});
*/



//get toilet by user id-shared your toielt page
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const toilets = await SharedToilet.find({ userId }); 
    res.json(toilets);
  } catch (error) {
    console.log(error)
  }
});



module.exports = router;
