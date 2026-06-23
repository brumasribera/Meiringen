const EVENT_HERO_GRADIENTS = [
  "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.78),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(244,196,48,0.22),_transparent_26%),linear-gradient(135deg,#ffe4e6_0%,#dbeafe_42%,#ccfbf1_100%)]",
  "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.74),_transparent_30%),radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(135deg,#f5f3ff_0%,#c7d2fe_46%,#a7f3d0_100%)]",
  "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.76),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.18),_transparent_24%),linear-gradient(135deg,#ecfeff_0%,#bae6fd_44%,#fde68a_100%)]",
  "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.76),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.16),_transparent_24%),linear-gradient(135deg,#fff7ed_0%,#fed7aa_44%,#dbeafe_100%)]",
  "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.74),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.18),_transparent_22%),linear-gradient(135deg,#f0fdf4_0%,#dbeafe_46%,#fef3c7_100%)]",
  "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.74),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.16),_transparent_24%),linear-gradient(135deg,#e0f2fe_0%,#d1fae5_45%,#fef9c3_100%)]",
  "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.76),_transparent_29%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(135deg,#fae8ff_0%,#e0e7ff_45%,#cffafe_100%)]",
  "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.75),_transparent_31%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.18),_transparent_22%),linear-gradient(135deg,#fdf2f8_0%,#dcfce7_43%,#dbeafe_100%)]",
] as const;

function hashString(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return hash;
}

export function getEventHeroGradientClass(params: {
  seed: string;
  title: string;
  description?: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
}): string {
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
    return "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.76),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(244,196,48,0.24),_transparent_26%),linear-gradient(135deg,#1f2937_0%,#4c1d95_48%,#f4c430_100%)]";
  }

  return EVENT_HERO_GRADIENTS[hashString(haystack) % EVENT_HERO_GRADIENTS.length];
}
