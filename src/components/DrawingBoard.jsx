import { useEffect, useRef, useState } from "react";
import {
  calculateAngle,
  calculateDistance,
  findLine,
  findPointAtDistance,
  getPointOnCanvas,
  getPointsFromLines,
  radianToDegree,
} from "../utils/helper";
import { AiOutlineClear } from "react-icons/ai";
import { PiLineSegmentBold } from "react-icons/pi";

const WIDTH = window.innerWidth * 0.8;
const HEIGHT = 500;
const GRID_UNIT = 20;

export const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const namePointer = useRef(65);
  const [lines, setLines] = useState([]);
  const [angles, setAngles] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [toolActive, setToolActive] = useState(false);

  function renderGrid(gridSpacing) {
    // console.log("Grid");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "#ccc";
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#000";
    ctx.font = "12px Arial";
  }

  function drawPoint(ctx, point, name) {
    const pointRadius = 5;
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    name && ctx.fillText(name, point.x - 10, point.y - 10);
  }

  const renderLine = (newLine) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const distance = (
      calculateDistance(newLine.start, newLine.end) /
      (4 * GRID_UNIT)
    ).toFixed(2);
    const centerX = (newLine.start.x + newLine.end.x) / 2;
    const centerY = (newLine.start.y + newLine.end.y) / 2;

    const line = {
      ...newLine,
      distance,
      center: { x: centerX, y: centerY + 15 },
    };
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.fillText(`${line.distance} cm`, line.center.x, line.center.y);
    ctx.stroke();
    drawPoint(ctx, line.start, line.startName);
    drawPoint(ctx, line.end, line.endName);
  };

  function renderAngle({ start, center, end, angle }) {
    // console.log(start, center, end, angle);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const angleCenterX = center.x;
    const angleCenterY = center.y;

    let startAngle = Math.atan2(start.y - angleCenterY, start.x - angleCenterX);
    let endAngle = Math.atan2(end.y - angleCenterY, end.x - angleCenterX);

    const startAngleDeg = radianToDegree(startAngle);
    const endAngleDeg = radianToDegree(endAngle);

    const diff = Math.abs(Math.round(startAngleDeg - endAngleDeg));
    let direction = false;
    if (
      (startAngleDeg > endAngleDeg && diff === angle) ||
      (startAngleDeg < 270 && diff != angle)
    ) {
      direction = true;
    }
    // console.log(angle, startAngleDeg, endAngleDeg, diff);

    ctx.beginPath();
    ctx.arc(angleCenterX, angleCenterY, 30, startAngle, endAngle, direction);
    ctx.stroke();

    const textDistance = 60;
    const p1 = findPointAtDistance({ start: center, end: start }, textDistance);
    const p2 = findPointAtDistance({ start: center, end }, textDistance);

    const textX = (p1.x + p2.x) / 2;
    const textY = (p1.y + p2.y) / 2;

    // console.log(direction, startAngleDeg, endAngleDeg);

    ctx.fillText(`${angle}°`, textX, textY);
  }

  const clearScreen = () => {
    // console.log("Clear");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderGrid(GRID_UNIT);
  };

  const updateAnglesAndName = ({ start, center, end, name }) => {
    // console.log(start, center, end, name);
    if (!name) {
      const updatedName = String.fromCharCode(namePointer.current);
      namePointer.current += 1;
      return updatedName;
    }
    const angle = calculateAngle(start, center, end);
    const newAngle = {
      start,
      center,
      end,
      angle,
    };
    setAngles((prevAngles) => [...prevAngles, newAngle]);
    return name;
  };

  const handleMouseDown = (e) => {
    if (!toolActive) return;
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

  const handleMouseMove = (e) => {
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

    angles.forEach((angle) => {
      renderAngle(angle);
    });

    // renderLine(newLine);

    // ctx.lineWidth = 2;
    // ctx.beginPath();
    // ctx.moveTo(startPoint.x, startPoint.y);
    // ctx.lineTo(x, y);
    // ctx.stroke();
  };

  const handleMouseUp = (e) => {
    const canvas = canvasRef.current;
    const endPoint = getPointOnCanvas(e, canvas);

    const startData = findLine(lines, startPoint);
    const endData = findLine(lines, endPoint);
    // console.log("Start Data", startData);
    // console.log("End Data", endData);

    const startName = updateAnglesAndName({
      start: endPoint,
      center: startData.start,
      end: startData.end,
      name: startData.name,
    });

    const endName = updateAnglesAndName({
      start: endData.end,
      center: endData.start,
      end: startPoint,
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

  useEffect(() => {
    clearScreen();

    lines.forEach((line) => {
      renderLine(line);
    });

    angles.forEach((angle) => {
      renderAngle(angle);
    });
  }, [lines, angles]);

  const handleClearCanvas = () => {
    namePointer.current = 65;
    setLines([]);
    setAngles([]);
    clearScreen();
  };

  return (
    <>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          height={HEIGHT}
          width={WIDTH}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleMouseMove}
          style={{ cursor: toolActive ? "crosshair" : "default" }}
        />
        <div className="toolBox">
          <button
            onClick={() => {
              setToolActive(!toolActive);
            }}
            className={toolActive ? "active" : ""}
          >
            <PiLineSegmentBold />
          </button>
          <button onClick={handleClearCanvas}>
            <AiOutlineClear />
          </button>
        </div>
      </div>
    </>
  );
};
