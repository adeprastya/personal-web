import AnimatedText from "./AnimatedText";
import HeroObject from "./HeroObject";
import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";

const CanvasScene = memo(() => {
	return (
		<Canvas
			style={{
				width: "100vw",
				height: "100vh",
				position: "fixed"
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

			<group position={[0, 0, 0]}>
				<AnimatedText />
				<HeroObject />
			</group>

			<Stats />
		</Canvas>
	);
});

CanvasScene.displayName = "CanvasScene";

export default CanvasScene;
