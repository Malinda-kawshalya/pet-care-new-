import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const uploadsDir = path.resolve(process.cwd(), "uploads");

app.use(helmet());
app.use(cors({ origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 250 }));
app.use("/uploads", express.static(uploadsDir));

app.get("/", (_req, res) => {
  res.json({ name: "Pet Care Smart Platform API", status: "healthy" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
