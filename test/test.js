const {
  cubicBezierLine,
  quadBezierAABB
} = require('../dist/bezier-intersect');

const { assert } = require('chai');

describe('intersectCubicBezierLine', () => {
  it ('vertical line crosses', () => {
    const result = [];
    assert.isTrue(!!cubicBezierLine(0,0, 100, 100, 200, 100, 300, 0, 100, 0, 100, 100, result))
    assert.deepEqual(result, [99.99999999999997, 66.66666666666666]);
  });

  it ('diagonal line crosses', () => {
    const result = [];
    assert.isTrue(!!cubicBezierLine(0,0, 100, 100, 200, 100, 300, 0, 100, 0, 200, 100, result))
    assert.deepEqual(result, [173.20508075688772, 73.20508075688774]);
  });
});

describe('quad bezier rectangle', () => {
  it ('crosses the rectangle at 2 points', () => {
    const result = [];
    assert.equal(quadBezierAABB(0, 0, 150, 100, 300, 0, 100, 0, 200, 100, result), 2);
    assert.deepEqual(result, [200, 44.44444444444445, 100, 44.44444444444444]);
  });
});
