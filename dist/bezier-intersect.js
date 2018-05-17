(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bezierIntersect = {})));
}(this, (function (exports) { 'use strict';

var POLYNOMIAL_TOLERANCE = 1e-6;
var TOLERANCE            = 1e-12;

function getPolynomialRoots() {
  var C  = arguments;
  var degree  = C.length - 1;
  var n       = degree;
  var results = [];
  for (var i = 0; i <= degree; i++) {
    if (Math.abs(C[i]) <= TOLERANCE) { degree--; } else { break; }
  }

  switch (degree) {
    case 1: getLinearRoots(C[n], C[n - 1], results); break;
    case 2: getQuadraticRoots(C[n], C[n - 1], C[n - 2], results); break;
    case 3: getCubicRoots(C[n], C[n - 1], C[n - 2], C[n - 3], results); break;
    default: break;
  }

  return results;
}

function getLinearRoots(C0, C1, results) {
  if ( results === void 0 ) results = [];

  if (C1 !== 0) { results.push(-C0 / C1); }
  return results;
}

function getQuadraticRoots(C0, C1, C2, results) {
  if ( results === void 0 ) results = [];

  var a = C2;
  var b = C1 / a;
  var c = C0 / a;
  var d = b * b - 4 * c;

  if (d > 0) {
    var e = Math.sqrt(d);

    results.push(0.5 * (-b + e));
    results.push(0.5 * (-b - e));
  } else if (d === 0) {
    results.push( 0.5 * -b);
  }

  return results;
}


function getCubicRoots(C0, C1, C2, C3, results) {
  if ( results === void 0 ) results = [];

  var c3 = C3;
  var c2 = C2 / c3;
  var c1 = C1 / c3;
  var c0 = C0 / c3;

  var a       = (3 * c1 - c2 * c2) / 3;
  var b       = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
  var offset  = c2 / 3;
  var discrim = b * b / 4 + a * a * a / 27;
  var halfB   = b / 2;
  var tmp, root;

  if (Math.abs(discrim) <= POLYNOMIAL_TOLERANCE) { discrim = 0; }

  if (discrim > 0) {
    var e = Math.sqrt(discrim);

    tmp = -halfB + e;
    if ( tmp >= 0 ) { root = Math.pow(  tmp, 1/3); }
    else            { root = -Math.pow(-tmp, 1/3); }

    tmp = -halfB - e;
    if ( tmp >= 0 ) { root += Math.pow( tmp, 1/3); }
    else            { root -= Math.pow(-tmp, 1/3); }

    results.push(root - offset);
  } else if (discrim < 0) {
    var distance = Math.sqrt(-a/3);
    var angle    = Math.atan2(Math.sqrt(-discrim), -halfB) / 3;
    var cos      = Math.cos(angle);
    var sin      = Math.sin(angle);
    var sqrt3    = Math.sqrt(3);

    results.push( 2 * distance * cos - offset);
    results.push(-distance * (cos + sqrt3 * sin) - offset);
    results.push(-distance * (cos - sqrt3 * sin) - offset);
  } else {
    if (halfB >= 0) { tmp = -Math.pow(halfB, 1/3); }
    else            { tmp =  Math.pow(-halfB, 1/3); }

    results.push(2 * tmp - offset);
    // really should return next root twice, but we return only one
    results.push(-tmp - offset);
  }

  return results;
}

function quadBezierLine(
  p1x, p1y, p2x, p2y, p3x, p3y,
  a1x, a1y, a2x, a2y, result) {
  var ax, ay, bx, by;                // temporary variables
  var c2x, c2y, c1x, c1y, c0x, c0y;  // coefficients of quadratic
  var cl;               // c coefficient for normal form of line
  var nx, ny;           // normal for normal form of line
  // used to determine if point is on line segment
  var minx = Math.min(a1x, a2x),
      miny = Math.min(a1y, a2y),
      maxx = Math.max(a1x, a2x),
      maxy = Math.max(a1y, a2y);

  ax = p2x * -2; ay = p2y * -2;
  c2x = p1x + ax + p3x;
  c2y = p1y + ay + p3y;

  ax = p1x * -2; ay = p1y * -2;
  bx = p2x * 2;  by = p2y * 2;
  c1x = ax + bx;
  c1y = ay + by;

  c0x = p1x; c0y = p1y; // vec

  // Convert line to normal form: ax + by + c = 0
  // Find normal to line: negative inverse of original line's slope
  nx = a1y - a2y; ny = a2x - a1x;

  // Determine new c coefficient
  cl = a1x * a2y - a2x * a1y;

  // Transform cubic coefficients to line's coordinate system
  // and find roots of cubic
  var roots = getPolynomialRoots(
    // dot products => x * x + y * y
    nx * c2x + ny * c2y,
    nx * c1x + ny * c1y,
    nx * c0x + ny * c0y + cl
  );

  // Any roots in closed interval [0,1] are intersections on Bezier, but
  // might not be on the line segment.
  // Find intersections and calculate point coordinates
  for (var i = 0; i < roots.length; i++) {
    var t = roots[i];
    if ( 0 <= t && t <= 1 ) { // We're within the Bezier curve
      // Find point on Bezier
      // lerp: x1 + (x2 - x1) * t
      var p4x = p1x + (p2x - p1x) * t;
      var p4y = p1y + (p2y - p1y) * t;

      var p5x = p2x + (p3x - p2x) * t;
      var p5y = p2y + (p3y - p2y) * t;

      // candidate
      var p6x = p4x + (p5x - p4x) * t;
      var p6y = p4y + (p5y - p4y) * t;

      // See if point is on line segment
      // Had to make special cases for vertical and horizontal lines due
      // to slight errors in calculation of p6
      if (a1x === a2x) {
        if (miny <= p6y && p6y <= maxy) {
          if (result) { result.push(p6x, p6y); }
          else        { return 1; }
        }
      } else if (a1y === a2y) {
        if (minx <= p6x && p6x <= maxx) {
          if (result) { result.push(p6x, p6y); }
          else        { return 1; }
        }

      // gte: (x1 >= x2 && y1 >= y2)
      // lte: (x1 <= x2 && y1 <= y2)
      } else if (p6x >= minx && p6y >= miny && p6x <= maxx && p6y <= maxy) {
        if (result) { result.push(p6x, p6y); }
        else        { return 1; }
      }
    }
  }
  return result ? result.length / 2 : 0;
}


function quadBezierAABB(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmax, ymax, result) {
  if (result) { // all intersections
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmax, ymin, result);
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmax, ymin, xmax, ymax, result);
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymax, xmax, ymax, result);
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmin, ymax, result);
    return result.length / 2;
  } else {      // any intersections
    // trivial cases
    if (xmin <= ax && xmax >= ax && ymin <= ay && ymax >= ay) { return 1; }
    if (xmin <= bx && xmax >= bx && ymin <= by && ymax >= by) { return 1; }
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmax, ymin)) { return 1; }
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmax, ymin, xmax, ymax)) { return 1; }
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymax, xmax, ymax)) { return 1; }
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmin, ymax)) { return 1; }
    return 0;
  }
}

function cubicBezierLine(
  p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y,
  a1x, a1y, a2x, a2y, result) {
  var ax, ay, bx, by, cx, cy, dx, dy;         // temporary variables
  var c3x, c3y, c2x, c2y, c1x, c1y, c0x, c0y; // coefficients of cubic
  var cl;         // c coefficient for normal form of line
  var nx, ny;     // normal for normal form of line

  // used to determine if point is on line segment
  var minx = Math.min(a1x, a2x),
      miny = Math.min(a1y, a2y),
      maxx = Math.max(a1x, a2x),
      maxy = Math.max(a1y, a2y);

  // Start with Bezier using Bernstein polynomials for weighting functions:
  //     (1-t^3)P1 + 3t(1-t)^2P2 + 3t^2(1-t)P3 + t^3P4
  //
  // Expand and collect terms to form linear combinations of original Bezier
  // controls.  This ends up with a vector cubic in t:
  //     (-P1+3P2-3P3+P4)t^3 + (3P1-6P2+3P3)t^2 + (-3P1+3P2)t + P1
  //             /\                  /\                /\       /\
  //             ||                  ||                ||       ||
  //             c3                  c2                c1       c0

  // Calculate the coefficients
  ax = p1x * -1; ay = p1y * -1;
  bx = p2x * 3;  by = p2y * 3;
  cx = p3x * -3; cy = p3y * -3;
  dx = ax + bx + cx + p4x;
  dy = ay + by + cy + p4y;
  c3x = dx; c3y = dy; // vec

  ax = p1x * 3;  ay = p1y * 3;
  bx = p2x * -6; by = p2y * -6;
  cx = p3x * 3;  cy = p3y * 3;
  dx = ax + bx + cx;
  dy = ay + by + cy;
  c2x = dx; c2y = dy; // vec

  ax = p1x * -3; ay = p1y * -3;
  bx = p2x * 3;  by = p2y * 3;
  cx = ax + bx;
  cy = ay + by;
  c1x = cx;
  c1y = cy; // vec

  c0x = p1x;
  c0y = p1y;

  // Convert line to normal form: ax + by + c = 0
  // Find normal to line: negative inverse of original line's slope
  nx = a1y - a2y;
  ny = a2x - a1x;

  // Determine new c coefficient
  cl = a1x * a2y - a2x * a1y;

  // ?Rotate each cubic coefficient using line for new coordinate system?
  // Find roots of rotated cubic
  var roots = getPolynomialRoots(
    // dot products => x * x + y * y
    nx * c3x + ny * c3y,
    nx * c2x + ny * c2y,
    nx * c1x + ny * c1y,
    nx * c0x + ny * c0y + cl
  );

  // Any roots in closed interval [0,1] are intersections on Bezier, but
  // might not be on the line segment.
  // Find intersections and calculate point coordinates
  for (var i = 0; i < roots.length; i++) {
    var t = roots[i];

    if (0 <= t && t <= 1) { // We're within the Bezier curve
      // Find point on Bezier
      // lerp: x1 + (x2 - x1) * t
      var p5x = p1x + (p2x - p1x) * t;
      var p5y = p1y + (p2y - p1y) * t; // lerp(p1, p2, t);

      var p6x = p2x + (p3x - p2x) * t;
      var p6y = p2y + (p3y - p2y) * t;

      var p7x = p3x + (p4x - p3x) * t;
      var p7y = p3y + (p4y - p3y) * t;

      var p8x = p5x + (p6x - p5x) * t;
      var p8y = p5y + (p6y - p5y) * t;

      var p9x = p6x + (p7x - p6x) * t;
      var p9y = p6y + (p7y - p6y) * t;

      // candidate
      var p10x = p8x + (p9x - p8x) * t;
      var p10y = p8y + (p9y - p8y) * t;

      // See if point is on line segment
      if (a1x === a2x) {                       // vertical
        if (miny <= p10y && p10y <= maxy) {
          if (result) { result.push(p10x, p10y); }
          else        { return 1; }
        }
      } else if (a1y === a2y) {               // horizontal
        if (minx <= p10x && p10x <= maxx) {
          if (result) { result.push(p10x, p10y); }
          else        { return 1; }
        }
      } else if (p10x >= minx && p10y >= miny && p10x <= maxx && p10y <= maxy) {
        if (result) { result.push(p10x, p10y); }
        else        { return 1; }
      }
    }
  }
  return result ? result.length / 2 : 0;
}


function cubicBezierAABB(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmin, ymin, xmax, ymax, result) {
  if (result) { // all intersections
    cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmin, ymin, xmax, ymin, result);
    cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmax, ymin, xmax, ymax, result);
    cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmin, ymax, xmax, ymax, result);
    cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmin, ymin, xmin, ymax, result);
    return result.length / 2;
  } else {     // any intersections
    // trivial cases
    if (xmin <= ax && xmax >= ax && ymin <= ay && ymax >= ay) { return 1; }
    if (xmin <= bx && xmax >= bx && ymin <= by && ymax >= by) { return 1; }
    if (cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmin, ymin, xmax, ymin)) { return 1; }
    if (cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmax, ymin, xmax, ymax)) { return 1; }
    if (cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmin, ymax, xmax, ymax)) { return 1; }
    if (cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, xmin, ymin, xmin, ymax)) { return 1; }
    return 0;
  }
}

exports.quadBezierLine = quadBezierLine;
exports.quadBezierAABB = quadBezierAABB;
exports.cubicBezierLine = cubicBezierLine;
exports.cubicBezierAABB = cubicBezierAABB;

Object.defineProperty(exports, '__esModule', { value: true });

})));
