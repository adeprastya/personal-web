import { FilterEffect, FeGaussianBlur } from "../../components/SvgFilters";
import { useId, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";

export default function HomeSection({ children }: { children: React.ReactNode }) {
	const ref = useRef(null);
	const inView = useInView(ref, { amount: 0.5 });
	const id = useId();

	return (
		<section ref={ref} className="w-full h-screen">
			<AnimatePresence mode="sync">
				{inView && (
					<>
						<FilterEffect id={`fe-home-section-${id}`}>
							<FeGaussianBlur x={40} y={2} animate={true} />
						</FilterEffect>

						<motion.div
							style={{ filter: `url(#fe-home-section-${id})` }}
							className="fixed top-0 w-full h-screen py-28 px-6 sm:px-12 lg:px-20 flex items-end justify-start"
						>
							<div className="w-full max-w-xs flex flex-col gap-4">{children}</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</section>
	);
}
