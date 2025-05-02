import { BrowserRouter, Routes, Route } from "react-router";
import Nav from "./components/layout/Nav";
import CanvasScene from "./components/canvas/CanvasScene";
import Home from "./pages/home";

export default function App() {
	return (
		<BrowserRouter>
			<Nav />
			<CanvasScene />

			<Routes>
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	);
}
