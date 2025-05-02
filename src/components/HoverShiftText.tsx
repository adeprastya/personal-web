import { motion } from "motion/react";

interface HoverShiftTextProps {
	children: string;
	className?: string;
}

export function HoverShiftText({ children, className }: HoverShiftTextProps) {
	return (
		<motion.span
			className={`overflow-clip block ${className}`}
			whileHover="hover"
			initial="initial"
			animate="initial"
			variants={{
				initial: {
					transition: {
						staggerChildren: 0.05
					}
				},
				hover: {
					transition: {
						staggerChildren: 0.05
					}
				}
			}}
		>
			{children.split("").map((char, i) =>
				char === " " ? (
					<span key={i} className="inline-block">
						&nbsp;
					</span>
				) : (
					<motion.span
						key={i}
						className="relative inline-block"
						variants={{
							initial: { y: [0, "-100%", 0] },
							hover: { y: [0, "-100%", 0] }
						}}
						transition={{ duration: 0.3, ease: "easeOut", times: [0, 1, 1] }}
					>
						<span className="block">{char}</span>
						<span className="absolute top-full left-0 block">{char}</span>
					</motion.span>
				)
			)}
		</motion.span>
	);
}
