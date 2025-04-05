import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const textLines = [
	["Hei", "Guten Tag", "Ahoj"],
	["Hola", "Bonjour", "Hello"],
	["Ola", "Namaste", "Ni Hao"],
	["Halo", "Ciao", "Konnichiwa"]
].map((text) => text.join("  ") + "   " + text.join("  ") + "   " + text.join("  "));

export default function AnimatedText() {
	const material = useMemo(() => new THREE.MeshBasicMaterial({ color: "#000000" }), []);
	const [charGeometries, setCharGeometries] = useState<THREE.BufferGeometry[][]>([]);

	useEffect(() => {
		const loader = new FontLoader();
		loader.load("/node_modules/three/examples/fonts/helvetiker_regular.typeface.json", (font) => {
			const newGeometries = textLines.map((textLine) =>
				textLine.split("").map(
					(char) =>
						new TextGeometry(char, {
							font: font,
							size: 1,
							depth: 0.01,
							curveSegments: 4,
							bevelEnabled: true,
							bevelThickness: 0,
							bevelSize: 0,
							bevelSegments: 1
						})
				)
			);
			setCharGeometries(newGeometries);
		});
	}, []);

	const refs = useRef<THREE.Group[]>([]);
	useFrame(() => {
		refs.current.forEach((ref) => {
			ref.rotation.x += 0.01;
			ref.rotation.y += 0.01;
			ref.rotation.z += 0.01;
		});
	});

	return (
		<>
			{charGeometries.length > 0 &&
				charGeometries.map((lineGeometries, lineIndex) => {
					const verticalSpacing = 0;
					const yPosition = (lineIndex - 1.5) * verticalSpacing;
					const radius = 3;
					return (
						<group
							key={lineIndex}
							ref={(el) => (refs.current[lineIndex] = el as THREE.Group)}
							rotation={[Math.random(), Math.random(), Math.random()]}
						>
							{lineGeometries.map((geometry, charIndex) => {
								const angle = (-charIndex / lineGeometries.length) * Math.PI * 2;
								const x = radius * Math.cos(angle);
								const z = radius * Math.sin(angle);
								const yRotation = Math.PI / 2 - angle;

								return (
									<Center key={charIndex} position={[x, yPosition, z]} scale={0.3}>
										<mesh geometry={geometry} material={material} rotation={[0, yRotation, 0]} />
									</Center>
								);
							})}
						</group>
					);
				})}
		</>
	);
}
