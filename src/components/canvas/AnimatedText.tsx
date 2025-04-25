import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { useFrame, useThree } from "@react-three/fiber";

const texts = [
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA "
];

export default function AnimatedText() {
	const { width } = useThree((state) => state.viewport);

	const material = useMemo(() => new THREE.MeshBasicMaterial({ color: "#aaaaaa" }), []);
	const [charGeometries, setCharGeometries] = useState<THREE.BufferGeometry[][]>([]);
	useEffect(() => {
		const loader = new FontLoader();
		loader.load("/fonts/LibreBarcode39ExtendedText_Regular.json", (font) => {
			const newGeometries = texts.map((text) =>
				text.split("").map(
					(char) =>
						new TextGeometry(char, {
							font: font,
							size: 1,
							depth: 0.01,
							curveSegments: 1,
							bevelEnabled: true,
							bevelThickness: 0,
							bevelSize: 0,
							bevelSegments: 1,
						})
				)
			);
			setCharGeometries(newGeometries);
		});
	}, []);

	const verticalSpace = 0.4 + width * 0.005;
	const circleRadius = 0.8 + width * 0.08;
	const textScale = 0.1 + width * 0.005;

	const groupRef = useRef<THREE.Group>(null);
	const lineRefs = useRef<THREE.Group[]>([]);

	useFrame(() => {
		lineRefs.current.forEach((ref, i) => {
			if (ref) {
				if (i % 2 === 0) {
					ref.rotation.y += 0.001;
				} else {
					ref.rotation.y -= 0.001;
				}
			}
		});
	});

	return (
		<group ref={groupRef}>
			{charGeometries.length &&
				charGeometries.map((lineGeometries, lineIndex) => {
					const normalizedIndex = lineIndex - charGeometries.length / 2 + 0.5;
					const lineY = normalizedIndex * verticalSpace - 0.1;

					return (
						<group
							key={lineIndex}
							ref={(el) => (lineRefs.current[lineIndex] = el as THREE.Group)}
							position={[0, lineY, 0]}
						>
							{lineGeometries.map((geometry, charIndex) => {
								const angle = (-charIndex / lineGeometries.length) * Math.PI * 2;
								const x = circleRadius * Math.cos(angle);
								const z = circleRadius * Math.sin(angle);
								const yRotation = Math.PI / 2 - angle;

								return (
									<mesh
										key={charIndex}
										geometry={geometry}
										material={material}
										scale={textScale}
										position={[x, 0, z]}
										rotation={[0, yRotation, 0]}
									/>
								);
							})}
						</group>
					);
				})}
		</group>
	);
}
