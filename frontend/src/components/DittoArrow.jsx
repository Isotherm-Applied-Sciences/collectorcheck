import React from 'react';

export default function DittoArrow({ fromRect, toRect }) {
  if (!fromRect || !toRect) return null;

  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toRect.left + toRect.width / 2;
  const endY = toRect.top + toRect.height / 2;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.max(1, Math.hypot(deltaX, deltaY));
  const curve = Math.max(36, Math.min(100, distance * 0.22));
  const curveX = (-deltaY / distance) * curve;
  const curveY = (deltaX / distance) * curve;
  const control1X = startX + deltaX * 0.33 + curveX;
  const control1Y = startY + deltaY * 0.33 + curveY;
  const control2X = startX + deltaX * 0.67 + curveX;
  const control2Y = startY + deltaY * 0.67 + curveY;
  const angle = Math.atan2(endY - control2Y, endX - control2X);
  const headLength = 12;
  const headWidth = 7;
  const baseX = endX - headLength * Math.cos(angle);
  const baseY = endY - headLength * Math.sin(angle);
  const leftX = baseX + headWidth * Math.sin(angle);
  const leftY = baseY - headWidth * Math.cos(angle);
  const rightX = baseX - headWidth * Math.sin(angle);
  const rightY = baseY + headWidth * Math.cos(angle);

  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="100%"
      viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
      preserveAspectRatio="none"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10001,
        overflow: 'visible'
      }}
    >
      <path
        className="ditto-arrow-path"
        d={`M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`}
        stroke="#4da6ff"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <polygon
        className="ditto-arrow-head"
        points={`${endX},${endY} ${leftX},${leftY} ${rightX},${rightY}`}
        fill="#4da6ff"
      />
    </svg>
  );
}