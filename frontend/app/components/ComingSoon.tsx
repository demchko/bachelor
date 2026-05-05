'use client';

import AppLayout from '@/app/components/AppLayout';
import Link from 'next/link';

function ComingSoon({ title, description, from }: { title: string; description: string; from: string }) {
  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{description}<br />Розділ у розробці — буде доступний незабаром.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition">
            ← На дашборд
          </Link>
          <p className="text-xs text-gray-400 mt-4">Перейдено з: {from}</p>
        </div>
      </main>
    </AppLayout>
  );
}

export { ComingSoon };
