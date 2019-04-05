"use strict";

const { test, trait } = use("Test/Suite")("Car");
const Car = use("App/Models/Car");

trait("Test/ApiClient");

test("create a car and get a list of Cars", async ({ client }) => {
  await Car.create({
    make: "GM",
    model: "Vectra",
    year: "2011",
    style: "Hatch",
    color: "Blue"
  });

  const response = await client.get("/api/v1/cars").end();

  response.assertStatus(200);
}).timeout(0);
