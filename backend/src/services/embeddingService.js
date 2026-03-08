// Embedding service — generates vector embeddings and handles vector storage/search in Firestore
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../config/firebase.js";
import { FieldValue } from "@google-cloud/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function embedAndStore(chunks, collection, sourceId) {
  console.log("[embeddingService.embedAndStore] Embedding", chunks.length, "chunks for source:", sourceId);

  let result;
  try {
    console.log("[embeddingService.embedAndStore] Calling Gemini batchEmbedContents...");
    result = await model.batchEmbedContents({
      requests: chunks.map((text) => ({
        content: { parts: [{ text }] },
        outputDimensionality: 2048,
      })),
    });
    console.log("[embeddingService.embedAndStore] Got", result.embeddings.length, "embeddings");
  } catch (err) {
    console.error("[embeddingService.embedAndStore] Embedding generation failed:", err);
    throw err;
  }

  try {
    console.log("[embeddingService.embedAndStore] Writing to Firestore collection:", collection);
    const batch = db.batch();
    const collectionRef = db.collection(collection);

    result.embeddings.forEach((entry, i) => {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        embedding: FieldValue.vector(entry.values),
        text: chunks[i],
        source_id: sourceId,
      });
    });

    await batch.commit();
    console.log("[embeddingService.embedAndStore] Firestore batch commit complete");
  } catch (err) {
    console.error("[embeddingService.embedAndStore] Firestore write failed:", err);
    throw err;
  }
}

async function embed(text) {
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 2048,
  });
  return result.embedding.values;
}

async function deleteChunksBySourceId(collection, sourceId) {
  const snapshot = await db
    .collection(collection)
    .where("source_id", "==", sourceId)
    .get();

  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export { embedAndStore, embed, deleteChunksBySourceId };
