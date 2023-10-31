import {
  TLUiMenuGroup,
  TLUiOverrides,
  menuItem,
  toolbarItem,
} from "@tldraw/tldraw";

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools.speech = {
      id: "speech-bubble",
      icon: "color",
      label: "speech-bubble" as any,
      kbd: "c",
      readonlyOk: false,
      onSelect: () => {
        editor.setCurrentTool("speech-bubble");
      },
    };
    return tools;
  },
  toolbar(_app, toolbar, { tools }) {
    toolbar.splice(4, 0, toolbarItem(tools.speech));
    return toolbar;
  },
  keyboardShortcutsMenu(_app, keyboardShortcutsMenu, { tools }) {
    const toolsGroup = keyboardShortcutsMenu.find(
      (group) => group.id === "shortcuts-dialog.tools"
    ) as TLUiMenuGroup;
    toolsGroup.children.push(menuItem(tools.speech));
    return keyboardShortcutsMenu;
  },
};