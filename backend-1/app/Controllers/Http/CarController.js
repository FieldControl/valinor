"use strict";
const Database = use("Database");
const Car = use("App/Models/Car");

class CarController {
  async index({ request, response }) {
    const limit = 10;
    const sqlFields = ["make", "model", "year", "style", "color"];
    const carInfo = request.only([
      "page",
      "make",
      "model",
      "year",
      "style",
      "color"
    ]);
    let sql = "";
    let page = 1;

    if (carInfo.page) {
      page = carInfo.page;
    }

    for (var i = 0; i < sqlFields.length; i++) {
      if (eval("carInfo." + sqlFields[i])) {
        if (sql) {
          sql +=
            " and " +
            sqlFields[i] +
            " like '%" +
            eval("carInfo." + sqlFields[i]) +
            "%' ";
        } else {
          sql +=
            " " +
            sqlFields[i] +
            " like '%" +
            eval("carInfo." + sqlFields[i]) +
            "%' ";
        }
      }
    }

    const cars = await Database.from("cars")
      .whereRaw(sql)
      .paginate(page, limit);
    Database.close();
    return response.json(cars);
  }

  async show({ params, response }) {
    const car = await Car.find(params.id);
    return response.json(car);
  }

  async store({ request, response }) {
    const carInfo = request.only(["make", "model", "year", "style", "color"]);
    const car = new Car();
    car.make = carInfo.make;
    car.model = carInfo.model;
    car.year = carInfo.year;
    car.style = carInfo.style;
    car.color = carInfo.color;
    await car.save();
    return response.status(201).json(car);
  }
  async update({ params, request, response }) {
    const carInfo = request.only(["make", "model", "year", "style", "color"]);
    const car = await Car.find(params.id);
    if (!car) {
      return response.status(404).json({ data: "Resource not found !" });
    }
    car.make = carInfo.make;
    car.model = carInfo.model;
    car.year = carInfo.year;
    car.style = carInfo.style;
    car.color = carInfo.color;
    await car.save();
    return response.status(200).json(car);
  }

  async delete({ params, response }) {
    const car = await Car.find(params.id);
    if (!car) {
      return response.status(404).json({ data: "Resource not found !" });
    }
    await car.delete();
    return response.status(204).json(null);
  }
}

module.exports = CarController;
