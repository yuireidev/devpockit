export const SIDEBAR_TOGGLE_SHORTCUT_LABELS = {
  mac: '⌘B',
  other: 'Ctrl+B',
} as const;

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  const contentEditable = target.getAttribute('contenteditable');
  return target.isContentEditable === true || contentEditable === 'true' || contentEditable === '';
}
