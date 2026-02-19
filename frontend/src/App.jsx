import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LoteAtual from "./pages/LoteAtual";
import LotesFinalizados from "./pages/LotesFinalizados";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
         <Route path="/lote-atual" element={<LoteAtual />} />
          <Route path="/lotes-finalizados" element={<LotesFinalizados />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
