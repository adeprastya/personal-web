import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import CameraControl from "./CameraControl";
import AnimatedText from "./AnimatedText";
import HeroObject from "./HeroObject";

const CanvasScene = memo(() => {
	console.log("__CanvasScene rendered");

	return (
		<Canvas
			style={{
				position: "fixed",
				zIndex: -0,
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh"
			}}
			camera={{
				fov: 75,
				near: 0.1,
				far: 10,
				position: [0, 0, 5]
			}}
			dpr={[1, 2]}
			gl={{
				antialias: true,
				powerPreference: "high-performance"
			}}
		>
			<color attach="background" args={["#121212"]} />

			<AnimatedText />
			<HeroObject />

			<CameraControl />

			<Stats />
		</Canvas>
	);
});

export default CanvasScene;
