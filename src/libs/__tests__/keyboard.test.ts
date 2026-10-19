import { isEditableKeyboardTarget, SIDEBAR_TOGGLE_SHORTCUT_LABELS } from '../keyboard';

describe('keyboard', () => {
  describe('isEditableKeyboardTarget', () => {
    it('should return false for plain elements', () => {
      const div = document.createElement('div');
      expect(isEditableKeyboardTarget(div)).toBe(false);
    });

    it('should return true for input elements', () => {
      const input = document.createElement('input');
      expect(isEditableKeyboardTarget(input)).toBe(true);
    });

    it('should return true for textarea elements', () => {
      const textarea = document.createElement('textarea');
      expect(isEditableKeyboardTarget(textarea)).toBe(true);
    });

    it('should return true for select elements', () => {
      const select = document.createElement('select');
      expect(isEditableKeyboardTarget(select)).toBe(true);
    });

    it('should return true for contenteditable elements', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      expect(isEditableKeyboardTarget(div)).toBe(true);
    });

    it('should return false for non-contenteditable elements', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'false');
      expect(isEditableKeyboardTarget(div)).toBe(false);
    });

    it('should return false for null targets', () => {
      expect(isEditableKeyboardTarget(null)).toBe(false);
    });

    it('should return false for non-HTMLElement event targets', () => {
      const textNode = document.createTextNode('text');
      expect(isEditableKeyboardTarget(textNode)).toBe(false);
    });

    it('should return false for nested editable detection when not editable', () => {
      const button = document.createElement('button');
      expect(isEditableKeyboardTarget(button)).toBe(false);
    });
  });

  describe('SIDEBAR_TOGGLE_SHORTCUT_LABELS', () => {
    it('should expose platform labels', () => {
      expect(SIDEBAR_TOGGLE_SHORTCUT_LABELS.mac).toBe('⌘B');
      expect(SIDEBAR_TOGGLE_SHORTCUT_LABELS.other).toBe('Ctrl+B');
    });
  });
});
