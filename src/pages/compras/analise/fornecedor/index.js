import React, { useEffect, useState } from "react";
import "./styles.css";

import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import Header from "../../../../components/header";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { Rating } from "primereact/rating";
import { Sidebar } from "primereact/sidebar";

import { FaGift } from "react-icons/fa";

import moment from "moment";

import api from "../../../../services/axios";

export default function AnaliseFornecedor() {
  addLocale("pt-BR", {
    firstDayOfWeek: 0,
    dayNames: [
      "domingo",
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sábado",
    ],
    dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
    dayNamesMin: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    monthNamesShort: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Maio",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    today: " Agora ",
    clear: " Limpar ",
  });

  const [loading, setLoading] = useState(false);
  const [dataInicialCompra, setDataInicialCompra] = useState("");
  const [dataFinalCompra, setDataFinalCompra] = useState("");
  const [dataInicialVenda, setDataInicialVenda] = useState("");
  const [dataFinalVenda, setDataFinalVenda] = useState("");
  const [fornecedor, setFornecedor] = useState();
  const [fornecedores, setFornecedores] = useState([""]);
  const [filial, setFilial] = useState(1);
  const [lojas, setLojas] = useState([""]);

  const [produtos, setProdutos] = useState([""]);
  const [pedidos, setPedidos] = useState([""]);

  const [visibleLeft, setVisibleLeft] = useState(false);

  const getFornecedores = () => {
    setLoading(true);

    api
      .get(`/api/entidade/fornecedores/`)
      .then((r) => {
        setFornecedores(r.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getLojas = () => {
    setLoading(true);
    api
      .get("/api/filial")
      .then((r) => {
        setLojas(r.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const analisar = () => {
    setLoading(true);

    api
      .get(
        `/api_react/compras/produtos/${moment(dataInicialCompra).format(
          "YYYY-MM-DD"
        )}/${moment(dataFinalCompra).format("YYYY-MM-DD")}/${fornecedor.id}/${
          filial.codigo
        }/${moment(dataInicialVenda).format("YYYY-MM-DD")}/${moment(
          dataFinalVenda
        ).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        setProdutos(r.data);
        console.log(r.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const total_comprado_template = (rowData) => {
    let total = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.total_comprado);
    return (
      <>
        {" "}
        <font color="red">
          {" "}
          <u> Total comprado </u> <br />
        </font>
        <font style={{ fontSize: "20px", color: "red", fontWeight: "800" }}>
          {" "}
          {total}{" "}
        </font>
      </>
    );
  };

  const valor_unitario_template = (rowData) => {
    let valor_unitario = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.custo_unitario);
    return (
      <>
        {" "}
        <font color="red">
          {" "}
          <u>Custo unitário </u> <br />
        </font>{" "}
        <font style={{ fontSize: "20px", color: "red", fontWeight: "800" }}>
          {" "}
          {valor_unitario}
        </font>{" "}
      </>
    );
  };

  const preco_media_venda_template = (rowData) => {
    let preco_medio_venda = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco_medio_venda);
    return (
      <>
        {" "}
        <font color="green">
          <h4>Análise de venda do dia </h4>{" "}
          {moment(dataInicialVenda).format("DD-MM-YY")} até{" "}
          {moment(dataFinalVenda).format("DD-MM-YY")} <br />
          <u> Preço médio de venda</u>{" "}
        </font>{" "}
        <br />
        <font color="green" style={{ fontSize: "20px", fontWeight: "800" }}>
          {preco_medio_venda}{" "}
        </font>{" "}
      </>
    );
  };

  const quantidade_comprada_template = (rowData) => {
    let embalagem = Intl.NumberFormat("pt-BR", {
      style: "decimal",
    }).format(rowData.embalagem);
    return (
      <>
        {" "}
        <font color="red">
          {" "}
          <u>Comprou </u> <br />
        </font>
        <font color="red" style={{ fontSize: "25px", fontWeight: "800" }}>
          {rowData.quantidade_comprada} {rowData.unidade_compra} ({embalagem})
        </font>
      </>
    );
  };

  const quantidade_vendida_template = (rowData) => {
    let quantidade_vendida = Intl.NumberFormat("pt-BR", {
      style: "decimal",
    }).format(rowData.quantidade_vendida);
    return (
      <>
        {" "}
        <font color="green">
          {" "}
          <u>Vendeu </u> <br />
        </font>
        <font color="green" style={{ fontSize: "25px", fontWeight: "800" }}>
          {rowData.quantidade_vendida ? quantidade_vendida : 0}{" "}
          {rowData.unidade_venda}
        </font>
      </>
    );
  };

  const total_template = (rowData) => {
    let total = rowData.quantidade_vendida * rowData.preco_medio_venda;
    let totalF = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
    return (
      <>
        <font color="green">
          <u> Total vendido </u> <br />
        </font>
        <font color="green" style={{ fontSize: "20px", fontWeight: "800" }}>
          {" "}
          {totalF}{" "}
        </font>
      </>
    );
  };

  const data_inclusao_template = (rowData) => {
    return (
      <>
        {" "}
        <div>
          {" "}
          <h4>Chegou dia </h4>
        </div>{" "}
        {moment(rowData.data_inclusao).format("DD/MM/yyyy")}{" "}
      </>
    );
  };

  const giroTemplate = (rowData) => {
    let totalEstrelas =
      (rowData.quantidade_vendida /
        (rowData.quantidade_comprada * rowData.embalagem)) *
      5;

    return (
      <>
        {totalEstrelas.toFixed(2)}
        <Rating value={totalEstrelas} stars={5} readOnly cancel={false} />
      </>
    );
  };

  const EanOrCodigo = (rowData) => {
    if (rowData.ean) {
      return (
        <>
          <div>{rowData.ean} </div>
          <div>
            <img
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`http://www.eanpictures.com.br:9000/api/gtin/${rowData.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={rowData.ean}
            />
          </div>
        </>
      );
    } else {
      return rowData.codigo;
    }
  };

  const cfop_template = (rowData) => {
    return (
      <>
        {rowData.cfop === "5910" ||
        rowData.cfop === "2910" ||
        rowData.cfop === "1910" ? (
          <>
            <Tooltip
              target=".cfop-button"
              tooltipOptions={{ className: "purple-tooltip", position: "top" }}
            />
            <span
              className="cfop-button"
              data-pr-tooltip={rowData.cfop_descricao}
            >
              {rowData.cfop} <br />
              <FaGift />
            </span>
          </>
        ) : (
          <>
            <Tooltip
              target=".cfop-button"
              tooltipOptions={{ className: "purple-tooltip", position: "top" }}
            />
            <span
              className="cfop-button"
              data-pr-tooltip={rowData.cfop_descricao}
            >
              {rowData.cfop}
            </span>
          </>
        )}
      </>
    );
  };

  const botaoAddTemplate = (rowdata) => {
    return (
      <>
        <Button
        style={{ margin: "5px" }}
        className="p-button-rounded"
          label="+"
          icon="pi pi-shopping-bag"
          onClick={() => adicionarProduto(rowdata)}
        />

       
      </>
    );
  };

  const adicionarProduto = (rowData) => {
    setPedidos((oldArray) => [
      ...oldArray,
      { produto: rowData.produto, codigo: rowData.ean },
    ]);
  };

  useEffect(() => {
    getFornecedores();
    getLojas();
  }, []);

  return (
    <>
      <Header />

      <Button
          
          icon="pi pi-shopping-cart"
          onClick={() => setVisibleLeft(true)}
          className="botao-add-colado mr-2"
        />

      <Sidebar
        style={{ width: "75%" }}
        visible={visibleLeft}
        onHide={() => setVisibleLeft(false)}
      >
        <div className="lista-itens">
          <h4 style={{ color: "#FFF", margin: "15px" }}>Pedido de compra</h4>
          <Button style={{margin:'5px'}} label="Limpar lista" onClick={() => setPedidos([""])} />
          <div style={{ width: "100%" }}>
            <DataTable value={pedidos}>
              <Column field={EanOrCodigo} header="Código/Ean"></Column>
              <Column field="produto" header="Produto"></Column>
              <Column field="quantidade" header="Quantidade"></Column>
            </DataTable>
          </div>
        </div>
      </Sidebar>

      <div className="container-fornecedor">
        <h1
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Análise de compras
        </h1>
        <div>
          <div className="fornecedor-input">
            <h4>Selecione um fornecedor para análise</h4>
            <Dropdown
              style={{ marginTop: "10px" }}
              placeholder="Selecione um fornecedor"
              value={fornecedor}
              options={fornecedores}
              optionLabel="nome"
              filter
              showClear
              filterBy="nome"
              onChange={(e) => setFornecedor(e.target.value)}
            />
          </div>

          <div className="fornecedor-input">
            <h4>Selecione uma loja para análise</h4>
            <Dropdown
              style={{ marginTop: "10px" }}
              placeholder="Selecione uma loja"
              value={filial}
              onChange={(e) => setFilial(e.target.value)}
              options={lojas}
              optionLabel="nome"
            />
          </div>
        </div>
        <div>
          <div className="fornecedor-input">
            <h4 style={{ color: "red" }}>
              Informe o período inicial para análise de compra
            </h4>

            <Calendar
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataInicialCompra(e.target.value)}
              value={dataInicialCompra}
            ></Calendar>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "red" }}>
              Informe o período final para análise de compra
            </h4>

            <Calendar
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataFinalCompra(e.target.value)}
              value={dataFinalCompra}
            ></Calendar>
          </div>
        </div>
        <div>
          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>
              Informe o período inicial para análise de venda
            </h4>

            <Calendar
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataInicialVenda(e.target.value)}
              value={dataInicialVenda}
            ></Calendar>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>
              Informe o período final para análise de venda
            </h4>

            <Calendar
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataFinalVenda(e.target.value)}
              value={dataFinalVenda}
            ></Calendar>
          </div>
        </div>
        <div>
          <Button
            loading={loading}
            style={{ marginTop: "30px" }}
            icon="pi pi-search"
            label={loading ? "Analisando..." : "Pesquisar"}
            className="p-button-lg p-button-success p-button-rounded"
            onClick={analisar}
          />
        </div>
      </div>
      <div className="tabela">
        <DataTable
          selectionMode="single"
          loading={loading}
          value={produtos}
          style={{
            width: "100%",
            borderRadius: "20px",
            border: "20px solid #FFF",
            alignItems: "center",
          }}
          emptyMessage="Sem dados "
          responsiveLayout="stack"
          breakpoint="960px"
          rowGroupMode="subheader"
          groupRowsBy="produto"
          sortMode="single"
          sortField="produto"
          sortOrder={1}
        >
          <Column
            field={data_inclusao_template}
            header="Data de entrada"
          ></Column>

          <Column field={EanOrCodigo} header="Código"></Column>

          <Column field="produto" header="Produto"></Column>

          <Column field={cfop_template} header="CFOP"></Column>

          <Column body={botaoAddTemplate}></Column>

          <Column
            field="rating"
            header="Classificação"
            body={giroTemplate}
          ></Column>

          <Column
            field={valor_unitario_template}
            header="Custo unitário"
          ></Column>

          <Column
            field={quantidade_comprada_template}
            header="Qtde compra"
          ></Column>

          <Column
            field={total_comprado_template}
            header="Total comprado"
          ></Column>

          <Column field={preco_media_venda_template}></Column>

          <Column
            field={quantidade_vendida_template}
            header="Qtde venda"
          ></Column>

          <Column field={total_template} header="Total vendido"></Column>
        </DataTable>
      </div>
    </>
  );
}
