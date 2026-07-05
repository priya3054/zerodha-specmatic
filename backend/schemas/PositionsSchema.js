const { Schema } = require("mongoose");

const PositionsSchema = new Schema({
  product: String,
  name: String,
  qty: {
    type: Number,
    validate: { validator: Number.isInteger, message: "{VALUE} is not an integer value for qty" },
  },
  avg: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: Boolean,
});

module.exports = { PositionsSchema };
