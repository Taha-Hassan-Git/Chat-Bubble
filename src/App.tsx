import './App.css'
import { Editor, Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { SpeechBubbleUtil } from './SpeechBubble/SpeechBubble'
import { snapshot } from './data'
import { SpeechBubbleTool } from './SpeechBubble/SpeechBubbleTool'
import { uiOverrides } from './SpeechBubble/ui-overrides'
import { useCallback } from 'react'

const shapeUtils = [SpeechBubbleUtil]
const tools = [SpeechBubbleTool]

function App() {
	const handleMount = useCallback((editor: Editor) => {
		// editor.store.loadSnapshot(snapshot)
		// editor.setCamera({ x: 0, y: 0, z: 1 })
	}, [])

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw
				shapeUtils={shapeUtils}
				tools={tools}
				overrides={uiOverrides}
				persistenceKey="whatever"
				// onMount={handleMount}
			/>
		</div>
	)
}

export default App
