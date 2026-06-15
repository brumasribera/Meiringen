import { Link } from "@/i18n/routing";

type Props = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string | null;
};

const iconSizes = { sm: 32, md: 42, lg: 52 };
const textSizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

function LogoMark({ size }: { size: number }) {
  return (
    <img
      src="/brand/logo-mark.png"
      width={size}
      height={size}
      alt=""
      aria-hidden
      className="shrink-0 object-cover"
    />
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
        <span className={`font-bold ${textSizes[size]}`} style={{ color: "#111111" }}>
          Meiringen
          <span style={{ color: "#B8860B" }}>.life</span>
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-2.5 ${className}`;

  if (href === null) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href={href} className={classes} aria-label="Meiringen.life home">
      {content}
    </Link>
  );
}
