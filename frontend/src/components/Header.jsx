import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">Painel de Controle</h2>
      </div>

      <div className="header-right">
        <span className="header-user">Admin</span>
      </div>
    </header>
  );
}

export default Header;
