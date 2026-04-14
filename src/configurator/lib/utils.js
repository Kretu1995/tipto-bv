export function canUseWebGL() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function getFinishData(finishes = [], finishValue) {
  return finishes.find((finish) => finish.value === finishValue) ?? finishes[0] ?? null;
}
