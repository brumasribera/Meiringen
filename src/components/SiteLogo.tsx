import { Link } from "@/i18n/routing";

type Props = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string | null;
};

const iconSizes = { sm: 28, md: 36, lg: 44 };
const textSizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="logo-bg" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1b4332" />
          <stop offset="1" stopColor="#2d6a4f" />
        </linearGradient>
        <linearGradient id="logo-peaks" x1="24" y1="10" x2="24" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d8f3dc" />
          <stop offset="1" stopColor="#95d5b2" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#logo-bg)" />
      <path
        d="M6 36.5 17.2 14.8 24 27.2 30.8 11.5 42 36.5Z"
        fill="url(#logo-peaks)"
      />
      <path
        d="M24 27.2 17.2 14.8 24 21.5 30.8 11.5 24 27.2Z"
        fill="#40916c"
        opacity="0.45"
      />
      <circle cx="34.5" cy="13.5" r="4.2" fill="#e9c46a" />
      <circle cx="34.5" cy="13.5" r="4.2" fill="#d4a373" opacity="0.35" />
      <path
        d="M11 37.5c4.5-1.2 8.8-1.2 13 0s8.5 1.2 13 0"
        stroke="#e9c46a"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

export function SiteLogo({
  showText = true,
  size = "md",
  className = "",
  href = "/",
}: Props) {
  const iconSize = iconSizes[size];
  const content = (
    <>
      <LogoMark size={iconSize} />
      {showText && (
        <span className={`font-bold text-primary ${textSizes[size]}`}>
          Meiringen<span className="text-accent">.org</span>
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-2.5 ${className}`;

  if (href === null) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href={href} className={classes} aria-label="Meiringen.org home">
      {content}
    </Link>
  );
}
