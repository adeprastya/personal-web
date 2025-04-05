import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";

export default function CameraControl() {
	console.log("__CameraControl rendered");

	const { camera } = useThree();
	const mouse = useRef({ x: 0, y: 0 });
	const target = useRef({ x: 0, y: 0, z: 0 });

	// get normalized mouse position & get camera position
	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
			target.current.x = mouse.current.x * 2;
			target.current.y = mouse.current.y * 1;
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	// set camera position
	useFrame(() => {
		camera.position.x += (target.current.x - camera.position.x) * 0.004;
		camera.position.y += (target.current.y - camera.position.y) * 0.004;
		camera.lookAt(0, 0, 0);
	});

	return null;
}
