'use client';

import { useNotes } from './useNotes';

export default function NotesPage() {
  const {
    notes,
    userName,
    loading,
    noteTitle,
    setNoteTitle,
    noteContent,
    setNoteContent,
    editingNoteId,
    addNote,
    deleteNote,
    startEditNote,
    cancelEditNote,
  } = useNotes();

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
            {userName && <p className="text-sm text-gray-500">Halo, {userName}!</p>}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-lg border">
          <input
            id="note-title"
            type="text"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Judul catatan..."
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          <textarea
            id="note-content"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
            placeholder="Isi catatan..."
            rows={4}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={addNote}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              {editingNoteId ? 'Simpan Perubahan' : 'Tambah'}
            </button>

            {editingNoteId && (
              <button
                onClick={cancelEditNote}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
              >
                Batal edit
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 text-sm">Memuat catatan...</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="p-3 rounded-lg border transition-all bg-white border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    <span className="font-medium text-black">{note.title}</span>
                    {note.content && (
                      <span className="text-sm text-gray-500 whitespace-pre-line">{note.content}</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm shrink-0 p-1"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => startEditNote(note)}
                    className="text-blue-500 hover:text-blue-700 font-medium text-sm shrink-0 p-1"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && notes.length === 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">Belum ada catatan. Mulai tulis sesuatu.</p>
        )}
      </div>
    </main>
  );
}
