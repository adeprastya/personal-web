import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import AnimatedText from "./AnimatedText";
import HeroObject from "./HeroObject";

const CanvasScene = React.memo(() => {
	return (
		<Canvas camera={{ fov: 75, near: 0.1, far: 50, position: [0, 0, 5] }} style={{ width: "100vw", height: "100vh" }}>
			<OrbitControls />
			<gridHelper args={[10, 10]} position={[0, 0, 0]} />

			<HeroObject />

			<AnimatedText />
		</Canvas>
	);
});

export default CanvasScene;
