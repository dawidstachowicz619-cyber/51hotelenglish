import type { TrainingSlideSection } from "@/lib/types/hr-training";
import type { TrainingSlideIllustration } from "@/lib/types/training-slide-illustration";
import { SLIDE_ILLUSTRATION_LABELS } from "@/lib/types/training-slide-illustration";
import { SLIDE_SECTION_LABELS } from "@/lib/hr/slide-structure";
import { cn } from "@/lib/utils";

type Palette = {
  bg: string;
  bgGradient: [string, string];
  accent: string;
  secondary: string;
  glow: string;
};

const PALETTES: Record<TrainingSlideIllustration, Palette> = {
  "course-objective": {
    bg: "#E6F4ED",
    bgGradient: ["#D4EDE0", "#F0FAF5"],
    accent: "#1A7A52",
    secondary: "#F0A030",
    glow: "#1A7A5222",
  },
  "course-knowledge": {
    bg: "#E8EEFB",
    bgGradient: ["#D6E4FA", "#F2F6FE"],
    accent: "#2E5FD9",
    secondary: "#1A7A52",
    glow: "#2E5FD922",
  },
  "course-case": {
    bg: "#FFF0E6",
    bgGradient: ["#FFE4D0", "#FFF8F2"],
    accent: "#D4622A",
    secondary: "#C9922E",
    glow: "#D4622A22",
  },
  "management-value": {
    bg: "#E8F5EE",
    bgGradient: ["#D8EFE6", "#F2FAF6"],
    accent: "#1F8A5C",
    secondary: "#F5A623",
    glow: "#1F8A5C22",
  },
  "key-actions": {
    bg: "#EEF4FF",
    bgGradient: ["#DEE8FF", "#F4F7FF"],
    accent: "#3B6FD9",
    secondary: "#1F8A5C",
    glow: "#3B6FD922",
  },
  coaching: {
    bg: "#FFF4E8",
    bgGradient: ["#FFEAD4", "#FFF9F2"],
    accent: "#E07A2F",
    secondary: "#1F8A5C",
    glow: "#E07A2F22",
  },
  review: {
    bg: "#F3EEFA",
    bgGradient: ["#E8DDF8", "#F9F5FE"],
    accent: "#7B4BB9",
    secondary: "#1F8A5C",
    glow: "#7B4BB922",
  },
  team: {
    bg: "#E8F5EE",
    bgGradient: ["#D8EFE6", "#F2FAF6"],
    accent: "#1F8A5C",
    secondary: "#3B6FD9",
    glow: "#1F8A5C22",
  },
  "hotel-service": {
    bg: "#FFF8E8",
    bgGradient: ["#FFEFD0", "#FFFBF2"],
    accent: "#C9922E",
    secondary: "#1F8A5C",
    glow: "#C9922E22",
  },
  communication: {
    bg: "#EEF8F8",
    bgGradient: ["#D8F0F0", "#F2FAFA"],
    accent: "#2A9D8F",
    secondary: "#3B6FD9",
    glow: "#2A9D8F22",
  },
  growth: {
    bg: "#E8F5EE",
    bgGradient: ["#D8EFE6", "#F2FAF6"],
    accent: "#1F8A5C",
    secondary: "#7B4BB9",
    glow: "#1F8A5C22",
  },
};

const SECTION_PALETTE: Record<
  TrainingSlideSection,
  Pick<Palette, "bgGradient" | "accent" | "secondary">
> = {
  objective: {
    bgGradient: ["#D4EDE0", "#F0FAF5"],
    accent: "#1A7A52",
    secondary: "#F0A030",
  },
  knowledge: {
    bgGradient: ["#D6E4FA", "#F2F6FE"],
    accent: "#2E5FD9",
    secondary: "#1A7A52",
  },
  case: {
    bgGradient: ["#FFE4D0", "#FFF8F2"],
    accent: "#D4622A",
    secondary: "#C9922E",
  },
};

function SvgDefs({ id, accent, secondary }: { id: string; accent: string; secondary: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={accent} stopOpacity="0.12" />
        <stop offset="100%" stopColor={secondary} stopOpacity="0.06" />
      </linearGradient>
      <linearGradient id={`${id}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={accent} />
        <stop offset="100%" stopColor={accent} stopOpacity="0.78" />
      </linearGradient>
      <linearGradient id={`${id}-sec`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={secondary} />
        <stop offset="100%" stopColor={secondary} stopOpacity="0.75" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={accent} floodOpacity="0.18" />
      </filter>
    </defs>
  );
}

function BackgroundDecor({ id }: { id: string }) {
  return (
    <>
      <rect width="320" height="240" fill={`url(#${id}-bg)`} />
      <circle cx="280" cy="40" r="56" fill={`url(#${id}-bg)`} opacity="0.9" />
      <circle cx="36" cy="200" r="44" fill={`url(#${id}-bg)`} opacity="0.7" />
      <circle cx="260" cy="190" r="28" fill="white" opacity="0.35" />
    </>
  );
}

function IllustrationSvg({
  type,
  accent,
  secondary,
}: {
  type: TrainingSlideIllustration;
  accent: string;
  secondary: string;
}) {
  const id = `ill-${type}`;

  switch (type) {
    case "course-objective":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <circle cx="160" cy="108" r="52" fill="white" opacity="0.92" />
            <circle cx="160" cy="108" r="40" fill="none" stroke={accent} strokeWidth="5" opacity="0.25" />
            <circle cx="160" cy="108" r="28" fill="none" stroke={accent} strokeWidth="5" opacity="0.45" />
            <circle cx="160" cy="108" r="16" fill="none" stroke={accent} strokeWidth="5" opacity="0.7" />
            <circle cx="160" cy="108" r="7" fill={`url(#${id}-fill)`} />
          </g>
          <rect x="118" y="52" width="84" height="22" rx="11" fill={`url(#${id}-sec)`} />
          <rect x="132" y="58" width="56" height="4" rx="2" fill="white" opacity="0.85" />
          <rect x="140" y="66" width="40" height="3" rx="1.5" fill="white" opacity="0.55" />
          <path
            d="M196 76 L208 68 L208 80 Z"
            fill={secondary}
            opacity="0.9"
          />
          <rect x="72" y="148" width="76" height="10" rx="5" fill={accent} opacity="0.15" />
          <rect x="82" y="164" width="56" height="8" rx="4" fill={accent} opacity="0.1" />
          <rect x="172" y="148" width="76" height="10" rx="5" fill={accent} opacity="0.15" />
          <rect x="182" y="164" width="56" height="8" rx="4" fill={accent} opacity="0.1" />
          <path
            d="M128 148 L160 132 L192 148"
            stroke={accent}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.35"
          />
        </>
      );

    case "course-knowledge":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M88 72 C88 64 96 58 108 58 L160 58 L212 58 C224 58 232 64 232 72 L232 168 C232 176 224 182 212 182 L160 182 L108 182 C96 182 88 176 88 168 Z"
              fill="white"
              opacity="0.95"
            />
            <path d="M160 58 L160 182" stroke={accent} strokeWidth="2" opacity="0.2" />
            <rect x="104" y="82" width="44" height="4" rx="2" fill={accent} opacity="0.35" />
            <rect x="104" y="94" width="36" height="3" rx="1.5" fill={accent} opacity="0.2" />
            <rect x="104" y="104" width="40" height="3" rx="1.5" fill={accent} opacity="0.2" />
            <rect x="172" y="82" width="44" height="4" rx="2" fill={accent} opacity="0.35" />
            <rect x="172" y="94" width="32" height="3" rx="1.5" fill={accent} opacity="0.2" />
            <rect x="172" y="104" width="38" height="3" rx="1.5" fill={accent} opacity="0.2" />
          </g>
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M228 48 L248 58 L248 88 L228 78 Z"
              fill={`url(#${id}-fill)`}
            />
            <circle cx="248" cy="52" r="14" fill={`url(#${id}-sec)`} />
            <path
              d="M244 52 L247 56 L253 48"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
          <rect x="118" y="148" width="84" height="28" rx="14" fill={accent} opacity="0.12" />
          <rect x="130" y="156" width="24" height="4" rx="2" fill={accent} opacity="0.35" />
          <rect x="130" y="166" width="36" height="3" rx="1.5" fill={accent} opacity="0.22" />
          <rect x="178" y="156" width="16" height="16" rx="4" fill={secondary} opacity="0.85" />
          <path d="M182 164 L186 168 L194 158" stroke="white" strokeWidth="2" fill="none" />
        </>
      );

    case "course-case":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <rect x="72" y="88" width="176" height="88" rx="12" fill="white" opacity="0.95" />
            <rect x="72" y="88" width="176" height="24" rx="12" fill={`url(#${id}-fill)`} />
            <rect x="72" y="100" width="176" height="12" fill={`url(#${id}-fill)`} />
            <circle cx="92" cy="100" r="5" fill="white" opacity="0.7" />
            <circle cx="108" cy="100" r="5" fill="white" opacity="0.45" />
            <circle cx="124" cy="100" r="5" fill="white" opacity="0.45" />
          </g>
          <ellipse cx="108" cy="178" rx="20" ry="8" fill={accent} opacity="0.12" />
          <circle cx="108" cy="152" r="16" fill={secondary} />
          <circle cx="108" cy="147" r="6" fill="white" />
          <path d="M96 164 Q108 156 120 164 L120 174 Q108 180 96 174 Z" fill="white" />
          <rect x="136" y="132" width="88" height="36" rx="10" fill={accent} opacity="0.1" />
          <rect x="146" y="142" width="48" height="4" rx="2" fill={accent} opacity="0.4" />
          <rect x="146" y="152" width="64" height="3" rx="1.5" fill={accent} opacity="0.25" />
          <rect x="146" y="160" width="52" height="3" rx="1.5" fill={accent} opacity="0.2" />
          <path
            d="M128 148 L136 152 L128 156"
            stroke={secondary}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="200" y="56" width="48" height="22" rx="11" fill={`url(#${id}-sec)`} />
          <text x="224" y="71" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
            CASE
          </text>
        </>
      );

    case "management-value":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <rect x="96" y="84" width="128" height="88" rx="10" fill={`url(#${id}-fill)`} />
            <rect x="112" y="68" width="96" height="18" rx="6" fill={`url(#${id}-sec)`} />
            <rect x="124" y="108" width="24" height="24" rx="4" fill="white" opacity="0.88" />
            <rect x="156" y="108" width="24" height="24" rx="4" fill="white" opacity="0.88" />
            <rect x="124" y="140" width="24" height="24" rx="4" fill="white" opacity="0.88" />
            <rect x="156" y="140" width="24" height="24" rx="4" fill="white" opacity="0.88" />
          </g>
          <circle cx="216" cy="64" r="16" fill={secondary} />
          <path d="M210 64 L214 68 L222 58" stroke="white" strokeWidth="2.5" fill="none" />
        </>
      );

    case "key-actions":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <rect x="84" y="56" width="104" height="136" rx="12" fill="white" opacity="0.95" />
            <rect x="100" y="76" width="48" height="5" rx="2.5" fill={accent} opacity="0.35" />
            <rect x="100" y="90" width="64" height="5" rx="2.5" fill={accent} opacity="0.25" />
            <circle cx="100" cy="116" r="8" fill={accent} />
            <path d="M97 116 L99 119 L104 112" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="100" cy="140" r="8" fill={accent} />
            <path d="M97 140 L99 143 L104 136" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="100" cy="164" r="8" fill={accent} />
            <path d="M97 164 L99 167 L104 160" stroke="white" strokeWidth="2" fill="none" />
          </g>
          <g filter={`url(#${id}-shadow)`}>
            <circle cx="212" cy="124" r="36" fill={secondary} opacity="0.9" />
            <circle cx="212" cy="112" r="14" fill="white" />
            <path d="M192 144 Q212 132 232 144 L232 164 Q212 176 192 164 Z" fill="white" />
          </g>
        </>
      );

    case "coaching":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <ellipse cx="120" cy="188" rx="36" ry="14" fill={accent} opacity="0.12" />
          <g filter={`url(#${id}-shadow)`}>
            <circle cx="120" cy="136" r="32" fill={secondary} />
            <circle cx="120" cy="128" r="12" fill="white" />
            <path d="M100 156 Q120 144 140 156 L140 172 Q120 182 100 172 Z" fill="white" />
          </g>
          <g filter={`url(#${id}-shadow)`}>
            <rect x="168" y="84" width="88" height="56" rx="16" fill="white" opacity="0.95" />
            <path d="M168 104 L156 116 L168 116 Z" fill="white" opacity="0.95" />
            <rect x="184" y="100" width="48" height="5" rx="2.5" fill={accent} opacity="0.4" />
            <rect x="184" y="112" width="36" height="4" rx="2" fill={accent} opacity="0.25" />
            <rect x="184" y="122" width="42" height="4" rx="2" fill={accent} opacity="0.2" />
          </g>
        </>
      );

    case "review":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <rect x="88" y="132" width="20" height="48" rx="5" fill={accent} opacity="0.45" />
            <rect x="120" y="108" width="20" height="72" rx="5" fill={accent} opacity="0.65" />
            <rect x="152" y="84" width="20" height="96" rx="5" fill={`url(#${id}-fill)`} />
            <rect x="184" y="96" width="20" height="84" rx="5" fill={`url(#${id}-sec)`} />
          </g>
          <path
            d="M88 76 L120 64 L152 72 L184 52 L224 60"
            stroke={secondary}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="224" cy="60" r="7" fill={secondary} />
        </>
      );

    case "team":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <circle cx="108" cy="120" r="24" fill={secondary} />
            <circle cx="108" cy="112" r="10" fill="white" />
            <path d="M88 144 Q108 128 128 144 L128 160 Q108 170 88 160 Z" fill="white" />
            <circle cx="160" cy="108" r="28" fill={`url(#${id}-fill)`} />
            <circle cx="160" cy="98" r="12" fill="white" />
            <path d="M136 132 Q160 116 184 132 L184 152 Q160 168 136 152 Z" fill="white" />
            <circle cx="204" cy="132" r="20" fill={accent} opacity="0.75" />
            <circle cx="204" cy="124" r="8" fill="white" />
            <path d="M190 148 Q204 140 218 148 L218 160 Q204 168 190 160 Z" fill="white" opacity="0.92" />
          </g>
        </>
      );

    case "hotel-service":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <rect x="100" y="100" width="120" height="80" rx="8" fill={`url(#${id}-fill)`} />
            <rect x="116" y="84" width="88" height="18" rx="5" fill={`url(#${id}-sec)`} />
            <rect x="128" y="120" width="20" height="24" rx="2" fill="white" opacity="0.88" />
            <rect x="156" y="120" width="20" height="24" rx="2" fill="white" opacity="0.88" />
            <rect x="184" y="120" width="20" height="24" rx="2" fill="white" opacity="0.88" />
            <rect x="128" y="152" width="76" height="8" rx="4" fill="white" opacity="0.35" />
          </g>
          <circle cx="216" cy="72" r="20" fill={secondary} />
          <path
            d="M216 62 L218 68 L224 68 L219 72 L221 78 L216 74 L211 78 L213 72 L208 68 L214 68 Z"
            fill="white"
          />
        </>
      );

    case "communication":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <g filter={`url(#${id}-shadow)`}>
            <rect x="72" y="88" width="92" height="52" rx="14" fill="white" opacity="0.95" />
            <rect x="88" y="104" width="40" height="4" rx="2" fill={accent} opacity="0.35" />
            <rect x="88" y="116" width="56" height="4" rx="2" fill={accent} opacity="0.22" />
            <rect x="156" y="112" width="92" height="52" rx="14" fill={`url(#${id}-fill)`} />
            <rect x="172" y="128" width="48" height="4" rx="2" fill="white" opacity="0.85" />
            <rect x="172" y="140" width="32" height="4" rx="2" fill="white" opacity="0.6" />
          </g>
          <path
            d="M164 116 L156 124 L164 132"
            stroke={secondary}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );

    case "growth":
      return (
        <>
          <SvgDefs id={id} accent={accent} secondary={secondary} />
          <BackgroundDecor id={id} />
          <path
            d="M80 184 Q112 160 144 168 T208 112 T240 80"
            stroke={accent}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="240" cy="80" r="10" fill={secondary} />
          <g filter={`url(#${id}-shadow)`}>
            <path d="M144 184 L144 144 L168 164 L192 132 L192 184 Z" fill={accent} opacity="0.28" />
            <rect x="144" y="184" width="48" height="6" rx="3" fill={accent} />
          </g>
        </>
      );
  }
}

type TrainingSlideIllustrationProps = {
  type: TrainingSlideIllustration;
  className?: string;
  variant?: "card" | "hero";
};

export function TrainingSlideIllustration({
  type,
  className,
  variant = "card",
}: TrainingSlideIllustrationProps) {
  const palette = PALETTES[type];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        variant === "card" ? "rounded-2xl" : "rounded-none",
        className
      )}
      style={{ backgroundColor: palette.bg }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(135deg, ${palette.bgGradient[0]} 0%, ${palette.bgGradient[1]} 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full blur-2xl"
        style={{ backgroundColor: palette.glow }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full blur-xl"
        style={{ backgroundColor: palette.glow }}
      />
      <svg
        viewBox="0 0 320 240"
        className={cn(
          "relative z-10 h-full w-full",
          variant === "hero" ? "max-h-none max-w-none" : "max-h-44 max-w-56"
        )}
        preserveAspectRatio="xMidYMid meet"
      >
        <IllustrationSvg type={type} accent={palette.accent} secondary={palette.secondary} />
      </svg>
    </div>
  );
}

export function TrainingSlideVisual({
  illustration,
  title,
  slideLabel,
  bullets,
  section,
  className,
}: {
  illustration?: TrainingSlideIllustration;
  title: string;
  slideLabel: string;
  bullets: string[];
  section?: TrainingSlideSection;
  className?: string;
}) {
  const type = illustration ?? "course-knowledge";
  const palette = PALETTES[type];
  const sectionStyle = section ? SECTION_PALETTE[section] : null;
  const sectionLabel = section ? SLIDE_SECTION_LABELS[section] : null;
  const illustrationLabel = SLIDE_ILLUSTRATION_LABELS[type];

  return (
    <div
      className={cn("absolute inset-0 flex flex-col overflow-hidden", className)}
      style={{
        background: sectionStyle
          ? `linear-gradient(145deg, ${sectionStyle.bgGradient[0]} 0%, ${sectionStyle.bgGradient[1]} 55%, ${palette.bg} 100%)`
          : `linear-gradient(145deg, ${palette.bgGradient[0]} 0%, ${palette.bgGradient[1]} 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: (sectionStyle?.accent ?? palette.accent) + "33" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: (sectionStyle?.secondary ?? palette.secondary) + "44" }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative flex min-h-[42%] flex-1 items-center justify-center p-4 md:min-h-0 md:max-w-[46%] md:p-6">
          {illustration && (
            <TrainingSlideIllustration
              type={illustration}
              variant="hero"
              className="aspect-[4/3] w-full max-w-[280px] rounded-3xl shadow-lg ring-1 ring-black/5 md:max-w-none"
            />
          )}
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-foreground/40 md:hidden">
            {illustrationLabel}
          </p>
        </div>

        <div className="relative flex flex-col justify-center border-t border-white/50 bg-white/45 px-5 py-4 backdrop-blur-sm md:min-w-0 md:flex-1 md:border-l md:border-t-0 md:px-6 md:py-5">
          <div className="flex flex-wrap items-center gap-2">
            {sectionLabel && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm"
                style={{ backgroundColor: sectionStyle?.accent ?? palette.accent }}
              >
                {sectionLabel}
              </span>
            )}
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-secondary">
              {slideLabel}
            </span>
          </div>

          <h2 className="mt-2 font-display text-lg leading-snug text-foreground md:text-xl lg:text-2xl">
            {title}
          </h2>

          {bullets.length > 0 && (
            <ul className="mt-3 space-y-2 text-xs font-semibold text-foreground md:text-sm">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2.5 leading-relaxed">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: sectionStyle?.accent ?? palette.accent }}
                  />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
