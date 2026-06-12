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

const BRAND_GOLD = "#F4C430";
const BRAND_BLACK = "#111111";

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
      <rect width="48" height="48" rx="12" fill={BRAND_GOLD} />
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="10.5"
        stroke="#FFFFFF"
        strokeWidth="1.25"
        opacity="0.55"
      />
      <g fill={BRAND_BLACK}>
        <path d="M19.5 9.5h9v2.2l-.8 1.8h-7.4l-.8-1.8V9.5Z" />
        <path d="M21 7.6h6v2h-6V7.6Z" />
        <path d="M23.2 5.8h1.6v2.4h-1.6V5.8Z" />
        <path d="M24 14.8c-2.1 0-3.8 1.4-3.8 3.1 0 .8.3 1.5.8 2.1-.9.4-1.6 1.1-2 2-.5 1.1-.3 2.4.5 3.3L8.5 27.2c-.9.5-1.1 1.7-.4 2.4l1.9 1.9c.7.7 1.9.5 2.4-.4l5.8-9.2 4.8 3.1v8.4c0 1 .8 1.8 1.8 1.8h.4c1 0 1.8-.8 1.8-1.8v-8.4l4.8-3.1 5.8 9.2c.5.9 1.7 1.1 2.4.4l1.9-1.9c.7-.7.5-1.9-.4-2.4L28.5 22.3c.8-.9 1-2.2.5-3.3-.4-.9-1.1-1.6-2-2 .5-.6.8-1.3.8-2.1 0-1.7-1.7-3.1-3.8-3.1Z" />
        <path d="M24 31.2 18.8 40.2h10.4L24 31.2Z" />
      </g>
      <path d="M26.8 16.2 30.2 17.4 26.8 18.4V16.2Z" fill={BRAND_GOLD} />
      <path
        d="M15.5 24.8 11.8 27.2M32.5 24.8 36.2 27.2"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
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
        <span className={`font-bold ${textSizes[size]}`} style={{ color: BRAND_BLACK }}>
          Meiringen
          <span style={{ color: "#B8860B" }}>.org</span>
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
