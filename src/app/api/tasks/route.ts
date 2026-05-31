import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

// --- LOGIKA SORTING CUSTOM ---
interface Task {
  id: number;
  priority: number;
  deadline?: string | null;
  created_at: string;
  [key: string]: any;
}

const sortTasksLogic = (tasksList: Task[]) => {
  return [...tasksList].sort((a, b) => {
    // 1. Cek Prioritas (Descending: 3 -> 2 -> 1)
    if (b.priority !== a.priority) return b.priority - a.priority;
    
    // 2. Jika prioritas sama, cek Deadline
    const hasDeadlineA = !!a.deadline;
    const hasDeadlineB = !!b.deadline;

    if (hasDeadlineA && hasDeadlineB) {
      const dateDeadlineA = new Date(a.deadline as string).getTime();
      const dateDeadlineB = new Date(b.deadline as string).getTime();
      if (dateDeadlineA !== dateDeadlineB) return dateDeadlineA - dateDeadlineB;
    } else if (hasDeadlineA && !hasDeadlineB) {
      return -1; // A punya deadline, letakkan di atas
    } else if (!hasDeadlineA && hasDeadlineB) {
      return 1;  // B punya deadline, letakkan di atas
    }
    
    // 3. Jika prioritas dan deadline sama, berdasarkan waktu pembuatan
    const dateCreatedA = new Date(a.created_at || '').getTime();
    const dateCreatedB = new Date(b.created_at || '').getTime();
    return dateCreatedA - dateCreatedB;
  });
};
// ------------------------------

async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Eksekusi logika sorting sebelum dikirim ke frontend
  const sortedData = sortTasksLogic(data);

  return NextResponse.json(sortedData);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, priority, deadline, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Judul tidak boleh kosong' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert([{
      user_id: user.id,
      title,
      description: description ?? null,
      priority: priority ?? 1, 
      deadline: deadline ?? null, 
      status: status ?? 'pending', 
      is_completed: false,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}