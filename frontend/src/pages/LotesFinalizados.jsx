import "./LotesFinalizados.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function LotesFinalizados() {
    return (
        <div className="lotesfinalizados-layout">
            <Sidebar />

            <div className="lotesfinalizados-content">
                <Header />

                <div className="lotesfinalizados">
                    <h1>Aqui será a página que mostrará os lotes finalizados.</h1>
                </div>
            </div>
        </div>
    )
}

export default LotesFinalizados;
