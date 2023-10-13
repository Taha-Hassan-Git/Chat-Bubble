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
          editor.createShapes([
            {
              type: "speech-bubble",
              x: 100,
              y: 100,
              props: { color: "red", strokeWidth: 10 },
            },
            {
              type: "speech-bubble",
              x: 200,
              y: 200,
              props: { color: "blue", strokeWidth: 5 },
            },
            {
              type: "speech-bubble",
              x: 300,
              y: 300,
              props: { color: "black", strokeWidth: 1 },
            },
          ]);
        }}
      />
    </div>
  );
}

export default App;
