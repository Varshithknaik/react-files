interface Editor {
  // Reference to contenteditable DOM element.
  rootElement: HTMLElement | null;
  // Both current and pending EditorStates.
  editorState: EditorState;
  pendingEditorState: EditorState | null;
  // Non-core fields are omitted.
}

interface EditorState {
  // Primarily contains content (nodes) and selection state.
  nodes: EditorNodes;
  selection: EditorSelection | null;
}

interface EditorNodes {
  // Exact structure to be discussed.
}

interface EditorSelection {
  // Exact structure to be discussed.
}

interface EditorNode {}

interface ElementalNode extends EditorNode {
  children: Array<EditorNode>
}

interface TextNode extends EditorNode {
  text: string
}