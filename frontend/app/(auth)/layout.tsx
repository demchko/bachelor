import AnimatedRing from '../components/AnimatedRing';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#1e3a5f] to-[#2d5a8f] text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Logo and Title */}
        <div className="absolute top-8 left-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">
              IR
            </div>
            <h1 className="text-xl font-semibold">IRB Explorer</h1>
          </div>
          <p className="text-sm text-white/70 ml-13">Lviv Polytechnic National University</p>
        </div>

        {/* Central Content */}
        <div className="z-10 text-center">
          <AnimatedRing />
          
          <h2 className="text-4xl font-bold mb-4">
            Досліджуй кільцеві<br />в&apos;язанки
          </h2>
          
          <p className="text-white/80 max-w-md mx-auto">
            Інтерактивна платформа для вивчення<br />
            комбінаторних конфігурацій ІКВ
          </p>
        </div>

        {/* Bottom Features - shown on some pages */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Генератор ІКВ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Симуляція</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Тести</span>
            </div>
          </div>
          
          {/* Math formula */}
          <div className="mt-4 text-center text-white/60 font-mono text-sm">
            R · (S - 1) = n · (n - 1)
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
