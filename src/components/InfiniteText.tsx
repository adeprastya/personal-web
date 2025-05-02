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

interface BaseInfiniteTextProps {
	children: string;
	baseVelocity?: number;
	containerStyle?: string;
	textStyle?: string;
}

interface InfiniteTextProps extends BaseInfiniteTextProps {
	direction?: number;
}

const useInfiniteTextAnimation = (
	baseVelocity: number,
	direction: number | ((delta: number) => number),
	childRef: React.RefObject<HTMLElement | null>
) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [childMultiply, setChildMultiply] = useState(0);
	const childWidth = useMotionValue(0);
	const baseX = useMotionValue(0);

	const x = useTransform(
		[baseX, childWidth],
		([v, w]: MotionValue<number>[]): string => `${wrap(-w, 0, v as unknown as number)}px`
	);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useAnimationFrame((_, delta) => {
		if (childRef.current) {
			const moveBy = (typeof direction === "function" ? direction(delta) : direction) * baseVelocity * (delta / 1000);
			baseX.set(baseX.get() + moveBy);

			if (childWidth.get() !== childRef.current.offsetWidth) {
				childWidth.set(childRef.current.offsetWidth);
			}
		}
	});

	return { containerRef, childMultiply, x };
};

export function InfiniteText({
	children,
	baseVelocity = 10,
	direction = 1,
	containerStyle = "",
	textStyle = ""
}: InfiniteTextProps) {
	const childRef = useRef<HTMLElement | null>(null);
	const { containerRef, childMultiply, x } = useInfiniteTextAnimation(baseVelocity, direction, childRef);

	return (
		<div ref={containerRef} className="w-full overflow-x-clip">
			<motion.div className={`transform-gpu whitespace-nowrap ${containerStyle}`} style={{ x }}>
				<span ref={childRef} className={textStyle}>
					{typeof children === "string" ? `${children} ` : children}
				</span>

				{Array.from({ length: childMultiply }).map((_, i) => (
					<span key={i} className={textStyle}>
						{typeof children === "string" ? `${children} ` : children}
					</span>
				))}
			</motion.div>
		</div>
	);
}

export function ScrollInfiniteText({
	children,
	baseVelocity = 10,
	containerStyle = "",
	textStyle = ""
}: BaseInfiniteTextProps) {
	const { scrollY } = useScroll();
	const scrollVelocity = useVelocity(scrollY);
	const smoothVelocity = useSpring(scrollVelocity, { damping: 100, stiffness: 700 });
	const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
	const directionFactor = useRef(1);

	const childRef = useRef<HTMLElement | null>(null);
	const { containerRef, childMultiply, x } = useInfiniteTextAnimation(
		baseVelocity,
		(delta) => {
			let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

			if (velocityFactor.get() < 0) {
				directionFactor.current = -1;
			} else if (velocityFactor.get() > 0) {
				directionFactor.current = 1;
			}

			moveBy += directionFactor.current * moveBy * velocityFactor.get();
			return moveBy;
		},
		childRef
	);

	return (
		<div ref={containerRef} className="w-full overflow-x-clip">
			<motion.div className={`${containerStyle} whitespace-nowrap transform-gpu`} style={{ x }}>
				<span ref={childRef} className={textStyle}>
					{typeof children === "string" ? `${children} ` : children}
				</span>

				{Array.from({ length: childMultiply }).map((_, i) => (
					<span key={i} className={textStyle}>
						{typeof children === "string" ? `${children} ` : children}
					</span>
				))}
			</motion.div>
		</div>
	);
}
