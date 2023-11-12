export const Canvas = ({ canvasRef, HEIGHT, WIDTH, toolActive }) => {
  <canvas
    ref={canvasRef}
    height={HEIGHT}
    width={WIDTH}
    style={{ cursor: toolActive ? "crosshair" : "default" }}
  />;
};
