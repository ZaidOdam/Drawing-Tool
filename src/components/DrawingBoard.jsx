import { useEffect, useRef, useState } from "react";
import {
  calculateAngle,
  calculateDistance,
  findPointAtDistance,
  getCommonPoint,
  getControlPoint,
  isSamePoint,
} from "../utils/helper";
import { AiOutlineClear } from "react-icons/ai";
import { PiLineSegmentBold } from "react-icons/pi";
import { BiSolidHand } from "react-icons/bi";
import * as lineTool from "./tools/line";
import * as selectTool from "./tools/select";

const WIDTH = window.innerWidth * 0.8;
// const HEIGHT = window.innerHeight * 0.8;
const GRID_UNIT = 20;

export function DrawingBoard() {
  const canvasRef = useRef(null);
  const namePointer = useRef(65);
  const selectedLineName = useRef(null);
  const [lines, setLines] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [toolActive, setToolActive] = useState(null);

  function renderGrid(gridSpacing) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // ctx.strokeStyle = "#f0f0f0";
    for (let x = gridSpacing; x < canvas.width; x += gridSpacing) {
      for (let y = gridSpacing; y < canvas.height; y += gridSpacing) {
        const pointRadius = 2;
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#4F4F4F2e";
        ctx.fillStyle = "#4F4F4F2e";
        ctx.fill();
        ctx.stroke();
      }
    }

    // const line = {
    //   start: { x: 2 * gridSpacing, y: 2 * gridSpacing },
    //   end: { x: 6 * gridSpacing, y: 2 * gridSpacing },
    // };
    // renderLine(line);

    ctx.strokeStyle = "4F4F4F";
    ctx.font = "14px Arial";
  }

  function drawPoint(ctx, point, name) {
    const pointRadius = 5;
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#4F4F4F";
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
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
    ctx.fillStyle = "black";
    ctx.strokeStyle = "#4F4F4F";
    ctx.font = "bold 14px Arial";
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

    // const angleCenterX = center.x;
    // const angleCenterY = center.y;

    // let startAngle = Math.atan2(start.y - angleCenterY, start.x - angleCenterX);
    // let endAngle = Math.atan2(end.y - angleCenterY, end.x - angleCenterX);

    // const startAngleDeg = radianToDegree(startAngle);
    // const endAngleDeg = radianToDegree(endAngle);

    // const diff = Math.abs(Math.round(startAngleDeg - endAngleDeg));
    // let direction = false;
    // if (
    //   (startAngleDeg > endAngleDeg && diff === angle) ||
    //   (startAngleDeg < 270 && diff != angle)
    // ) {
    //   direction = true;
    // }
    // // console.log(angle, startAngleDeg, endAngleDeg, diff);

    // ctx.beginPath();
    // ctx.arc(angleCenterX, angleCenterY, 30, startAngle, endAngle, direction);
    // ctx.stroke();

    const arc1 = findPointAtDistance({ start: center, end: start }, 30);
    const arc2 = findPointAtDistance({ start: center, end }, 30);
    const controlPoint = getControlPoint(arc1, center, arc2);
    ctx.beginPath();
    ctx.moveTo(arc1.x, arc1.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, arc2.x, arc2.y);
    ctx.stroke();

    // const textDistance = 30;
    // const p1 = findPointAtDistance({ start: center, end: start }, textDistance);
    // const p2 = findPointAtDistance({ start: center, end }, textDistance);
    // const centerPoint = getControlPoint(p1, center, p2);

    // const textX = (p1.x + p2.x) / 2;
    // const textY = (p1.y + p2.y) / 2;

    // console.log(direction, startAngleDeg, endAngleDeg);

    ctx.fillText(
      `${isNaN(angle) ? 180 : angle}°`,
      controlPoint.x,
      controlPoint.y
    );
  }

  const clearScreen = () => {
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
    setToolActive(null);
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
            className={toolActive === "select" ? "active" : ""}
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
}
