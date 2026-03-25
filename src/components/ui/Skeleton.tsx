import { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
};

export default function Skeleton({ className = "", style }: Props) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      style={style}
    />
  );
}
