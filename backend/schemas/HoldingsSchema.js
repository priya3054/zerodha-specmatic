const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
  name: String,
  qty: {
    type: Number,
    validate: { validator: Number.isInteger, message: "{VALUE} is not an integer value for qty" },
  },
  avg: Number,
  price: Number,
  net: String,
  day: String,
});

module.exports = { HoldingsSchema };
