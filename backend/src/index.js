// Entry point — initializes Express server and mounts routes
import express from "express";
import cors from "cors";
import multer from "multer";
import { createNewNote, getNote, getAllNotes, updateNote, deleteNote } from "./services/notesService.js";
import { uploadFile, getAllFiles, deleteFile } from "./services/filesService.js";
import { queryKnowledgeBase } from "./services/queryService.js";

const app = express();
const port = 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- Notes ---

app.get("/notes", async (req, res) => {
  try {
    const notes = await getAllNotes();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get("/notes/:id", async (req, res) => {
  try {
    const note = await getNote(req.params.id);
    res.json(note);
  } catch (error) {
    const status = error.message === "Note not found" ? 404 : 500;
    res.status(status).json({ error: { message: error.message } });
  }
});

app.post("/notes", async (req, res) => {
  try {
    const note = await createNewNote(req.body);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.patch("/notes/:id", async (req, res) => {
  try {
    const updated = await updateNote(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete("/notes/:id", async (req, res) => {
  try {
    await deleteNote(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// --- Files ---

app.get("/files", async (req, res) => {
  try {
    const files = await getAllFiles();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post("/files", upload.single("file"), async (req, res) => {
  console.log("[POST /files] Received upload request");
  try {
    if (!req.file) {
      console.log("[POST /files] No file in request");
      return res.status(400).json({ error: { message: "No file provided" } });
    }
    console.log("[POST /files] File received:", req.file.originalname, "size:", req.file.size, "mimetype:", req.file.mimetype);
    const file = await uploadFile(req.file);
    console.log("[POST /files] Upload complete, responding with:", file);
    res.status(201).json(file);
  } catch (error) {
    console.error("[POST /files] Error:", error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete("/files/:name", async (req, res) => {
  try {
    await deleteFile(req.params.name);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// --- Query ---

app.post("/query", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: { message: "text is required" } });
    }
    const response = await queryKnowledgeBase(text);
    res.json({ response });
  } catch (error) {
    console.error("[POST /query] Error:", error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
