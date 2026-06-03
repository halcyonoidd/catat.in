"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };
  return (
    <aside className="w-72 bg-gray-50 min-h-screen border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div className="p-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold">Y</div>
            <div>
              <div className="text-sm font-semibold text-slate-900">your name</div>
              <div className="text-xs text-slate-500">yourname@gmail.com</div>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
            </svg>
            <span className="flex-1">Profil</span>
          </Link>

          <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <span className="flex-1">My Tasks</span>
          </Link>

          <Link href="/notes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <span className="flex-1">My Notes</span>
          </Link>

          <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0v6a2 2 0 01-2 2h-6m-4-4L3 19V5a2 2 0 012-2h6" />
            </svg>
            <span className="flex-1">My Wishlist</span>
            <span className="text-xs bg-white border border-gray-200 text-slate-600 px-2 py-0.5 rounded">1</span>
          </Link>
        </nav>
      </div>

      <div className="p-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span>
              Keluar
            </span>
        </button>
      </div>
    </aside>
  );
}