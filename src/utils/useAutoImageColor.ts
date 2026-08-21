import { useEffect, useState } from "react";

/**
 * Converts RGB color values to HSL.
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Generates a deterministic pastel HSL background color from a string hash.
 */
function hashToPastelHsl(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 93%)`;
}

export interface AutoColorResult {
  className: string;
  style: React.CSSProperties;
}

/**
 * React hook that extracts dominant color from an image URL to produce a soft pastel background tint.
 * If a custom color preset is provided (not "auto"), it uses the custom preset instead.
 */
export function useAutoImageColor(
  imageSrc?: string,
  customColor?: string,
  itemKey?: string
): AutoColorResult {
  // If customColor is set and not "auto", return custom color class directly
  const isCustom = Boolean(customColor && customColor !== "auto");
  
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>(() => {
    if (isCustom) return {};
    if (imageSrc) return { backgroundColor: hashToPastelHsl(imageSrc) };
    if (itemKey) return { backgroundColor: hashToPastelHsl(itemKey) };
    return { backgroundColor: "hsl(48, 65%, 93%)" };
  });

  useEffect(() => {
    if (isCustom || !imageSrc) return;

    // Use hash color as initial background
    setBgStyle({ backgroundColor: hashToPastelHsl(imageSrc) });

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 32, 32);
        const imgData = ctx.getImageData(0, 0, 32, 32).data;

        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let count = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip transparent or near-transparent pixels
          if (a < 100) continue;

          // Skip pure white/black background pixels
          const brightness = (r + g + b) / 3;
          if (brightness > 245 || brightness < 15) continue;

          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }

        if (count > 0 && isMounted) {
          const avgR = Math.round(rSum / count);
          const avgG = Math.round(gSum / count);
          const avgB = Math.round(bSum / count);

          const [h, s] = rgbToHsl(avgR, avgG, avgB);
          // Set soft pastel background (lightness 93%)
          const saturation = Math.min(70, Math.max(35, Math.round(s)));
          const pastelColor = `hsl(${Math.round(h)}, ${saturation}%, 93%)`;
          setBgStyle({ backgroundColor: pastelColor });
        }
      } catch (err) {
        // Fallback to hash color if CORS or canvas fails
      }
    };

    return () => {
      isMounted = false;
    };
  }, [imageSrc, customColor, isCustom]);

  if (isCustom) {
    return {
      className: customColor!,
      style: {},
    };
  }

  return {
    className: "",
    style: bgStyle,
  };
}
