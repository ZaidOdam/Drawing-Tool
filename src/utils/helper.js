export function calculateDistance(startPoint, endPoint) {
  const deltaX = endPoint.x - startPoint.x;
  const deltaY = endPoint.y - startPoint.y;

  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return Math.round(distance);
}

export function getPointsFromLines(lines) {
  const points = lines.reduce((acc, curr) => {
    return [...acc, curr.start, curr.end];
  }, []);
  return points;
}

export function findLine(lines, { x, y }) {
  const THRESHOLD = 30;
  const foundLine = lines.find((line) => {
    const points = getPointsFromLines([line]);
    for (let point of points) {
      const distance = calculateDistance(point, { x, y });
      //   console.log("Distance", distance);
      if (distance < THRESHOLD) return true;
    }
    return false;
  });

  if (foundLine) {
    const d1 = calculateDistance(foundLine.start, { x, y });
    if (d1 < THRESHOLD) {
      return {
        name: foundLine.startName,
        start: foundLine.start,
        end: foundLine.end,
      };
    }
    return {
      name: foundLine.endName,
      start: foundLine.end,
      end: foundLine.start,
    };
  }

  return { name: null, start: null, end: null };
}

export function radianToDegree(radian) {
  const angle = (radian * 180) / Math.PI;
  return (angle + 360) % 360;
  // return angle;
}

export function findPointAtDistance(line, distance) {
  const { start, end } = line;
  const length = calculateDistance(start, end);
  if (length === 0) {
    return { x: start.x, y: start.y }; // Handle case when start and end are the same
  }
  const t = distance / length;
  const point = {
    x: start.x + t * (end.x - start.x),
    y: start.y + t * (end.y - start.y),
  };
  return point;
}

export function calculateAngle(A, B, C) {
  const dotProduct = (B.x - A.x) * (C.x - B.x) + (B.y - A.y) * (C.y - B.y);
  const magnitudeAB = calculateDistance(A, B);
  const magnitudeBC = calculateDistance(B, C);

  const cosTheta = dotProduct / (magnitudeAB * magnitudeBC);
  const angleRad = Math.acos(cosTheta);
  const angleDeg = (angleRad * 180) / Math.PI;

  return Math.round(180 - angleDeg);
}

export function getPointOnCanvas(e, canvas) {
  // console.log(e);
  if (!e) return { x: 0, y: 0 };
  return {
    x: (e?.clientX ?? e?.changedTouches[0]?.clientX ?? 0) - canvas.offsetLeft,
    y: (e?.clientY ?? e?.changedTouches[0]?.clientY ?? 0) - canvas.offsetTop,
  };
}

export function isSamePoint(p1, p2) {
  return p1.x === p2.x && p1.y == p2.y;
}

export function getCommonPoint(l1, l2) {
  if (isSamePoint(l1.start, l2.start) || isSamePoint(l1.start, l2.end))
    return l1.start;
  if (isSamePoint(l1.end, l2.start) || isSamePoint(l1.end, l2.end))
    return l1.end;
  return null;
}

export function getControlPoint(start, center, end) {
  const vertex = center;

  const adjacentVertices = [start, end];

  const vector1 = {
    x: adjacentVertices[0].x - vertex.x,
    y: adjacentVertices[0].y - vertex.y,
  };
  const vector2 = {
    x: adjacentVertices[1].x - vertex.x,
    y: adjacentVertices[1].y - vertex.y,
  };

  const angleBisector = {
    x: vector1.x + vector2.x,
    y: vector1.y + vector2.y,
  };

  const angleBisectorMagnitude = Math.sqrt(
    angleBisector.x ** 2 + angleBisector.y ** 2
  );

  const fourthPointDistance = 1.5 * Math.sqrt(vector1.x ** 2 + vector1.y ** 2);

  const normalizedAngleBisector = {
    x: angleBisector.x / angleBisectorMagnitude,
    y: angleBisector.y / angleBisectorMagnitude,
  };

  const fourthPoint = {
    x: vertex.x + fourthPointDistance * normalizedAngleBisector.x,
    y: vertex.y + fourthPointDistance * normalizedAngleBisector.y,
  };

  return fourthPoint;
}
