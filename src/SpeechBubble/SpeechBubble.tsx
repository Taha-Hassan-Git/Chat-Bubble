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
  TLHandle,
  TLShapeId,
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
    const tailWidth = 20;
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
          x: 60 - tailWidth / 2,
          y: tailHeight,
        },
        handle2: {
          id: "handle2",
          type: "vertex",
          index: "a2",
          canBind: false,
          canSnap: true,
          //start position
          x: 0,
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
    return new Polygon2d({
      points: [
        new Vec2d(handle2.x, handle2.y),
        new Vec2d(handle1.x - offset, handle1.y),
        new Vec2d(-w, tailHeight),
        new Vec2d(-w, -h),
        new Vec2d(w, -h),
        new Vec2d(w, tailHeight),
        new Vec2d(handle1.x + offset, handle1.y),
      ],
      isFilled: shape.props.isFilled,
    });
  }

  override getHandles(shape: SpeechBubbleShape) {
    const handles = shape.props.handles;
    const sortedHandles = Object.values(handles).sort(sortByIndex);
    return sortedHandles;
  }
  previousHandle: {
    shapeId: TLShapeId;
    handleId: string;
    x: number;
    y: number;
  } | null = null;
  override onHandleChange: TLOnHandleChangeHandler<SpeechBubbleShape> = (
    shape,
    { handle }
  ) => {
    const next = deepCopy(shape);

    if (
      !this.previousHandle ||
      this.previousHandle.shapeId !== shape.id ||
      this.previousHandle.handleId !== handle.id
    ) {
      this.previousHandle = {
        shapeId: shape.id,
        handleId: handle.id,
        x: shape.props.handles[handle.id as HandleType["id"]].x,
        y: shape.props.handles[handle.id as HandleType["id"]].y,
      };
    }

    const diffX = handle.x - this.previousHandle.x;
    const diffY = handle.y - this.previousHandle.y;

    //Does the user want to move the tail or make it wider?
    // const diffX = handle.x - shape.props.handles["handle1"].x;
    // const diffY = handle.y - shape.props.handles["handle1"].y;
    console.log({ diffX, diffY });

    //Check handle, and check bounds
    if (
      handle.id === "handle1" &&
      handle.x < shape.props.w - shape.props.tailWidth / 2 &&
      handle.x > -shape.props.w + shape.props.tailWidth / 2
    ) {
      //Moving the tail
      if (Math.abs(diffX) > Math.abs(diffY)) {
        next.props.handles[handle.id] = {
          ...next.props.handles[handle.id],
          x: handle.x,
        };
      }
      //Making the tail wider
      //We should check bounds here too
      const corner1 = shape.props.handles.handle1.x + shape.props.tailWidth / 2;
      const corner2 = shape.props.handles.handle1.x - shape.props.tailWidth / 2;
      if (Math.abs(diffY) > Math.abs(diffX)) {
        if (next.props.tailWidth < 10) {
          next.props.tailWidth = 10;
        }
        if (corner1 < shape.props.w - shape.props.tailWidth / 2) {
          next.props.tailWidth += 0;
        }
        if (corner2 > -shape.props.w + shape.props.tailWidth / 2) {
          next.props.tailWidth -= 0;
        }
        if (diffY > 0) {
          next.props.tailWidth -= 2;
        } else {
          next.props.tailWidth += 2;
        }
      }
    }
    //Changing position of the tail
    else if (handle.id === "handle2") {
      next.props.handles["handle2"] = {
        ...next.props.handles["handle2"],
        x: handle.x,
        y: handle.y,
      };
    }

    this.previousHandle = {
      shapeId: shape.id,
      handleId: handle.id,
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
    tailWidth,
    handles: { handle1, handle2 },
  } = shape.props;
  const offset = tailWidth / 2;
  const d = `
            M${handle2.x},${handle2.y}
            L${handle1.x - offset},${handle1.y}
            L-${w},${tailHeight}
            L-${w},-${h}
            L${w},-${h}
            L${w},${tailHeight}
            L${handle1.x + offset},${handle1.y}
            z`;

  return d;
}
