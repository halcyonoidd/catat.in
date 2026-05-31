import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

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
    .eq('user_id', user.id)
    // UBAH: dari 'urgency' menjadi 'priority'
    .order('priority', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  // UBAH: Tangkap priority, deadline, dan status dari frontend
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
      priority: priority ?? 1, // UBAH: dari urgency ke priority
      deadline: deadline ?? null, // TAMBAH: agar input tanggal masuk ke db
      status: status ?? 'pending', // TAMBAH: status tugas
      is_completed: false,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}