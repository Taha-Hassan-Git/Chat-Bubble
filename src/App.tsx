import "./App.css";
import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { SpeechBubbleUtil } from "./SpeechBubble/SpeechBubble";
import { SpeechBubbleTool } from "./SpeechBubble/SpeechBubbleTool";
import { customAssetUrls, uiOverrides } from "./SpeechBubble/ui-overrides";

const shapeUtils = [SpeechBubbleUtil];
const tools = [SpeechBubbleTool];

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        shapeUtils={shapeUtils}
        tools={tools}
        overrides={uiOverrides}
        assetUrls={customAssetUrls}
        persistenceKey="whatever"
      />
    </div>
  );
}

export default App;
