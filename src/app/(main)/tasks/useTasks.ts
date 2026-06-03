import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export interface Tasks {
  id: number;
  user_id?: string;
  title: string;
  description?: string | null;
  priority: number;
  deadline?: string | null;
  status?: string | null;
  is_completed?: boolean;
  created_at: string;
}

export const priorityLabel: Record<number, { text: string; color: string }> = {
  1: { text: 'Rendah',  color: 'text-green-500' },
  2: { text: 'Sedang',  color: 'text-yellow-500' },
  3: { text: 'Tinggi',  color: 'text-red-500' },
};

export function useTasks() {
  const router = useRouter();
  const [todos, setTodos] = useState<Tasks[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);


  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<number>(1);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('pending');

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority(1);
    setDeadline('');
    setStatus('pending');
    setEditingTaskId(null);
  };

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
    }
    setLoading(false);
  };

  const addTasks = async () => {
    if (!taskTitle.trim() || !token) return;

    const isEditing = editingTaskId !== null;
    const res = await fetch(isEditing ? `/api/tasks/${editingTaskId}` : '/api/tasks', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        deadline: deadline ? deadline : null,
        status: status,
      }),
    });

    if (res.ok) {
      await fetchTasks(token);
      resetForm();
    }
  };

  const startEditTask = (task: Tasks) => {
    setTaskTitle(task.title);
    setTaskDescription(task.description ?? '');
    setTaskPriority(task.priority ?? 1);
    setDeadline(task.deadline ? task.deadline.slice(0, 16) : '');
    setStatus(task.status ?? 'pending');
    setEditingTaskId(task.id);
  };

  const cancelEditTask = () => {
    resetForm();
  };

  const toggleTask = async (id: number, currentStatus: boolean) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        is_completed: !currentStatus,
        status: !currentStatus ? 'completed' : 'pending'
      }),
    });

    if (res.ok && token) {
      await fetchTasks(token);
    }
  };


  const updateTask = async (id: number, updatedFields: Partial<Tasks>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedFields),
    });

    if (res.ok && token) {
      await fetchTasks(token);
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

  // Kirim semua data dan fungsi agar bisa dipakai oleh UI
  return {
    todos, userName, loading,
    taskTitle, setTaskTitle,
    taskDescription, setTaskDescription,
    taskPriority, setTaskPriority,
    deadline, setDeadline,
    status, setStatus,
    editingTaskId,
    addTasks, toggleTask, deleteTask, handleLogout, updateTask, startEditTask, cancelEditTask
  };
}