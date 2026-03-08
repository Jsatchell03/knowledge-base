// Query service — AI query processing logic
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../config/firebase.js";
import { FieldValue } from "@google-cloud/firestore";
import { embed } from "./embeddingService.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const llm = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
const goodLlm = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function queryKnowledgeBase(text) {
  // 1. Embed the query
  const queryVector = await embed(text);

  // 2. Vector search both collections in parallel (top 5 each)
  const vectorQuery = (collection) =>
    db
      .collection(collection)
      .findNearest("embedding", FieldValue.vector(queryVector), {
        limit: 5,
        distanceMeasure: "COSINE",
      })
      .get();

  const [noteResults, fileResults] = await Promise.all([
    vectorQuery("note_chunks"),
    vectorQuery("file_chunks"),
  ]);

  // 3. Merge & rank — take best 5 overall by distance
  const allChunks = [];
  for (const snap of [noteResults, fileResults]) {
    snap.docs.forEach((doc) => {
      const data = doc.data();
      allChunks.push({ text: data.text, distance: doc.get("distance") });
    });
  }
  allChunks.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  const topChunks = allChunks.slice(0, 5);

  // 4. Build prompt
  const contextBlocks = topChunks
    .map((c, i) => `[${i + 1}] ${c.text}`)
    .join("\n\n");

  const prompt = [
    "You are a helpful assistant for a personal knowledge base.",
    "Answer the user's question using ONLY the context below.",
    "If the context does not contain enough information, say so.",
    "",
    "--- Context ---",
    contextBlocks,
    "",
    "--- Question ---",
    text,
  ].join("\n");

  // 5. Generate response
  const result = await goodLlm.generateContent(prompt);
  return result.response.text();
}

export { queryKnowledgeBase };
