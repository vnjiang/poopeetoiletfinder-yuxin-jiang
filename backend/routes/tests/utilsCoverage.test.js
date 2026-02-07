const mongoose = require("mongoose");

test("closeTestMongo without connect should not throw (covers mongo falsy branch)", async () => {

  const { closeTestMongo } = require("./setupMongo");
  await expect(closeTestMongo()).resolves.toBeUndefined();
});


test("pickEnum throws when enum values missing (covers throw branch)", () => {
  const { pickEnum } = require("./factories");


  const fakeModel = {
    modelName: "Fake",
    schema: {
      path: () => ({ enumValues: [] }),
    },
  };

  expect(() => pickEnum(fakeModel, "type")).toThrow(/No enum values found/i);
});

test("pickEnum throws when schemaPath is undefined (covers !values + optional chaining branch)", () => {
    const { pickEnum } = require("./factories");
  
    const fakeModel = {
      modelName: "Fake",
      schema: {
    
        path: () => undefined,
      },
    };
  
    expect(() => pickEnum(fakeModel, "type")).toThrow(/No enum values found/i);
  });

  test("pickEnum returns first enum value when available (covers normal return branch)", () => {
    const path = require("path");
    const { pickEnum } = require(path.join(__dirname, "factories.js"));
  
    const fakeModel = {
      modelName: "Fake",
      schema: {
        path: () => ({ enumValues: ["A", "B"] }),
      },
    };
  
    expect(pickEnum(fakeModel, "type")).toBe("A");
  });
  
  
  test("makeToilet covers default param branch (no args + with overrides)", () => {
    const path = require("path");
    const { makeToilet } = require(path.join(__dirname, "factories.js"));
  
 
    const a = makeToilet();
    expect(a).toHaveProperty("place_id");
  

    const b = makeToilet({ place_id: "p_override" });
    expect(b.place_id).toBe("p_override");
  });
  
  test("makeSharedToilet covers default param branch (no args + with overrides)", () => {
    const path = require("path");
    const { makeSharedToilet } = require(path.join(__dirname, "factories.js"));
  
    const a = makeSharedToilet();
    expect(a).toHaveProperty("eircode");
  
    const b = makeSharedToilet({ eircode: "T00TEST" });
    expect(b.eircode).toBe("T00TEST");
  });
  

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch {}
});
