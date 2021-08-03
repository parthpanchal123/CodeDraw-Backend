import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDb = () => {
  mongoose
    .connect(process.env.MONGO_DB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => {
      console.log(`Db connection established`);
    })
    .catch((err) => {
      console.log(err.message);
      throw new Error(err.message);
    });

  mongoose.set("useFindAndModify", false);
};

export default connectDb;
