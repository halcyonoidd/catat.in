import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export interface Note {
  id: number;
  user_id?: string;
  title: string;
  content: string;
  created_at: string;
}

export function useNotes() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      setToken(session.access_token);

      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (userData) setUserName(userData.name);
      await fetchNotes(session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setToken(session.access_token);
      else router.replace('/login');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchNotes = async (accessToken: string) => {
    setLoading(true);
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      const mappedNotes = data.map((item: Record<string, unknown>) => ({
        id: Number(item.id),
        user_id: typeof item.user_id === 'string' ? item.user_id : undefined,
        title: typeof item.title === 'string' ? item.title : '',
        content: typeof item.description === 'string' ? item.description : '',
        created_at: typeof item.created_at === 'string' ? item.created_at : '',
      }));
      setNotes(mappedNotes);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setEditingNoteId(null);
  };

  const addNote = async () => {
    if (!token || !noteTitle.trim()) return;

    const isEditing = editingNoteId !== null;
    const res = await fetch(isEditing ? `/api/tasks/${editingNoteId}` : '/api/tasks', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: noteTitle,
        description: noteContent,
        priority: 1,
        status: 'pending',
      }),
    });

    if (res.ok) {
      await fetchNotes(token);
      resetForm();
    }
  };

  const startEditNote = (note: Note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content ?? '');
    setEditingNoteId(note.id);
  };

  const cancelEditNote = () => {
    resetForm();
  };

  const deleteNote = async (id: number) => {
    if (!token) return;

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return {
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
    handleLogout,
    startEditNote,
    cancelEditNote,
  };
}
