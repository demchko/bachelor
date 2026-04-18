'use client';

export default function AnimatedRing() {
  return (
    <div className="relative w-64 h-64 mx-auto mb-12">
      {/* Animated Ring */}
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Main ring */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="3"
          className="animate-[spin_20s_linear_infinite]"
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Nodes on the ring */}
        <circle cx="100" cy="30" r="5" fill="white" className="animate-pulse" />
        <circle cx="170" cy="100" r="5" fill="white" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        <circle cx="100" cy="170" r="5" fill="white" className="animate-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="30" cy="100" r="5" fill="white" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        {/* Connection symbols */}
        <text x="45" y="35" fill="white" fontSize="14" className="font-mono">7</text>
        <text x="175" y="75" fill="white" fontSize="14" className="font-mono">1</text>
        <text x="125" y="185" fill="white" fontSize="14" className="font-mono">3</text>
        <text x="5" y="115" fill="white" fontSize="14" className="font-mono">2</text>
      </svg>
    </div>
  );
}
