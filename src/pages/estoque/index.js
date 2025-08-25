import { useEffect, useState } from "react";

import Footer from "../../components/footer";
import "../../components/prime-react-styles.css";
import api from "../../services/axios";

import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";

const AjusteEstoque = () => {
  const [grupo, setGrupo] = useState(null);
  const [grupoList, setGrupoList] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    codigo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    nome: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const getGrupos = () => {
    return api
      .get("/api/grupos")
      .then((r) => {
        setGrupoList(r.data);
      })
      .catch((e) => {});
  };

  const getProdutosProGrupo = () => {
    setLoading(true);
    return api
      .get(`/api/produto/grupo/${grupo?.id}`)
      .then((r) => {
        setProdutos(r.data);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoading(false);
      });
  };

  const converterParaCSV = (jsonData) => {
    const separator = ";";
    const keys = Object.keys(jsonData[0]);

    const csvContent = jsonData.map((item) =>
      keys.map((key) => item[key]).join(separator)
    );

    return keys.join(separator) + "\n" + csvContent.join("\n");
  };

  const downloadTxt = () => {
    const csvData = converterParaCSV(
      produtos.map((m) => ({
        produto: m?.codigo,
        quantidade: "0",
      }))
    );

    const blob = new Blob([csvData.slice(18)], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ZerarProdutosBalanco";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const header = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          
        }}
      >
        <div>
          <h4>{grupo?.nome} </h4>
        </div>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Pesquisar"
          />
        </span>
      </div>
    );
  };
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  useEffect(() => {
    getGrupos();
  }, []);

  return (
    <div className="page-container">
      <Footer />

      {produtos.length === 0 ? (
        <div className="page-card">
          <div className="page-header">
            <h1>Exportar Arquivo EDI para Zerar Estoque</h1>
            <p className="subtitle">Informe a seção que deseja carregar para exportação</p>
          </div>

          {/* Aviso de atenção */}
          <div className="attention-warning">
            <i className="pi pi-exclamation-triangle"></i>
            <span>Esta funcionalidade permite exportar produtos para zerar o estoque via arquivo EDI</span>
          </div>

          {/* Container de filtros */}
          <div className="filters-container">
            <div className="filters-section">
              <h3 className="section-title">
                <i className="pi pi-filter"></i>
                Seleção de Grupo
              </h3>
              
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">
                    <i className="pi pi-tags"></i>
                    Grupo de Produtos
                    {grupo && <span className="filter-status active">✓</span>}
                  </label>
                  <Dropdown
                    value={grupo}
                    placeholder="Selecione um grupo"
                    optionLabel="nome"
                    options={grupoList}
                    onChange={(e) => setGrupo(e.value)}
                    filter
                    showClear
                    filterBy="nome"
                    className="filter-dropdown"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão de pesquisa */}
          <div className="search-button-container">
            <div className="search-info">
              <div className="filters-count">
                <i className="pi pi-filter"></i>
                <span>
                  {grupo ? '1 de 1 filtro preenchido' : '0 de 1 filtro preenchido'}
                </span>
              </div>
              {!grupo && (
                <div className="validation-warning">
                  <i className="pi pi-exclamation-triangle"></i>
                  <span>Selecione um grupo para continuar</span>
                </div>
              )}
            </div>
            
            <Button
              className="search-button"
              label="Carregar Produtos"
              icon="pi pi-search"
              loading={loading}
              disabled={!grupo}
              onClick={() => getProdutosProGrupo()}
            />
          </div>
        </div>
      ) : (
        <div className="page-card">
          <div className="page-header">
            <h1>Produtos para Exportação</h1>
            <p className="subtitle">Exporte produtos para zerar o estoque via arquivo EDI</p>
          </div>

          <Toolbar
            className="p-toolbar"
            left={
              <Button
                label="Voltar"
                className="p-button p-button-rounded p-button-danger"
                icon="pi pi-backward"
                onClick={() => setProdutos([])}
              />
            }
            right={
              <Button
                label="Exportar produtos"
                className="p-button p-button-rounded p-button-success"
                icon="pi pi-file-excel"
                onClick={() => downloadTxt()}
              />
            }
          />
          
          <div className="table-container">
            <div className="table-wrapper">
              <DataTable
                className="DataTable"
                value={produtos}
                loading={loading}
                responsiveLayout="stack"
                filters={filters}
                globalFilterFields={["codigo", "ean", "nome"]}
                stripedRows
                header={header}
                paginator
                rows={10}
                emptyMessage="Sem dados para serem exibidos"
                breakpoint="968px"
                footer={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Existem {produtos.length} produtos para exportação
                  </div>
                }
              >
                <Column field="codigo" header="Código"></Column>
                <Column field="ean" header="Ean"></Column>
                <Column field="nome" header="Nome"></Column>
              </DataTable>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AjusteEstoque;
