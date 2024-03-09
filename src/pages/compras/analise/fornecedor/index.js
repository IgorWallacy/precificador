import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

import "./styles.css";
import TextTransition, { presets } from "react-text-transition";
import { PedidoListaSidebar } from "./lista-pedidos-sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";

import { Messages } from "primereact/messages";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import { addLocale } from "primereact/api";

import { Column } from "primereact/column";
//import { Tooltip } from "primereact/tooltip";

import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";

import { Toolbar } from "primereact/toolbar";

import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

import moment from "moment";

import api from "../../../../services/axios";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import { useReactToPrint } from "react-to-print";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function AnaliseFornecedor() {
  const location = useLocation();
  const pedidoData = location.state;

  const TEXTS = [
    "Analisando",
    "Aguarde por favor",
    "Calculando sugestões",
    "Buscando dados",
  ];

  const [filial, setFilial] = useState(1);
  const [index, setIndex] = React.useState(0);
  const msgs1 = useRef(null);
  const [selectedProductsPedido, setSelectedProductsPedido] = useState([]);
  const [editDialog, setEditDialog] = useState(false);
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
    today: " Hoje ",
    clear: " Limpar ",
  });
  const navigate = useNavigate();

  const [observacao, setObservacao] = useState(null);
  const [pedidoCodigo, setPedidoCodigo] = useState(null);
  const [comprador, setComprador] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [dataInicialCompra, setDataInicialCompra] = useState(
    new Date(new Date().setDate(new Date().getDate() - 90))
  );
  const [dataFinalCompra, setDataFinalCompra] = useState(new Date());
  // const [dataInicialVenda, setDataInicialVenda] = useState(new Date());
  const [diasVenda, setDiasVenda] = useState(90);
  const [dataFinalVenda, setDataFinalVenda] = useState();
  const [fornecedor, setFornecedor] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [compradores, setCompradores] = useState([]);

  const [lojas, setLojas] = useState([]);
  const [fator, setFator] = useState(1);

  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [displayDialog, setDisplayDialog] = useState(false);

  const [unidadeMedidaLista, setUnidadeMedidaLista] = useState([]);

  const [condicaoPagamento, setCondicaoPagamento] = useState(null);
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [prazoEntrega, setPrazoEntrega] = useState();

  const toast = useRef(null);
  const toast2 = useRef(null);
  const toast3 = useRef(null);

  const [idPedido, setIdPedido] = useState(null);

  const [totalPedido, setTotalPedido] = useState(0);

  const [produtoPorFilialLista, setProdutoPorFilialLista] = useState([]);

  const [loadingLojas, setLoadingLojas] = useState(false);

  const [checked, setChecked] = useState(false);
  const [dataEmissao, setDataEmissao] = useState(null);

  const linhas = useRef(5);

  const [dialogSelectedProductsAtualizar, setDialogSelectedProductsAtualizar] =
    useState(false);

  let eanUrl = "https://cdn-cosmos.bluesoft.com.br/products";

  let params = useParams();

  const tabelaRef = useRef();

  const handlePrint = useReactToPrint({
    pageStyle: `@media print {
      @page {
        size: 500mm 500mm;
        margin: 5;
      }
    }`,
    onBeforeGetContent: () => (linhas.current = 9999),
    content: () => tabelaRef.current,
    onAfterPrint: () => (linhas.current = 5),
  });

  const imprimir = () => {
    if (linhas.current === 9999) {
      handlePrint();
    } else {
      linhas.current = 9999;
      toast.current.show({
        severity: "info",
        summary: "Aviso",
        detail: "Tabela ajustada, Imprima novamente! ",
        life: 3000,
      });
    }
  };

  const getPedidos = () => {
    if (pedidoData?.data) {
      setPedidoCodigo(pedidoData?.data?.codigo);
      setFornecedor(pedidoData?.data?.fornecedor);
      setFilial([{ id: pedidoData?.data?.idfilial }]);
      setPrazoEntrega(pedidoData?.data?.prazoEntrega);
      setCondicaoPagamento(pedidoData?.data?.condicaoPagamento);
      setObservacao(pedidoData?.data?.observacao);
      setDataEmissao(pedidoData?.data?.dataEmissao);
      setComprador(pedidoData?.data?.comprador);
    } else {
      if (idPedido) {
        api
          .get(`/api/pedido/compra/${idPedido}`)
          .then((r) => {
            setPedidoCodigo(r?.data?.codigo);
            setFornecedor(r.data.fornecedor);
            setFilial([{ id: filial }]);
            setPrazoEntrega(r.data.prazoEntrega);
            setCondicaoPagamento(r.data.condicaoPagamento);
            setDataEmissao(r?.data?.dataEmissao);
            setObservacao(r?.data?.observacao);
            setComprador(r?.data?.comprador);
          })
          .catch((e) => {
            //  console.log(e);
          });
      }
    }
  };

  const getUnidadeMedida = () => {
    api
      .get("/api/unidademedida")
      .then((r) => {
        setUnidadeMedidaLista(r.data);
      })
      .catch((e) => {});
  };

  const getFornecedores = () => {
    setLoading(true);

    api
      .get(`/api/entidade/fornecedores/`)
      .then((r) => {
        setFornecedores(r.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error.message}`,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getCompradores = () => {
    api
      .get(`/api/entidade/compradores/`)
      .then((r) => {
        setCompradores(r.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `Erro ao listar compradores ${error.message}`,
        });
      })
      .finally(() => {});
  };

  const getCondficaoPagamento = () => {
    setLoading(true);

    api
      .get("/api/condicaopagamento/todas")
      .then((r) => {
        setCondicoesPagamento(r.data);
      })
      .catch((error) => {
        toast.show({
          severity: "error",
          summary: "Erro",
          detail: `${error.message}`,
        });
      })
      .finally(setLoading(false));
  };

  const getLojasSelecionada = () => {
    if (pedidoData) {
      api
        .get(`/api/filial/${pedidoData?.data?.idfilial}`)
        .then((r) => {
          setFilial(r.data);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${error.message}`,
          });
        });
    }
  };

  const getLojas = () => {
    setLoading(true);
    api
      .get("/api/filial")
      .then((r) => {
        setLojas(r.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error.message}`,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const total_template = (rowData) => {
    let total = rowData.quantidade_vendida * rowData.preco_medio_venda;
    let totalF = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
    return (
      <>
        <font color="green" style={{ fontSize: "1rem", fontWeight: "800" }}>
          {" "}
          {totalF}{" "}
        </font>
      </>
    );
  };

  const EanOrCodigoPedido = (rowData) => {
    //console.log(rowData);
    if (rowData?.idproduto?.ean) {
      return (
        <>
          <div>{rowData?.idproduto?.ean} </div>
          <div>
            <img
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${rowData?.idproduto?.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={rowData?.idproduto?.ean}
            />
          </div>
        </>
      );
    } else {
      return rowData?.idproduto?.codigo;
    }
  };

  const finalizarPedido = () => {
    api
      .post(`/api/pedido/compra/salvar`, {
        id: idPedido,
        codigo: pedidoCodigo ? pedidoCodigo : idPedido,
        idfilial: filial?.id,
        fornecedor: fornecedor,
        condicaoPagamento: condicaoPagamento,
        prazoEntrega: prazoEntrega,
        total: totalPedido,
        observacao: observacao,
        dataEmissao: dataEmissao ? dataEmissao : moment().format("YYYY-MM-DD"),
        comprador: comprador,
      })
      .then((r) => {
        setIdPedido(null);

        setPedidos([]);
        setCondicaoPagamento(null);
        setFornecedor(null);
        setDisplayDialog(false);
        setProdutos([]);
        setPrazoEntrega(null);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Pedido finalizado!",
          life: 3000,
        });
        setTimeout(() => {
          // console.log("Delayed for 1 second.");
          navigate("/compras/consulta");
        }, "1000");
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao finalizar pedido ",
          life: 3000,
        });
      });
  };

  const leftContents = () => {
    return (
      <>
        <Button
          disabled={idPedido ? false : true}
          style={{ margin: "5px" }}
          icon="pi pi-cloud-upload"
          className="p-button p-button-success p-button-rounded"
          label="Gravar pedido"
          onClick={() => finalizarPedido()}
        />
      </>
    );
  };

  const rightContents = () => {
    return (
      <>
        {idPedido ? (
          <>
            {" "}
            <Button
              disabled={selectedProductsPedido.length > 0 ? false : true}
              label="Deletar selecionados"
              className="p-button p-button-rounded p-button-danger"
              icon="pi pi-times"
              style={{ marginRight: "10px" }}
              onClick={() => deletarProdutoPedidoMassa(selectedProductsPedido)}
            />
            <Button
              label="Imprimir"
              className="p-button p-button-rounded p-button-secondary"
              icon="pi pi-print"
              style={{ marginRight: "10px" }}
              onClick={() => imprimir()}
            />
          </>
        ) : (
          <></>
        )}
      </>
    );
  };

  const getItensPedido = () => {
    if (params.id || idPedido) {
      api
        .get(
          `/api/pedido/compra/itens/pedidoId/${
            params.id ? params.id : idPedido
          }`
        )
        .then((r) => {
          //   console.log(r.data);
          setLoading3(true);
          setPedidos(r.data);
        })
        .catch((error) => {
          // console.log(error.data);

          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${error.data}`,
            life: 3000,
          });
        })
        .finally((f) => {
          setLoading3(false);
        });
    }
  };

  const gravarPedido = () => {
    //  let pedido = JSON.stringify(fornecedorPedido);
    if (
      fornecedor === null ||
      condicaoPagamento === null ||
      prazoEntrega === null ||
      filial === null ||
      comprador === null
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Informe o fornecedor, o comprador, condição de pagamento e prazo para entrega `,
        life: 3000,
      });
    } else {
      api
        .post(`/api/pedido/compra/salvar`, {
          id: idPedido ? idPedido : "",
          codigo: pedidoCodigo ? pedidoCodigo : "",
          idfilial: filial.id,
          fornecedor: fornecedor,
          condicaoPagamento: condicaoPagamento,
          prazoEntrega: prazoEntrega,
          dataEmissao: moment().format("YYYY-MM-DD"),
          comprador: comprador,
        })
        .then((r) => {
          //   console.log(r.data);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Pedido ${r.data.id} criado!`,
            life: 3000,
          });
          setIdPedido(r.data.id);
          setPedidoCodigo(r.data.id);
          setDisplayDialog(false);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `Erro ao criar o pedido ${error.data} `,
            life: 3000,
          });
        });
    }
  };

  const alterarPedido = (data) => {
    if (
      fornecedor === null ||
      condicaoPagamento === null ||
      prazoEntrega === null ||
      filial === null
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Informe o fornecedor, condição de pagamento e prazo para entrega `,
        life: 3000,
      });
    } else {
      api
        .post(`/api/pedido/compra/salvar`, {
          id: data?.id,
          codigo: data?.codigo,
          idfilial: filial?.id ? filial.id : pedidoData?.data?.idfilial,
          fornecedor: fornecedor,
          condicaoPagamento: condicaoPagamento,
          prazoEntrega: prazoEntrega,
          total: totalPedido,
          observacao: observacao,
          dataEmissao: dataEmissao,
          comprador: comprador,
        })
        .then((r) => {
          //   console.log(r.data);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Pedido ${r.data.id} alterado! `,
            life: 3000,
          });
          setIdPedido(r.data.id);
          setDisplayDialog(false);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `Erro ao criar o pedido ${error.data} `,
            life: 3000,
          });
        });
    }
  };

  const itemTemplate = (option) => {
    return (
      <>
        <div>
          {" "}
          <i className="pi pi-users"></i> {option.codigo} - {option.nome}{" "}
        </div>
      </>
    );
  };

  const precoPedidoLinhaTotal = (rowData) => {
    let total = rowData.preco * rowData.quantidade;

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
  };

  let footerGroupPedido = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total:"
          colSpan={5}
          footerStyle={{ textAlign: "right" }}
        />
        <Column colSpan={6} footer={() => totalizarPedido()} />
      </Row>
    </ColumnGroup>
  );

  const precoPedido = (rowData) => {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco);
  };

  const deletarProdutoPedido = (rowData) => {
    api
      .delete(`/api/pedido/compra/deletar/${rowData.id}`)
      .then((r) => {
        toast2.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: `Produto ${rowData.idproduto.nome} deletado com sucesso !`,
          life: 3000,
        });
      })
      .catch((e) => {
        toast2.current.show({
          severity: "error",
          summary: "Erro",
          detail: `Erro ao deletar ${e.message}`,
          life: 3000,
        });
      })
      .finally(() => {
        getItensPedido();
        // getItensPedidoProduto(produtoSelecionado[0]);
      });
  };

  const deletarProdutoPedidoMassa = (rowData) => {
    rowData.map((m) => {
      api
        .delete(`/api/pedido/compra/deletar/${m.id}`)
        .then((r) => {
          toast2.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Produto(s) deletado(s) com sucesso  !`,
            life: 3000,
          });
          setSelectedProductsPedido([]);
        })
        .catch((e) => {
          toast2.current.show({
            severity: "error",
            summary: "Erro",
            detail: `Erro ao deletar ${e.message}`,
            life: 3000,
          });
        })
        .finally(() => {
          getItensPedido();
        });
    });
  };

  const deletarItemPedido = (rowData) => {
    //  console.log(rowData);
    return (
      <>
        <Button
          //  label="Excluir"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => deletarProdutoPedido(rowData)}
        />
      </>
    );
  };

  const totalizarPedido = () => {
    let t = 0;
    for (let p of pedidos) {
      t += p?.quantidade * p?.preco;
    }

    let tF = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(t);
    setTotalPedido(t);
    return tF;
  };

  const getIdPedidoUrl = () => {
    setIdPedido(params.id);
    getItensPedido(params.id);
  };

  useEffect(() => {
    getIdPedidoUrl();
    getCompradores();
    getPedidos();
    getUnidadeMedida();
    getFornecedores();
    getLojas();
    getLojasSelecionada();
    getCondficaoPagamento();

    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      3000 // every 3 seconds
    );
    return () => clearTimeout(intervalId);
  }, []);

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      <Toast ref={toast3} position="bottom" />
      <Messages ref={msgs1} />
      <Header />

      <Footer />
      {/*
      <Button
        icon="pi pi-shopping-cart"
        label={`${idPedido ? "Pedido " + idPedido : ""} `}
        className="botao-add-colado"
        onClick={() => setVisibleLeft(true)}
      />
  */}
      <div
        style={{ backgroundColor: "#969FE0", borderRadius: "50px" }}
        ref={tabelaRef}
      >
        {displayDialog ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignContent: "center",
                justifyContent: "space-evenly",
                gap: "10px",
                color: "#FFF",
                flexWrap: "wrap",
              }}
            >
              {fornecedor?.leadttimecompra ? (
                <>
                  <h1>Lead Time {fornecedor.leadttimecompra} dias </h1>
                </>
              ) : (
                <></>
              )}
              <div className="fornecedor-input">
                <h4>Selecione uma loja </h4>
                <Dropdown
                  //  disabled={idPedido ? true : false}
                  required
                  style={{ width: "100%", margin: "10px 0px" }}
                  placeholder={pedidoData?.data?.idfilial}
                  value={filial}
                  options={lojas}
                  optionLabel="nome"
                  itemTemplate={itemTemplate}
                  filter
                  showClear
                  filterBy="nome,codigo"
                  onChange={(e) => {
                    console.log(e.target.value);
                    setFilial(e.target.value);
                  }}
                />
              </div>
              <div className="fornecedor-input">
                <h4>Selecione um comprador </h4>
                <Dropdown
                  //  disabled={idPedido ? true : false}
                  required
                  style={{ width: "100%", margin: "10px 0px" }}
                  placeholder="Selecione um comprador"
                  value={comprador}
                  options={compradores}
                  optionLabel="nome"
                  //   itemTemplate={itemTemplate}
                  filter
                  showClear
                  filterBy="nome,codigo"
                  onChange={(e) => {
                    setComprador(e.target.value);
                  }}
                />
              </div>
              <div className="fornecedor-input">
                <h4>Selecione um fornecedor </h4>
                <Dropdown
                  //  disabled={idPedido ? true : false}
                  required
                  style={{ width: "100%", margin: "10px 0px" }}
                  placeholder="Selecione um fornecedor"
                  value={fornecedor}
                  options={fornecedores}
                  optionLabel="nome"
                  itemTemplate={itemTemplate}
                  filter
                  showClear
                  filterBy="nome,codigo"
                  onChange={(e) => {
                    setFornecedor(e.target.value);
                  }}
                />
              </div>
              <div className="fornecedor-input">
                <h4>Informe um prazo para entrega</h4>
                <Calendar
                  placeholder={moment(prazoEntrega).format("DD/MM/YYYY")}
                  //  mask="99/99/9999"
                  showIcon
                  showButtonBar
                  locale="pt-BR"
                  dateFormat="dd/mm/yy"
                  style={{ width: "100%", margin: "10px 0px" }}
                  value={prazoEntrega}
                  onChange={(e) => setPrazoEntrega(e.value)}
                />
              </div>
              <div className="fornecedor-input">
                <h4>Informe uma condição de pagamento</h4>
                <Dropdown
                  style={{ width: "100%", margin: "10px 0px" }}
                  filter
                  value={condicaoPagamento}
                  // optionValue="id"
                  options={condicoesPagamento}
                  optionLabel="descricao"
                  onChange={(e) => setCondicaoPagamento(e.value)}
                  placeholder="Selecione uma condição de pagamento"
                />
              </div>
              <div className="fornecedor-input">
                <Button
                  // disabled={idPedido ? true : false}
                  style={{ width: "100%", margin: "10px 0px" }}
                  icon="pi pi-save"
                  className="p-button p-button-success p-button-rounded p-button-md"
                  label={idPedido ? `Alterar pedido ` + idPedido : "Gravar"}
                  onClick={() => alterarPedido(pedidoData?.data)}
                />
                <Button
                  style={{ margin: "5px" }}
                  label="Cancelar alteração"
                  icon="pi pi-times"
                  className="p-button p-button-rounded p-button-danger"
                  onClick={() => {
                    setDisplayDialog(false);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                padding: "1rem",
                color: "#ffff",
              }}
            >
              <h1
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "cabin-sketch-regular",
                  fontWeight: "400",
                  fontSize: "50px",
                }}
              >
                Pedido de compra
                {idPedido ? (
                  <>
                    #{pedidoCodigo} - Fornecedor {fornecedor?.codigo} -{" "}
                    {fornecedor?.nome}{" "}
                    <Button
                      style={{ margin: "5px" }}
                      label="Alterar"
                      icon="pi pi-pencil"
                      className="p-button p-button-rounded p-button-primary"
                      onClick={() => {
                        setDisplayDialog(true);
                        setFornecedor(fornecedor);
                        getLojasSelecionada();
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </h1>

              <Dialog
                visible={loading}
                closable={false}
                header="Aguarde por favor"
              >
                <h1
                  style={{
                    fontFamily: "cabin-sketch-bold",
                    fontWeight: "400",
                    fontSize: "45px",
                  }}
                >
                  <TextTransition springConfig={presets.wobbly}>
                    {TEXTS[index % TEXTS.length]}
                  </TextTransition>
                </h1>
              </Dialog>

              {idPedido ? (
                <>
                  <div>
                    {fornecedor?.leadttimecompra ? (
                      <>
                        <h1>Lead Time {fornecedor.leadttimecompra} dias </h1>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignContent: "center",
                      justifyContent: "space-evenly",
                      gap: "15px",
                      color: "#FFF",
                    }}
                  >
                    {fornecedor?.leadttimecompra ? (
                      <>
                        <h1>Lead Time {fornecedor.leadttimecompra} dias </h1>
                      </>
                    ) : (
                      <></>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div className="fornecedor-input">
                        <h4>Selecione uma loja </h4>

                        <Dropdown
                          //  disabled={idPedido ? true : false}
                          required
                          style={{ width: "100%", margin: "10px 0px" }}
                          placeholder="Selecione uma loja"
                          value={filial}
                          options={lojas}
                          optionLabel="nome"
                          itemTemplate={itemTemplate}
                          filter
                          showClear
                          filterBy="nome,codigo"
                          onChange={(e) => {
                            setFilial(e.target.value);
                          }}
                        />
                      </div>
                      <div className="fornecedor-input">
                        <h4>Selecione o comprador </h4>
                        <Dropdown
                          disabled={idPedido ? true : false}
                          required
                          style={{ width: "100%", margin: "10px 0px" }}
                          placeholder="Selecione o comprador"
                          value={comprador}
                          options={compradores}
                          optionLabel="nome"
                          // itemTemplate={itemTemplate}
                          filter
                          showClear
                          filterBy="nome,codigo"
                          onChange={(e) => {
                            setComprador(e.target.value);
                          }}
                        />
                      </div>
                      <div className="fornecedor-input">
                        <h4>Selecione um fornecedor </h4>
                        <Dropdown
                          disabled={idPedido ? true : false}
                          required
                          style={{ width: "100%", margin: "10px 0px" }}
                          placeholder="Selecione um fornecedor"
                          value={fornecedor}
                          options={fornecedores}
                          optionLabel="nome"
                          itemTemplate={itemTemplate}
                          filter
                          showClear
                          filterBy="nome,codigo"
                          onChange={(e) => {
                            setFornecedor(e.target.value);
                          }}
                        />
                      </div>
                      <div className="fornecedor-input">
                        <h4>Informe um prazo para entrega</h4>
                        <Calendar
                          placeholder="Informe o prazo para entrega"
                          // mask="99/99/9999"
                          showIcon
                          showButtonBar
                          locale="pt-BR"
                          dateFormat="dd/mm/yy"
                          style={{ width: "100%", margin: "10px 0px" }}
                          value={prazoEntrega}
                          onChange={(e) => {
                            setPrazoEntrega(e.target.value);
                          }}
                        />
                      </div>
                      <div className="fornecedor-input">
                        <h4>Informe uma condição de pagamento</h4>
                        <Dropdown
                          style={{ width: "100%", margin: "10px 0px" }}
                          filter
                          value={condicaoPagamento}
                          // optionValue="id"
                          options={condicoesPagamento}
                          optionLabel="descricao"
                          onChange={(e) => setCondicaoPagamento(e.value)}
                          placeholder="Selecione uma condição de pagamento"
                        />
                      </div>
                      <div className="fornecedor-input">
                        <Button
                          disabled={idPedido ? true : false}
                          style={{ width: "100%", margin: "10px 0px" }}
                          icon="pi pi-save"
                          className="p-button p-button-success p-button-rounded p-button-md"
                          label={
                            idPedido
                              ? `Pedido número ` +
                                idPedido +
                                ` criado, adicione os itens a lista do pedido`
                              : "Gravar "
                          }
                          onClick={() => gravarPedido()}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <Toast ref={toast2} position="bottom-center" />
        <Messages ref={msgs1} />
        <div
          //ref={tabelaRef}
          style={{ width: "100%", backgroundColor: "#f2f2f2" }}
        >
          <Toolbar right={leftContents} left={rightContents} />
          <div style={{ width: "100%" }}>
            {idPedido ? (
              <>
                <PedidoListaSidebar
                  linhas={linhas}
                  idPedido={idPedido}
                  filial={filial}
                  editDialog={editDialog}
                  setEditDialog={setEditDialog}
                  checked={checked}
                  dialogSelectedProductsAtualizar={
                    dialogSelectedProductsAtualizar
                  }
                  setDialogSelectedProductsAtualizar={
                    setDialogSelectedProductsAtualizar
                  }
                  selectedProductsPedido={selectedProductsPedido}
                  setSelectedProductsPedido={setSelectedProductsPedido}
                  setLoadingLojas={setLoadingLojas}
                  fornecedor={fornecedor}
                  dataInicialCompra={dataInicialCompra}
                  dataFinalCompra={dataFinalCompra}
                  dataFinalVenda={dataFinalVenda}
                  msgs1={msgs1}
                  loadingLojas={loadingLojas}
                  produtoPorFilialLista={produtoPorFilialLista}
                  totalPedido={totalPedido}
                  diasVenda={diasVenda}
                  total_template={total_template}
                  lojas={lojas}
                  getItensPedido={getItensPedido}
                  pedidos={pedidos}
                  footerGroupPedido={footerGroupPedido}
                  loading3={loading3}
                  EanOrCodigoPedido={EanOrCodigoPedido}
                  precoPedido={precoPedido}
                  precoPedidoLinhaTotal={precoPedidoLinhaTotal}
                  deletarItemPedido={deletarItemPedido}
                  unidadeMedidaLista={unidadeMedidaLista}
                />

                <Card
                  header={
                    <>
                      <h4>Observação</h4>
                    </>
                  }
                  style={{ margin: "1rem", padding: "10px" }}
                >
                  <InputTextarea
                    style={{ width: "100%" }}
                    autoResize
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={10}
                    cols={50}
                  />
                </Card>

                <Card  footer={<h4>Pedido emitido em {moment(pedidoData?.data?.dataEmissao).format("DD/MM/YYYY")}</h4>} style={{ padding: "1rem", margin: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems:'center',
                      justifyContent:'space-evenly',
                      padding: "1rem",
                      margin: "10px",
                      gap : '20px'
                    }}
                  >
                    <div style={{width:'45%'}}>
                      <hr />
                      <h4>Comprador</h4>
                    </div>
                    <div style={{width:'45%'}}>
                      <hr />
                      <h4>Vendedor</h4>
                    </div>
                    
                  </div>
                 
                </Card>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
