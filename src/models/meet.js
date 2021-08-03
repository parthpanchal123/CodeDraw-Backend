import mongoose from "mongoose";

// Declare the Schema of the Mongo model
const meetSchema = new mongoose.Schema({
  _id: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

//Export the model
export default mongoose.model("Meet", meetSchema);
