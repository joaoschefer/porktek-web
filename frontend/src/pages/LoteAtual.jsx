import "./LoteAtual.css";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const API = "http://127.0.0.1:8000/api";

const endpointPorAba = {
  chegadas: "chegadas",
  mortes: "mortes",
  racao: "racoes",
  saidas: "saidas",
  observacoes: "observacoes",
};

function toPtBRDate(v) {
  if (!v) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return v;
}

export default function LoteAtual() {
  const [loteAtual, setLoteAtual] = useState(null);

  const [abaAtiva, setAbaAtiva] = useState("mortes");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState("registro"); // "registro" | "lote"
  const [form, setForm] = useState({});

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [registros, setRegistros] = useState({
    chegadas: [],
    mortes: [],
    racao: [],
    saidas: [],
    observacoes: [],
  });

  const temLote = !!loteAtual;

  const configAbas = useMemo(() => ({
    chegadas: {
      titulo: "Chegadas",
      colunas: ["Data", "Qtd", "Origem", "Obs"],
      cards: [
        { t: "Registros", v: registros.chegadas.length },
        { t: "Total do Lote", v: loteAtual?.total_animais ?? "—" },
      ],
    },
    mortes: {
      titulo: "Mortalidade",
      colunas: ["Data", "Qtd", "Motivo", "Obs"],
      cards: [
        { t: "Registros", v: registros.mortes.length },
        { t: "Total Mortes", v: registros.mortes.reduce((acc, r) => acc + (Number(r.c2) || 0), 0) },
      ],
    },
    racao: {
      titulo: "Consumo Ração",
      colunas: ["Data", "KG", "Tipo", "Obs"],
      cards: [
        { t: "Registros", v: registros.racao.length },
        { t: "Último Tipo", v: registros.racao[0]?.c3 ?? "—" },
      ],
    },
    saidas: {
      titulo: "Saídas/Vendas",
      colunas: ["Data", "Qtd", "Destino", "Obs"],
      cards: [
        { t: "Registros", v: registros.saidas.length },
        { t: "Total Saídas", v: registros.saidas.reduce((acc, r) => acc + (Number(r.c2) || 0), 0) },
      ],
    },
    observacoes: {
      titulo: "Diário de Campo",
      colunas: ["Data", "Tipo", "Título", "Obs"],
      cards: [
        { t: "Notas", v: registros.observacoes.length },
        { t: "Última", v: registros.observacoes[0]?.c3 ?? "—" },
      ],
    },
  }), [loteAtual, registros]);

  const abaInfo = configAbas[abaAtiva];

  // carregar lote atual ao abrir
  useEffect(() => {
    (async () => {
      try {
        setErro("");
        setLoading(true);
        const r = await fetch(`${API}/lotes/atual/`);
        const data = await r.json();
        setLoteAtual(data);
      } catch {
        setErro("Não consegui buscar o lote atual no backend.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // carregar registros quando mudar aba ou lote
  useEffect(() => {
    if (!loteAtual?.id) return;

    (async () => {
      try {
        setErro("");
        setLoading(true);

        const endpoint = endpointPorAba[abaAtiva];
        const r = await fetch(`${API}/${endpoint}/?lote=${loteAtual.id}`);
        const lista = await r.json();

        const normalizados = lista.map((item) => {
          if (abaAtiva === "chegadas")
            return { id: item.id, c1: item.data, c2: String(item.qtd), c3: item.origem ?? "", c4: item.obs ?? "" };
          if (abaAtiva === "mortes")
            return { id: item.id, c1: item.data, c2: String(item.qtd), c3: item.motivo ?? "", c4: item.obs ?? "" };
          if (abaAtiva === "racao")
            return { id: item.id, c1: item.data, c2: String(item.kg), c3: item.tipo ?? "", c4: item.obs ?? "" };
          if (abaAtiva === "saidas")
            return { id: item.id, c1: item.data, c2: String(item.qtd), c3: item.destino ?? "", c4: item.obs ?? "" };
          return { id: item.id, c1: item.data, c2: item.tipo ?? "", c3: item.titulo ?? "", c4: item.obs ?? "" };
        });

        setRegistros((prev) => ({ ...prev, [abaAtiva]: normalizados.reverse() }));
      } catch {
        setErro("Não consegui carregar os registros dessa aba.");
      } finally {
        setLoading(false);
      }
    })();
  }, [abaAtiva, loteAtual?.id]);

  // abrir modal novo lote
  const abrirModalNovoLote = () => {
    setModalTipo("lote");
    setForm({
      numero: "",
      data_inicio: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  };

  // criar lote (POST)
  const criarNovoLote = async (e) => {
    e.preventDefault();

    try {
      setErro("");
      setLoading(true);

      const payload = {
        numero: form.numero,
        data_inicio: form.data_inicio,
        total_animais: 0,
        ativo: true,
      };

      const r = await fetch(`${API}/lotes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) throw new Error(await r.text());

      const data = await r.json();

      setLoteAtual(data);
      setRegistros({ chegadas: [], mortes: [], racao: [], saidas: [], observacoes: [] });

      setModalOpen(false);
      setModalTipo("registro");
      setForm({});
    } catch {
      setErro("Não consegui criar o lote. Confira os campos e o backend.");
    } finally {
      setLoading(false);
    }
  };

  // finalizar lote
  const finalizarCiclo = async () => {
    if (!loteAtual?.id) return;

    try {
      setErro("");
      setLoading(true);

      const r = await fetch(`${API}/lotes/${loteAtual.id}/finalizar/`, { method: "POST" });
      if (!r.ok) throw new Error(await r.text());

      setLoteAtual(null);
      setRegistros({ chegadas: [], mortes: [], racao: [], saidas: [], observacoes: [] });
    } catch {
      setErro("Não consegui finalizar o lote.");
    } finally {
      setLoading(false);
    }
  };

  // adicionar registro por aba (POST)
  const adicionarRegistro = async (e) => {
    e.preventDefault();
    if (!loteAtual?.id) return;

    try {
      setErro("");
      setLoading(true);

      const endpoint = endpointPorAba[abaAtiva];

      let payload = { lote: loteAtual.id };

      if (abaAtiva === "chegadas") {
        payload = { ...payload, data: form.c1, qtd: Number(form.c2), origem: form.c3 || "", obs: form.c4 || "" };
      } else if (abaAtiva === "mortes") {
        payload = { ...payload, data: form.c1, qtd: Number(form.c2), motivo: form.c3 || "", obs: form.c4 || "" };
      } else if (abaAtiva === "racao") {
        payload = { ...payload, data: form.c1, kg: Number(form.c2), tipo: form.c3 || "", obs: form.c4 || "" };
      } else if (abaAtiva === "saidas") {
        payload = { ...payload, data: form.c1, qtd: Number(form.c2), destino: form.c3 || "", obs: form.c4 || "" };
      } else if (abaAtiva === "observacoes") {
        payload = { ...payload, data: form.c1, tipo: form.c2 || "", titulo: form.c3 || "", obs: form.c4 || "" };
      }

      const r = await fetch(`${API}/${endpoint}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) throw new Error(await r.text());

      // recarrega aba
      const rr = await fetch(`${API}/${endpoint}/?lote=${loteAtual.id}`);
      const lista = await rr.json();

      const normalizados = lista.map((item) => {
        if (abaAtiva === "chegadas") return { id: item.id, c1: item.data, c2: String(item.qtd), c3: item.origem ?? "", c4: item.obs ?? "" };
        if (abaAtiva === "mortes") return { id: item.id, c1: item.data, c2: String(item.qtd), c3: item.motivo ?? "", c4: item.obs ?? "" };
        if (abaAtiva === "racao") return { id: item.id, c1: item.data, c2: String(item.kg), c3: item.tipo ?? "", c4: item.obs ?? "" };
        if (abaAtiva === "saidas") return { id: item.id, c1: item.data, c2: String(item.qtd), c3: item.destino ?? "", c4: item.obs ?? "" };
        return { id: item.id, c1: item.data, c2: item.tipo ?? "", c3: item.titulo ?? "", c4: item.obs ?? "" };
      });

      setRegistros((prev) => ({ ...prev, [abaAtiva]: normalizados.reverse() }));

      setModalOpen(false);
      setForm({});
    } catch {
      setErro("Falha ao salvar registro. Confira os campos e o backend.");
    } finally {
      setLoading(false);
    }
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

              {temLote && (
                <p>
                  Iniciado em {toPtBRDate(loteAtual.data_inicio)} • <strong>{loteAtual.total_animais} animais</strong>
                </p>
              )}

              {erro && <p style={{ color: "#b91c1c", marginTop: 8 }}>{erro}</p>}
              {loading && <p style={{ color: "#64748b", marginTop: 8 }}>Carregando...</p>}
            </div>

            <div className="lote-actions">
              {!temLote ? (
                <button className="btn-new-lote" onClick={abrirModalNovoLote}>
                  + Iniciar Novo Lote
                </button>
              ) : (
                <button className="btn-finish" onClick={finalizarCiclo}>
                  Finalizar Ciclo
                </button>
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

                    <button
                      className="btn-add"
                      onClick={() => {
                        setModalTipo("registro");
                        setForm({});
                        setModalOpen(true);
                      }}
                    >
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
              <p>Para começar a registrar dados, crie um novo lote.</p>
              <button className="btn-new-lote" onClick={abrirModalNovoLote}>Começar agora</button>
            </div>
          )}
        </main>

        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {modalTipo === "lote" ? (
                <>
                  <h3>Novo Lote</h3>

                  <form onSubmit={criarNovoLote}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nome/Número do Lote</label>
                        <input
                          required
                          type="text"
                          value={form.numero || ""}
                          onChange={(e) => setForm({ ...form, numero: e.target.value })}
                          placeholder="Ex: 32, 2024.09..."
                        />
                      </div>

                      <div className="form-group">
                        <label>Data de Início</label>
                        <input
                          required
                          type="date"
                          value={form.data_inicio || ""}
                          onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-save">
                        Criar Lote
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h3>Novo Registro: {abaInfo.titulo}</h3>

                  <form onSubmit={adicionarRegistro}>
                    <div className="form-grid">
                      {abaInfo.colunas.map((col, i) => (
                        <div className="form-group" key={i}>
                          <label>{col}</label>
                          <input
                            required
                            type={col === "Data" ? "date" : "text"}
                            onChange={(e) => setForm({ ...form, [`c${i + 1}`]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="modal-footer">
                      <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-save">
                        Salvar Registro
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}