import React, { MouseEvent, useEffect, useRef } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { newId } from './tools/object';

const Dimensions = {
  margin: 0,
};

interface Point {
  x: number;
  y: number;
}

type Rect = Point & {
  width: number;
  height: number;
};

interface Draggable {
  dragStart?: Point;
}

interface Resizable {
  resizeStart?: Point;
}

type Shape = Rect &
  Draggable &
  Resizable & {
    id: string;
    color: string;
  };

type Selection = Rect & Resizable;

interface SelectionGroup {
  selection: Selection;
  shapes: Record<string, Shape>;
}

const App = () => {
  const useGlobalState = useLocalStorageState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [getSelection, setSelection] = useGlobalState<Selection | null>(null);
  const [getSelectionGroup, setSelectionGroup] =
    useGlobalState<SelectionGroup | null>(null);
  const [getMovingShape, setMovingShape] = useGlobalState<Shape | null>(null);
  const [getResizingShape, setResizingShape] = useGlobalState<Shape | null>(
    null
  );
  const [getShapes, setShapes] = useGlobalState<Shape[]>([
    {
      id: newId(),
      x: 20,
      y: 20,
      width: 100,
      height: 50,
      color: 'green',
    },
    {
      id: newId(),
      x: 150,
      y: 100,
      width: 120,
      height: 30,
      color: 'red',
    },
  ]);

  const renderCanvas = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) => {
    const renderShape = (shape: Shape) => {
      const { id, x, y, width, height, color } = shape;
      const selectionGroup = getSelectionGroup();

      context.fillStyle = color;
      context.fillRect(x, y, width, height);
      context.fillStyle = 'black';
      context.fillRect(x + width - 10, y + height - 10, 10, 10);

      if (selectionGroup?.shapes[id]) {
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.strokeRect(x, y, width, height);
      }
    };

    const renderMovingShape = (shape: Shape) => {
      const { x, y, width, height, color } = shape;

      context.strokeStyle = color;
      context.strokeRect(x, y, width, height);
    };

    const renderResizingShape = (shape: Shape) => {
      const { x, y, width, height } = shape;
      context.strokeStyle = 'grey';
      context.strokeRect(x, y, width, height);
      context.fillStyle = 'black';
      context.fillRect(x + width - 10, y + height - 10, 10, 10);
    };

    const renderSelection = (selection: Selection) => {
      const { x, y, width, height } = selection;

      context.strokeStyle = 'grey';
      context.strokeRect(x, y, width, height);
    };

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const selection = getSelection();

    if (selection) {
      console.log('sel');
      renderSelection(selection);
    }

    const resizingShape = getResizingShape();

    if (resizingShape) {
      renderResizingShape(resizingShape);
    }

    const movingShape = getMovingShape();

    if (movingShape) {
      renderMovingShape(movingShape);
    }

    for (const shape of getShapes()) {
      if (shape.id !== movingShape?.id && shape.id !== resizingShape?.id) {
        renderShape(shape);
      }
    }
  };

  const findShape = (x: number, y: number) =>
    getShapes().find(
      (shape) =>
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
    );

  const findResizingShape = (x: number, y: number) =>
    getShapes().find(
      (shape) =>
        x >= shape.x + shape.width - 10 &&
        x <= shape.x + shape.width &&
        y >= shape.y + shape.height - 10 &&
        y <= shape.y + shape.height
    );

  const isShapeWithinBounds = (shape: Rect, selection: Rect) =>
    shape.x >= selection.x &&
    shape.x + shape.width <= selection.x + selection.width &&
    shape.y >= selection.y &&
    shape.y + shape.height <= selection.y + selection.height;

  const onMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const shape = findShape(event.clientX, event.clientY);
    const resizingShape = findResizingShape(event.clientX, event.clientY);

    if (!shape && !resizingShape) {
      console.log('creating selection');
      const selection: Selection = {
        x: event.clientX,
        y: event.clientY,
        width: 0,
        height: 0,
        resizeStart: {
          x: event.clientX,
          y: event.clientY,
        },
      };

      setSelection(selection);
      return;
    }

    if (resizingShape) {
      resizingShape.resizeStart = {
        x: event.clientX,
        y: event.clientY,
      };

      setResizingShape(resizingShape);
      return;
    }

    if (shape) {
      shape.dragStart = {
        x: event.clientX,
        y: event.clientY,
      };
      setMovingShape(shape);
    }
  };

  const onMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const selection = getSelection();

    if (selection?.resizeStart) {
      const xDiff = event.clientX - (selection.resizeStart.x ?? 0);
      const yDiff = event.clientY - (selection.resizeStart.y ?? 0);

      selection.width += xDiff;
      selection.height += yDiff;
      selection.resizeStart.x = event.clientX;
      selection.resizeStart.y = event.clientY;

      setSelection(selection);
    }

    const resizingShape = getResizingShape();

    if (resizingShape?.resizeStart) {
      const xDiff = event.clientX - (resizingShape.resizeStart.x ?? 0);
      const yDiff = event.clientY - (resizingShape.resizeStart.y ?? 0);

      resizingShape.width += xDiff;
      resizingShape.height += yDiff;
      resizingShape.resizeStart.x = event.clientX;
      resizingShape.resizeStart.y = event.clientY;

      setResizingShape(resizingShape);

      return;
    }

    const movingShape = getMovingShape();

    if (movingShape?.dragStart) {
      const xDiff = event.clientX - (movingShape.dragStart.x ?? 0);
      const yDiff = event.clientY - (movingShape.dragStart.y ?? 0);

      movingShape.x += xDiff;
      movingShape.y += yDiff;
      movingShape.dragStart.x = event.clientX;
      movingShape.dragStart.y = event.clientY;

      setMovingShape(movingShape);
    }
  };

  const onMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const selection = getSelection();

    if (selection) {
      const allShapes = getShapes();
      const group: SelectionGroup = {
        selection,
        shapes: {},
      };

      for (const shape of allShapes) {
        if (isShapeWithinBounds(shape, selection)) {
          group.shapes[shape.id] = shape;
        }
      }

      console.log('removing selection');
      setSelectionGroup(group);
      setSelection(null);
    }

    const resizingShape = getResizingShape();

    if (resizingShape) {
      const allShapes = getShapes();

      for (const shape of allShapes) {
        if (shape.id === resizingShape.id) {
          shape.width = resizingShape.width;
          shape.height = resizingShape.height;
        }
      }

      setShapes(allShapes);
      setResizingShape(null);
    }

    const movingShape = getMovingShape();

    if (movingShape) {
      const allShapes = getShapes();

      for (const shape of allShapes) {
        if (shape.id === movingShape.id) {
          shape.x = movingShape.x;
          shape.y = movingShape.y;
        }
      }

      setShapes(allShapes);
      setMovingShape(null);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // canvas.onmousedown = onMouseDown;
    // canvas.onmouseup = onMouseUp;
    // canvas.onmousemove = onMouseMove;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    renderCanvas(canvas, context);
    setInterval(() => renderCanvas(canvas, context), 10);
  }, []);

  return (
    <div className="App">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        style={{
          margin: Dimensions.margin,
          width: window.innerWidth,
          height: window.innerHeight,
          border: '2px solid grey',
        }}
      ></canvas>
    </div>
  );
};

export default App;
