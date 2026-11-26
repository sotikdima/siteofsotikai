import React from 'react';

interface SectionRacingBackgroundProps {
  image?: string;
  opacity?: string;
  hasKerb?: boolean;
  kerbPosition?: 'bottom' | 'top' | 'both';
  accentGradient?: string;
}

export const SectionRacingBackground: React.FC<SectionRacingBackgroundProps> = ({
  image = '/images/forza_racing_car_1794261906314.jpg',
  opacity = 'opacity-20 sm:opacity-25',
  hasKerb = true,
  kerbPosition = 'bottom',
  accentGradient = 'from-amber-400/15 via-transparent to-red-500/10',
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0 rounded-[28px]">
      {/* Real Racing Photo Background Under Frosted Glass */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover ${opacity} mix-blend-multiply transition-transform duration-1000 scale-100 group-hover:scale-105`}
      />

      {/* Racing dynamic gradient tint */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${accentGradient} pointer-events-none`} />

      {/* Subtle Racing Checkered / Speed overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent pointer-events-none" />

      {/* Racing Kerb (Гоночный поребрик красно-белый) */}
      {hasKerb && (kerbPosition === 'bottom' || kerbPosition === 'both') && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(45deg,#dc2626_0,#dc2626_16px,#ffffff_16px,#ffffff_32px)] opacity-35" />
      )}
      {hasKerb && (kerbPosition === 'top' || kerbPosition === 'both') && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#dc2626_0,#dc2626_16px,#ffffff_16px,#ffffff_32px)] opacity-25" />
      )}
    </div>
  );
};
