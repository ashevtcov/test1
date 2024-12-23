import React, { MouseEvent, useEffect, useRef } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { newId } from './tools/object';

const Dimensions = {
  margin: 0,
};

interface Shape {
  id: string;
  x: number;
  y: number;
  dragStartX?: number;
  dragStartY?: number;
  width: number;
  height: number;
  color: string;
}

const App = () => {
  const useGlobalState = useLocalStorageState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      const { x, y, width, height, color } = shape;
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
      context.fillStyle = 'black';
      context.fillRect(x + width - 10, y + height - 10, 10, 10);
    };

    const renderMovingShape = (shape: Shape) => {
      const { x, y, width, height, color } = shape;
      context.strokeStyle = color;
      context.strokeRect(x, y, width, height);
    };

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const resizingShape = getResizingShape();
    const movingShape = getMovingShape();

    for (const shape of getShapes()) {
      if (shape.id !== movingShape?.id && shape.id !== resizingShape?.id) {
        renderShape(shape);
      }
    }

    if (movingShape) {
      renderMovingShape(movingShape);
    }
  };

  const getShapeById = (id: string) =>
    getShapes().find((shape) => shape.id === id);

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

  const onMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const resizingShape = findResizingShape(event.clientX, event.clientY);

    if (resizingShape) {
      setResizingShape(resizingShape);
      return;
    }

    const shape = findShape(event.clientX, event.clientY);

    if (shape) {
      shape.dragStartX = event.clientX;
      shape.dragStartY = event.clientY;
      setMovingShape(shape);
    }
  };

  const onMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const resizingShape = getResizingShape();

    if (resizingShape) {
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

  const onMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const movingShape = getMovingShape();

    if (movingShape) {
      const xDiff = event.clientX - (movingShape.dragStartX ?? 0);
      const yDiff = event.clientY - (movingShape.dragStartY ?? 0);

      movingShape.x += xDiff;
      movingShape.y += yDiff;
      movingShape.dragStartX = event.clientX;
      movingShape.dragStartY = event.clientY;

      setMovingShape(movingShape);
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
