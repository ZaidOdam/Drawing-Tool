import {
  findLine,
  getPointOnCanvas,
  getPointsFromLines,
  isSamePoint,
} from "../../utils/helper";

export const handleMouseDown = (e, props) => {
  const { canvasRef, lines, selectedLineName, setStartPoint } = props;
  const canvas = canvasRef.current;
  const { x, y } = getPointOnCanvas(e, canvas);

  const selectedLine = findLine(lines, { x, y });
  if (!selectedLine.name) return;

  const points = getPointsFromLines(lines);
  let count = 0;
  points.forEach((point) => {
    if (isSamePoint(selectedLine.start, point)) count++;
  });

  if (count > 1) return;

  setStartPoint(selectedLine.end);
  selectedLineName.current = selectedLine.name;
};

export const handleMouseMove = (e, props) => {
  const {
    canvasRef,
    lines,
    selectedLineName,
    clearScreen,
    startPoint,
    renderLine,
    renderAngles,
  } = props;
  if (!selectedLineName.current || !startPoint) return;
  const canvas = canvasRef.current;
  const { x, y } = getPointOnCanvas(e, canvas);
  clearScreen();
  const filteredLine = lines.filter((line) => {
    return (
      line.startName !== selectedLineName.current &&
      line.endName !== selectedLineName.current
    );
  });

  const updatedLine = {
    start: startPoint,
    end: { x, y },
    name: selectedLineName.current,
  };
  [...filteredLine, updatedLine].forEach((line) => {
    renderLine(line);
  });

  renderAngles([...filteredLine, updatedLine]);
};

export const handleMouseUp = (e, props) => {
  const {
    canvasRef,
    lines,
    selectedLineName,
    setStartPoint,
    startPoint,
    renderName,
    setLines,
  } = props;
  const canvas = canvasRef.current;
  const endPoint = getPointOnCanvas(e, canvas);

  const startData = findLine(lines, startPoint);
  const endData = findLine(lines, endPoint);

  const startName = renderName({
    name: selectedLineName.current,
  });

  const endName = renderName({
    start: endData.end,
    center: endData.start,
    end: startPoint,
    name: selectedLineName.current,
  });

  const filteredLine = lines.filter((line) => {
    return (
      line.startName !== selectedLineName.current &&
      line.endName !== selectedLineName.current
    );
  });

  const newLine = {
    start: startData.start ?? startPoint,
    end: endData.start ?? endPoint,
    startName,
    endName,
  };
  setLines([...filteredLine, newLine]);
  setStartPoint(null);
  selectedLineName.current = null;
};
