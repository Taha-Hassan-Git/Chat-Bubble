import {
  ShapeUtil,
  Geometry2d,
  TLBaseShape,
  TLOnResizeHandler,
  resizeBox,
  Vec2d,
  Polygon2d,
  TLOnHandleChangeHandler,
  deepCopy,
  structuredClone,
  TLHandle,
  intersectLineSegmentPolygon,
  TLOnBeforeUpdateHandler,
} from "@tldraw/tldraw";

type SpeechBubbleShape = TLBaseShape<
  "speech-bubble",
  {
    w: number;
    h: number;
    handles: {
      handle: TLHandle;
    };
  }
>;

export class SpeechBubbleUtil extends ShapeUtil<SpeechBubbleShape> {
  static type = "speech-bubble" as const;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override isAspectRatioLocked = (_shape: SpeechBubbleShape) => false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override canResize = (_shape: SpeechBubbleShape) => true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override canBind = (_shape: SpeechBubbleShape) => true;

  getDefaultProps(): SpeechBubbleShape["props"] {
    return {
      w: 200,
      h: 130,
      handles: {
        handle: {
          id: "handle1",
          type: "vertex",
          canBind: true,
          canSnap: true,
          index: "a1",
          x: 180,
          y: 180,
        },
      },
    };
  }

  getGeometry(shape: SpeechBubbleShape): Geometry2d {
    const speechBubbleGeometry = getSpeechBubbleGeometry(shape);
    const body = new Polygon2d({
      points: speechBubbleGeometry,
      isFilled: true,
    });
    return body;
  }

  override getHandles(shape: SpeechBubbleShape) {
    const handles = shape.props.handles;
    const handlesArray = Object.values(handles);
    return handlesArray;
  }

  override onBeforeUpdate:
    | TLOnBeforeUpdateHandler<SpeechBubbleShape>
    | undefined = (_: SpeechBubbleShape, next: SpeechBubbleShape) => {
    const { intersection } = getHandleIntersectionPoint({
      w: next.props.w,
      h: next.props.h,
      handle: next.props.handles.handle,
    });

    if (!intersection) return next;

    const intersectionVector = new Vec2d(intersection.x, intersection.y);
    const handleVector = new Vec2d(
      next.props.handles.handle.x,
      next.props.handles.handle.y
    );

    const distance = handleVector.dist(intersectionVector);
    const topLeft = new Vec2d(0, 0);
    const bottomRight = new Vec2d(next.props.w, next.props.h);
    const MIN_DISTANCE = topLeft.dist(bottomRight) / 5;

    const MAX_DISTANCE = topLeft.dist(bottomRight) / 1.5;
    let newPoint = handleVector;
    if (distance <= MIN_DISTANCE) {
      // Calculate the angle between the handle vector and the shape
      const angle = Math.atan2(
        handleVector.y - intersectionVector.y,
        handleVector.x - intersectionVector.x
      );

      const direction = Vec2d.FromAngle(angle, MIN_DISTANCE);
      newPoint = intersectionVector.add(direction);
    }
    if (distance >= MAX_DISTANCE) {
      // Calculate the angle between the handle vector and the shape
      const angle = Math.atan2(
        handleVector.y - intersectionVector.y,
        handleVector.x - intersectionVector.x
      );

      const direction = Vec2d.FromAngle(angle, MAX_DISTANCE);
      newPoint = intersectionVector.add(direction);
    }

    return {
      ...next,
      props: {
        ...next.props,
        handles: {
          ...next.props.handles,
          handle: {
            ...next.props.handles.handle,
            x: newPoint.x,
            y: newPoint.y,
          },
        },
      },
    };
  };

  override onHandleChange: TLOnHandleChangeHandler<SpeechBubbleShape> = (
    _,
    { handle, initial }
  ) => {
    const next = deepCopy(initial!);

    next.props.handles["handle"] = {
      ...next.props.handles["handle"],
      x: handle.x,
      y: handle.y,
    };

    return next;
  };

  component(shape: SpeechBubbleShape) {
    const geometry = getSpeechBubbleGeometry(shape);
    const pathData = "M" + geometry[0] + "L" + geometry.slice(1) + "Z";
    return (
      <>
        <svg className="tl-svg-container">
          <path d={pathData} stroke={"black"} strokeWidth={4} fill="none" />
        </svg>
      </>
    );
  }

  indicator(shape: SpeechBubbleShape) {
    const geometry = getSpeechBubbleGeometry(shape);
    const pathData = "M" + geometry[0] + "L" + geometry.slice(1) + "Z";
    return <path d={pathData} />;
  }

  override onResize: TLOnResizeHandler<SpeechBubbleShape> = (shape, info) => {
    const resized = resizeBox(shape, info);
    const next = structuredClone(info.initialShape);
    console.log(
      "initial",
      next.props.handles.handle.x,
      next.props.handles.handle.y
    );
    next.x = resized.x;
    next.y = resized.y;
    next.props.w = resized.props.w;
    next.props.h = resized.props.h;

    const widthRatio = next.props.w / info.initialShape.props.w;
    const heightRatio = next.props.h / info.initialShape.props.h;
    //console.log({ widthRatio, heightRatio });
    const handle = next.props.handles.handle;
    handle.x *= widthRatio;
    handle.y *= heightRatio;
    console.log((handle.x *= widthRatio), (handle.y *= heightRatio));
    return {
      ...next,
      props: {
        ...next.props,
        handles: {
          ...next.props.handles,
          handle: { ...handle, x: handle.x, y: handle.y },
        },
      },
    };
  };
}

function getHandleIntersectionPoint({
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

  const intersection = intersectLineSegmentPolygon(handleVec, center, box);
  if (intersection) {
    // lines
    ///      0
    //  _____________
    //  |           |
    // 3|           | 1
    //  |           |
    //  -------------
    //        2
    let line: 0 | 1 | 2 | 3 = 2;
    let start = new Vec2d(0, h);
    let end = new Vec2d(w, h);
    const intersectionVec = new Vec2d(intersection[0].x, intersection[0].y);

    if (Math.round(intersectionVec.y) < 4) {
      line = 0;
      start = new Vec2d(0, 0);
      end = new Vec2d(w, 0);
    }
    if (Math.round(intersectionVec.x) === Math.round(w)) {
      line = 1;
      start = new Vec2d(w, 0);
      end = new Vec2d(w, h);
    }
    if (Math.round(intersectionVec.y) === Math.round(h)) {
      line = 2;
      start = new Vec2d(0, h);
      end = new Vec2d(w, h);
    }

    if (Math.round(intersectionVec.x) < 4) {
      line = 3;
      start = new Vec2d(0, 0);
      end = new Vec2d(0, h);
    }
    const whichOffset =
      line === 0 || line === 2 ? offset.horizontal : offset.vertical;
    const adjustedIntersection = getAdjustedIntersectionPoint({
      start,
      end,
      intersectionVec,
      offset: whichOffset,
    });

    return { intersection: adjustedIntersection, offset, line };
  }
  return { intersection: null, offset };
}

const getSpeechBubbleGeometry = (shape: SpeechBubbleShape): Vec2d[] => {
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
      throw new Error("Invalid line number");
  }

  return modifiedSegments;
};

const getAdjustedIntersectionPoint = ({
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function invLerp(a: number, b: number, v: number) {
  return (v - a) / (b - a);
}
/**
 * Maps a value from one range to another.
 * e.g. mapRange(10, 20, 50, 100, 15) => 75
 */
function mapRange(a1: number, b1: number, a2: number, b2: number, s: number) {
  return lerp(a2, b2, invLerp(a1, b1, s));
}
