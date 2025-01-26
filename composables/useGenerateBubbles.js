// composables/useGenerateBubbles.js

export function useGenerateBubbles(matrixSize, colors, size) {
  const generateBubbles = () => {
    return Array.from({ length: matrixSize }, (_, i) =>
      Array.from({ length: matrixSize }, (_, j) => ({
        id: i + "" + j,
        color: colors[Math.floor(Math.random() * colors.length)],
        highlight: false,
        done: false,
        triggerClass: "",
        class: "",
        x: i,
        y: j,
        top: i * size,
        left: j * size,
        size: size,
      }))
    );
  };

  return { generateBubbles };
}
