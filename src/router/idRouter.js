import express from "express";
import { nanoid } from "nanoid";
const idRouter = express.Router();

idRouter.post("/", (req, res) => {
  const id = nanoid();
  res.json({ id });
});

export default idRouter;
