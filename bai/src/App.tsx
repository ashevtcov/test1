import React, { useEffect, useRef } from 'react';
import './App.css';

const renderCanvas = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) => {
  context.beginPath();
  context.arc(50, 50, 50, 0, 2 * Math.PI);
  context.fill();
};

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    renderCanvas(canvas, context);
  }, []);

  return (
    <div className="App">
      <canvas
        ref={canvasRef}
        style={{
          margin: 10,
          width: 1024,
          height: 768,
          border: '2px solid grey',
        }}
      ></canvas>
    </div>
  );
};

export default App;
