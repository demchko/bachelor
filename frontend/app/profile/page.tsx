'use client';

import AppLayout from '@/app/components/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Профіль</h1>
        <p className="text-sm text-gray-500 mt-0.5">Управління обліковим записом</p>
      </header>

      <main className="flex-1 px-8 py-8 max-w-xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a2332] flex items-center justify-center text-white text-xl font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-400">Обліковий запис LPNU</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Email</label>
              <p className="text-sm text-gray-900 mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">ID</label>
              <p className="text-sm text-gray-400 font-mono mt-1">{user?.id}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-lg transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Вийти з системи
          </button>
        </div>
      </main>
    </AppLayout>
  );
}
