import { useEffect, useRef, useState } from "react";
import {
  calculateAngle,
  calculateDistance,
  findPointAtDistance,
  getCommonPoint,
  isSamePoint,
  radianToDegree,
} from "../utils/helper";
import { AiOutlineClear } from "react-icons/ai";
import { PiLineSegmentBold } from "react-icons/pi";
import { BiSolidHand } from "react-icons/bi";
import * as lineTool from "./tools/line";
import * as selectTool from "./tools/select";

const WIDTH = window.innerWidth * 0.8;
// const HEIGHT = window.innerHeight * 0.8;
const GRID_UNIT = 20;

export const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const namePointer = useRef(65);
  const selectedLineName = useRef(null);
  const [lines, setLines] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [toolActive, setToolActive] = useState("");

  function renderGrid(gridSpacing) {
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
    ctx.font = "14px Arial";
  }

  function drawPoint(ctx, point, name) {
    const pointRadius = 5;
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    name && ctx.fillText(name, point.x - 10, point.y - 10);
  }

  const renderAngles = (lines) => {
    for (let i = 0; i < lines.length; i++) {
      const l1 = lines[i];
      for (let j = i + 1; j < lines.length; j++) {
        const l2 = lines[j];
        const commonPoint = getCommonPoint(l1, l2);
        if (!commonPoint) continue;

        const start = isSamePoint(l1.start, commonPoint) ? l1.end : l1.start;
        const end = isSamePoint(l2.start, commonPoint) ? l2.end : l2.start;

        const angle = calculateAngle(start, commonPoint, end);
        renderAngle({ start, center: commonPoint, end, angle });
      }
    }
  };

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

  const renderName = ({ name }) => {
    if (!name) {
      const updatedName = String.fromCharCode(namePointer.current);
      namePointer.current += 1;
      return updatedName;
    }
    return name;
  };

  useEffect(() => {
    clearScreen();

    lines.forEach((line) => {
      renderLine(line);
    });

    renderAngles(lines);
  }, [lines]);

  const handleClearCanvas = () => {
    namePointer.current = 65;
    setLines([]);
    clearScreen();
  };

  function getProps() {
    return {
      canvasRef,
      lines,
      setStartPoint,
      startPoint,
      clearScreen,
      setLines,
      renderLine,
      renderAngles,
      renderName,
      selectedLineName,
    };
  }

  const handleMouseDown = (e) => {
    const props = getProps();
    switch (toolActive) {
      case "line": {
        return lineTool.handleMouseDown(e, props);
      }
      case "select": {
        return selectTool.handleMouseDown(e, props);
      }
      default:
        break;
    }
  };

  const handleMouseMove = (e) => {
    const props = getProps();
    switch (toolActive) {
      case "line": {
        return lineTool.handleMouseMove(e, props);
      }
      case "select": {
        return selectTool.handleMouseMove(e, props);
      }
      default:
        break;
    }
  };

  const handleMouseUp = (e) => {
    const props = getProps();
    switch (toolActive) {
      case "line": {
        return lineTool.handleMouseUp(e, props);
      }
      case "select": {
        return selectTool.handleMouseUp(e, props);
      }
      default:
        break;
    }
  };

  return (
    <>
      <div className="canvas-container">
        <canvas
          id="canvas"
          ref={canvasRef}
          height="500px"
          width={WIDTH}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}
          onMouseOut={handleMouseUp}
          style={{ cursor: toolActive === "line" ? "crosshair" : "default" }}
        />
        <div className="toolBox">
          <button
            onClick={() => {
              setToolActive("line");
            }}
            className={toolActive === "line" ? "active" : ""}
          >
            <PiLineSegmentBold />
          </button>
          <button
            onClick={() => {
              setToolActive("select");
            }}
          >
            <BiSolidHand />
          </button>
          <button onClick={handleClearCanvas}>
            <AiOutlineClear />
          </button>
        </div>
      </div>
    </>
  );
};
