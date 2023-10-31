import "./App.css";
import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { SpeechBubbleUtil } from "./SpeechBubble/SpeechBubble";
import { snapshot } from "./data";
import { SpeechBubbleTool } from "./SpeechBubble/SpeechBubbleTool";
import { uiOverrides } from "./SpeechBubble/ui-overrides";

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        shapeUtils={[SpeechBubbleUtil]}
        tools={[SpeechBubbleTool]}
        overrides={uiOverrides}
        onMount={(editor) => {
          editor.store.loadSnapshot(snapshot);
          editor.setCamera({ x: 0, y: 0, z: 1 });
        }}
      />
    </div>
  );
}

export default App;
