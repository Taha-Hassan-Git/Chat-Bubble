import "./App.css";
import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { SpeechBubbleUtil } from "./SpeechBubble/SpeechBubble";
import { snapshot } from "./data";

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        shapeUtils={[SpeechBubbleUtil]}
        onMount={(editor) => {
          editor.store.loadSnapshot(snapshot);
          editor.setCamera({ x: -100, y: 150, z: 0.75 });
        }}
      />
    </div>
  );
}

export default App;
