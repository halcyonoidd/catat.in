'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface Todo {
  id: number;
  user_id: string;
  title: string;
  description: string;
  urgency: number;
  is_completed: boolean;
}

const urgencyLabel: Record<number, { text: string; color: string }> = {
  1: { text: 'Rendah',  color: 'text-green-500' },
  2: { text: 'Sedang',  color: 'text-yellow-500' },
  3: { text: 'Tinggi',  color: 'text-red-500' },
};

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskUrgency, setTaskUrgency] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Cek sesi awal
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
      fetchTodos(session.access_token);
    });

    // ✅ Listen perubahan auth di dalam useEffect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) setToken(session.access_token);
        else router.replace('/login');
      }
    );

    // ✅ Cleanup saat komponen unmount
    return () => subscription.unsubscribe();
  }, [router]);

  const fetchTodos = async (accessToken: string) => {
    setLoading(true);
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      setTodos(data);
    } else {
      console.error('Error fetching todos');
    }
    setLoading(false);
  };

  const addTodo = async () => {
    if (!taskTitle.trim() || !token) return;

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        urgency: taskUrgency,
      }),
    });

    if (res.ok) {
      const newTask = await res.json();
      setTodos([newTask, ...todos]);
      setTaskTitle('');
      setTaskDescription('');
      setTaskUrgency(1);
    } else {
      console.error('Error adding task');
    }
  };

  const toggleTask = async (id: number, currentStatus: boolean) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_completed: !currentStatus }),
    });

    if (res.ok) {
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    }
  };

  const deleteTask = async (id: number) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pencatat Tugas</h1>
            {userName && <p className="text-sm text-gray-500">Halo, {userName}!</p>}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Keluar
          </button>
        </div>

        {/* Form Tambah Tugas */}
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Judul tugas..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <textarea
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
            placeholder="Deskripsi (opsional)..."
            rows={2}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 font-medium">Urgensi:</label>
            <select
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={taskUrgency}
              onChange={(e) => setTaskUrgency(Number(e.target.value))}
            >
              <option value={1}>1 — Rendah</option>
              <option value={2}>2 — Sedang</option>
              <option value={3}>3 — Tinggi</option>
            </select>
            <button
              onClick={addTodo}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* List Tugas */}
        {loading ? (
          <p className="text-center text-gray-400 text-sm">Memuat tugas...</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={() => toggleTask(todo.id, todo.is_completed)}
                      className="w-5 h-5 cursor-pointer mt-0.5 shrink-0"
                    />
                    <div className="flex flex-col gap-1">
                      <span className={`font-medium text-black ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.title}
                      </span>
                      {todo.description && (
                        <span className="text-sm text-gray-500">{todo.description}</span>
                      )}
                      <span className={`text-xs font-semibold ${urgencyLabel[todo.urgency]?.color ?? 'text-gray-400'}`}>
                        ● Urgensi: {urgencyLabel[todo.urgency]?.text ?? '-'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(todo.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && todos.length === 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">Belum ada tugas. Bersantai sejenak!</p>
        )}
      </div>
    </main>
  );
}