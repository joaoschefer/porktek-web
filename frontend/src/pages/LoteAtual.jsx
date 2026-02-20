import "./LoteAtual.css";
import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function LoteAtual() {

  const [loteAtual, setLoteAtual] = useState({
    id: 1,
    numero: "32",
    data_inicio: "10/02/2024",
    total_animais: 450,
  });

  const [abaAtiva, setAbaAtiva] = useState("mortes");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});


  const [registros, setRegistros] = useState({
    chegadas: [{ id: 1, c1: "2024-02-10", c2: "450", c3: "Granja Modelo", c4: "Padrão A" }],
    mortes: [
      { id: 1, c1: "2024-02-12", c2: "2", c3: "Pneumonia", c4: "Baia 2" },
      { id: 2, c1: "2024-02-15", c2: "1", c3: "Refugagem", c4: "Baia 5" },
    ],
    racao: [{ id: 1, c1: "2024-02-11", c2: "2000kg", c3: "Inicial", c4: "Silo 01" }],
    saidas: [],
    observacoes: [{ id: 1, c1: "2024-02-14", c2: "Saúde", c3: "Vacinação", c4: "Ciclo de Febre Aftosa" }],
  });

  const temLote = !!loteAtual;


  const configAbas = {
    chegadas: { titulo: "Chegadas", colunas: ["Data", "Qtd", "Origem", "Obs"], cards: [{ t: "Total Recebido", v: "450" }, { t: "Fornecedores", v: "1" }] },
    mortes: { titulo: "Mortalidade", colunas: ["Data", "Qtd", "Motivo", "Obs"], cards: [{ t: "Total Mortes", v: registros.mortes.length }, { t: "Taxa Atual", v: "0.6%" }] },
    racao: { titulo: "Consumo Ração", colunas: ["Data", "KG", "Tipo", "Obs"], cards: [{ t: "Consumo Acumulado", v: "2.000kg" }, { t: "Último Tipo", v: "Inicial" }] },
    saidas: { titulo: "Saídas/Vendas", colunas: ["Data", "Qtd", "Destino", "Obs"], cards: [{ t: "Total Saídas", v: "0" }, { t: "Pendentes", v: "447" }] },
    observacoes: { titulo: "Diário de Campo", colunas: ["Data", "Tipo", "Título", "Obs"], cards: [{ t: "Notas", v: registros.observacoes.length }, { t: "Alertas", v: "Baixo" }] },
  };

  const abaInfo = configAbas[abaAtiva];


  const criarNovoLote = () => {
    setLoteAtual({ id: Date.now(), numero: "2024.09", data_inicio: new Date().toLocaleDateString(), total_animais: 0 });
    setRegistros({ chegadas: [], mortes: [], racao: [], saidas: [], observacoes: [] });
  };

  const adicionarRegistro = (e) => {
    e.preventDefault();
    const novo = { id: Date.now(), ...form };
    setRegistros(prev => ({ ...prev, [abaAtiva]: [novo, ...prev[abaAtiva]] }));
    setModalOpen(false);
  };

  return (
    <div className="loteatual-layout">
      <Sidebar />
      <div className="loteatual-content">
        <Header />

        <main className="loteatual-container">
          
          <section className="lote-hero">
            <div className="lote-info-principal">
              <span className={`badge ${temLote ? "badge-active" : "badge-off"}`}>
                {temLote ? "Lote Ativo" : "Nenhum Lote"}
              </span>
              <h1>{temLote ? `Lote #${loteAtual.numero}` : "Bem-vindo de volta!"}</h1>
              {temLote && <p>Iniciado em {loteAtual.data_inicio} • <strong>{loteAtual.total_animais} animais</strong></p>}
            </div>

            <div className="lote-actions">
              {!temLote ? (
                <button className="btn-new-lote" onClick={criarNovoLote}>+ Iniciar Novo Lote</button>
              ) : (
                <button className="btn-finish" onClick={() => setLoteAtual(null)}>Finalizar Ciclo</button>
              )}
            </div>
          </section>

          {temLote ? (
            <>
              <nav className="lote-tabs">
                {Object.entries(configAbas).map(([key, info]) => (
                  <button 
                    key={key} 
                    className={`tab-item ${abaAtiva === key ? "active" : ""}`}
                    onClick={() => setAbaAtiva(key)}
                  >
                    <span className="tab-icon">{info.icon}</span>
                    {info.titulo}
                  </button>
                ))}
              </nav>

              <div className="dashboard-grid">
                <section className="stats-grid">
                  {abaInfo.cards.map((card, i) => (
                    <div className="stat-card" key={i}>
                      <span className="stat-label">{card.t}</span>
                      <span className="stat-value">{card.v}</span>
                    </div>
                  ))}
                </section>

                <section className="table-container">
                  <div className="table-header-actions">
                    <h2>Histórico de {abaInfo.titulo}</h2>
                    <button className="btn-add" onClick={() => { setForm({}); setModalOpen(true); }}>
                      + Adicionar Novo
                    </button>
                  </div>

                  <div className="custom-table">
                    <header className="table-row head">
                      {abaInfo.colunas.map((c, i) => <span key={i}>{c}</span>)}
                    </header>
                    <div className="table-body">
                      {registros[abaAtiva].length > 0 ? (
                        registros[abaAtiva].map((reg) => (
                          <div className="table-row" key={reg.id}>
                            <span>{reg.c1}</span>
                            <span>{reg.c2}</span>
                            <span>{reg.c3}</span>
                            <span className="text-muted">{reg.c4}</span>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state-table">Nenhum registro em {abaInfo.titulo}</div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="main-empty-state">
              <h2>Não há lotes em andamento</h2>
              <p>Para começar a registrar dados de mortalidade, ração e saúde, crie um novo lote.</p>
              <button className="btn-new-lote" onClick={criarNovoLote}>Começar agora</button>
            </div>
          )}
        </main>

        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Novo Registro: {abaInfo.titulo}</h3>
              <form onSubmit={adicionarRegistro}>
                <div className="form-grid">
                  {abaInfo.colunas.map((col, i) => (
                    <div className="form-group" key={i}>
                      <label>{col}</label>
                      <input 
                        required
                        type={col === "Data" ? "date" : "text"}
                        onChange={e => setForm({...form, [`c${i+1}`]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Salvar Registro</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}