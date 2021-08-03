import express from "express";
import { nanoid } from "nanoid";
import Meet from "../models/meet.js";
import ObjectId from "mongoose";
const idRouter = express.Router();

idRouter.post("/", async (req, res) => {
  const id = nanoid();

  if (!id) {
    return res.json({ error: "Couldn't generate an id" });
  }

  try {
    const newMeet = new Meet({
      _id: id,
    });
    await newMeet.save();
    res.json({ id });
  } catch (error) {
    console.log(error);
    return res.json({ error: "Couldn't generate an id" });
  }
});

idRouter.post("/isValid", async (req, res) => {
  const { meetId } = req.body;

  if (!meetId) {
    return res.json({ status: false });
  }

  try {
    const meet = await Meet.findById(meetId);
    if (!meet) return res.json({ status: false });
  } catch (error) {
    return res.json({ status: false });
  }

  return res.json({ status: true });
});

export default idRouter;
