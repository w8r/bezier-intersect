const {
  cubicBezierLine,
  quadBezierAABB,
  cubicBezierAABB
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

describe('intersectCubicBezierAABB', () => {

  it ('intersects', () => {
    const x = 981.7516776530498, y = 1202.2380271093887;
    const dx = 860.2542723247064, dy = 1323.735432437732;
    const res = [];
    const q = [843, 1228, 943, 1328];
    assert.equal(cubicBezierAABB(x, y, dx, y, x, dy, x, y, q[0], q[1], q[2], q[3], res), 2);
    assert.deepEqual(res, [ 927.7910501404327, 1228, 942.9999999999999, 1252.974906993395 ]);
  });

  it ('does not intersect', () => {
    const x = 981.7516776530498, y = 1202.2380271093887;
    const dx = 860.2542723247064, dy = 1323.735432437732;
    const res = [];
    const q = [843 - 100, 1228 - 100, 943 -100, 1328 - 100]
    assert.equal(cubicBezierAABB(x, y, dx, y, x, dy, x, y, q[0], q[1], q[2], q[3], res), 0);
    assert.deepEqual(res, []);
  });

});

describe('quad bezier rectangle', () => {
  it ('crosses the rectangle at 2 points', () => {
    const result = [];
    assert.equal(quadBezierAABB(0, 0, 150, 100, 300, 0, 100, 0, 200, 100, result), 2);
    assert.deepEqual(result, [200, 44.44444444444445, 100, 44.44444444444444]);
  });
});
