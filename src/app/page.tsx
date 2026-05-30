// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Definisi tipe data tugas
interface Todo {
  id: number;
  title: string;
  is_completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [taskTitle, setTaskTitle] = useState('');

  // 1. Ambil data dari Supabase saat halaman dibuka
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) console.error('Error fetching:', error);
    else setTodos(data || []);
  };

  // 2. Tambah Tugas Baru
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: taskTitle }])
      .select();

    if (error) console.error('Error adding:', error);
    else {
      setTodos([...todos, ...data]);
      setTaskTitle('');
    }
  };

  // 3. Update Status Tugas (Selesai / Belum)
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

  // 4. Hapus Tugas
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
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Pencatat Tugas</h1>
        
        {/* Form Tambah Tugas */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Tambah tugas baru..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            Tambah
          </button>
        </form>

        {/* List Tugas */}
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => toggleTodo(todo.id, todo.is_completed)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className={`text-black ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 font-medium text-sm"
              >
                Hapus
              </button>
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