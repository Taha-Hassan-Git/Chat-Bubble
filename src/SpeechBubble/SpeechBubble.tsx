import {
  ShapeUtil,
  Geometry2d,
  TLBaseShape,
  TLOnResizeHandler,
  resizeBox,
  Stadium2d,
} from "@tldraw/tldraw";

type SpeechBubbleShape = TLBaseShape<
  "speech-bubble",
  {
    w: number;
    h: number;
    strokeWidth: number;
    isFilled: boolean;
    handles: {
      start: {
        id: string;
        type: string;
        canBind: boolean;
        canSnap: boolean;
        index: string;
        x: number;
        y: number;
      };
      end: {
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
    return new Stadium2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: shape.props.isFilled,
    });
  }

  getDefaultProps(): SpeechBubbleShape["props"] {
    return {
      w: 100,
      h: 100,
      isFilled: false,
      size: "m",
      color: "black",
      strokeWidth: 2,
      handles: {
        start: {
          id: "start",
          type: "vertex",
          canBind: false,
          canSnap: true,
          index: "a1",
          x: 0,
          y: 0,
        },
        end: {
          id: "end",
          type: "vertex",
          canBind: false,
          canSnap: true,
          index: "a2",
          x: 100,
          y: 100,
        },
      },
    };
  }

  component(shape: SpeechBubbleShape) {
    const d = getOvalIndicatorPath(shape.props.w, shape.props.h);
    return (
      <svg className="tl-svg-container">
        <path
          d={d}
          stroke={shape.props.color}
          strokeWidth={shape.props.strokeWidth}
          fill="blue"
        />
      </svg>
    );
  }

  indicator(shape: SpeechBubbleShape) {
    return <path d={getOvalIndicatorPath(shape.props.w, shape.props.h)} />;
  }
  override onResize: TLOnResizeHandler<SpeechBubbleShape> = (shape, info) => {
    console.log({ info });
    return resizeBox(shape, info);
  };
}

export function getOvalIndicatorPath(w: number, h: number) {
  let d: string;

  if (h > w) {
    const offset = w / 2;
    d = `
    M0,${offset}
    a${offset},${offset},0,1,1,${offset * 2},0
    L${w},${h - offset}
    a${offset},${offset},0,1,1,-${offset * 2},0
    Z`;
  } else {
    const offset = h / 2;
    d = `
    M${offset},0
    L${w - offset},0
    a${offset},${offset},0,1,1,0,${offset * 2}
    L${offset},${h}
    a${offset},${offset},0,1,1,0,${-offset * 2}
    Z`;
  }

  return d;
}
