import "./Dashboard.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <Header />
        <div className="dashboard">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-text">
            Bem-vindo ao PorkTek Web.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
