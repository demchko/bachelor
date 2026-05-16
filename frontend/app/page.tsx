import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#1e3a5f] to-[#2d5a8f] flex flex-col">
      <header className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm text-white">
            IR
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">IRB Explorer</h1>
            <p className="text-xs text-white/70">Lviv Polytechnic National University</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Публічні посилання">
          <Link
            href="/login"
            className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 border border-white/20"
          >
            Увійти
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
          >
            Реєстрація
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center text-white">
        <div className="max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Досліджуй кільцеві<br />
            в&apos;язанки
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-4">
            Інтерактивна платформа для вивчення
            <br className="hidden md:block" />
            комбінаторних конфігурацій ІКВ
          </p>

          <p className="text-white/70 mb-10 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Після входу ви отримуєте єдину навігацію: генератор послідовностей, дві лабораторії кодів, симуляцію
            зашумленого каналу, теоретичний модуль, тести та профіль зі статистикою — усе для завершеного навчального
            циклу з кодування на основі ІКВ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              Розпочати безкоштовно
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 border border-white/30"
            >
              Увійти в систему
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Генератор ІКВ</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Параметри n, R, перевірка умов ідеальної кільцевої в&apos;язанки, збереження конфігурацій у вашому
                акаунті.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm3 4h8M7 13h5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Лабораторії кодів</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Монолітні та циклічні коди на тій самій ІКВ: матриці, кільце сум, encode/decode і візуалізація помилок.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Симуляція та тести</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                BSC, порівняння з бінарним каналом і довідковою кривою RS; теорія та перевірка знань у закритому
                середовищі після входу.
              </p>
            </div>
          </div>

          <p className="mt-12 text-white/50 text-xs max-w-xl mx-auto">
            Увійдіть, щоб перейти до розділів. Зовнішня сторінка не зберігає дані симуляцій — усе в особистому
            кабінеті після автентифікації.
          </p>
        </div>
      </main>

      <footer className="p-6 text-center text-white/60 text-sm border-t border-white/10">
        <p className="mb-2">© {new Date().getFullYear()} Lviv Polytechnic National University. Всі права захищені.</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <Link href="/login" className="hover:text-white underline-offset-2 hover:underline">
            Вхід
          </Link>
          <Link href="/register" className="hover:text-white underline-offset-2 hover:underline">
            Реєстрація
          </Link>
          <Link href="/forgot-password" className="hover:text-white underline-offset-2 hover:underline">
            Скидання пароля
          </Link>
        </div>
      </footer>
    </div>
  );
}
