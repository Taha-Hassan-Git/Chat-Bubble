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
  TLOnBeforeUpdateHandler,
  T,
} from "@tldraw/tldraw";

// GET THE ELEMENT FOR THE HANDLES, CHANGE ITS ZINDEX TO 101

type HandleType = {
  id: "handle1" | "handle2";
  type: "vertex";
  canBind: boolean;
  canSnap: boolean;
  index: string;
  x: number;
  y: number;
};

type SpeechBubbleShape = TLBaseShape<
  "speech-bubble",
  {
    tailHeight: number;
    tailWidth: number;
    text: string;
    w: number;
    h: number;
    strokeWidth: number;
    isFilled: boolean;
    handles: {
      handle1: HandleType;
      handle2: HandleType;
    };
    size: string;
    color: string;
  }
>;

export const STROKE_SIZES: Record<string, number> = {
  s: 2,
  m: 3.5,
  l: 5,
  xl: 10,
};

export class SpeechBubbleUtil extends ShapeUtil<SpeechBubbleShape> {
  static type = "speech-bubble" as const;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override isAspectRatioLocked = (_shape: SpeechBubbleShape) => false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override canResize = (_shape: SpeechBubbleShape) => true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override canBind = (_shape: SpeechBubbleShape) => true;

  getDefaultProps(): SpeechBubbleShape["props"] {
    const tailHeight = -20;
    const tailWidth = 60;
    return {
      tailHeight: tailHeight,
      tailWidth: tailWidth,
      text: "hello",
      w: 200,
      h: 130,
      isFilled: true,
      size: "m",
      color: "black",
      strokeWidth: 5,
      handles: {
        handle1: {
          id: "handle1",
          type: "vertex",
          canBind: false,
          canSnap: true,
          index: "a1",
          x: 30 - tailWidth / 2,
          y: tailHeight,
        },
        handle2: {
          id: "handle2",
          type: "vertex",
          index: "a2",
          canBind: false,
          canSnap: true,
          //start position
          x: -60,
          //there was an extra bit at the bottom I needed to trim off
          y: -tailHeight,
        },
      },
    };
  }

  getGeometry(shape: SpeechBubbleShape): Geometry2d {
    const {
      w,
      h,
      tailHeight,
      tailWidth,
      handles: { handle1, handle2 },
    } = shape.props;
    const offset = tailWidth / 2;
    const body = new Polygon2d({
      points: [
        new Vec2d(handle2.x, handle2.y),
        new Vec2d(handle1.x - offset, handle1.y),
        new Vec2d(-w / 2, tailHeight),
        new Vec2d(-w / 2, -h),
        new Vec2d(w / 2, -h),
        new Vec2d(w / 2, tailHeight),
        new Vec2d(handle1.x + offset, handle1.y),
      ],
      isFilled: shape.props.isFilled,
    });

    return new Group2d({
      children: [
        body,
        new Rectangle2d({
          width: w,
          height: h + tailHeight,
          x: -w / 2,
          y: -h,
          isFilled: true,
          isLabel: true,
        }),
      ],
    });
  }

  override getHandles(shape: SpeechBubbleShape) {
    const handles = shape.props.handles;
    const handlesArray = Object.values(handles);
    return handlesArray;
  }
  override onBeforeUpdate?:
    | TLOnBeforeUpdateHandler<SpeechBubbleShape>
    | undefined = (_: T, next: T) => {
    const {
      w,
      tailHeight,
      tailWidth,
      handles: { handle1, handle2 },
    } = next.props;

    const newHandle1: HandleType = { ...handle1 };
    const newHandle2: HandleType = { ...handle2 };
    const newTail = { tailHeight, tailWidth };

    // If the tail gets too high, move it back down
    if (handle2.y < tailHeight) {
      newHandle2.y = tailHeight;
    }
    // if the tail gets too small, don't let it invert
    if (tailWidth < 1) {
      newTail.tailWidth = 1;
    }
    //if the corners are out of bounds, move them back in
    if (handle1.x > w / 2 - tailWidth / 2) {
      newHandle1.x = w / 2 - tailWidth / 2;
    }
    if (handle1.x < -(w / 2) + tailWidth / 2) {
      newHandle1.x = -(w / 2) + tailWidth / 2;
    }
    // if the tail is wider than the shape, make it the same width
    if (tailWidth > w) {
      newTail.tailWidth = w;
    }

    return {
      ...next,
      props: {
        ...next.props,
        tailHeight: newTail.tailHeight,
        tailWidth: newTail.tailWidth,
        handles: { handle1: newHandle1, handle2: newHandle2 },
      },
    };
  };

  override onHandleChange: TLOnHandleChangeHandler<SpeechBubbleShape> = (
    shape,
    { handle }
  ) => {
    const next = deepCopy(shape);

    // 1. stash the original shape (original handle position)
    // 2. calculate the delta from where you started dragging to now (point origin-> current point)
    // 3. add that to the original handle position

    const deltaY = 0.1;

    //Check handle, and check bounds
    if (handle.id === "handle1") {
      next.props.handles.handle1.x = handle.x;

      next.props.tailWidth += deltaY;
    }
    if (handle.id === "handle2") {
      next.props.handles["handle2"] = {
        ...next.props.handles["handle2"],
        x: handle.x,
        y: handle.y,
      };
    }

    return next;
  };

  component(shape: SpeechBubbleShape) {
    const d = getSpeechBubblePath(shape);

    return (
      <>
        <svg className="tl-svg-container">
          <path
            d={d}
            stroke={shape.props.color}
            strokeWidth={shape.props.strokeWidth}
            fill="none"
          />
        </svg>
      </>
    );
  }

  indicator(shape: SpeechBubbleShape) {
    return <path d={getSpeechBubblePath(shape)} />;
  }

  override onResize: TLOnResizeHandler<SpeechBubbleShape> = (shape, info) => {
    return resizeBox(shape, info);
  };
}
export function getSpeechBubblePath(shape: SpeechBubbleShape) {
  const {
    w,
    h,
    tailHeight,
    tailWidth,
    handles: { handle1, handle2 },
  } = shape.props;
  const offset = tailWidth / 2;
  const d = `
            M${handle2.x},${handle2.y}
            L${handle1.x - offset},${handle1.y}
            L-${w / 2},${tailHeight}
            L-${w / 2},-${h}
            L${w / 2},-${h}
            L${w / 2},${tailHeight}
            L${handle1.x + offset},${handle1.y}
            z`;

  return d;
}
