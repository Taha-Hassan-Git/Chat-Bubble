import "./App.css";
import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { SpeechBubbleUtil } from "./SpeechBubble/SpeechBubble";

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        shapeUtils={[SpeechBubbleUtil]}
        onMount={(editor) => {
          editor.createShapes([{ type: "speech-bubble" }]);
        }}
      />
    </div>
  );
}

export default App;
