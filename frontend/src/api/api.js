import { sampleNotes, sampleFiles } from '../data/sampleData';

let notes = [...sampleNotes];
let files = [...sampleFiles];

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchNotes() {
  await delay();
  return [...notes];
}

export async function fetchFiles() {
  await delay();
  return [...files];
}

export async function createNote(note) {
  await delay();
  const now = new Date().toISOString();
  const newNote = {
    id: Date.now().toString(),
    title: note.title ?? 'Untitled',
    content: note.content ?? '',
    createdAt: now,
    updatedAt: now,
  };
  notes = [newNote, ...notes];
  return newNote;
}

export async function updateNote(id, updates) {
  await delay();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) throw new Error(`Note ${id} not found`);
  notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() };
  return { ...notes[idx] };
}

export async function deleteNote(id) {
  await delay();
  notes = notes.filter((n) => n.id !== id);
}

export async function addFile(fileMeta) {
  await delay();
  const newFile = {
    id: Date.now().toString(),
    name: fileMeta.name,
    size: fileMeta.size,
    type: fileMeta.type,
    createdAt: new Date().toISOString(),
  };
  files = [newFile, ...files];
  return newFile;
}

export async function deleteFile(id) {
  await delay();
  files = files.filter((f) => f.id !== id);
}
