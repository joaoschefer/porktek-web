import "./LoteAtual.css";
import { useMemo, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function LoteAtual() {
  const API = "http://127.0.0.1:8000/api";

  const endpointPorAba = {
    chegadas: `${API}/chegadas/`,
    mortes: `${API}/mortes/`,
    racao: `${API}/racoes/`,
    saidas: `${API}/saidas/`,
    observacoes: `${API}/observacoes/`,
  };

  const [abaAtiva, setAbaAtiva] = useState("mortes");
  const [modalOpen, setModalOpen] = useState(false);

  // lote atual vindo do backend
  const [loteAtual, setLoteAtual] = useState(null);
  const temLote = !!loteAtual?.id;

  // UI (cards placeholders; linhas vêm do backend)
  const [dadosPorAba, setDadosPorAba] = useState({
    chegadas: {
      titulo: "Chegadas",
      cards: [
        { titulo: "Chegadas", valor: "—" },
        { titulo: "Total de chegadas", valor: "—" },
        { titulo: "Peso médio", valor: "—" },
        { titulo: "Última chegada", valor: "—" },
      ],
      colunas: ["Data", "Qtd", "Origem", "Observação"],
      linhas: [],
    },
    mortes: {
      titulo: "Mortes",
      cards: [
        { titulo: "Mortes hoje", valor: "—" },
        { titulo: "Total de mortes", valor: "—" },
        { titulo: "Mortalidade", valor: "—" },
        { titulo: "Motivo principal", valor: "—" },
      ],
      colunas: ["Data", "Mossa", "Motivo", "Observação"],
      linhas: [],
    },
    racao: {
      titulo: "Ração",
      cards: [
        { titulo: "Consumo por dia", valor: "—" },
        { titulo: "Consumo total", valor: "—" },
        { titulo: "Média por suíno", valor: "—" },
        { titulo: "Ração atual", valor: "—" },
      ],
      colunas: ["Data", "KG", "Tipo", "Observação"],
      linhas: [],
    },
    saidas: {
      titulo: "Saídas",
      cards: [
        { titulo: "Saídas", valor: "—" },
        { titulo: "Total de saídas", valor: "—" },
        { titulo: "Peso médio", valor: "—" },
        { titulo: "Última saída", valor: "—" },
      ],
      colunas: ["Data", "Qtd", "Destino", "Observação"],
      linhas: [],
    },
    observacoes: {
      titulo: "Observações",
      cards: [
        { titulo: "Risco", valor: "—" },
        { titulo: "Total de obs.", valor: "—" },
        { titulo: "Alertas ativos", valor: "—" },
        { titulo: "Última atualização", valor: "—" },
      ],
      colunas: ["Data", "Tipo", "Título", "Observação"],
      linhas: [],
    },
  });

  const dadosAtuais = dadosPorAba[abaAtiva];

  // forms (DATA em YYYY-MM-DD pro Django)
  const forms = useMemo(
    () => ({
      chegadas: {
        titulo: "Adicionar Chegada",
        campos: [
          { key: "data", label: "Data", placeholder: "YYYY-MM-DD" },
          { key: "qtd", label: "Quantidade", placeholder: "Ex: 1000" },
          { key: "origem", label: "Origem", placeholder: "Ex: Fornecedor A" },
          { key: "obs", label: "Observação", placeholder: "Opcional" },
        ],
      },
      mortes: {
        titulo: "Adicionar Morte",
        campos: [
          { key: "data", label: "Data", placeholder: "YYYY-MM-DD" },
          { key: "mossa", label: "Mossa", placeholder: "Ex: 1" },
          { key: "motivo", label: "Motivo", placeholder: "Ex: Diarréia" },
          { key: "obs", label: "Observação", placeholder: "Opcional" },
        ],
      },
      racao: {
        titulo: "Adicionar Ração",
        campos: [
          { key: "data", label: "Data", placeholder: "YYYY-MM-DD" },
          { key: "kg", label: "KG", placeholder: "Ex: 90" },
          { key: "tipo", label: "Tipo", placeholder: "Ex: Crescimento" },
          { key: "obs", label: "Observação", placeholder: "Opcional" },
        ],
      },
      saidas: {
        titulo: "Adicionar Saída",
        campos: [
          { key: "data", label: "Data", placeholder: "YYYY-MM-DD" },
          { key: "qtd", label: "Quantidade", placeholder: "Ex: 20" },
          { key: "destino", label: "Destino", placeholder: "Ex: Frigorífico X" },
          { key: "obs", label: "Observação", placeholder: "Opcional" },
        ],
      },
      observacoes: {
        titulo: "Adicionar Observação",
        campos: [
          { key: "data", label: "Data", placeholder: "YYYY-MM-DD" },
          { key: "tipo", label: "Tipo", placeholder: "Ex: Saúde" },
          { key: "titulo", label: "Título", placeholder: "Ex: Tosse" },
          { key: "obs", label: "Observação", placeholder: "Detalhe aqui" },
        ],
      },
    }),
    []
  );

  const formAtual = forms[abaAtiva];
  const [form, setForm] = useState({});

  const limparDadosUI = () => {
    setDadosPorAba((prev) => {
      const novo = { ...prev };
      Object.keys(novo).forEach((k) => (novo[k] = { ...novo[k], linhas: [] }));
      return novo;
    });
  };

  const carregarLoteAtual = async () => {
    // Ajuste conforme teu backend: o ideal é ter endpoint "lote ativo"
    const res = await fetch(`${API}/lotes/?ativo=true`);
    if (!res.ok) return;

    const lotes = await res.json();
    const ativo = Array.isArray(lotes) && lotes.length ? lotes[0] : null;

    setLoteAtual(ativo);

    if (!ativo) {
      limparDadosUI();
      return;
    }

    // carrega a aba atual já do backend
    await carregarAba(abaAtiva, ativo.id);
  };

  useEffect(() => {
    carregarLoteAtual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarAba = async (aba, loteIdParam) => {
    const loteId = loteIdParam ?? loteAtual?.id;
    if (!loteId) {
      limparDadosUI();
      return;
    }

    const url = `${endpointPorAba[aba]}?lote_id=${loteId}`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      console.log("Erro ao carregar:", txt);
      return;
    }

    const data = await res.json();

    const mapToLinha = {
      chegadas: (i) => ({ c1: i.data, c2: String(i.qtd ?? ""), c3: i.origem || "-", c4: i.observacao || "-" }),
      mortes: (i) => ({ c1: i.data, c2: String(i.mossa ?? ""), c3: i.motivo || "-", c4: i.observacao || "-" }),
      racao: (i) => ({ c1: i.data, c2: String(i.kg ?? ""), c3: i.tipo || "-", c4: i.observacao || "-" }),
      saidas: (i) => ({ c1: i.data, c2: String(i.qtd ?? ""), c3: i.destino || "-", c4: i.observacao || "-" }),
      observacoes: (i) => ({ c1: i.data, c2: i.tipo || "-", c3: i.titulo || "-", c4: i.observacao || "-" }),
    };

    setDadosPorAba((prev) => ({
      ...prev,
      [aba]: {
        ...prev[aba],
        linhas: data.map(mapToLinha[aba]),
      },
    }));
  };

  const abrirModal = () => {
    if (!temLote) return;
    const inicial = {};
    formAtual.campos.forEach((c) => (inicial[c.key] = ""));
    setForm(inicial);
    setModalOpen(true);
  };

  const fecharModal = () => setModalOpen(false);

  const atualizarCampo = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!temLote) return;

    const faltando = formAtual.campos
      .filter((c) => c.key !== "obs")
      .some((c) => String(form[c.key] || "").trim() === "");

    if (faltando) return;

    const loteId = loteAtual.id;

    const payloadPorAba = {
      chegadas: { lote: loteId, data: form.data, qtd: Number(form.qtd), origem: form.origem, observacao: form.obs || "" },
      mortes: { lote: loteId, data: form.data, mossa: Number(form.mossa), motivo: form.motivo, observacao: form.obs || "" },
      racao: { lote: loteId, data: form.data, kg: Number(form.kg), tipo: form.tipo, observacao: form.obs || "" },
      saidas: { lote: loteId, data: form.data, qtd: Number(form.qtd), destino: form.destino, observacao: form.obs || "" },
      observacoes: { lote: loteId, data: form.data, tipo: form.tipo, titulo: form.titulo, observacao: form.obs || "" },
    };

    const res = await fetch(endpointPorAba[abaAtiva], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadPorAba[abaAtiva]),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.log("Erro ao salvar:", txt);
      return;
    }

    await carregarAba(abaAtiva, loteId);
    setModalOpen(false);
  };

  // Botão "Novo Lote": cria no backend e vira o lote atual
  const criarNovoLote = async () => {
    // aqui você pode abrir um modal de "criar lote" depois
    // por enquanto, cria um lote simples
    const hoje = new Date().toISOString().slice(0, 10);
    const numero = Math.floor(Math.random() * 900 + 100); // só pra teste

    const res = await fetch(`${API}/lotes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero,
        data_inicio: hoje,
        ativo: true,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.log("Erro ao criar lote:", txt);
      return;
    }

    const loteCriado = await res.json();
    setLoteAtual(loteCriado);
    limparDadosUI();
    await carregarAba(abaAtiva, loteCriado.id);
  };

  return (
    <div className="loteatual-layout">
      <Sidebar />

      <div className="loteatual-content">
        <Header />

        <div className="loteatual">
          <div className="topo-lote">
            <div className="linha-loteatual">
              <h1 className="loteatual-title">{temLote ? `Lote ${loteAtual.numero}` : "Sem lote ativo"}</h1>
              <p className="loteatual-subtitle">
                {temLote ? `Iniciado dia ${loteAtual.data_inicio}` : "Crie um novo lote para começar."}
              </p>
            </div>

            <div className="acoes">
              <button className="btn-primario" onClick={criarNovoLote}>
                Novo Lote
              </button>
              <button className="btn-secundario" disabled={!temLote}>
                Finalizar lote
              </button>
            </div>
          </div>

          <div className="tabs">
            {[
              { key: "chegadas", label: "Chegadas" },
              { key: "mortes", label: "Mortes" },
              { key: "racao", label: "Ração" },
              { key: "saidas", label: "Saídas" },
              { key: "observacoes", label: "Observações" },
            ].map((t) => (
              <button
                key={t.key}
                disabled={!temLote}
                className={`tab ${abaAtiva === t.key ? "ativo" : ""} ${!temLote ? "tab-disabled" : ""}`}
                onClick={async () => {
                  setAbaAtiva(t.key);
                  await carregarAba(t.key);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* se não tem lote, fica vazio daqui pra baixo */}
          {temLote && (
            <>
              <div className="cards">
                {dadosAtuais.cards.map((c, idx) => (
                  <div className="card" key={idx}>
                    <h3>{c.titulo}</h3>
                    <h2>{c.valor}</h2>
                  </div>
                ))}
              </div>

              <div className="lista">
                <div className="lista-topo">
                  <h3 className="lista-titulo">Registros - {dadosAtuais.titulo}</h3>
                  <button className="btn-terciario" onClick={abrirModal}>
                    Adicionar
                  </button>
                </div>

                <div className="lista-header">
                  {dadosAtuais.colunas.map((col, idx) => (
                    <span key={idx}>{col}</span>
                  ))}
                </div>

                <ul>
                  {dadosAtuais.linhas.map((l, idx) => (
                    <li key={idx}>
                      <span>{l.c1}</span>
                      <span>{l.c2}</span>
                      <span>{l.c3}</span>
                      <span>{l.c4}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div className="modal-overlay" onMouseDown={fecharModal}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-topo">
                <h3 className="modal-titulo">{formAtual.titulo}</h3>
                <button className="modal-fechar" onClick={fecharModal}>
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={salvar}>
                {formAtual.campos.map((c) => (
                  <label className="campo" key={c.key}>
                    <span className="campo-label">{c.label}</span>
                    <input
                      className="campo-input"
                      placeholder={c.placeholder}
                      value={form[c.key] || ""}
                      onChange={(e) => atualizarCampo(c.key, e.target.value)}
                    />
                  </label>
                ))}

                <div className="modal-acoes">
                  <button type="button" className="btn-secundario" onClick={fecharModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primario">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}