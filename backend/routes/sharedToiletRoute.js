const express = require('express');
const router = express.Router();
const axios = require('axios'); //for http
const SharedToilet = require('../models/sharedToilet');
const Toilet = require('../models/toilet');



const GOOGLE_GEOCODING_API_KEY =
  process.env.GOOGLE_GEOCODING_API_KEY;

if (!GOOGLE_GEOCODING_API_KEY) {
  throw new Error('Missing GOOGLE_GEOCODING_API_KEY');
}


const normalizeEircode = (eircode = "") => {
  const s = eircode.trim().toUpperCase().replace(/\s+/g, "");

  if (s.length === 7) return `${s.slice(0, 3)} ${s.slice(3)}`;
  return eircode.trim().toUpperCase();
};


//transfer eircode from frontend form and return a location
const transferEircodeToLocation = async (eircode) => {
  try {
    const normalized = normalizeEircode(eircode);
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: normalized,
          key: GOOGLE_GEOCODING_API_KEY,
        },
        timeout: 10000,
      }
    );

        const { status, results, error_message } = response.data;

 
if (status !== "OK" || !Array.isArray(results) || results.length === 0) {
  console.log("GEOCODE DEBUG:", {
    input: eircode,
    status,
    error_message,
    resultsLen: results?.length,
    firstFormatted: results?.[0]?.formatted_address,
  });

  throw new Error(
    `Invalid eircode: ${eircode} (status=${status}${error_message ? `, msg=${error_message}` : ""})`
  );
}


    const location = results[0].geometry.location;
    return {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    };
  } catch (error) {
    console.log(error?.message || error);
    throw new Error("Failed to geocode eircode");
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
     return res.status(500).json({ message: error.message });
  }
});



//get shared toilet by user id
//shared your toielt page
router.get('/user/:userId', async (req, res) => {
  try {
    const uid = req.params.userId;

 
    const list = await SharedToilet.find({
      $or: [{ user_id: uid }, { userId: uid }],
    }).sort({ createdAt: -1 });

    console.log('DEBUG userId param:', uid);
    console.log('DEBUG found count:', list.length);

    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
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

        return res.status(201).json(
      await newSharedToiletData.save()
    );
  } catch (error) {
    console.error('Create shared toilet failed:', error.message);
        return res.status(400).json({
      message: error.message,
    });
  }
});



//update shared toilet info by id
//shared toilet page
router.put('/:id', async (req, res) => {
  try {
    const doc = await SharedToilet.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const isAdminDecision =
      Object.prototype.hasOwnProperty.call(req.body, "approved_by_admin") &&
      (Object.keys(req.body).length === 1 ||
        (Object.keys(req.body).length === 2 && Object.prototype.hasOwnProperty.call(req.body, "rejected")));


    if (isAdminDecision) {
      const decisionUpdate = {
 
        approved_by_admin: !!req.body.approved_by_admin,
        rejected: !!req.body.rejected,
      };

      const updated = await SharedToilet.findByIdAndUpdate(
        req.params.id,
        { $set: decisionUpdate },
        { new: true, runValidators: true, context: "query" }
      );

      if (updated.approved_by_admin) {
        await Toilet.findOneAndDelete({ place_id: updated._id.toString() });

        const toiletDoc = {
          place_id: updated._id.toString(),
          toilet_name: updated.toilet_name,
          toilet_description: updated.toilet_description,
          eircode: updated.eircode,
          type: updated.type,
          toilet_paper_accessibility: updated.toilet_paper_accessibility,
          contact_number: updated.contact_number,
          location: updated.location,
          user_id: updated.userId,
        };

        if (updated.type === "paid") {
          toiletDoc.price = updated.price;
        }

        await new Toilet(toiletDoc).save();
      } else {

        await Toilet.findOneAndDelete({ place_id: updated._id.toString() });
      }

      return res.json(updated);
    }


    const updateData = { ...req.body, approved_by_admin: false, rejected: false };


    if (updateData.type !== "paid") {
      delete updateData.price;
    }

    const updatedSharedToiletInForm = await SharedToilet.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, context: "query" }
    );

    return res.json(updatedSharedToiletInForm);
  } catch (error) {
    console.error("PUT update failed:", error);
    return res.status(400).json({ message: error.message });
  }
});



// for update admin page reject status
router.put('/reject/:id', async (req, res) => {
  try {
    const updateRejectStatus = await SharedToilet.findByIdAndUpdate(
      req.params.id,
      { $set: { rejected: true } }, 
      { new: true, runValidators: true, context: 'query' }
    );
    res.status(200).json(updateRejectStatus);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
});



//delete toilet by id
//shared toilet page
router.delete('/:id', async (req, res) => {
  try {

    const sharedToilet = await SharedToilet.findByIdAndDelete(req.params.id);

    if (sharedToilet) {
      await Toilet.findOneAndDelete({ place_id: req.params.id });
    }
    res.status(200).json({ message: 'deleted successfully' });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
});




module.exports = router;
