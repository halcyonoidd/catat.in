'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ✅ UPDATE: Interface disesuaikan dengan skema tabel todos yang baru
interface Todo {
  id: number;
  user_id?: string;       // uuid, opsional jika belum pakai auth
  title: string;
  description: string;    // ✅ BARU
  urgency: number;        // ✅ BARU: int2 (misal: 1=rendah, 2=sedang, 3=tinggi)
  is_completed: boolean;
}

// Label urgency untuk tampilan
const urgencyLabel: Record<number, { text: string; color: string }> = {
  1: { text: 'Rendah',  color: 'text-green-500' },
  2: { text: 'Sedang',  color: 'text-yellow-500' },
  3: { text: 'Tinggi',  color: 'text-red-500' },
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState(''); // ✅ BARU
  const [taskUrgency, setTaskUrgency] = useState<number>(1);   // ✅ BARU

  useEffect(() => {
    fetchTodos();
  }, []);

  // ✅ Tidak ada perubahan di sini, select('*') sudah otomatis ambil semua kolom baru
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('urgency', { ascending: false }); // ✅ UPDATE: urutkan by urgency

    if (error) console.error('Error fetching:', error);
    else setTodos(data || []);
  };

  // ✅ UPDATE: insert sekarang juga menyertakan description dan urgency
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{
        title: taskTitle,
        description: taskDescription, // ✅ BARU
        urgency: taskUrgency,          // ✅ BARU
        // is_completed tidak perlu dikirim, default-nya sudah false di DB
      }])
      .select();

    if (error) console.error('Error adding:', error);
    else {
      setTodos([...todos, ...data]);
      setTaskTitle('');
      setTaskDescription(''); // ✅ reset field baru
      setTaskUrgency(1);      // ✅ reset field baru
    }
  };

  // ✅ Tidak ada perubahan di sini
  const toggleTodo = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (error) console.error('Error updating:', error);
    else {
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    }
  };

  // ✅ Tidak ada perubahan di sini
  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting:', error);
    else {
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Pencatat Tugas</h1>

        {/* ✅ UPDATE: Form sekarang punya field description dan urgency */}
        <form onSubmit={addTodo} className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Judul tugas..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          {/* ✅ BARU: Input deskripsi */}
          <textarea
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
            placeholder="Deskripsi (opsional)..."
            rows={2}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          {/* ✅ BARU: Pilih urgensi */}
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
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Tambah
            </button>
          </div>
        </form>

        {/* ✅ UPDATE: Card todo sekarang tampilkan description dan urgency */}
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li key={todo.id} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={() => toggleTodo(todo.id, todo.is_completed)}
                    className="w-5 h-5 cursor-pointer mt-0.5 shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <span className={`font-medium text-black ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                      {todo.title}
                    </span>
                    {/* ✅ BARU: Tampilkan deskripsi jika ada */}
                    {todo.description && (
                      <span className="text-sm text-gray-500">{todo.description}</span>
                    )}
                    {/* ✅ BARU: Tampilkan badge urgensi */}
                    <span className={`text-xs font-semibold ${urgencyLabel[todo.urgency]?.color ?? 'text-gray-400'}`}>
                      ● Urgensi: {urgencyLabel[todo.urgency]?.text ?? '-'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 font-medium text-sm shrink-0"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">Belum ada tugas. Bersantai sejenak!</p>
        )}
      </div>
    </main>
  );
}