import test from 'node:test';
import assert from 'node:assert/strict';
import './animation-order.js';

const { movePoint, animationDelays, cameraPosition, sourcePosition } = globalThis.AnimationOrder;

test('movePoint changes the persisted animation order without mutating the original list', () => {
  const points = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const moved = movePoint(points, 2, -1);

  assert.deepEqual(moved.map((point) => point.id), ['a', 'c', 'b']);
  assert.deepEqual(points.map((point) => point.id), ['a', 'b', 'c']);
});

test('animationDelays follow the current point order', () => {
  assert.deepEqual(animationDelays([{ id: 'c' }, { id: 'a' }, { id: 'b' }], 500), [
    ['c', 0], ['a', 500], ['b', 1000],
  ]);
});

test('camera position keeps a point aligned after the landscape is scaled and moved right', () => {
  assert.deepEqual(cameraPosition({ x: 50, y: 50 }), { x: 66, y: 30 });
  assert.deepEqual(sourcePosition({ x: 66, y: 30 }), { x: 50, y: 50 });
});
