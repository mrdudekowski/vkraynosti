(function attachAnimationOrder(root) {
  const movePoint = (points, index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= points.length) return points.slice();
    const next = points.slice();
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };

  const animationDelays = (points, gap) => points.map((point, index) => [point.id, index * gap]);
  const camera = { scale: 0.56, left: 38, top: 2 };
  const round = (value) => Math.round(value * 100) / 100;
  const cameraPosition = ({ x, y }) => ({ x: round(camera.left + x * camera.scale), y: round(camera.top + y * camera.scale) });
  const sourcePosition = ({ x, y }) => ({ x: round((x - camera.left) / camera.scale), y: round((y - camera.top) / camera.scale) });

  root.AnimationOrder = { movePoint, animationDelays, cameraPosition, sourcePosition };
}(globalThis));
