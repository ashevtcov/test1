import { Rect } from '../types/shapes';

export const normalizeSelection = (selection: Rect) => {
  const right = selection.x + selection.width;
  const bottom = selection.y + selection.height;

  if (selection.x > right) {
    selection.x = right;
    selection.width = Math.abs(selection.width);
  }

  if (selection.y > bottom) {
    selection.y = Math.abs(bottom);
    selection.height = Math.abs(selection.height);
  }

  return selection;
};
