import { useNotes } from "../context/useNotes";

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FileViewer({ file }) {
  const { deleteFile } = useNotes();
  console.log(file);
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">
          {file.contentType.includes("image/")
            ? "🖼"
            : file.contentType.includes("/pdf")
              ? "📄"
              : "📎"}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {file.name}
        </h2>
        <p className="text-sm text-gray-500 mb-1">{formatSize(file.size)}</p>
        <p className="text-sm text-gray-500 mb-1">{file.type}</p>

        <button
          onClick={() => deleteFile(file.name)}
          className="text-sm text-red-500 hover:text-red-700 border border-red-300 rounded px-4 py-2 hover:bg-red-50"
        >
          Delete File
        </button>
      </div>
    </div>
  );
}
