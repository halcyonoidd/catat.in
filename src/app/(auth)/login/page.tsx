'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === 'register' && password !== confirmPassword) {
      setMessage({ text: 'Password dan konfirmasi password harus sama.', type: 'error' });
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setMessage({ text: error.message, type: 'error' });
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: data.user.id, email, name }]);
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (!loginError) {
          router.replace('/tasks');
          return;
        }
        setMessage({ text: 'Akun dibuat! Silakan login.', type: 'success' });
      }

    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setMessage({ text: 'Email atau password salah.', type: 'error' });
        } else if (error.message.includes('Email not confirmed')) {
          setMessage({ text: 'Email belum dikonfirmasi. Matikan "Email confirmations" di Supabase.', type: 'error' });
        } else {
          setMessage({ text: error.message, type: 'error' });
        }
        setLoading(false);
        return;
      }

      router.replace('/tasks');
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.22),_transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.34] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.45)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="absolute inset-0 opacity-[0.26] [background-image:radial-gradient(rgba(255,255,255,0.9)_1.5px,transparent_1.5px)] [background-size:20px_20px] [mask-image:radial-gradient(circle_at_top_left,black,transparent_68%)]" />
      <div className="absolute inset-0 opacity-[0.2] [background-image:repeating-linear-gradient(135deg,rgba(56,189,248,0.22)_0,rgba(56,189,248,0.22)_2px,transparent_2px,transparent_16px)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(15,23,42,0.82),rgba(15,23,42,0.64))]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/90 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6">
          <div className="mb-4 text-center">
            <img src="/logo.png" alt="Logo catat.in" className="mx-auto h-24 w-24" />
            <p className="mt-1 text-sm text-slate-600">
              {mode === 'login' ? 'Masuk untuk lanjut ke daftar tugas' : 'Buat akun baru untuk mulai mencatat'}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`rounded-xl px-4 py-2 transition ${
                mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'hover:text-slate-950'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage(null);
              }}
              className={`rounded-xl px-4 py-2 transition ${
                mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'hover:text-slate-950'
              }`}
            >
              Daftar
            </button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
                    Nama
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Nama kamu"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
                <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 karakter"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {message && (
              <p
                className={`rounded-xl px-3 py-2 text-sm ${
                  message.type === 'error'
                    ? 'border border-red-200 bg-red-50 text-red-700'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-3 py-2 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat akun'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setMessage(null);
              }}
              className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-950"
            >
              {mode === 'login' ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}