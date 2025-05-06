import { HoverShiftText } from "../HoverShiftText";
import { NavLink } from "react-router";
import { useState } from "react";

export default function Nav({ routes }: { routes: Array<{ path: string; label: string; bgText: string }> }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className="pointer-events-none fixed z-50 right-0 top-0 h-full py-12 flex items-start sm:items-center">
			{/* Mobile Nav Toggle */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="pointer-events-auto overflow-clip absolute right-0 top-0 m-2 px-2 visible sm:hidden"
			>
				<span className="font-sans font-black uppercase text-2xl text-neutral-200">///</span>
				<div
					className={`pointer-events-none absolute top-0 left-0 w-full h-full backdrop-invert transition-all duration-1300 ${
						isOpen ? "translate-x-0 skew-x-0" : "-translate-x-[150%] skew-x-52"
					}`}
				/>
			</button>

			<ul
				className={`pointer-events-none sm:pointer-events-auto relative p-4 flex flex-col gap-4 items-end group transition-all duration-800 ease-in-out ${
					isOpen ? "opacity-100" : "opacity-0 sm:opacity-100"
				}`}
			>
				{routes.map(({ path, label }, i) => (
					<NavItem key={i} label={label} path={path} />
				))}
			</ul>
		</nav>
	);
}

function NavItem({ label, path }: { label: string; path: string }) {
	return (
		<li>
			<NavLink to={path} className="pointer-events-auto relative cursor-pointer">
				{({ isActive }) => (
					<>
						<HoverShiftText
							className={`w-fit pe-6 uppercase font-sans font-extralight tracking-wide leading-loose text-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-800 ease-in-out peer
						${isActive ? "text-amber-300" : "text-neutral-300"}`}
						>
							{label}
						</HoverShiftText>

						<div
							className={`absolute right-0 top-1/2 -translate-y-1/2 size-4 rounded-full border transition-all duration-800 ease-in-out after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:size-1 after:rounded-full after:transition-all after:duration-800 after:ease-in-out ${
								isActive
									? "border-amber-300 after:bg-amber-400"
									: "border-neutral-300 bg-transparent peer-hover:after:bg-neutral-300"
							}`}
						/>
					</>
				)}
			</NavLink>
		</li>
	);
}
