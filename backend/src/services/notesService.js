// Notes service — Firestore operations for notes collection
import db from "../config/firebase.js";
import { chunkText } from "./chunkingService.js";
import { embedAndStore, deleteChunksBySourceId } from "./embeddingService.js";

async function createNewNote(note) {
  const notesRef = db.collection("notes");
  const docRef = await notesRef.add({
    ...note,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const chunks = chunkText(note.content_markdown);
  if (chunks.length > 0) {
    await embedAndStore(chunks, "note_chunks", docRef.id);
  }

  return { id: docRef.id, ...note };
}

async function getNote(id) {
  const doc = await db.collection("notes").doc(id).get();
  if (!doc.exists) throw new Error("Note not found");
  return { id: doc.id, ...doc.data() };
}

async function getAllNotes() {
  const notesRef = db.collection("notes");
  const snapshot = await notesRef.get();

  const notes = [];
  snapshot.forEach((doc) => {
    notes.push({ id: doc.id, ...doc.data() });
  });

  return notes;
}

async function updateNote(id, newNote) {
  const noteRef = db.collection("notes").doc(id);
  await noteRef.update({
    ...newNote,
    updatedAt: new Date(),
  });

  if (newNote.content_markdown !== undefined) {
    await deleteChunksBySourceId("note_chunks", id);
    const chunks = chunkText(newNote.content_markdown);
    if (chunks.length > 0) {
      await embedAndStore(chunks, "note_chunks", id);
    }
  }

  const updated = await noteRef.get();
  return { id, ...updated.data() };
}

async function deleteNote(id) {
  await db.collection("notes").doc(id).delete();
}

export { createNewNote, getNote, getAllNotes, updateNote, deleteNote };
