import { useReducer, useCallback, useEffect } from 'react';
import * as api from '../api/api';
import { NotesContext } from './notesContext';

const initialState = {
  notes: [],
  files: [],
  selectedNoteId: null,
  selectedFileId: null,
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return { ...state, notes: action.payload.notes, files: action.payload.files, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SELECT_NOTE':
      return { ...state, selectedNoteId: action.payload, selectedFileId: null };
    case 'SELECT_FILE':
      return { ...state, selectedFileId: action.payload, selectedNoteId: null };
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes], selectedNoteId: action.payload.id, selectedFileId: null };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
        selectedNoteId: state.selectedNoteId === action.payload ? null : state.selectedNoteId,
      };
    case 'ADD_FILE':
      return { ...state, files: [action.payload, ...state.files] };
    case 'DELETE_FILE':
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.payload),
        selectedFileId: state.selectedFileId === action.payload ? null : state.selectedFileId,
      };
    default:
      return state;
  }
}

export function NotesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.fetchNotes(), api.fetchFiles()])
      .then(([notes, files]) => {
        if (!cancelled) dispatch({ type: 'SET_INITIAL_DATA', payload: { notes, files } });
      })
      .catch((err) => {
        if (!cancelled) dispatch({ type: 'SET_ERROR', payload: err.message });
      });
    return () => { cancelled = true; };
  }, []);

  const selectNote = useCallback((id) => {
    dispatch({ type: 'SELECT_NOTE', payload: id });
  }, []);

  const selectFile = useCallback((id) => {
    dispatch({ type: 'SELECT_FILE', payload: id });
  }, []);

  const createNote = useCallback(async () => {
    const note = await api.createNote({ title: 'Untitled', content: '' });
    dispatch({ type: 'ADD_NOTE', payload: note });
    return note;
  }, []);

  const updateNote = useCallback(async (id, updates) => {
    const updated = await api.updateNote(id, updates);
    dispatch({ type: 'UPDATE_NOTE', payload: { id, updates: updated } });
    return updated;
  }, []);

  const deleteNote = useCallback(async (id) => {
    await api.deleteNote(id);
    dispatch({ type: 'DELETE_NOTE', payload: id });
  }, []);

  const addFile = useCallback(async (file) => {
    const newFile = await api.addFile({ name: file.name, size: file.size, type: file.type });
    dispatch({ type: 'ADD_FILE', payload: newFile });
    return newFile;
  }, []);

  const deleteFile = useCallback(async (id) => {
    await api.deleteFile(id);
    dispatch({ type: 'DELETE_FILE', payload: id });
  }, []);

  return (
    <NotesContext.Provider
      value={{
        ...state,
        selectNote,
        selectFile,
        createNote,
        updateNote,
        deleteNote,
        addFile,
        deleteFile,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
