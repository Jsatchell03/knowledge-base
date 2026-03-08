const BASE_URL = "http://localhost:3000";

export async function fetchNotes() {
  const res = await fetch(`${BASE_URL}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function fetchFiles() {
  const res = await fetch(`${BASE_URL}/files`);
  if (!res.ok) throw new Error("Failed to fetch files");
  return res.json();
}

export async function fetchNote(id) {
  const res = await fetch(`${BASE_URL}/notes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  let json = await res.json();
  console.log(json);
  return json;
}

export async function createNote(note) {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

export async function updateNote(id, updates) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(`${BASE_URL}/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
}

export async function addFile(file) {
  console.log("[api.addFile] Building FormData for:", file.name);
  const formData = new FormData();
  formData.append("file", file);
  try {
    console.log("[api.addFile] Sending POST to", `${BASE_URL}/files`);
    const res = await fetch(`${BASE_URL}/files`, {
      method: "POST",
      body: formData,
    });
    console.log("[api.addFile] Response status:", res.status);
    if (!res.ok) {
      const body = await res.text();
      console.error("[api.addFile] Upload failed:", res.status, body);
      throw new Error("Failed to upload file");
    }
    const json = await res.json();
    console.log("[api.addFile] Upload success:", json);
    return json;
  } catch (err) {
    console.error("[api.addFile] Error:", err);
    throw err;
  }
}

export async function deleteFile(name) {
  const res = await fetch(`${BASE_URL}/files/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete file");
}

export async function queryAI(text) {
  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to query AI");
  const data = await res.json();
  return data.response;
}
