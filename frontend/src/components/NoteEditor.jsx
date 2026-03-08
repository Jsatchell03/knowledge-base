import { useState, useCallback } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  linkPlugin,
  tablePlugin,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertTable,
  ListsToggle,
  InsertThematicBreak,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useNotes } from "../context/useNotes";

const PLUGINS = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  markdownShortcutPlugin(),
  linkPlugin(),
  tablePlugin(),
  toolbarPlugin({
    toolbarContents: () => (
      <>
        <BoldItalicUnderlineToggles />
        <Separator />
        <ListsToggle />
        <Separator />
        <CreateLink />
        <InsertTable />
        <InsertThematicBreak />
      </>
    ),
  }),
];

export default function NoteEditor({ note }) {
  const { updateNote } = useNotes();
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content_markdown);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleChange = useCallback((content) => {
    setLocalContent(content);
    console.log(content);
    setDirty(true);
  }, []);

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateNote(note.id, {
      title: localTitle,
      content_markdown: localContent,
    });
    setSaving(false);
    setDirty(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <input
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          className="flex-1 text-2xl font-bold text-gray-900 border-none outline-none bg-transparent"
          placeholder="Note title"
        />
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
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
              Saving…
            </span>
          ) : (
            "Save"
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MDXEditor
          key={note.id}
          markdown={note.content_markdown}
          onChange={handleChange}
          plugins={PLUGINS}
          contentEditableClassName="prose max-w-none p-4"
        />
      </div>
    </div>
  );
}
