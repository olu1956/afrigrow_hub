import {
  Building2,
  Handshake,
  Lightbulb,
  Megaphone,
  TrendingUp,
  Wallet,
} from "lucide-react";

const icons = [Lightbulb, Megaphone, Wallet, TrendingUp, Building2];

export function PartnerBannerIllustration() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-[#0d5a40] to-primary-dark px-6 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-8 top-8 h-24 w-24 rounded-full border-2 border-accent" />
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full border-2 border-white/30" />
      </div>

      <div className="relative mx-auto h-52 w-52 sm:h-60 sm:w-60">
        <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm sm:h-40 sm:w-40">
          <Handshake className="h-14 w-14 text-accent sm:h-16 sm:w-16" strokeWidth={1.5} />
        </div>

        {icons.map((Icon, index) => {
          const angle = (index / icons.length) * 360 - 90;
          const radius = 96;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <span
              key={index}
              className="absolute left-1/2 top-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-accent"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <Icon className="h-5 w-5" />
            </span>
          );
        })}
      </div>
    </div>
  );
}
