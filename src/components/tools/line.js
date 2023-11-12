import {
  calculateDistance,
  findLine,
  getPointOnCanvas,
  getPointsFromLines,
} from "../../utils/helper";

export const handleMouseDown = (e, props) => {
  const { canvasRef, lines, setStartPoint } = props;
  // e.preventDefault();
  const canvas = canvasRef.current;
  const { x, y } = getPointOnCanvas(e, canvas);
  // setStartPoint({ x, y });
  const points = getPointsFromLines(lines);
  const THRESHOLD = 30;
  let closedPoint = { x, y };
  let minDistance = THRESHOLD;
  points.forEach((point) => {
    const distance = calculateDistance(point, { x, y });
    if (distance < minDistance) {
      minDistance = distance;
      closedPoint = point;
    }
  });
  // console.log(closedPoint);
  setStartPoint(closedPoint);
};

export const handleMouseMove = (e, props) => {
  const {
    startPoint,
    canvasRef,
    clearScreen,
    lines,
    renderLine,
    renderAngles,
  } = props;
  // e.preventDefault();
  if (!startPoint) return;
  const canvas = canvasRef.current;
  // const ctx = canvas.getContext("2d");
  const { x, y } = getPointOnCanvas(e, canvas);
  clearScreen();

  const newLine = {
    start: startPoint,
    end: { x, y },
  };

  [...lines, newLine].forEach((line) => {
    renderLine(line);
  });

  renderAngles([...lines, newLine]);

  // renderLine(newLine);

  // ctx.lineWidth = 2;
  // ctx.beginPath();
  // ctx.moveTo(startPoint.x, startPoint.y);
  // ctx.lineTo(x, y);
  // ctx.stroke();
};

export const handleMouseUp = (e, props) => {
  const { canvasRef, lines, startPoint, renderName, setLines, setStartPoint } =
    props;
  // e.preventDefault();
  const canvas = canvasRef.current;
  const endPoint = getPointOnCanvas(e, canvas);

  const startData = findLine(lines, startPoint);
  const endData = findLine(lines, endPoint);

  const startName = renderName({
    name: startData.name,
  });

  const endName = renderName({
    name: endData.name,
  });

  // console.log(startName, endName);
  const newLine = {
    start: startData.start ?? startPoint,
    end: endData.start ?? endPoint,
    startName,
    endName,
  };
  setLines((prevLines) => [...prevLines, newLine]);
  setStartPoint(null);
};
