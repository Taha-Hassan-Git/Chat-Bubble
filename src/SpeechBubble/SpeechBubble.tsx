import {
  ShapeUtil,
  Geometry2d,
  TLBaseShape,
  TLOnResizeHandler,
  resizeBox,
  Ellipse2d,
} from "@tldraw/tldraw";

type SpeechBubbleShape = TLBaseShape<
  "speech-bubble",
  {
    w: number;
    h: number;
    color: "black";
    weight: "regular";
    strokeWidth: number;
  }
>;

export class SpeechBubbleUtil extends ShapeUtil<SpeechBubbleShape> {
  static type = "speech-bubble" as const;

  override isAspectRatioLocked = (_shape: SpeechBubbleShape) => false;
  override canResize = (_shape: SpeechBubbleShape) => true;
  override canBind = (_shape: SpeechBubbleShape) => true;

  getGeometry(shape: SpeechBubbleShape): Geometry2d {
    return new Ellipse2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  getDefaultProps(): SpeechBubbleShape["props"] {
    return {
      w: 100,
      h: 100,
      color: "black",
      weight: "regular",
      strokeWidth: 10,
    };
  }

  component(shape: SpeechBubbleShape) {
    const cx = shape.props.w / 2;
    const cy = shape.props.h / 2;
    const rx = Math.max(0, cx);
    const ry = Math.max(0, cy);

    const d = `M${cx - rx},${cy}a${rx},${ry},0,1,1,${
      rx * 2
    },0a${rx},${ry},0,1,1,-${rx * 2},0`;
    return (
      <svg>
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
    return (
      <ellipse
        cx={shape.props.w / 2}
        cy={shape.props.h / 2}
        rx={shape.props.w / 2}
        ry={shape.props.h / 2}
      />
    );
  }
  override onResize: TLOnResizeHandler<SpeechBubbleShape> = (shape, info) => {
    return resizeBox(shape, info);
  };
}
