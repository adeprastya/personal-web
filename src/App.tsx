import { BrowserRouter, Routes, Route } from "react-router";
import Nav from "./components/layout/Nav";
import CanvasScene from "./components/canvas/CanvasScene";
import Home from "./pages/home";
import BackgroundText from "./components/layout/BackgroundText";

const routes = [
	{ path: "/", label: "home", bgText: "BONJOUR" },
	{ path: "/about", label: "about", bgText: "ABOUT ME" },
	{ path: "/work", label: "work", bgText: "MY WORKS" },
	{ path: "/contact", label: "contact", bgText: "LET'S TALK" },
	{ path: "/credit", label: "credit", bgText: "CHEERS" }
];

export default function App() {
	return (
		<BrowserRouter>
			<CanvasScene />
			<BackgroundText routes={routes} />
			<Nav routes={routes} />

			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	);
}
