import { motion, MotionProps } from "motion/react";

interface FilterEffectProps {
	children: React.ReactNode;
	id: string;
}
export function FilterEffect({ children, id }: FilterEffectProps) {
	return (
		<svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, visibility: "hidden" }}>
			<defs>
				<filter id={id}>{children}</filter>
			</defs>
		</svg>
	);
}

interface FeGaussianBlurProps extends MotionProps {
	x?: number;
	y?: number;
	animate?: boolean;
}
export function FeGaussianBlur({ x = 0, y = 0, animate = false, ...props }: FeGaussianBlurProps) {
	return (
		<motion.feGaussianBlur
			in="SourceGraphic"
			edgeMode="duplicate"
			stdDeviation={`${x} ${y}`}
			initial={{ stdDeviation: `${x} ${y}` }}
			animate={animate ? { stdDeviation: "0 0" } : undefined}
			exit={animate ? { stdDeviation: `${x} ${y}` } : undefined}
			{...props}
		/>
	);
}
