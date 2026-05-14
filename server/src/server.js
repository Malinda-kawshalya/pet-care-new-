import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Pet Care API running on port ${port}`);
  });
});
