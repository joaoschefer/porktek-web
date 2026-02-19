import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar-title">PorkTek</h2>

            <nav className="sidebar-menu">
                <Link to="/" className="menu-item">Dashboard</Link>

                <Link to="/lote-atual" className="menu-item">Lote Atual</Link>

                <Link to="/lotes-finalizados" className="menu-item">Lotes Finalizados</Link>
            </nav>
        </aside>
    );
}

export default Sidebar;
