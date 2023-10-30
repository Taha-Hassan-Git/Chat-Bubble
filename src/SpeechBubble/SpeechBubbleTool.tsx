import { BaseBoxShapeTool, TLClickEvent } from "@tldraw/tldraw";

export class SpeechBubbleTool extends BaseBoxShapeTool {
  static override id = "speech-bubble";
  static override initial = "idle";
  override shapeType = "speech-bubble";

  override onDoubleClick: TLClickEvent = (_info) => {};
}
