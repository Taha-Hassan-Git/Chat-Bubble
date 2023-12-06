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
    if (!intersection)
      return {
        ...next,
        props: {
          ...next.props,
          handles: {
            ...next.props.handles,
            handle: {
              ...next.props.handles.handle,
              y: _.props.handles.handle.y,
            },
          },
        },
      };
    const intersectionVector = new Vec2d(intersection.x, intersection.y);
    const handleVector = new Vec2d(
      next.props.handles.handle.x,
      next.props.handles.handle.y
    );

    const distance = handleVector.dist(intersectionVector);
    const MIN_DISTANCE = next.props.h / 3;
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
          <path d={pathData} stroke={"black"} strokeWidth={2} fill="none" />
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

    // Make a copy of the initial shape
    const next = structuredClone(info.initialShape);

    next.x = resized.x;
    next.y = resized.y;
    next.props.w = resized.props.w;
    next.props.h = resized.props.h;

    const initialHeight = info.initialBounds.h;
    const initialWidth = info.initialBounds.w;

    // Finding the initial normalized position of the handle
    const normalizedX = next.props.handles.handle.x / initialWidth;
    const normalizedY = next.props.handles.handle.y / initialHeight;

    const newX = normalizedX * (next.props.w + next.props.w / 10);
    const newY =
      normalizedY *
      (next.props.h + (next.props.handles.handle.y - next.props.h));

    const nextHandle = next.props.handles.handle;
    nextHandle.x = newX;
    nextHandle.y = newY;

    return next;
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
  const offset = w / 10;
  const handleVec = new Vec2d(handle.x, handle.y);
  const center = new Vec2d(w / 2, h / 2);
  const box = [
    new Vec2d(0, 0),
    new Vec2d(w, 0),
    new Vec2d(w, h),
    new Vec2d(0, h),
  ];

  const intersection = intersectLineSegmentPolygon(handleVec, center, box);

  // A ___I__ M _______ B
  const a = new Vec2d(w, h);
  const b = new Vec2d(0, h);
  const m = new Vec2d(w / 2, h / 2);

  // lerp
  if (intersection) {
    // lines
    ///      0
    //  _____________
    //  |           |
    // 3|           | 1
    //  |           |
    //  -------------
    //      2

    let line: 0 | 1 | 2 | 3;
    console.log({ x: intersection[0].x, y: intersection[0].y });
    if (Math.round(intersection[0].y) === h) line = 2;
    if (Math.round(intersection[0].y) < 4) line = 0;
    if (Math.round(intersection[0].x) === w) line = 1;
    if (Math.round(intersection[0].x) < 4) line = 3;
    console.log(line);
    return { intersection: intersection[0], offset, line };
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
    return orientation === "horizontal"
      ? [
          line === 0
            ? new Vec2d(intersection.x - offset, intersection.y)
            : new Vec2d(intersection.x + offset, intersection.y),
          new Vec2d(handle.x, handle.y),
          line === 0
            ? new Vec2d(intersection.x + offset, intersection.y)
            : new Vec2d(intersection.x - offset, intersection.y),
        ]
      : [
          line === 1
            ? new Vec2d(intersection.x, intersection.y - offset)
            : new Vec2d(intersection.x, intersection.y + offset),
          new Vec2d(handle.x, handle.y),
          line === 1
            ? new Vec2d(intersection.x, intersection.y + offset)
            : new Vec2d(intersection.x, intersection.y - offset),
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
