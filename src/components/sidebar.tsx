"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';


export default function Sidebar() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      setUserEmail(session.user.email ?? '');

      const { data: profile } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', session.user.id)
        .single();

      setUserName(profile?.name ?? session.user.user_metadata?.name ?? '');
      setUserEmail(profile?.email ?? session.user.email ?? '');
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      setUserEmail(session.user.email ?? '');
      setUserName(session.user.user_metadata?.name ?? '');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const avatarLabel = (userName || userEmail || 'U').trim().charAt(0).toUpperCase();

  return (
    <aside className="w-72 bg-gray-50 min-h-screen border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div className="p-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold">{avatarLabel}</div>
            <div>
              {userName && <p className="text-sm text-gray-500">Halo, {userName}!</p>}
              <div className="text-xs text-slate-500">{userEmail || 'Email belum tersedia'}</div>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <span className="flex-1">Profil</span>
          </Link>

          <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <span className="flex-1">My Tasks</span>
          </Link>

          <Link href="/notes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <span className="flex-1">My Notes</span>
          </Link>

          <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <span className="flex-1">My Wishlist</span>
          </Link>
        </nav>
      </div>

      <div className="p-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition">
            <span>
              Keluar
            </span>
        </button>
      </div>
    </aside>
  );
}