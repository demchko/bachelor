import type { ReactNode } from 'react';
import Link from 'next/link';

function External({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-cyan-700 underline hover:text-cyan-900 break-all">
      {children}
    </a>
  );
}

export type TheoryTopic = {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  content: ReactNode;
};

export const THEORY_TOPICS: TheoryTopic[] = [
  {
    id: 'intro',
    title: 'Що таке ІКВ у цьому проєкті',
    emoji: '📖',
    duration: '6 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>
          <strong>Інтервальна кільцева в&apos;язанка (ІКВ)</strong> у IRB Explorer — це впорядкована послідовність
          натуральних чисел <em>k₁, …, kₙ</em>, з якої будується комбінаторна структура на циклічній групі{' '}
          <strong>Z_S</strong>, де в цьому застосуванні <strong>S = k₁ + … + kₙ</strong> (сума елементів
          послідовності).
        </p>
        <p>
          Множина зсувів часткових сум по модулю <em>S</em> утворює <strong>множину різниць</strong> D ⊂ Z_S — базу
          для <strong>циклічного коду</strong> (матриця <em>H</em>, синдроми). Довжина <em>n</em> задає{' '}
          <strong>монолітний</strong> блок <em>n</em> бітів із словами <code className="rounded bg-slate-100 px-1">1^w 0^(n−w)</code>.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950">
          <p className="font-bold mb-1">Практично</p>
          <p>
            <Link className="font-semibold text-amber-800 underline" href="/generator">
              Генератор
            </Link>
            {' → '}
            <Link className="font-semibold text-amber-800 underline" href="/cyclic-codes">
              циклічна
            </Link>
            {' / '}
            <Link className="font-semibold text-amber-800 underline" href="/vector-codes">
              монолітна
            </Link>
            {' лабораторія.'}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'irb-formal',
    title: 'ІКВ у відкритих джерелах (визначення)',
    emoji: '🌐',
    duration: '8 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>
          У статті колективу Львівської політехніки в <em>Ukrainian Journal of Information Technologies</em> (2021)
          <strong> Ideal Ring Bundles (IRB)</strong> описано так: це <strong>циклічні послідовності додатних цілих
          чисел</strong>, які утворюють <strong>ідеальні розбиття скінченного інтервалу цілих чисел</strong>; суми{' '}
          <em>з&apos;єднаних</em> (послідовних на кільці) елементів ІКВ перелічають множину натуральних чисел{' '}
          <strong>рівно R разів</strong> (параметр покриття <em>R</em>).
        </p>
        <p className="text-xs text-slate-500 border-l-2 border-slate-300 pl-3 italic">
          Формулювання узгоджене з англомовним анотаційним текстом публікації на порталі LPNU; деталі та повний
          список літератури див. у оригіналі статті.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            DOI: <External href="https://doi.org/10.23939/ujit2021.03.099">10.23939/ujit2021.03.099</External>
          </li>
          <li>
            Сторінка статті:{' '}
            <External href="https://science.lpnu.ua/ujit/all-volumes-and-issues/volume-3-number-1/comparative-analysis-monolithic-and-cyclic-noise">
              Comparative analysis of monolithic and cyclic noise-protective codes effectiveness (LPNU)
            </External>
          </li>
          <li>
            Тематична добірка «Ideal Ring Bundle»:{' '}
            <External href="https://science.lpnu.ua/taxonomy/term/7239">science.lpnu.ua/taxonomy/term/7239</External>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'roadmap',
    title: 'Маршрут користувача',
    emoji: '🗺️',
    duration: '4 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <Link className="font-semibold text-orange-700 hover:underline" href="/dashboard">
              Головна панель
            </Link>{' '}
            — статистика та швидкі посилання.
          </li>
          <li>
            <Link className="font-semibold text-orange-700 hover:underline" href="/generator">
              Генератор ІКВ
            </Link>{' '}
            — параметри <em>n</em>, <em>R</em>, збереження конфігурацій.
          </li>
          <li>
            <Link className="font-semibold text-orange-700 hover:underline" href="/vector-codes">
              Монолітні
            </Link>{' '}
            та{' '}
            <Link className="font-semibold text-orange-700 hover:underline" href="/cyclic-codes">
              циклічні
            </Link>{' '}
            коди.
          </li>
          <li>
            <Link className="font-semibold text-orange-700 hover:underline" href="/simulation">
              Симуляція
            </Link>{' '}
            — BSC, порівняння з бінарним каналом і RS (оцінка).
          </li>
          <li>
            <Link className="font-semibold text-orange-700 hover:underline" href="/tests">
              Тести
            </Link>
            .
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: 'monolithic',
    title: 'Монолітний (векторний) код',
    emoji: '📊',
    duration: '8 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>
          <strong>Монолітні ІКВ-коди</strong>: кодові слова складаються з «пакетів» однакових символів — суцільних
          блоків <code className="rounded bg-slate-100 px-1">1</code> та <code className="rounded bg-slate-100 px-1">0</code>.
          У відкритій статті 2021 зазначено, що така структура сприяє{' '}
          <strong>самокорекції та виявленню / виправленню помилок</strong> через групування символів, а також може
          підтримувати <strong>швидке декодування</strong> і <strong>багаторівневе</strong> кодування (зв&apos;язок із
          захистом даних розглядається в тій же роботі як перспектива конфігурації систем).
        </p>
        <p>
          У застосунку: слова <code className="rounded bg-slate-100 px-1">1^w 0^(n−w)</code>, інформація — індекс ваги
          у ⌈log₂(n+1)⌉ бітах; декодер шукає найкраще монолітне слово за відстанню Хемінга (навчальна модель).
        </p>
        <Link
          href="/vector-codes"
          className="inline-flex rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700"
        >
          Лабораторія монолітних кодів
        </Link>
      </div>
    ),
  },
  {
    id: 'cyclic',
    title: 'Циклічний код на ІКВ',
    emoji: '🔁',
    duration: '8 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>
          <strong>Циклічні ІКВ-коди</strong>: перевірочна структура будується на комбінаторній конфігурації з
          кільцем <strong>Z_S</strong>. За матеріалами UJIT 2021, оптимізовані циклічні ІКВ-коди вигідно відрізняються
          <strong> чітко фіксованою кількістю виявлюваних і виправлюваних помилок</strong> при доборі інформаційних
          параметрів (порівняно з монолітним варіантом на тій самій ІКВ-платформі).
        </p>
        <p>
          У застосунку: матриці <em>G</em>, <em>H</em>, синдромне декодування одиничної помилки; обмеження на{' '}
          <em>S</em> для швидкості в браузері.
        </p>
        <Link
          href="/cyclic-codes"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
        >
          Лабораторія циклічних кодів
        </Link>
      </div>
    ),
  },
  {
    id: 'mono-vs-cyclic',
    title: 'Порівняння монолітного й циклічного (за статтею 2021)',
    emoji: '⚖️',
    duration: '7 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>За підсумками порівняльного аналізу в тій самій публікації (див. DOI вище), коротко:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Циклічні</strong> ІКВ-коди з оптимізованими параметрами — перевага у{' '}
            <em>прогнозованій кількості</em> виявлених і виправлених помилок.
          </li>
          <li>
            <strong>Монолітні</strong> — перевага у <em>швидкості декодування повідомлення</em> завдяки самокорекції
            та структурі «пакетів»; також згадується можливість багаторівневого кодування й розширення можливостей
            шифрування / захисту від несанкціонованого доступу в контексті конфігурації системи.
          </li>
        </ul>
        <p className="text-xs text-slate-600">
          Для порівняння з класичними кодами Ріда–Соломона на тій самій тематиці див., наприклад, публікацію у{' '}
          <External href="https://nv.nltu.edu.ua/index.php/journal/article/view/2719">
            Scientific Bulletin of UNFU (НЛТУ)
          </External>{' '}
          — відкритий доступ до PDF на сайті журналу.
        </p>
      </div>
    ),
  },
  {
    id: 'barker-irb',
    title: 'Barker-подібні послідовності та ІКВ',
    emoji: '📶',
    duration: '5 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>
          На порталі LPNU в тому ж випуску UJIT (vol. 3, no. 1) опубліковано роботу про{' '}
          <strong>синтез завадостійких Barker-подібних послідовностей</strong> з адаптацією до рівня завад — з
          використанням ідеальних кільцевих в&apos;язанок як комбінаторної основи.
        </p>
        <p>
          <External href="https://science.lpnu.ua/ujit/all-volumes-and-issues/volume-3-number-1/synthesis-barker-sequences-adaptation-size">
            Synthesis of Barker-like sequences with adaptation to the size of the interference (LPNU)
          </External>
        </p>
      </div>
    ),
  },
  {
    id: 'channel',
    title: 'Канал BSC і симуляція',
    emoji: '📡',
    duration: '7 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>
          <strong>BSC</strong> — кожен біт незалежно інвертується з імовірністю <em>p</em>. Це стандартна модель для
          навчальних симуляторів; див. огляд у{' '}
          <External href="https://en.wikipedia.org/wiki/Binary_symmetric_channel">Wikipedia: Binary symmetric channel</External>.
        </p>
        <p>
          У симуляторі: Monte Carlo для ІКВ і бінарного каналу; крива для <strong>RS(255,191)</strong> на графіку —
          аналітична оцінка блоку (не повна реалізація GF(2⁸)), щоб порівняти порядки величин з ІКВ на одній осі{' '}
          <em>p</em>.
        </p>
        <Link
          href="/simulation"
          className="inline-flex rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-cyan-700"
        >
          Симуляція каналу
        </Link>
      </div>
    ),
  },
  {
    id: 'classical',
    title: 'Класичні коди та відстань Хемінга',
    emoji: '📐',
    duration: '8 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>
          <strong>Відстань Хемінга</strong> <em>d</em> між двійковими словами — кількість позицій, де біти
          відрізняються. Лінійний блоковий код виправляє <em>t</em> помилок, якщо <em>2t + 1 ≤ d</em> (у грубому
          наближенні для навчання). Огляд:{' '}
          <External href="https://en.wikipedia.org/wiki/Error_correction_code">Error correction code (Wikipedia)</External>.
        </p>
        <p>
          <strong>Циклічні коди</strong> як підклас лінійних: зручна алгебра та регістри зсуву; вступ:{' '}
          <External href="https://en.wikipedia.org/wiki/Cyclic_code">Cyclic code (Wikipedia)</External>. Коди{' '}
          <strong>BCH</strong>:{' '}
          <External href="https://en.wikipedia.org/wiki/BCH_code">BCH code (Wikipedia)</External> — на них часто
          орієнтують інтуїцію для RS (інший алфавіт, але спільна ідея контрольних символів).
        </p>
        <p className="text-xs text-slate-500">
          Класичні підручники, на які посилається стаття LPNU 2021 у списку літератури: Blahut (1986), Peterson &amp;
          Weldon (1972) — див. бібліографію оригінальної статті на сайті журналу.
        </p>
      </div>
    ),
  },
  {
    id: 'dissertation',
    title: 'Дисертація та монографії (за бібліографією LPNU)',
    emoji: '🎓',
    duration: '6 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p>У списку літератури до статті UJIT 2021 (сторінка LPNU) зокрема згадано:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            <strong>Kis Y. P.</strong> (1997). <em>Modeling and synthesis of protective codes by ideal ring bundles</em>
            . Дисертація кандидата технічних наук, Львівська політехніка — фундаментальне джерело з синтезу захисних
            кодів на ІКВ.
          </li>
          <li>
            <strong>Riznyk V. V.</strong> (1989). <em>Synthesis of optimal combinatorial systems</em> (монографія,
            Львів).
          </li>
          <li>
            <strong>Riznyk V. V.</strong> (2019). <em>Combinatorial optimization of multidimensional systems…</em>{' '}
            (Видавництво Львівської політехніки).
          </li>
        </ul>
        <p className="text-xs text-slate-500">
          Повні бібліографічні описи та інші позиції (Hall, MacWilliams &amp; Sloane тощо) — у PDF статті за посиланням
          на LPNU вище.
        </p>
        <p>
          ORCID В. В. Різника:{' '}
          <External href="https://orcid.org/0000-0002-3880-4595">0000-0002-3880-4595</External>
        </p>
      </div>
    ),
  },
  {
    id: 'properties',
    title: 'Обмеження платформи',
    emoji: '⚙️',
    duration: '4 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <ul className="list-disc pl-5 space-y-2">
          <li>Валідація послідовностей і обмеження довжини блоку для циклічного коду (продуктивність).</li>
          <li>Симуляція: ліміт пакетів, спрощена модель RS на графіку.</li>
          <li>Теорія тут — навчальний конспект; для формальних доказів див. оригінальні статті та книги.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'literature',
    title: 'Відкриті джерела та цитування',
    emoji: '📚',
    duration: '10 хв',
    content: (
      <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
        <p className="font-semibold text-slate-900">Ключова стаття (повний текст / метадані на LPNU)</p>
        <p className="text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-slate-800">
          Riznyk, V. V., Skrybajlo-Leskiv, D. Y., Badz, B. M., Hlod, C. I., Liakh, V. V., Kulyk, Y.-M., Romanjuk, N.
          B., Tkachuk, K. I., &amp; Ukrajinets, V. V. (2021). Comparative analysis of monolithic and cyclic
          noise-protective codes effectiveness. Ukrainian Journal of Information Technology, 3(1), 99–105.{' '}
          <External href="https://doi.org/10.23939/ujit2021.03.099">https://doi.org/10.23939/ujit2021.03.099</External>
        </p>
        <p className="text-xs text-slate-600">
          ДСТУ-цитування наведено на сторінці журналу LPNU (українською) — скопіюйте звідти для бакалаврської /
          магістерської роботи.
        </p>
        <p className="font-semibold text-slate-900 mt-4">Корисні посилання</p>
        <ul className="space-y-2 text-sm list-none pl-0">
          <li>
            1.{' '}
            <External href="https://science.lpnu.ua/ujit/all-volumes-and-issues/volume-3-number-1/comparative-analysis-monolithic-and-cyclic-noise">
              LPNU — стаття про монолітний vs циклічний ІКВ-код (2021)
            </External>
          </li>
          <li>
            2. <External href="https://science.lpnu.ua/taxonomy/term/7239">LPNU — добірка «Ideal Ring Bundle»</External>
          </li>
          <li>
            3.{' '}
            <External href="https://science.lpnu.ua/ujit/all-volumes-and-issues/volume-3-number-1/synthesis-barker-sequences-adaptation-size">
              LPNU — Barker-подібні послідовності та ІКВ (2021)
            </External>
          </li>
          <li>
            4.{' '}
            <External href="https://nv.nltu.edu.ua/index.php/journal/article/view/2719">
              НЛТУ — аналіз монолітних ІКВ-кодів vs Reed–Solomon (відкритий доступ)
            </External>
          </li>
          <li>
            5. <External href="https://orcid.org/0000-0002-3880-4595">ORCID — Volodymyr Riznyk</External>
          </li>
          <li>
            6. <External href="https://en.wikipedia.org/wiki/Error_correction_code">Wikipedia — Error correction</External>
          </li>
          <li>
            7. <External href="https://en.wikipedia.org/wiki/Binary_symmetric_channel">Wikipedia — BSC</External>
          </li>
        </ul>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/tests" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:border-violet-300">
            Тести
          </Link>
          <Link href="/profile" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:border-violet-300">
            Профіль
          </Link>
        </div>
      </div>
    ),
  },
];
