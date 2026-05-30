'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

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
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">catat.in</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}
        </p>

        <div className="flex flex-col gap-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Nama"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (min. 8 karakter)"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {message && (
            <p className={`text-sm px-3 py-2 rounded-lg ${
              message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {message.text}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </div>

        <p className="text-sm text-center text-gray-500 mt-4">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}
            className="text-blue-500 hover:underline font-medium"
          >
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </main>
  );
}