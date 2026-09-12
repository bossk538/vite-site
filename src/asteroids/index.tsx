import { useEffect, useRef, useState } from 'react';

const createOutline = () => {
  const nSides = Math.trunc(Math.random() * 10 + 3);
  const ary = Array.from({ length: nSides }, () => Math.random() * 360);
  ary.sort((a, b) => a - b);
  const coords = [];
  for (const degrees of ary) {
    const radians = degrees * Math.PI / 180;
    const radius = Math.random() * 50 + 50;
    coords.push(Math.trunc(radius * Math.cos(radians)));
    coords.push(Math.trunc(radius * Math.sin(radians)));
  }
  return coords.join(' ');
};

const wrap = (value, max) => {
  if (value < 0) {
    return max;
  } else if (value > max) {
    return 0;
  } else {
    return value;
  }
};

const Asteroid = ({ x, y, path, angle }) => {
  return ( 
    <g transform={`translate(${x} ${y})`}>
      <polygon points={`${path}`} stroke="black" fill="none"  transform={`rotate(${angle})`} />
    </g>
  );
};

const createAsteroid = (width, height) => {
  return {
    degreesPerSecond: 100 * (Math.random()- .5),
    angle: Math.random() * 360,
    x: Math.random() * width,
    y: Math.random() * height,
    deltaX: 5 * (Math.random() - .5),
    deltaY: 5 * (Math.random() - .5),
    path: createOutline(),
  };
};

const createAsteroids = (width, height, n) => {
  return Array.from({ length: n > 0 ? n : Math.trunc(Math.random() * 10 + 1) }, () => createAsteroid(width, height));
}

const updateAsteroid = (asteroid, deltaSeconds, width, height) => {
    const { x, y, deltaX, deltaY, angle, degreesPerSecond } = asteroid;
    return {
      ...asteroid,
      x: wrap(x + deltaX, width),
      y: wrap(y + deltaY, height),
      angle: (angle + degreesPerSecond * deltaSeconds) % 360,
    };
};

export default function Asteroids({ size = 1000, color = 'steelblue' }) {
  const width = 1000;
  const height = 500;
  const lastTimeRef = useRef(null);
  const frameRef = useRef(null);
  const [asteroids, setAsteroids] = useState(() => createAsteroids(width, height));

  useEffect(() => {
    const animate = (time) => {
      if (lastTimeRef.current !== null) {
        const deltaSeconds = (time - lastTimeRef.current) / 1000;
        setAsteroids(prev => prev.map(asteroid => updateAsteroid(asteroid, deltaSeconds, width, height)));
      }
      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const viewSize = size * 1.5; // extra space so rotation doesn't clip
  const center = viewSize / 2;
  const half = size / 2;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      { asteroids.map(asteroid => (<Asteroid x={asteroid.x} y={asteroid.y} path={asteroid.path} angle={asteroid.angle} />)) }
    </svg>
  );
}

