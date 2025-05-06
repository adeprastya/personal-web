import { BrowserRouter, Routes, Route } from "react-router";
import Nav from "./components/layout/Nav";
import BackgroundText from "./components/layout/BackgroundText";
import CanvasScene from "./components/canvas/CanvasScene";
import Home from "./pages/home";

const routes = [
	{ path: "/", label: "home", bgText: "START HERE" },
	{ path: "/about", label: "about", bgText: "BEHIND THE SCENES" },
	{ path: "/work", label: "works", bgText: "WHAT I DO" },
	{ path: "/contact", label: "contact", bgText: "REACH OUT" },
	{ path: "/credit", label: "credit", bgText: "HIGH FIVES" }
];

export default function App() {
	return (
		<BrowserRouter>
			<Nav routes={routes} />
			<BackgroundText routes={routes} />
			<CanvasScene />

			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	);
}
