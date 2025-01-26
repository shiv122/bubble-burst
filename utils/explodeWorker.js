// explodeWorker.js
export function explode(y, x, delay = 10, size, color = "#06D001") {
    const DURATION = 700;
    const animationParams = {
      top: 0,
      left: 0,
      x: x + size / 2.2,
      y: y + size / 2.2,
      className: "z-20",
      degree: 0,
      count: 5,
      radius: { 0: 5 * size },
      children: {
        fill: color,
        pathScale: "rand(0.5, 1)",
        radius: `rand(${size / 3}, ${size / 2.5})`,
        swirlvalue: "rand(10, 15)",
        swirlFrequency: "rand(2, 4)",
        direction: [1, -1],
        duration: `rand(${1 * DURATION}, ${2 * DURATION})`,
        delay: "rand(0, 75)",
        easing: "quad.out",
        isSwirl: true,
        isForce3d: true,
      },
    };
  
    const circleParams = {
      top: 0,
      left: 0,
      x: x + size / 2.3,
      y: y + size / 2.3,
      className: "z-20",
      radius: { 30: 0, 0: size / 1.5 },
      stroke: color,
      strokeWidth: { 10: 0 },
      fill: "none",
      duration: 500,
    };
  
    return { animationParams, circleParams, delay };
  }
  