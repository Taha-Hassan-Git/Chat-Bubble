import { TLHandle, Vec2d, VecLike } from "@tldraw/tldraw";
import { SpeechBubbleShape } from "./SpeechBubble";

export function getHandleIntersectionPoint({
  w,
  h,
  handle,
}: {
  w: number;
  h: number;
  handle: TLHandle;
}) {
  const offset = { horizontal: w / 10, vertical: h / 10 };
  const handleVec = new Vec2d(handle.x, handle.y);
  const center = new Vec2d(w / 2, h / 2);
  const box = [
    new Vec2d(0, 0),
    new Vec2d(w, 0),
    new Vec2d(w, h),
    new Vec2d(0, h),
  ];

  const result = checkIntersection(handleVec, center, box);
  if (!result) return { intersection: null, offset: null, line: null };
  const { result: intersection, line } = result;

  // lines
  ///      0
  //  _____________
  //  |           |
  // 3|           | 1
  //  |           |
  //  -------------
  //        2

  const intersectionVec = new Vec2d(intersection[0].x, intersection[0].y);
  const lineCoordinates = {
    0: { start: new Vec2d(0, 0), end: new Vec2d(w, 0) },
    1: { start: new Vec2d(w, 0), end: new Vec2d(w, h) },
    2: { start: new Vec2d(0, h), end: new Vec2d(w, h) },
    3: { start: new Vec2d(0, 0), end: new Vec2d(0, h) },
  };

  // what cool typescript thing can I do here? I want to make sure that the line is one of the keys of lineCoordinates
  const { start, end } = lineCoordinates[line];
  const whichOffset =
    line === 0 || line === 2 ? offset.horizontal : offset.vertical;

  const adjustedIntersection = getAdjustedIntersectionPoint({
    start,
    end,
    intersectionVec,
    offset: whichOffset,
  });

  return {
    originalIntersection: intersectionVec,
    intersection: adjustedIntersection,
    offset,
    line,
    insideShape: result.insideShape,
  };
}

export const getSpeechBubbleGeometry = (shape: SpeechBubbleShape): Vec2d[] => {
  const { intersection, offset, line } = getHandleIntersectionPoint({
    w: shape.props.w,
    h: shape.props.h,
    handle: shape.props.handles.handle,
  });

  const handle = shape.props.handles.handle;

  const initialSegments = [
    new Vec2d(0, 0),
    new Vec2d(shape.props.w, 0),
    new Vec2d(shape.props.w, shape.props.h),
    new Vec2d(0, shape.props.h),
  ];

  if (!intersection) {
    return initialSegments;
  }

  const createTailSegments = (orientation: "horizontal" | "vertical") => {
    // Is it a horizontal or vertical line? Which line are we intersecting?
    return orientation === "horizontal"
      ? [
          line === 0
            ? new Vec2d(intersection.x - offset.horizontal, intersection.y)
            : new Vec2d(intersection.x + offset.horizontal, intersection.y),
          new Vec2d(handle.x, handle.y),
          line === 0
            ? new Vec2d(intersection.x + offset.horizontal, intersection.y)
            : new Vec2d(intersection.x - offset.horizontal, intersection.y),
        ]
      : [
          line === 1
            ? new Vec2d(intersection.x, intersection.y - offset.vertical)
            : new Vec2d(intersection.x, intersection.y + offset.vertical),
          new Vec2d(handle.x, handle.y),
          line === 1
            ? new Vec2d(intersection.x, intersection.y + offset.vertical)
            : new Vec2d(intersection.x, intersection.y - offset.vertical),
        ];
  };

  let modifiedSegments = [...initialSegments];

  switch (line) {
    case 0:
      modifiedSegments.splice(1, 0, ...createTailSegments("horizontal"));
      break;
    case 1:
      modifiedSegments.splice(2, 0, ...createTailSegments("vertical"));
      break;
    case 2:
      modifiedSegments.splice(3, 0, ...createTailSegments("horizontal"));
      break;
    case 3:
      modifiedSegments = [
        ...modifiedSegments,
        ...createTailSegments("vertical"),
      ];
      break;
    default:
      console.log("default");
  }

  return modifiedSegments;
};

export const getAdjustedIntersectionPoint = ({
  start,
  end,
  intersectionVec,
  offset,
}: {
  start: Vec2d;
  end: Vec2d;
  intersectionVec: Vec2d;
  offset: number;
}): Vec2d | null => {
  // a normalised vector from start to end, so this can work in any direction
  const unit = Vec2d.Sub(end, start).norm();

  const totalDistance = start.dist(end);
  const distance = intersectionVec.dist(start);

  //make it stick to the middle
  const middleRelative = mapRange(0, totalDistance, -1, 1, distance); // absolute -> -1 to 1
  const squaredRelative =
    Math.abs(middleRelative) ** 2 * Math.sign(middleRelative); // do some stuff
  const squared = mapRange(-1, 1, 0, totalDistance, squaredRelative); // -1 to 1 -> absolute

  //keep it away from the edges
  const constrained = mapRange(
    0,
    totalDistance,
    offset * 2.5,
    totalDistance - offset * 2.5,
    distance
  );

  // combine the two
  const interpolated = lerp(constrained, squared, 0.4);

  return unit.mul(interpolated).add(start);
};

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
export function invLerp(a: number, b: number, v: number) {
  return (v - a) / (b - a);
}
/**
 * Maps a value from one range to another.
 * e.g. mapRange(10, 20, 50, 100, 15) => 75
 */
export function mapRange(
  a1: number,
  b1: number,
  a2: number,
  b2: number,
  s: number
) {
  return lerp(a2, b2, invLerp(a1, b1, s));
}

export function checkIntersection(
  handle: Vec2d,
  center: Vec2d,
  points: Vec2d[]
): { result: VecLike[]; line: 0 | 1 | 2 | 3; insideShape?: boolean } | null {
  const result: VecLike[] = [];
  let segmentIntersection: VecLike | null;

  for (let i = 1, n = points.length; i < n + 1; i++) {
    segmentIntersection = intersectLineSegmentLineSegment(
      handle,
      center,
      points[i - 1],
      points[i % points.length]
    );

    if (segmentIntersection) {
      result.push(segmentIntersection);
      return { result, line: (i - 1) as 0 | 1 | 2 | 3 };
    }
  }
  //We're inside the shape, look backwards to find the intersection
  const angle = Math.atan2(handle.y - center.y, handle.x - center.x);
  //the third point's coordinates are the same as the height and width of the shape
  const direction = Vec2d.FromAngle(angle, Math.max(points[2].x, points[2].y));
  const newPoint = handle.add(direction);
  const intersection = checkIntersection(newPoint, center, points);
  if (!intersection) return null;
  return {
    result: intersection.result,
    line: intersection.line,
    insideShape: true,
  };
}

export function intersectLineSegmentLineSegment(
  a1: VecLike,
  a2: VecLike,
  b1: VecLike,
  b2: VecLike
) {
  const ABx = a1.x - b1.x;
  const ABy = a1.y - b1.y;
  const BVx = b2.x - b1.x;
  const BVy = b2.y - b1.y;
  const AVx = a2.x - a1.x;
  const AVy = a2.y - a1.y;
  const ua_t = BVx * ABy - BVy * ABx;
  const ub_t = AVx * ABy - AVy * ABx;
  const u_b = BVy * AVx - BVx * AVy;

  if (ua_t === 0 || ub_t === 0) return null; // coincident

  if (u_b === 0) return null; // parallel

  if (u_b !== 0) {
    const ua = ua_t / u_b;
    const ub = ub_t / u_b;
    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      return Vec2d.AddXY(a1, ua * AVx, ua * AVy);
    }
  }

  return null; // no intersection
}

export function getDistanceToLine({
  angle,
  distanceToIntersection,
  line,
}: {
  angle: number;
  distanceToIntersection: number;
  line: 0 | 1 | 2 | 3;
}) {
  const normals = {
    0: { x: 0, y: -1 }, // Top side
    1: { x: 1, y: 0 }, // Right side
    2: { x: 0, y: 1 }, // Bottom side
    3: { x: -1, y: 0 }, // Left side
  };

  const normalVectorAngle = Math.atan2(normals[line].y, normals[line].x);
  const normalizedHandleAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
  const normalizedNormalVectorAngle =
    (normalVectorAngle + 2 * Math.PI) % (2 * Math.PI);

  let angleDifference = normalizedHandleAngle - normalizedNormalVectorAngle;

  // Normalize the angle difference to be within the range -π to π
  if (angleDifference > Math.PI) {
    angleDifference -= 2 * Math.PI;
  } else if (angleDifference < -Math.PI) {
    angleDifference += 2 * Math.PI;
  }

  // Correct for angles beyond π/2 to reflect the perpendicular relationship
  let correctedAngle;
  if (Math.abs(angleDifference) <= Math.PI / 2) {
    correctedAngle = Math.PI / 2 - Math.abs(angleDifference);
  } else {
    correctedAngle = Math.abs(angleDifference) - Math.PI / 2;
  }

  // Use the sine of the corrected angle to calculate the perpendicular distance
  const distanceToLine = distanceToIntersection * Math.sin(correctedAngle);

  return distanceToLine;
}
