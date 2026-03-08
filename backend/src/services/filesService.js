// Files service — Firestore metadata + Firebase Storage operations

import { bucket } from "../config/firebase.js";
import { chunkText } from "./chunkingService.js";
import { embedAndStore, deleteChunksBySourceId } from "./embeddingService.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { PDFParse } from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const visionModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".tiff",
  ".tif",
]);

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".cs",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".go",
  ".rs",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".sh",
  ".bash",
  ".zsh",
  ".sql",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".md",
  ".txt",
  ".csv",
  ".env",
  ".cfg",
  ".ini",
  ".lua",
  ".r",
]);

async function uploadFile(file) {
  const destination = file.originalname;
  console.log("[filesService.uploadFile] Starting upload for:", destination);

  try {
    const storageFile = bucket.file(destination);
    console.log("[filesService.uploadFile] Saving to Firebase Storage...");
    await storageFile.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });
    console.log("[filesService.uploadFile] Firebase Storage save complete");
  } catch (err) {
    console.error(
      "[filesService.uploadFile] Firebase Storage save failed:",
      err,
    );
    throw err;
  }

  let text;
  try {
    console.log("[filesService.uploadFile] Extracting text...");
    text = await extractText(file);
    console.log(
      "[filesService.uploadFile] Text extraction result:",
      text ? `${text.length} chars` : "null (no text extracted)",
    );
  } catch (err) {
    console.error("[filesService.uploadFile] Text extraction failed:", err);
    throw err;
  }

  if (text) {
    try {
      console.log("[filesService.uploadFile] Chunking text...");
      const chunks = chunkText(text);
      console.log("[filesService.uploadFile] Created", chunks.length, "chunks");
      if (chunks.length > 0) {
        console.log(
          "[filesService.uploadFile] Embedding and storing chunks...",
        );
        await embedAndStore(chunks, "file_chunks", destination);
        console.log("[filesService.uploadFile] Embedding and storage complete");
      }
    } catch (err) {
      console.error(
        "[filesService.uploadFile] Chunking/embedding failed:",
        err,
      );
      throw err;
    }
  }

  const result = {
    name: destination,
    size: file.size,
    contentType: file.mimetype,
  };
  console.log("[filesService.uploadFile] Upload complete:", result);
  return result;
}

async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  console.log("[filesService.extractText] File extension:", ext);

  if (ext === ".pdf") {
    try {
      console.log("[filesService.extractText] Parsing PDF...");
      const pdf = new PDFParse(new Uint8Array(file.buffer));
      const data = await pdf.getText();
      console.log(
        "[filesService.extractText] PDF parsed, text length:",
        data.text?.length,
      );
      return data.text;
    } catch (err) {
      console.error("[filesService.extractText] PDF parsing failed:", err);
      throw err;
    }
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    const text = file.buffer.toString("utf-8");
    console.log(
      "[filesService.extractText] Text file decoded, length:",
      text.length,
    );
    return text;
  }

  if (IMAGE_EXTENSIONS.has(ext)) {
    try {
      console.log("[filesService.extractText] Describing image with Gemini...");
      const description = await describeImage(file);
      console.log(
        "[filesService.extractText] Image description length:",
        description?.length,
      );
      return description;
    } catch (err) {
      console.error(
        "[filesService.extractText] Image description failed:",
        err,
      );
      throw err;
    }
  }

  console.log(
    "[filesService.extractText] Unsupported file type, no text extracted",
  );
  return null;
}

async function describeImage(file) {
  console.log(
    "[filesService.describeImage] Preparing image for Gemini, mimetype:",
    file.mimetype,
  );
  const imagePart = {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };

  try {
    console.log("[filesService.describeImage] Calling Gemini vision model...");
    const result = await visionModel.generateContent([
      imagePart,
      "Describe this image in detail. Include what the image contains, its key visual elements, " +
        "and what this image could be used for (e.g. documentation, reference material, diagrams, etc.).",
    ]);
    const text = result.response.text();
    console.log(
      "[filesService.describeImage] Gemini response length:",
      text.length,
    );
    return text;
  } catch (err) {
    console.error(
      "[filesService.describeImage] Gemini vision call failed:",
      err,
    );
    throw err;
  }
}

async function getAllFiles() {
  const [files] = await bucket.getFiles();
  const fileData = await Promise.all(
    files.map(async (file) => {
      const [metadata] = await file.getMetadata();
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      return {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        url,
      };
    }),
  );
  return fileData;
}

async function deleteFile(fileName) {
  await bucket.file(fileName).delete();
  await deleteChunksBySourceId("file_chunks", fileName);
}

export { uploadFile, getAllFiles, deleteFile };
