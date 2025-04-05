import { useEffect, useRef, useState } from "react";
import {
	motion,
	MotionValue,
	useScroll,
	useSpring,
	useTransform,
	useMotionValue,
	useVelocity,
	useAnimationFrame,
	wrap
} from "motion/react";

interface InfiniteElementProps {
	children: React.ReactNode;
	baseVelocity?: number;
	className?: string;
}

const useInfiniteAnimation = (baseVelocity: number, direction: number | ((delta: number) => number)) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const childRef = useRef<HTMLDivElement>(null);
	const [childMultiply, setChildMultiply] = useState(0);
	const childWidth = useMotionValue(0);
	const baseX = useMotionValue(0);

	const x = useTransform(
		[baseX, childWidth],
		([v, w]: MotionValue<number>[]): string => `${wrap(-w, 0, v as unknown as number)}px`
	);

	// Calculate number ofchildren copies
	useEffect(() => {
		const calcChildMultiply = () => {
			if (containerRef.current && childRef.current) {
				const numChildren = Math.ceil(containerRef.current.offsetWidth / childRef.current.offsetWidth);
				setChildMultiply(numChildren);
			}
		};
		calcChildMultiply();

		window.addEventListener("resize", calcChildMultiply);
		return () => window.removeEventListener("resize", calcChildMultiply);
	}, []);

	// Animate children. set child width
	useAnimationFrame((_, delta) => {
		if (childRef.current) {
			const moveBy = (typeof direction === "function" ? direction(delta) : direction) * baseVelocity * (delta / 1000);
			baseX.set(baseX.get() + moveBy);

			if (childWidth.get() !== childRef.current.offsetWidth) {
				childWidth.set(childRef.current.offsetWidth);
			}
		}
	});

	return { containerRef, childRef, childMultiply, x };
};

export function InfiniteElement({ children, baseVelocity = 10, className = "" }: InfiniteElementProps) {
	const { containerRef, childRef, childMultiply, x } = useInfiniteAnimation(baseVelocity, 1);

	return (
		<div ref={containerRef} className="w-full overflow-x-clip">
			<motion.div style={{ x }} className={`${className} whitespace-nowrap flex`}>
				<div ref={childRef} className="flex items-center">
					{children}
				</div>

				{Array.from({ length: childMultiply }).map((_, i) => (
					<div key={i} className="flex items-center">
						{children}
					</div>
				))}
			</motion.div>
		</div>
	);
}

export function ScrollInfiniteElement({ children, baseVelocity = 10, className = "" }: InfiniteElementProps) {
	const { scrollY } = useScroll();
	const scrollVelocity = useVelocity(scrollY);
	const smoothVelocity = useSpring(scrollVelocity, { damping: 100, stiffness: 700 });
	const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
	const directionFactor = useRef(1);

	const { containerRef, childRef, childMultiply, x } = useInfiniteAnimation(baseVelocity, (delta) => {
		let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

		if (velocityFactor.get() < 0) {
			directionFactor.current = -1;
		} else if (velocityFactor.get() > 0) {
			directionFactor.current = 1;
		}

		moveBy += directionFactor.current * moveBy * velocityFactor.get();
		return moveBy;
	});

	return (
		<div ref={containerRef} className="w-full overflow-x-clip">
			<motion.div style={{ x }} className={`${className} whitespace-nowrap flex`}>
				<div ref={childRef} className="flex items-center">
					{children}
				</div>

				{Array.from({ length: childMultiply }).map((_, i) => (
					<div key={i} className="flex items-center">
						{children}
					</div>
				))}
			</motion.div>
		</div>
	);
}
