self.onmessage = function(event) {
  const { x, y, bubbles, size } = event.data;

  function tillTop(x, y, bubbles) {
    if (x <= 0) {
      return;
    }

    if (bubbles[x][y].done) {
      const og = bubbles[x][y];
      const target = bubbles[x - 1][y];

      bubbles[x][y] = target;
      bubbles[x - 1][y] = og;

      bubbles[x][y].x = x;
      bubbles[x][y].y = y;
      bubbles[x - 1][y].x = x - 1;
      bubbles[x - 1][y].y = y;

      // Update the positions
      bubbles[x][y].left = y * size;
      bubbles[x][y].top = x * size;
      bubbles[x - 1][y].left = y * size;
      bubbles[x - 1][y].top = (x - 1) * size;
    }

    tillTop(x - 1, y, bubbles);
  }

  tillTop(x, y, bubbles);
  
  self.postMessage({ bubbles });
};