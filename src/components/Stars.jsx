import { useMemo } from "react";

export default function Stars({ count = 90 }) {
  // useMemo ป้องกันดาวถูกสุ่มใหม่ทุกครั้งที่ re-render
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100 + "%",
        top: Math.random() * 100 + "%",
        "--d": 2 + Math.random() * 4 + "s",
        animationDelay: Math.random() * 4 + "s",
      })),
    [count]
  );

  return (
    <div className="stars">
      {stars.map(({ id, ...style }) => (
        <span key={id} className="star" style={style} />
      ))}
    </div>
  );
}