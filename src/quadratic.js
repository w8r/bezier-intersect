import { getPolynomialRoots } from './polynomial';

export function quadBezierLine(
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

  // Transform cubic coefficients to line's coordinate system and find roots
  // of cubic
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
          if (result) result.push(p6x, p6y);
          else        return 1;
        }
      } else if (a1y === a2y) {
        if (minx <= p6x && p6x <= maxx) {
          if (result) result.push(p6x, p6y);
          else        return 1;
        }

      // gte: (x1 >= x2 && y1 >= y2)
      // lte: (x1 <= x2 && y1 <= y2)
      } else if (p6x >= minx && p6y >= miny && p6x <= maxx && p6y <= maxy) {
        if (result) result.push(p6x, p6y);
        else        return 1;
      }
    }
  }
  return result ? result.length / 2 : 0;
}


export function quadBezierAABB(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmax, ymax, result) {
  if (result) { // all intersections
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmax, ymin, result);
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmax, ymin, xmax, ymax, result);
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymax, xmax, ymax, result);
    quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmin, ymax, result);
    return result.length / 2;
  } else {      // any intersections
    // trivial cases
    if (xmin <= ax && xmax >= ax && ymin <= ay && ymax >= ay) return 1;
    if (xmin <= bx && xmax >= bx && ymin <= by && ymax >= by) return 1;
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmax, ymin)) return 1;
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmax, ymin, xmax, ymax)) return 1;
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymax, xmax, ymax)) return 1;
    if (quadBezierLine(ax, ay, c1x, c1y, bx, by, xmin, ymin, xmin, ymax)) return 1;
    return 0;
  }
}
