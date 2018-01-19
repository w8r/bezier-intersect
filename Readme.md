# bezier-intersect

Set of functions to find intersections between lines and rectangles and Bezier curves of order 2 and 3. Based on [thelonious/js-intersections](https://github.com/thelonious/js-intersections/), but with the abstractions removed and some performance tweaking.

## Install

```
npm i -S bezier-intersect
```

```js
import {
  quadBezierLine,
  cubicBezierLine,
  quadBezierAABB,
  cubicBezierAABB
} from 'bezier-intersect';
```

```html
<script src="https://unpkg.com/bezier-intersect"></script>
<script>
var res = [];
bezierIntersect.quadBezierLine(..., res);
console.log(res);
</script>
```

## API

### `quadBezierLine(ax, ay, cx, cy, bx, by, l1x, l1y, l2x, l2y, [result:Array<number>]):number`

Calculates the intersection points between the quadratic Bezier curve and line segment. If `result` is passed, returns the exact number of intersections, and stores them in `result` as `[x, y, x, y]`. If not - stops at the first intersection and returns `1` or `0` if there are no intersections.

### `quadBezierAABB(ax, ay, cx, cy, bx, by, minx, miny, maxx, maxy, [result:Array<number>]):number`

Calculates the intersection points between the quadratic Bezier curve and axis-aligned box. If `result` is passed, returns the exact number of intersections, and stores them in `result` as `[x, y, x, y]`. If not - stops at the first intersection and returns `1` or `0` if there are no intersections.

### `cubicBezierLine(ax, ay, c1x, c1y, c2x, c2y, bx, by, l1x, l1y, l2x, l2y, [result:Array<number>]):number`

Calculates the intersection points between the cubic Bezier curve and line segment. If `result` is passed, returns the exact number of intersections, and stores them in `result` as `[x, y, x, y]`. If not - stops at the first intersection and returns `1` or `0` if there are no intersections.

### `cubicBezierAABB(ax, ay, c1x, c1y, c2x, c2y, bx, by, minx, miny, maxx, maxy, [result:Array<number>]):number`

Calculates the intersection points between the cubic Bezier curve and axis-aligned box. If `result` is passed, returns the exact number of intersections, and stores them in `result` as `[x, y, x, y]`. If not - stops at the first intersection and returns `1` or `0` if there are no intersections.

## TODO

- [ ] More tests
- [ ] Bezier/Polygon
- [ ] Bezier/Ellipse/Circle

## License

MIT
