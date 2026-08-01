const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  togglePin,
  searchNotes,
} = require("../controllers/noteController");

router.post("/", protect, createNote);

router.get("/search", protect, searchNotes);

router.get("/", protect, getNotes);

router.put("/:id", protect, updateNote);

router.delete("/:id", protect, deleteNote);

router.patch("/:id/pin", protect, togglePin);

module.exports = router;