import { NotesProvider } from "./context/NotesProvider";
import { useNotes } from "./context/useNotes";
import Sidebar from "./components/Sidebar";
import QueryPanel from "./components/QueryPanel";
import NoteEditor from "./components/NoteEditor";
import FileViewer from "./components/FileViewer";

function MainContent() {
  const { notes, files, selectedNoteId, selectedFileId, loading, error } =
    useNotes();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        <p>Failed to load data: {error}</p>
      </div>
    );
  }

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const selectedFile = files.find((f) => f.name === selectedFileId);

  if (selectedNote) {
    return <NoteEditor key={selectedNote.id} note={selectedNote} />;
  }

  if (selectedFile) {
    return <FileViewer file={selectedFile} />;
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-lg mb-2">No note selected</p>
        <p className="text-sm">
          Select a note or file from the sidebar, or create a new one
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NotesProvider>
      <div className="flex h-screen bg-white text-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <MainContent />
        </main>
        <QueryPanel />
      </div>
    </NotesProvider>
  );
}
