import { HoverShiftText } from "./HoverShiftText";

export default function AnimatedButton({
	children,
	...props
}: { children: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button {...props} className="overflow-clip relative w-full border-b border-neutral-200 group">
			<div className="pointer-events-none absolute top-0 left-0 size-full bg-neutral-200 -translate-x-[120%] skew-x-52 group-hover:translate-x-0 group-hover:skew-x-0 transition-all duration-1300 ease-in-out" />

			<HoverShiftText className="px-6 font-decor tracking-wider italic text-start text-3xl/relaxed text-neutral-200 group-hover:text-neutral-900 transition-all duration-1300 ease-in-out">
				{children}
			</HoverShiftText>
		</button>
	);
}
