import type { OrganizationCategory } from "@/lib/constants";

type Props = {
  category: OrganizationCategory;
  coverImageUrl?: string | null;
  backgroundClassName?: string;
  className?: string;
};

const coverThemes: Record<
  OrganizationCategory,
  { background: string; glowOne: string; glowTwo: string }
> = {
  culture: {
    background:
      "bg-[linear-gradient(135deg,#4c1d95_0%,#7c3aed_45%,#f4c430_100%)]",
    glowOne: "bg-white/25",
    glowTwo: "bg-[#f4c430]/35",
  },
  sport: {
    background:
      "bg-[linear-gradient(135deg,#14532d_0%,#16a34a_48%,#f4c430_100%)]",
    glowOne: "bg-white/20",
    glowTwo: "bg-[#86efac]/35",
  },
  social: {
    background:
      "bg-[linear-gradient(135deg,#6d28d9_0%,#ec4899_52%,#f59e0b_100%)]",
    glowOne: "bg-white/20",
    glowTwo: "bg-[#f9a8d4]/30",
  },
  integration: {
    background:
      "bg-[linear-gradient(135deg,#1d4ed8_0%,#0ea5e9_42%,#34d399_100%)]",
    glowOne: "bg-white/20",
    glowTwo: "bg-[#93c5fd]/30",
  },
  education: {
    background:
      "bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_45%,#fde68a_100%)]",
    glowOne: "bg-white/18",
    glowTwo: "bg-[#bfdbfe]/30",
  },
  music: {
    background:
      "bg-[linear-gradient(135deg,#111827_0%,#7c3aed_52%,#f472b6_100%)]",
    glowOne: "bg-white/18",
    glowTwo: "bg-[#ddd6fe]/28",
  },
  nature: {
    background:
      "bg-[linear-gradient(135deg,#14532d_0%,#2d6a4f_45%,#84cc16_100%)]",
    glowOne: "bg-white/18",
    glowTwo: "bg-[#bef264]/28",
  },
  festival: {
    background:
      "bg-[linear-gradient(135deg,#9a3412_0%,#ea580c_40%,#f4c430_100%)]",
    glowOne: "bg-white/20",
    glowTwo: "bg-[#fdba74]/28",
  },
  market: {
    background:
      "bg-[linear-gradient(135deg,#854d0e_0%,#f59e0b_45%,#fef08a_100%)]",
    glowOne: "bg-white/20",
    glowTwo: "bg-[#fde68a]/32",
  },
  other: {
    background:
      "bg-[linear-gradient(135deg,#334155_0%,#64748b_50%,#d4a373_100%)]",
    glowOne: "bg-white/18",
    glowTwo: "bg-[#cbd5e1]/24",
  },
};

export function OrgCoverArt({
  category,
  coverImageUrl,
  backgroundClassName,
  className = "",
}: Props) {
  const theme = coverThemes[category];
  const resolvedBackgroundClassName = coverImageUrl
    ? backgroundClassName ?? "bg-transparent"
    : backgroundClassName ?? theme.background;

  return (
    <div
      className={`relative overflow-hidden ${resolvedBackgroundClassName} ${className}`}
      aria-hidden
    >
      {coverImageUrl && (
        // Use a plain image here to avoid Next Image fill warnings on variable-height cards.
        // The cover art is decorative, so we keep it aria-hidden and size it via CSS.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        />
      )}
      <div
        className={`absolute inset-0 ${
          coverImageUrl
            ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(15,23,42,0.18)_100%)]"
            : "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.40),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.10))]"
        }`}
      />
      <div
        className={`absolute -right-10 top-4 h-28 w-28 rounded-full ${theme.glowOne} blur-3xl`}
      />
      <div
        className={`absolute -left-8 bottom-0 h-24 w-24 rounded-full ${theme.glowTwo} blur-3xl`}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
