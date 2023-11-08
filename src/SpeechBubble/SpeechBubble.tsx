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
} from "@tldraw/tldraw";

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
    w: number;
    h: number;
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
      w: 200,
      h: 130,
      isFilled: true,
      size: "m",
      color: "black",
      handles: {
        handle1: {
          id: "handle1",
          type: "vertex",
          canBind: false,
          canSnap: true,
          index: "a1",
          // the middle of the shape
          x: 100 + tailWidth / 2,
          y: 130 + tailHeight,
        },
        handle2: {
          id: "handle2",
          type: "vertex",
          index: "a2",
          canBind: false,
          canSnap: true,
          //half the width, but let's give it a funky angle
          x: 100 - 60,
          y: 130 - tailHeight,
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
        new Vec2d(0, h + tailHeight),
        new Vec2d(0, 0),
        new Vec2d(w, 0),
        new Vec2d(w, h + tailHeight),
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
          x: 0,
          y: 0,
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
    | undefined = (_: SpeechBubbleShape, next: SpeechBubbleShape) => {
    const {
      w,
      h,
      tailHeight,
      tailWidth,
      handles: { handle1, handle2 },
    } = next.props;

    const newHandle1: HandleType = { ...handle1 };
    const newHandle2: HandleType = { ...handle2 };
    const newTail = { tailHeight, tailWidth };

    // If the tail gets too high, move it back down
    if (handle2.y < h + tailHeight) {
      newHandle2.y = h + tailHeight;
    }
    // if the tail gets too small, don't let it invert
    if (tailWidth < 1) {
      newTail.tailWidth = 1;
    }
    //if the corners are out of bounds, move them back in
    if (handle1.x > w - tailWidth / 2) {
      newHandle1.x = w - tailWidth / 2;
    }
    if (handle1.x < 0 + tailWidth / 2) {
      newHandle1.x = 0 + tailWidth / 2;
    }
    // when the tail was at its smallest, you could drag it out of bounds
    // this prevents that
    if (tailWidth <= 1 && handle1.x > w) {
      newHandle1.x = w;
    }
    if (tailWidth <= 1 && handle1.x < 0) {
      newHandle1.x = 0;
    }
    // if the tail is wider than the shape, make it the same width
    if (tailWidth > w) {
      newHandle1.x = w / 2;
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
    _,
    { handle, initial }
  ) => {
    const next = deepCopy(initial!);

    let deltaY;

    if (handle.id === "handle1" && initial) {
      const oldY = initial.props.handles.handle1.y;
      const newY = handle.y;
      deltaY = newY - oldY;

      next.props.handles.handle1.x = handle.x;
      next.props.tailWidth = next.props.tailWidth + deltaY;
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
          <path d={d} stroke={shape.props.color} strokeWidth={7} fill="none" />
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
            L-${0},${h + tailHeight}
            L${0},${0}
            L${w},${0}
            L${w},${h + tailHeight}
            L${handle1.x + offset},${handle1.y}
            z`;

  return d;
}
