import {
  ShapeUtil,
  Geometry2d,
  TLBaseShape,
  TLOnResizeHandler,
  resizeBox,
  Vec2d,
  Polygon2d,
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
        type: string;
        canBind: boolean;
        canSnap: boolean;
        index: string;
        x: number;
        y: number;
      };
      handle2: {
        id: string;
        type: string;
        canBind: boolean;
        canSnap: boolean;
        index: string;
        x: number;
        y: number;
      };
      handle3: {
        id: string;
        type: string;
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

  override isAspectRatioLocked = (_shape: SpeechBubbleShape) => false;
  override canResize = (_shape: SpeechBubbleShape) => true;
  override canBind = (_shape: SpeechBubbleShape) => true;

  getGeometry(shape: SpeechBubbleShape): Geometry2d {
    const {
      w,
      h,
      tailHeight,
      tailWidth,
      handles: { handle1 },
    } = shape.props;
    return new Polygon2d({
      points: [
        new Vec2d(0, 0),
        new Vec2d(handle1.x, tailHeight),
        new Vec2d(-w, -tailHeight),
        new Vec2d(-w, -h),
        new Vec2d(w, -tailHeight),
        new Vec2d(handle1.x + tailWidth, -tailHeight),
      ],
      isFilled: shape.props.isFilled,
    });
  }

  getDefaultProps(): SpeechBubbleShape["props"] {
    return {
      tailHeight: 60,
      tailWidth: 10,
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
          y: 60,
        },
        handle2: {
          id: "handle2",
          type: "vertex",
          index: "a2",
          canBind: false,
          canSnap: true,
          x: -30 + 10,
          y: 60,
        },
        handle3: {
          id: "handle3",
          type: "vertex",
          index: "a3",
          canBind: false,
          canSnap: true,
          x: 0,
          y: 60,
        },
      },
    };
  }

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
    tailWidth,
    handles: { handle1 },
  } = shape.props;

  const d = `
            M${0},${0}
            L${handle1.x},-${tailHeight}
            L-${w},-${tailHeight}
            L-${w},-${h}
            L${w},-${h}
            L${w},-${tailHeight}
            L${handle1.x + tailWidth},-${tailHeight}
            z`;

  return d;
}
