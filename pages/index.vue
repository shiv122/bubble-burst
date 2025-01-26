<template>
  <div
    class="flex justify-center items-center h-screen relative flex-col gap-4"
  >
    <div class="absolute top-5 right-5">
      <UPopover>
        <UButton
          color="white"
          label="Setting"
          trailing-icon="i-heroicons-chevron-down-20-solid"
        />

        <template #panel>
          <div class="p-2">
            <p class="text-xs mb-1">Bubble Size ({{ size }})</p>
            <URange
              :min="20"
              :step="1"
              :max="80"
              v-model="size"
              size="sm"
              class="w-40 mb-2"
            />
            <p class="text-xs mb-1">Grid Size ({{ matrixSize }})</p>
            <URange
              :min="5"
              :step="1"
              :max="15"
              v-model="matrixSize"
              size="sm"
              class="w-40 mb-2"
            />

            <p class="text-xs mb-1">Bubble Type</p>
            <USelect
              v-model="radius"
              :options="radiusOption"
              option-attribute="name"
            />
          </div>
        </template>
      </UPopover>
    </div>

    <UCard>
      <div
        id="b-container"
        class="relative"
        :style="{
          height: size * matrixSize + 'px',
          width: size * matrixSize + 'px',
        }"
      >
        <div v-for="(row, i) in bubbles" :key="i" class="bubble-row">
          <button
            v-for="(bubble, j) in row"
            :key="bubble.id"
            :data-x="i"
            :data-y="j"
            :disabled="bubble.done"
            @click="!bubble.done && handleClick(i, j)"
            @mouseover="!bubble.done && handleClick(i, j, true)"
            :class="[
              bubble.triggerClass,
              bubble.class,
              bubble.highlight &&
                ` ring-2 ring-[var(--ring-color)] ring-offset-1 ring-offset-slate-800	`,
              'bubble z-10 absolute ',
            ]"
            @mouseleave="highlight = []"
            :style="{
              top: bubble.top + 'px',
              left: bubble.left + 'px',
              height: size - 5 + 'px',
              width: size - 5 + 'px',
              background: bubble.color,
              borderRadius: radius,
              '--ring-color': bubble.color,
            }"
          >
            <img
              v-if="!bubble.done && radius === '100%'"
              src="/assets/bubble.png"
              class="absolute top-0 opacity-[0.7]"
            />
          </button>
          <div
            v-for="(bubble, j) in row"
            :key="bubble.id"
            :class="[
              'bubble absolute rounded-full bg-gray-200 z-0 cursor-not-allowed',
              // !bubble.done ? 'invisible' : '',
            ]"
            :style="{
              top: i * size + 'px',
              left: j * size + 'px',
              height: size - 5 + 'px',
              width: size - 5 + 'px',
              borderRadius: radius,
            }"
          ></div>
        </div>
      </div>
    </UCard>
    <div class="flex gap-2">
      <UButton
        label="Refresh Grid"
        color="gray"
        @click="bubbles = generateBubbles()"
        icon="i-heroicons-arrow-path-rounded-square"
      />
      <UButton
        label="Rotate Grid"
        color="gray"
        :loading="rotating"
        @click="rotateMatrix()"
        icon="i-heroicons-arrow-uturn-right"
      />
    </div>
  </div>
</template>
<script setup>
//const colors = ["#d946ef", "#14b8a6"];
const colors = ["#d946ef", "#14b8a6", "#3b82f6", "#f59e0b"];
const bubbles = ref([]);
const highlight = ref([]);
const rotating = ref(false);
const size = ref(
  useCookie("size", {
    default: () => 50,
  })
);
const matrixSize = ref(
  useCookie("matrixSize", {
    default: () => 10,
  })
);
const radius = ref(
  useCookie("radius", {
    default: () => "100%",
  })
);
const radiusOption = [
  { name: "Circle", value: "100%" },
  { name: "Square", value: "0%" },
];

const generateBubbles = () => {
  return Array.from({ length: matrixSize.value }, (_, i) =>
    Array.from({ length: matrixSize.value }, (_, j) => ({
      id: i + "" + j,
      color: colors[Math.floor(Math.random() * colors.length)],
      //   color: colors[0],
      highlight: false,
      done: false,
      triggerClass: "",
      class: "",
      x: i,
      y: j,
      top: i * size.value,
      left: j * size.value,
      size: size.value,
    }))
  );
};
const { width, height } = useWindowSize();

onMounted(() => {
  bubbles.value = generateBubbles();
  nextTick(() =>
    width.value < 700
      ? (size.value = Math.trunc(width.value / (12 * (matrixSize.value / 10))))
      : null
  );
});

const handleClick = async (x, y, hover = false) => {
  const matrix = bubbles.value;
  const targetColor = matrix[x][y].color;
  const visited = new Set();
  const connected = [];

  async function dfs(x, y) {
    if (
      x < 0 ||
      y < 0 ||
      x >= matrix.length ||
      y >= matrix[0].length ||
      matrix[x][y].color !== targetColor ||
      visited.has(`${x},${y}`)
    ) {
      return;
    }

    visited.add(`${x},${y}`);
    connected.push(matrix[x][y]);

    dfs(x - 1, y);
    dfs(x + 1, y);
    dfs(x, y - 1);
    dfs(x, y + 1);
  }
  await dfs(x, y);

  if (hover) {
    highlight.value = connected;
    return;
  }
  let shouldDrop = true;
  let delay = 1;
  connected.forEach(async (el, i) => {
    const color = el.color;
    if (connected.length <= 1) {
      bubbles.value[el.x][el.y].triggerClass = "shake";
      setTimeout(() => {
        bubbles.value[el.x][el.y].triggerClass = "";
      }, 500);
      shouldDrop = false;
      return;
    }
    bubbles.value[el.x][el.y].color = "#f3f4f6";
    bubbles.value[el.x][el.y].class =
      "text-black transition-none cursor-not-allowed";
    bubbles.value[el.x][el.y].done = true;
    bubbles.value[el.x][el.y].highlight = false;
    await explode(el.x * size.value, el.y * size.value, (delay += 50), color);
  });
  nextTick(() => shouldDrop && updateDrop(connected));
};

const updateDrop = (data) => {
  const uniqueYWithMaxX = Object.values(
    data.reduce((acc, { x, y }) => {
      if (!acc[y] || x > acc[y].x) {
        acc[y] = { x, y };
      }
      return acc;
    }, {})
  );

  uniqueYWithMaxX.forEach((el) => {
    for (let index = 0; index < el.x; index++) {
      searchTillTop(el.x, el.y);
    }
  });
};

const searchTillTop = async (x, y) => {
  function tillTop(x, y) {
    if (x <= 0) {
      return;
    }

    if (bubbles.value[x][y].done) {
      const og = bubbles.value[x][y];
      const target = bubbles.value[x - 1][y];

      bubbles.value[x][y] = target;
      bubbles.value[x - 1][y] = og;

      bubbles.value[x][y].x = x;
      bubbles.value[x][y].y = y;
      bubbles.value[x - 1][y].x = x - 1;
      bubbles.value[x - 1][y].y = y;

      setTimeout(() => {
        bubbles.value[x][y].left = y * size.value;
        bubbles.value[x][y].top = x * size.value;
        bubbles.value[x - 1][y].left = y * size.value;
        bubbles.value[x - 1][y].top = (x - 1) * size.value;
      }, 1);
    }

    tillTop(x - 1, y);
  }
  tillTop(x, y);
};

const explode = async (y, x, delay = 10, color = "#06D001") => {
  // uncommnet for progressive explosion
  // await new Promise((resolve) => setTimeout(resolve, delay));
  const DURATION = 700;

  const burstOptions = {
    top: 0,
    left: 0,
    x: x + size.value / 2.2,
    y: y + size.value / 2.2,
    parent: "#b-container",
    onComplete: function () {
      this.el.remove();
    },

    className: "z-20",
    degree: 0,
    count: 3,
    radius: { 0: 5 * size.value },
    children: {
      shape: radius.value === "100%" ? "circle" : "rect",
      fill: color,
      pathScale: "rand(0.5, 1)",
      radius: `rand(${size.value / 3}, ${size.value / 2.5})`,
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

  const circleOptions = {
    parent: "#b-container",
    onComplete: function () {
      this.el.remove();
    },
    shape: radius.value === "100%" ? "circle" : "rect",
    className: "z-20",
    x: x + size.value / 2.2,
    y: y + size.value / 2.2,
    top: 0,
    left: 0,
    radius: { 30: 0, 0: size.value / 1.5 },
    stroke: color,
    strokeWidth: { 10: 0 },
    fill: "none",
    duration: 500,
  };

  const animation = new mojs.Burst(burstOptions);
  const circle = new mojs.Shape(circleOptions);
  animation.play();
  animation.generate().replay();
  circle.replay();
};

const rotateMatrix = async () => {
  bubbles.value = rotateMatrix90Degrees(toRaw(bubbles.value));
  const easeInOut = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const speed = 1;
  console.log("rotation started");
  rotating.value = true;
  var date1 = new Date();
  await new Promise((resolve) => {
    nextTick(async () => {
      let pendingOperations = 0;

      for (let i = 0; i < matrixSize.value; i++) {
        for (let j = 0; j < matrixSize.value; j++) {
          pendingOperations++;
          const t = (i + j) / (2 * (matrixSize.value - 1));
          const delay = Math.trunc((i + j) * speed + easeInOut(t) * speed);

          setTimeout(async () => {
            await searchTillTop(i, j);
            pendingOperations--;

            if (pendingOperations === 0) {
              resolve();
            }
          }, delay);
        }
      }
    });
  });
  var date2 = new Date();
  setTimeout(() => (rotating.value = false), 500 + (date2 - date1));
  console.log("rotation ended", { timeTook: date2 - date1 + "ms" });
};

const rotateMatrix90Degrees = useMemoize((matrix) => {
  const matrixSize = matrix.length;
  const rotatedMatrix = Array.from({ length: matrixSize }, (_, i) =>
    Array.from({ length: matrixSize }, (_, j) => ({}))
  );

  for (let i = 0; i < matrixSize; i++) {
    for (let j = 0; j < matrixSize; j++) {
      const originalCell = matrix[i][j];
      rotatedMatrix[j][matrixSize - 1 - i] = {
        ...originalCell,
        id: j + "" + (matrixSize - 1 - i),
        x: j,
        y: matrixSize - 1 - i,
        top: j * originalCell.size,
        left: (matrixSize - 1 - i) * originalCell.size,
      };
    }
  }

  return rotatedMatrix;
});

watch(highlight, (newHighlight, oldHighlight) => {
  if (newHighlight.length <= 0) {
    oldHighlight.forEach((val) => {
      bubbles.value[val.x][val.y].highlight = false;
    });
    return;
  }
  highlight.value.forEach((val) => {
    bubbles.value[val.x][val.y].highlight = true;
  });
});

watch(size, (newSize, oldSize) => {
  let nr = toRaw(bubbles.value);
  bubbles.value.forEach((bubble, i) => {
    bubble.forEach((el, j) => {
      nr[i][j].size = newSize;
      nr[i][j].top = nr[i][j].x * newSize;
      nr[i][j].left = nr[i][j].y * newSize;
    });
  });
  bubbles.value = nr;
});

watch(matrixSize, () => {
  bubbles.value = generateBubbles();
  size.value = Math.trunc(50 - (matrixSize.value / 3) * 5);
});

watch(width, (newWidth, oldWidth) => {
  newWidth < 700
    ? (size.value = Math.trunc(newWidth / (12 * (matrixSize.value / 10))))
    : null;
  console.log({ newW: newWidth });
});
</script>

<style>
.bubble:not(.transition-none) {
  transition: all 0.2s ease-in-out, top 0.3s ease-in-out;
}

.shake {
  animation: shake-animation 0.5s;
}

@keyframes shake-animation {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }

  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }

  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }

  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }

  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }

  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }

  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }

  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }

  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }

  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }

  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}
</style>
