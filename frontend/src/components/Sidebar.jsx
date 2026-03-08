import { useNotes } from '../context/useNotes';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function Sidebar() {
  const {
    notes,
    files,
    selectedNoteId,
    selectedFileId,
    selectNote,
    selectFile,
    createNote,
    deleteNote,
    addFile,
    deleteFile,
  } = useNotes();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) addFile(file);
    e.target.value = '';
  };

  return (
    <aside className="w-60 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="font-bold text-lg text-gray-900">Knowledge Base</h1>
      </div>

      {/* Notes section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</h2>
            <button
              onClick={createNote}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              + New
            </button>
          </div>
          <ul className="space-y-1">
            {notes.map((note) => (
              <li key={note.id} className="group flex items-center">
                <button
                  onClick={() => selectNote(note.id)}
                  className={`flex-1 text-left text-sm px-2 py-1.5 rounded truncate ${
                    selectedNoteId === note.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {note.title}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="hidden group-hover:block text-gray-400 hover:text-red-500 px-1 text-xs"
                  title="Delete note"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Files section */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Files</h2>
            <label className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer">
              + Upload
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <ul className="space-y-1">
            {files.map((file) => (
              <li key={file.id} className="group flex items-center">
                <button
                  onClick={() => selectFile(file.id)}
                  className={`flex-1 text-left text-sm px-2 py-1.5 rounded truncate ${
                    selectedFileId === file.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="block truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                  className="hidden group-hover:block text-gray-400 hover:text-red-500 px-1 text-xs"
                  title="Delete file"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
