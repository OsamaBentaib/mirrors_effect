import { useProgress, Html } from "@react-three/drei";
import React from "react";

export default function Loader(props) {
  const { color } = props;
  const { progress } = useProgress();
  return (
    <Html center>
      <span style={{ color: color }}>{progress} % loaded</span>
    </Html>
  );
}
