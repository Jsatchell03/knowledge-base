// Chunking service — splits note/file content into text chunks for embedding

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunkText(text, { chunkSize = CHUNK_SIZE, chunkOverlap = CHUNK_OVERLAP } = {}) {
  if (!text || typeof text !== "string") return [];

  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  if (trimmed.length <= chunkSize) return [trimmed];

  const chunks = [];
  const paragraphs = trimmed.split(/\n\s*\n/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const para = paragraph.trim();
    if (!para) continue;

    // If adding this paragraph fits, append it
    if (currentChunk.length + para.length + 1 <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
      continue;
    }

    // If current chunk has content, flush it
    if (currentChunk) {
      chunks.push(currentChunk);
      // Start next chunk with overlap from the end of the previous one
      currentChunk = getOverlap(currentChunk, chunkOverlap);
    }

    // If the paragraph itself exceeds chunkSize, split it by sentences
    if (para.length > chunkSize) {
      const sentenceChunks = splitBySentences(para, chunkSize, chunkOverlap);
      for (let i = 0; i < sentenceChunks.length; i++) {
        if (i < sentenceChunks.length - 1) {
          const combined = currentChunk
            ? currentChunk + "\n\n" + sentenceChunks[i]
            : sentenceChunks[i];
          chunks.push(combined);
          currentChunk = getOverlap(combined, chunkOverlap);
        } else {
          // Last sentence chunk becomes the start of the next chunk
          currentChunk = currentChunk
            ? currentChunk + "\n\n" + sentenceChunks[i]
            : sentenceChunks[i];
        }
      }
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function splitBySentences(text, chunkSize, chunkOverlap) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;

    if (current.length + s.length + 1 <= chunkSize) {
      current += (current ? " " : "") + s;
    } else {
      if (current) chunks.push(current);
      current = getOverlap(current, chunkOverlap);
      current += (current ? " " : "") + s;

      // If a single sentence exceeds chunkSize, force-split by characters
      while (current.length > chunkSize) {
        chunks.push(current.slice(0, chunkSize));
        current = current.slice(chunkSize - chunkOverlap);
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function getOverlap(text, overlapSize) {
  if (!text || overlapSize <= 0) return "";
  if (text.length <= overlapSize) return text;

  const overlap = text.slice(-overlapSize);
  // Try to start at a word boundary
  const spaceIdx = overlap.indexOf(" ");
  return spaceIdx !== -1 ? overlap.slice(spaceIdx + 1) : overlap;
}

export { chunkText };
