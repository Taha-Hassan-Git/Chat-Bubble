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
  Group2d,
  Rectangle2d,
  structuredClone,
  TLHandle,
  intersectLineSegmentPolygon,
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
    const offset = 10;
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
      const body = new Polygon2d({
        points: [
          new Vec2d(handle.x, handle.y),
          new Vec2d(intersection[0].x - offset, intersection[0].y),
          new Vec2d(0, h),
          new Vec2d(0, 0),
          new Vec2d(w, 0),
          new Vec2d(w, h),
          new Vec2d(intersection[0].x + offset, intersection[0].y),
        ],
        isFilled: true,
      });
      return new Group2d({
        children: [
          body,
          new Rectangle2d({
            width: w,
            height: h,
            x: 0,
            y: 0,
            isFilled: true,
            isLabel: true,
          }),
        ],
      });
    }
  }

  override getHandles(shape: SpeechBubbleShape) {
    const handles = shape.props.handles;
    const handlesArray = Object.values(handles);
    return handlesArray;
  }

  // override onBeforeUpdate?:
  // 	| TLOnBeforeUpdateHandler<SpeechBubbleShape>
  // 	| undefined = (_: SpeechBubbleShape, next: SpeechBubbleShape) => {
  // 	const {
  // 		w,
  // 		h,
  // 		tailHeight,
  // 		tailWidth,
  // 		handles: { handle1, handle2 },
  // 	} = next.props

  // 	const newHandle1: HandleType = { ...handle1 }
  // 	const newHandle2: HandleType = { ...handle2 }
  // 	const newTail = { tailHeight, tailWidth }

  // 	// If the tail gets too high, move it back down
  // 	if (handle2.y < h + tailHeight) {
  // 		newHandle2.y = h + tailHeight
  // 	}
  // 	// if the tail gets too small, don't let it invert
  // 	if (tailWidth < 1) {
  // 		newTail.tailWidth = 1
  // 	}
  // 	//if the corners are out of bounds, move them back in
  // 	if (handle1.x > w - tailWidth / 2) {
  // 		newHandle1.x = w - tailWidth / 2
  // 	}
  // 	if (handle1.x < 0 + tailWidth / 2) {
  // 		newHandle1.x = 0 + tailWidth / 2
  // 	}
  // 	// when the tail was at its smallest, you could drag it out of bounds
  // 	// this prevents that
  // 	if (tailWidth <= 1 && handle1.x > w) {
  // 		newHandle1.x = w
  // 	}
  // 	if (tailWidth <= 1 && handle1.x < 0) {
  // 		newHandle1.x = 0
  // 	}
  // 	// if the tail is wider than the shape, make it the same width
  // 	if (tailWidth > w) {
  // 		newHandle1.x = w / 2
  // 		newTail.tailWidth = w
  // 	}

  // 	return {
  // 		...next,
  // 		props: {
  // 			...next.props,
  // 			tailHeight: newTail.tailHeight,
  // 			tailWidth: newTail.tailWidth,
  // 			handles: { handle1: newHandle1, handle2: newHandle2 },
  // 		},
  // 	}
  // }

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

    for (const [id, handle] of Object.entries(
      info.initialShape.props.handles
    )) {
      const initialHeight = info.initialBounds.h;
      const initialWidth = info.initialBounds.w;

      // Finding the initial normalized position of the handle
      const normalizedX = handle.x / initialWidth;
      const normalizedY = handle.y / initialHeight;

      const newX = normalizedX * WIDTH_AFTERWARDS;
      const newY = normalizedY * (next.props.h + next.props.tailHeight);

      const nextHandle = next.props.handles[id as HandleType["id"]];
      nextHandle.x = newX;
      nextHandle.y = newY;
    }

    return next;
  };
}
export function getSpeechBubblePath(shape: SpeechBubbleShape) {
  const {
    w,
    h,

    handles: { handle },
  } = shape.props;
  const offset = 10;
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
    const d = `
            M${handle.x},${handle.y}
            L${intersection[0].x - offset},${intersection[0].y}
            L-${0},${h}
            L${0},${0}
            L${w},${0}
            L${w},${h}
            L${intersection[0].x + offset},${intersection[0].y}
            z`;

    return d;
  }
}
