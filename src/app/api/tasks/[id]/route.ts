import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const allowedUpdates: Record<string, unknown> = {};

  if (typeof body.title === 'string') {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: 'Judul tidak boleh kosong' }, { status: 400 });
    }
    allowedUpdates.title = title;
  }

  if (typeof body.description === 'string') {
    allowedUpdates.description = body.description;
  }

  if (body.priority !== undefined) {
    allowedUpdates.priority = Number(body.priority);
  }

  if (body.deadline !== undefined) {
    allowedUpdates.deadline = body.deadline;
  }

  if (typeof body.status === 'string') {
    allowedUpdates.status = body.status;
  }

  if (body.is_completed !== undefined) {
    allowedUpdates.is_completed = body.is_completed;
  }

  const { data: existing } = await supabaseAdmin
    .from('tasks')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update(allowedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data: existing } = await supabaseAdmin
    .from('tasks')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}