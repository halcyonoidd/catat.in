'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface Tasks {
  id: number;
  user_id?: string;
  title: string;
  description?: string | null;
  priority: number;
  deadline?: string | null;
  status?: string | null;
  is_completed?: boolean;
}

const priorityLabel: Record<number, { text: string; color: string }> = {
  1: { text: 'Rendah',  color: 'text-green-500' },
  2: { text: 'Sedang',  color: 'text-yellow-500' },
  3: { text: 'Tinggi',  color: 'text-red-500' },
};

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Tasks[]>([]);
  const [userName, setUserName] = useState<string>('');
  
  // State form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<number>(1);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('pending');
  
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

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
      fetchTasks(session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) setToken(session.access_token);
        else router.replace('/login');
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchTasks = async (accessToken: string) => {
    setLoading(true);
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      setTodos(data);
    } else {
      const errorData = await res.json();
      console.error('Error fetching tasks detail:', errorData);
      alert(`Gagal memuat tugas: ${errorData.error || 'Terjadi kesalahan'}`);
    }
    setLoading(false);
  };

  const addTasks = async () => {
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
        priority: taskPriority,
        deadline: deadline ? deadline : null, // Kirim null jika kosong
        status: status,
      }),
    });

    if (res.ok) {
      const newTask = await res.json();
      setTodos([newTask, ...todos]);
      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority(1);
      setDeadline('');
      setStatus('pending');
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
      // Mengubah is_completed dan otomatis mengubah status jika diperlukan
      body: JSON.stringify({ 
        is_completed: !currentStatus,
        status: !currentStatus ? 'completed' : 'pending'
      }),
    });

    if (res.ok) {
      setTodos(todos.map(t => 
        t.id === id 
          ? { ...t, is_completed: !currentStatus, status: !currentStatus ? 'completed' : 'pending' } 
          : t
      ));
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
        <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-lg border">
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
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 font-medium mb-1">Prioritas</label>
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                value={taskPriority}
                onChange={(e) => setTaskPriority(Number(e.target.value))}
              >
                <option value={1}>1 — Rendah</option>
                <option value={2}>2 — Sedang</option>
                <option value={3}>3 — Tinggi</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 font-medium mb-1">Status</label>
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600 font-medium mb-1">Tenggat Waktu (Deadline)</label>
            <div className="flex gap-3">
              <input
                type="datetime-local" // <-- UBAH KE DATETIME-LOCAL
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <button
                onClick={addTasks}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {/* List Tugas */}
        {loading ? (
          <p className="text-center text-gray-400 text-sm">Memuat tugas...</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className={`p-3 rounded-lg border transition-all ${todo.is_completed ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.is_completed || false}
                      onChange={() => toggleTask(todo.id, todo.is_completed || false)}
                      className="w-5 h-5 cursor-pointer mt-0.5 shrink-0"
                    />
                    <div className="flex flex-col gap-1 w-full">
                      <span className={`font-medium text-black ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.title}
                      </span>
                      
                      {todo.description && (
                        <span className={`text-sm ${todo.is_completed ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todo.description}
                        </span>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 ${priorityLabel[todo.priority]?.color ?? 'text-gray-400'}`}>
                          Prioritas: {priorityLabel[todo.priority]?.text ?? '-'}
                        </span>
                        
                        {todo.status && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            Status: {todo.status.replace('_', ' ')}
                          </span>
                        )}

                        {todo.deadline && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${new Date(todo.deadline) < new Date() && !todo.is_completed ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            {/* UBAH KE toLocaleString AGAR JAM MUNCUL */}
                            📅 {new Date(todo.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(todo.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm shrink-0 p-1"
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