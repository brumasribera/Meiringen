type HeroTone = "light" | "dark";

type HeroGradient = {
  className: string;
  tone: HeroTone;
};

const EVENT_HERO_GRADIENTS: HeroGradient[] = [
  {
    className:
      "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.72),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(244,196,48,0.18),_transparent_26%),linear-gradient(135deg,#bfd7ea_0%,#c7e3d7_45%,#eef2a8_100%)]",
    tone: "light",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.70),_transparent_30%),radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(135deg,#dfe6ff_0%,#b8c6f4_46%,#94e1c2_100%)]",
    tone: "light",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.68),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(135deg,#d9f6f8_0%,#96cde8_44%,#e8d18d_100%)]",
    tone: "light",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.68),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_24%),linear-gradient(135deg,#f7ead9_0%,#efbf8d_44%,#bfd5ef_100%)]",
    tone: "light",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.70),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.16),_transparent_22%),linear-gradient(135deg,#dff5e6_0%,#c2d8ee_46%,#f0e3a9_100%)]",
    tone: "light",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.70),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.14),_transparent_24%),linear-gradient(135deg,#d9edf8_0%,#c4ebd8_45%,#f1e7a8_100%)]",
    tone: "light",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.70),_transparent_29%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_22%),linear-gradient(135deg,#efc8ea_0%,#d7dff4_45%,#bfebf2_100%)]",
    tone: "light",
  },
  {
    className:
      "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.72),_transparent_31%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.16),_transparent_22%),linear-gradient(135deg,#f0d9e7_0%,#c9edd6_43%,#cfe0f6_100%)]",
    tone: "light",
  },
] as const;

function hashString(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export function getEventHeroGradient(params: {
  seed: string;
  title: string;
  description?: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
}): HeroGradient {
  const haystack = [
    params.seed,
    params.title,
    params.description ?? "",
    params.organizationName ?? "",
    params.organizationSlug ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (/(kino|film|cinema|cine|ciné)/.test(haystack)) {
    return {
      className:
        "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.20),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(244,196,48,0.18),_transparent_24%),linear-gradient(135deg,#1f2937_0%,#4c1d95_48%,#f4c430_100%)]",
      tone: "dark",
    };
  }

  return EVENT_HERO_GRADIENTS[hashString(haystack) % EVENT_HERO_GRADIENTS.length];
}
