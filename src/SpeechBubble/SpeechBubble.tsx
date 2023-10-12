import {
  ShapeUtil,
  Geometry2d,
  TLBaseShape,
  TLOnResizeHandler,
  resizeBox,
  Vec2d,
  Polygon2d,
  sortByIndex,
  TLOnHandleChangeHandler,
  deepCopy,
} from "@tldraw/tldraw";

type SpeechBubbleShape = TLBaseShape<
  "speech-bubble",
  {
    tailHeight: number;
    tailWidth: number;
    w: number;
    h: number;
    strokeWidth: number;
    isFilled: boolean;
    handles: {
      handle1: {
        id: string;
        type: "vertex";
        canBind: boolean;
        canSnap: boolean;
        index: string;
        x: number;
        y: number;
      };
      handle2: {
        id: string;
        type: "vertex";
        canBind: boolean;
        canSnap: boolean;
        index: string;
        x: number;
        y: number;
      };
      handle3: {
        id: string;
        type: "vertex";
        canBind: boolean;
        canSnap: boolean;
        index: string;
        x: number;
        y: number;
      };
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
    const tailHeight = -80;
    const tailWidth = 30;
    return {
      tailHeight: tailHeight,
      tailWidth: tailWidth,
      w: 100,
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
          x: -30,
          // tailHeight
          y: tailHeight,
        },
        handle2: {
          id: "handle2",
          type: "vertex",
          index: "a2",
          canBind: false,
          canSnap: true,
          // handle1.x + tailWidth
          x: -30 + tailWidth,
          //tailHeight
          y: tailHeight,
        },
        handle3: {
          id: "handle3",
          type: "vertex",
          index: "a3",
          canBind: false,
          canSnap: true,
          x: 0,
          //tailHeight
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
      handles: { handle1, handle2, handle3 },
    } = shape.props;
    return new Polygon2d({
      points: [
        new Vec2d(handle3.x, handle3.y),
        new Vec2d(handle1.x, handle1.y),
        new Vec2d(-w, -tailHeight),
        new Vec2d(-w, -h),
        new Vec2d(w, -tailHeight),
        new Vec2d(handle2.x, handle2.y),
      ],
      isFilled: shape.props.isFilled,
    });
  }

  override getHandles(shape: SpeechBubbleShape) {
    const handles = shape.props.handles;
    console.log("handles", handles);
    const sortedHandles = Object.values(handles).sort(sortByIndex);

    return sortedHandles;
  }
  override onHandleChange: TLOnHandleChangeHandler<SpeechBubbleShape> = (
    shape,
    { handle }
  ) => {
    const next = deepCopy(shape);

    (next.props.handles as any)[handle.id] = {
      ...(next.props.handles as any)[handle.id],
      x: handle.x,
      y: handle.y,
    };

    return next;
  };

  component(shape: SpeechBubbleShape) {
    const d = getSpeechBubblePath(shape);
    return (
      <svg className="tl-svg-container">
        <path
          d={d}
          stroke={shape.props.color}
          strokeWidth={shape.props.strokeWidth}
          fill="none"
        />
      </svg>
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
    handles: { handle1, handle2, handle3 },
  } = shape.props;

  const d = `
            M${handle3.x},${handle3.y}
            L${handle1.x},${handle1.y}
            L-${w},${tailHeight}
            L-${w},-${h}
            L${w},-${h}
            L${w},${tailHeight}
            L${handle2.x},${handle2.y}
            z`;

  return d;
}
