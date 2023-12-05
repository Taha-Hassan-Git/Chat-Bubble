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
    const {
      w,
      h,
      handles: { handle },
    } = shape.props;
    const { intersection, offset } = getHandleIntersectionPoint({
      w,
      h,
      handle,
    });
    if (intersection) {
      const body = new Polygon2d({
        points: [
          new Vec2d(handle.x, handle.y),
          new Vec2d(intersection.x - offset, intersection.y),
          new Vec2d(0, h),
          new Vec2d(0, 0),
          new Vec2d(w, 0),
          new Vec2d(w, h),
          new Vec2d(intersection.x + offset, intersection.y),
        ],
        isFilled: true,
      });
      return body;
    }
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
    if (!intersection) return _;
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
      console.log(angle);
      const direction = Vec2d.FromAngle(angle, MIN_DISTANCE);
      newPoint = intersectionVector.add(direction);
      console.log(newPoint);
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
    const d = getSpeechBubblePath(shape);
    return (
      <>
        <svg className="tl-svg-container">
          <path d={d} stroke={"black"} strokeWidth={2} fill="none" />
        </svg>
      </>
    );
  }

  indicator(shape: SpeechBubbleShape) {
    return <path d={getSpeechBubblePath(shape)} />;
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
    return { intersection: intersection[0], offset };
  }
  return { intersection: null, offset };
}

export function getSpeechBubblePath(shape: SpeechBubbleShape) {
  const {
    w,
    h,
    handles: { handle },
  } = shape.props;
  const { intersection, offset } = getHandleIntersectionPoint({ w, h, handle });
  if (intersection) {
    const d = `
            M${handle.x},${handle.y}
            L${intersection.x - offset},${intersection.y}
            L-${0},${h}
            L${0},${0}
            L${w},${0}
            L${w},${h}
            L${intersection.x + offset},${intersection.y}
            z`;

    return d;
  }
}
