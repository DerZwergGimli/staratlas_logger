import mongoose, {Schema} from "mongoose";

 const exchangeSchema = new Schema({
    timestamp: Number,
    signature:  String, // String is shorthand for {type: String}
    assetMint: String,
    currencyMint:   String,
    orderTaker:   String,
    orderInitializer:   String,
    size:   Number,
    price:   Number,
    cost:   Number
});

export const Exchange = mongoose.model("Exchange", exchangeSchema, "Exchange");