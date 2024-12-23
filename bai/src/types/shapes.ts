export interface Point {
  x: number;
  y: number;
}

export type Rect = Point & {
  width: number;
  height: number;
};

export interface Draggable {
  dragStart?: Point;
}

export interface Resizable {
  resizeStart?: Point;
}

export type Shape = Rect &
  Draggable &
  Resizable & {
    id: string;
    color: string;
  };

export type Selection = Rect & Resizable;

export interface SelectionGroup {
  selection: Selection;
  shapes: Record<string, Shape>;
}
