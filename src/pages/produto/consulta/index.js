import React, { useState, useEffect, useRef } from "react";

import { formataMoeda } from "../../../util";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import { FaStore } from "react-icons/fa";

import { Card } from "primereact/card";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

import axios from "../../../services/axios";
import moment from "moment";

import "./style.css";

const ConsultaProduto = () => {
  let eanUrl = "http://www.eanpictures.com.br:9000/api/gtin";

  const [dialogPesquisa, setDialogPesquisa] = useState(false);
  const [produtos, setProdutos] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const toast = useRef(null);
  const [filtro, setFiltro] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.CONTAINS },
    codigo: { value: null, matchMode: FilterMatchMode.EQUALS },
    ean: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [first2, setFirst2] = useState(0);
  const [rows2, setRows2] = useState(3);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [produtoSelecionadoDetalhado, setProdutoSelecionadoDetalhado] =
    useState([]);
  const [diasVendaFiltro, setDiasVendaFiltro] = useState(30);
  const [diasCompraFiltro, setDiasCompraFiltro] = useState(90);

  useEffect(() => {
    pesquisarMultEmpresa();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filtro };
    _filters2["global"].value = value;

    setFiltro(_filters2);
    setGlobalFilterValue(value);
  };

  const pesquisarMultEmpresa = () => {
    setLoading(true);
    axios
      .get(`/api/produto`)
      .then((r) => {
        setProdutos(r.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error}`,
          life: 3000,
        });
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const totalVendidoTemplate = (data) => {
    return formataMoeda(data?.totalVendido);
  };
  const totalVendaLiquidaTemplate = (data) => {
    return formataMoeda(
      data?.totalVendido - data?.totalDesconto - data?.totalDevolucao
    );
  };

  const totalDescontoTemplate = (data) => {
    return formataMoeda(data?.totalDesconto);
  };

  const totalDevolucaoTemplate = (data) => {
    return formataMoeda(data?.totalDevolucao);
  };

  const precoMedioVendaTemplate = (data) => {
    return formataMoeda(data?.precoMedioVenda);
  };

  const custoMedioTemplate = (data) => {
    return formataMoeda(data?.precoCusto);
  };

  const totalCompradoTemplate = (data) => {
    return formataMoeda(data?.totalComprado);
  };

  const precoVendaFormat = (rowData) => {
    let venda = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco);

    return (
      <>
        <div style={{ color: "green" }}> {venda} </div>
      </>
    );
  };

  const precoCustoFormat = (rowData) => {
    let custo = formataMoeda(rowData?.precocusto);
    return (
      <>
        <div style={{ color: "red" }}>{custo}</div>
      </>
    );
  };

  const ultimocustoTemplate = (rowData) => {
    return (
      <>
        <div style={{ color: "red" }}>
          <div>{moment(rowData.dataprecocusto).format("DD/MM/YYYY")}</div>
        </div>
      </>
    );
  };

  const ultimoprecoTemplate = (rowData) => {
    return (
      <>
        <div style={{ color: "green" }}>
          <div>{moment(rowData.dataalteracaopreco).format("DD/MM/YYYY")}</div>
        </div>
      </>
    );
  };

  const eanOrCodigo = (data) => {
    if (data?.ean) {
      return (
        <>
          <div>
            <img
              style={{
                width: "150px",
                height: "150px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${data?.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={data?.ean}
            />
          </div>
        </>
      );
    } else {
      return data?.codigo;
    }
  };

  const estoqueTemplate = (rowData) => {
    return rowData.estoque >= 0 ? (
      <div style={{ color: "green" }}>{rowData.estoque}</div>
    ) : (
      <div style={{ color: "red" }}>{rowData.estoque}</div>
    );
  };

  const template2 = {
    layout: "RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink",
    RowsPerPageDropdown: (options) => {
      const dropdownOptions = [
        { label: 3, value: 3 },
        { label: 5, value: 5 },
        { label: 15, value: 15 },
        { label: 50, value: 50 },
      ];

      return (
        <React.Fragment>
          <span
            className="mx-1"
            style={{ color: "var(--text-color)", userSelect: "none" }}
          >
            Itens por página:{" "}
          </span>
          <Dropdown
            value={options.value}
            options={dropdownOptions}
            onChange={options.onChange}
          />
        </React.Fragment>
      );
    },
    CurrentPageReport: (options) => {
      return (
        <span
          style={{
            color: "var(--text-color)",
            userSelect: "none",
            width: "400px",
            textAlign: "center",
          }}
        >
          Exibindo de {options.first} até {options.last} de{" "}
          {options.totalRecords} produtos
        </span>
      );
    },
  };

  const onCustomPage2 = (event) => {
    setFirst2(event.first);
    setRows2(event.rows);
  };

  const dataUltimaCompraTemplate = (rowData) => {
    return (
      <>
        <div>{moment(rowData.dataultimacompra).format("DD/MM/YYYY")}</div>
      </>
    );
  };

  const filialTemplate = (rowData) => {
    return (
      <>
        <FaStore /> - {rowData.filial}
      </>
    );
  };

  const promocao = (rowData) => {
    let row = [rowData];

    return row.map((m) => {
      let p = 0;

      if (m.precopromocionalfilial) {
        p = m.precopromocionalfilial;
      } else if (m.precopromocionalfamilia) {
        p = m.precopromocionalfamilia;
      } else if (m.precopromocional) {
        p = m.precopromocional;
      }

      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(p);
    });
  };

  const produtoSelecionadoTemplate = (rowData) => {
    setLoading2(true);

    setProdutoSelecionadoDetalhado([]);
    axios
      .get(`/api/produto/consulta/${rowData.data.id}`)
      .then((r) => {
        setProdutoSelecionado(r.data);

        //  console.log(produtoSelecionado);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoading2(false);
      });
  };

  const consultaVendaProduto = (rowData) => {
    let p = [rowData.data];

    setLoading3(true);
    setLoading2(true);
    if (p) {
      p.forEach((e) => {
        axios
          .get(
            `/api/produto/bi/vendacompra/${e?.idproduto}/${e?.idfilial}/${diasVendaFiltro}/${diasCompraFiltro}`
          )
          .then((r) => {
            setProdutoSelecionadoDetalhado(r.data);
            //  console.log(produtoSelecionadoDetalhado);
          })
          .catch((error) => {})
          .finally((f) => {
            setLoading3(false);
            setLoading2(false);
          });
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Header />
      <Footer />

      <Button
        className="btn-atualizar-fixo p-button-sucess p-button-lg p-button-rounded"
        icon="pi pi-refresh"
        onClick={() => pesquisarMultEmpresa()}
        loading={loading}
      />

      <Button
        className="btn-pesquisar-fixo p-button-info p-button-lg p-button-rounded"
        icon="pi pi-search"
        onClick={() => setDialogPesquisa(true)}
      />
      <Dialog
        header="Pesquisa rápida"
        modal={false}
        position="center"
        visible={dialogPesquisa}
        onHide={() => setDialogPesquisa(false)}
      >
        <div className="input-produto">
          <InputText
            style={{ width: "100%" }}
            autoFocus
            type="text"
            className="p-inputtext-lg block"
            placeholder="Código, Barras ou nome"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
          />
        </div>
      </Dialog>
      {/* <div className="btn-cosnultar">
            <Button
              label="Consultar"
              onClick={() => pesquisarMultEmpresa()}
              icon=" pi pi-search"
              className="p-button-lg p-button-rounded p-button-success"
            /> 
  </div> */}

      <div className="texto">
        <h1>Selecione um produto para mais detalhes</h1>
      </div>
      <div className="produto-container">
        <DataTable
          globalFilterFields={["nome", "codigo", "ean"]}
          className="tabela-produto"
          filters={filtro}
          filterDisplay="row"
          paginator
          paginatorTemplate={template2}
          first={first2}
          rows={rows2}
          onPage={onCustomPage2}
          paginatorClassName="justify-content-start"
          emptyMessage="Nenhum produto encontrado"
          loading={loading}
          disabled={loading2}
          value={produtos}
          selectionMode="single"
          onRowSelect={produtoSelecionadoTemplate}
          responsiveLayout="stack"
          breakpoint="1192px"
          style={{
            width: "100%",
          }}
        >
          <Column
            header="Código"
            field="codigo"
            filter
            filterPlaceholder="Pesquisar por código"
          ></Column>
          <Column
            header="EAN"
            field="ean"
            filter
            filterPlaceholder="Pesquisar por barras"
          ></Column>
          <Column
            field="nome"
            header="Produto"
            bodyStyle={{ fontWeight: "800", textAlign: "left" }}
            filter
            filterPlaceholder="Pesquisar por nome"
          ></Column>
          <Column field="idUnidadeMedida.nome" header="UN" />
        </DataTable>
        <Card style={{ display: "flex", justifyContent: "center" }}>
          <h1>Total de {produtos?.length} Produtos</h1>
        </Card>

        {produtoSelecionado ? (
          <>
            <div className="produto-card-selecionado">
              <div className="produto-selecionado">
                <h1 style={{ marginTop: "10px" }}>
                  {produtoSelecionado?.[0]?.produto}
                </h1>

                {eanOrCodigo(produtoSelecionado?.[0])}

                <div className="panel-dias-venda-compra">
                  <h1 style={{ margin: "1px 1em" }}>Venda</h1>
                  <div>
                    <InputNumber
                      inputId="horizontal"
                      value={diasVendaFiltro}
                      onValueChange={(e) => setDiasVendaFiltro(e.target.value)}
                      showButtons
                      buttonLayout="horizontal"
                      step={1}
                      decrementButtonClassName="p-button-danger"
                      incrementButtonClassName="p-button-success"
                      incrementButtonIcon="pi pi-plus"
                      decrementButtonIcon="pi pi-minus"
                      placeholder="Dias"
                    />
                  </div>
                  <h1 style={{ margin: "1px 1em" }}>Compra</h1>
                  <div>
                    <InputNumber
                      inputId="horizontal"
                      value={diasCompraFiltro}
                      onValueChange={(e) => setDiasCompraFiltro(e.target.value)}
                      showButtons
                      buttonLayout="horizontal"
                      step={1}
                      decrementButtonClassName="p-button-danger"
                      incrementButtonClassName="p-button-success"
                      incrementButtonIcon="pi pi-plus"
                      decrementButtonIcon="pi pi-minus"
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "5px",
                  }}
                >
                  <DataTable
                    className="tabela-produto mt-6"
                    responsiveLayout="stack"
                    selectionMode="single"
                    onRowSelect={consultaVendaProduto}
                    style={{ width: "100%", marginLeft: "25px" }}
                    emptyMessage="Nenhum produto encontrado"
                    loading={loading2}
                    value={produtoSelecionado}
                    dataKey="id"
                    rowGroupMode="subheader"
                    //  rowGroupHeaderTemplate={headerTemplate}
                    groupRowsBy="idproduto"
                  >
                    <Column header="Loja" field={filialTemplate} />
                    <Column header="Estoque" field={estoqueTemplate} />
                    <Column
                      header="Última compra"
                      field={dataUltimaCompraTemplate}
                    />
                    <Column header="Origem do custo" field="custoalteradopor" />
                    <Column header="Último custo" field={ultimocustoTemplate} />
                    <Column header="Custo" field={precoCustoFormat} />
                    <Column
                      header="Preço alterado"
                      field={ultimoprecoTemplate}
                    />
                    <Column header="Preço" field={precoVendaFormat} />
                    <Column header="Promoção" field={promocao} />
                  </DataTable>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "5px",
                    marginTop: "20px",
                    width: "100%",
                  }}
                >
                  <DataTable
                    value={produtoSelecionadoDetalhado}
                    responsiveLayout="stack"
                    breakpoint="1192px"
                    emptyMessage="Nenhum produto selecionado"
                    loading={loading3}
                    style={{ margin: "5px" }}
                  >
                    <Column field="filial" header="Loja"></Column>
                    <Column field="nome" header="Produto"></Column>

                    <Column
                      field="quantidadeComprada"
                      header="Quantidade comprada"
                    ></Column>
                    <Column
                      field={totalCompradoTemplate}
                      header="Total compra"
                    ></Column>
                    <Column
                      field="quantidadeVendida"
                      header="Quantidade vendida"
                    ></Column>
                    <Column
                      field="quantidadeDevolvida"
                      header="Quantidade devolução"
                    ></Column>
                    <Column field={custoMedioTemplate} header="CMV"></Column>
                    <Column
                      header="Preço médio de venda"
                      field={precoMedioVendaTemplate}
                    ></Column>

                    <Column
                      header="Total descontos"
                      field={totalDescontoTemplate}
                    ></Column>
                    <Column
                      header="Total devolução"
                      field={totalDevolucaoTemplate}
                    ></Column>

                    <Column
                      header="Total venda bruta"
                      field={totalVendidoTemplate}
                    ></Column>
                    <Column
                      header="Total venda líquida"
                      field={totalVendaLiquidaTemplate}
                    ></Column>
                  </DataTable>
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default ConsultaProduto;
