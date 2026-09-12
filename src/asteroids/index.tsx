import { useEffect, useRef, useState } from 'react';

const createOutline = () => {
  const nSides = Math.trunc(Math.random() * 10 + 3);
  const ary = Array.from({ length: nSides }, () => Math.random() * 360);
  ary.sort((a, b) => a - b);
  const coords = [];
  console.log(ary);
  for (const degrees of ary) {
    const radians = degrees * Math.PI / 180;
    const radius = Math.random() * 100 + 10;
    coords.push(Math.trunc(radius * Math.cos(radians)));
    coords.push(Math.trunc(radius * Math.sin(radians)));
  }
  //const path = `M ${coords[0]} ${coords[1]} ` +  coords.join(' ') + ' Z';
  return coords.join(' ')// + ' Z';;
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

export default function Asteroids({ size = 1000, color = 'steelblue' }) {
  const width = 1000;
  const height = 500;
  const [angle, setAngle] = useState(0);
  const lastTimeRef = useRef(null);
  const frameRef = useRef(null);
  const fooRef = useRef(null);
  const [path, setPath] = useState(() => createOutline());
  const [degreesPerSecond, setDegreesPerSecond] = useState(() => (50 * (Math.random()- .5)));
  const [deltaX, setDeltaX] = useState(() => 5 * (Math.random() - .5))
  const [deltaY, setDeltaY] = useState(() => 5 * (Math.random() - .5))
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  useEffect(() => {
    const animate = (time) => {
      if (lastTimeRef.current !== null) {
        const deltaSeconds = (time - lastTimeRef.current) / 1000;
        setAngle((prev) => (prev + degreesPerSecond * deltaSeconds) % 360);
        setX(prev => wrap(prev + deltaX, width));
        setY(prev => wrap(prev + deltaY, height));
      }
      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [degreesPerSecond]);

  const viewSize = size * 1.5; // extra space so rotation doesn't clip
  const center = viewSize / 2;
  const half = size / 2;
  //const path = `M10 10 90 10 90 90`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
    <g transform={`translate(${x} ${y})`}>
      <polygon ref={fooRef} points={`${path}`} stroke="black" fill="none"  transform={`rotate(${angle} ${x} ${y})`} />
      </g>
    </svg>
  );
}

