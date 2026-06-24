type GradientStyle = {
  backgroundImage: string;
};

function hashString(input: string): number {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function hueFromSeed(seed: string, offset: number): number {
  return (hashString(`${seed}:${offset}`) % 360 + offset * 17) % 360;
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${l}%)`;
}

function buildGradient(seed: string): GradientStyle {
  const baseHue = hueFromSeed(seed, 0);
  const accentHue = hueFromSeed(seed, 1);
  const depthHue = hueFromSeed(seed, 2);
  const glowHue = hueFromSeed(seed, 3);

  const saturation = 68;
  const lowLightness = 28;
  const midLightness = 45;
  const highLightness = 62;

  return {
    backgroundImage: [
      `radial-gradient(circle at top left, rgba(255,255,255,0.34), transparent 28%)`,
      `radial-gradient(circle at bottom right, rgba(255,255,255,0.16), transparent 30%)`,
      `linear-gradient(135deg, ${hsl(baseHue, saturation, lowLightness)} 0%, ${hsl(
        accentHue,
        saturation,
        midLightness
      )} 46%, ${hsl(glowHue, 72, highLightness)} 100%)`,
      `linear-gradient(220deg, transparent 0%, ${hsl(depthHue, 55, 18)} 100%)`,
    ].join(", "),
  };
}

export function getRelaxingGradient(seed: string): GradientStyle {
  if (!seed) {
    return buildGradient("default");
  }

  return buildGradient(seed);
}
