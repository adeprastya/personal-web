import { AnimationProps, motion } from "motion/react";

interface FeGaussianBlurProps {
	id: string;
	x?: number;
	y?: number;
	animate?: boolean;
	transition?: AnimationProps["transition"];
}
export function FeGaussianBlur({ id, x = 0, y = 0, animate = false, transition = {} }: FeGaussianBlurProps) {
	return (
		<svg style={{ display: "none" }}>
			<defs>
				<filter id={id}>
					<motion.feGaussianBlur
						in="SourceGraphic"
						edgeMode="duplicate"
						stdDeviation={`${x} ${y}`}
						initial={{ stdDeviation: `${x} ${y}` }}
						animate={animate ? { stdDeviation: "0 0" } : undefined}
						exit={animate ? { stdDeviation: `${x} ${y}` } : undefined}
						transition={transition}
					/>
				</filter>
			</defs>
		</svg>
	);
}
