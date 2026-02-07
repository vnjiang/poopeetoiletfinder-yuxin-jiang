const SharedToilet = require("../../models/sharedToilet");
const Toilet = require("../../models/toilet");


function pickEnum(model, path) {
  const schemaPath = model.schema.path(path);
  const values = schemaPath?.enumValues;
  if (!values || values.length === 0) {
    throw new Error(`No enum values found for ${model.modelName}.${path}`);
  }
  return values[0]; 
}

function makeToilet(overrides = {}) {
    const typeVal = pickEnum(Toilet, "type");

  return {
    place_id: "p_test",
    toilet_name: "Test Toilet",

    type: typeVal, 
    location: { type: "Point", coordinates: [-6.26, 53.35] },
    ...overrides,
  };
}

function makeSharedToilet(overrides = {}) {

  const typeVal = pickEnum(SharedToilet, "type");
  const priceVal = pickEnum(SharedToilet, "price");

  return {
    toilet_name: "Shared Test",
    eircode: "T12X316",
    type: typeVal,
    price: priceVal,
    contact_number: "123456789",
    location: { lat: 53.35, lng: -6.26 },
    created: new Date(),
    approved_by_admin: false,
    rejected: false,
    ...overrides,
  };
}

module.exports = { makeToilet, makeSharedToilet, pickEnum };
