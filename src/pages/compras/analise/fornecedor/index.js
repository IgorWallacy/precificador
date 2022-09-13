import React, { useEffect, useState, useRef } from "react";

import "./styles.css";

import { AdicionarProduto } from "./adicionar-produto";
import { exibirPedido } from "./imprimir-pedido";
import { PedidoListaSidebar } from "./lista-pedidos-sidebar";
import { useNavigate, useParams } from "react-router-dom";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
//import { Tooltip } from "primereact/tooltip";
import { TabMenu } from "primereact/tabmenu";
import { Rating } from "primereact/rating";
import { Sidebar } from "primereact/sidebar";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import { FilterMatchMode } from "primereact/api";
import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";
import { Badge } from "primereact/badge";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

import { FaGift } from "react-icons/fa";

import moment from "moment";

import api from "../../../../services/axios";

import ReactLoading from "react-loading";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import TextTransition, { presets } from "react-text-transition";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function AnaliseFornecedor() {
  const TEXTS = [
    "Calculando sugestões ...",
    "Processando ...",
    "Aguarde por favor ...",
    "Processando ...",
    "Adicionando produtos a lista",
  ];

  const [index, setIndex] = React.useState(0);
  const msgs1 = useRef(null);
  const [selectedProductsPedido, setSelectedProductsPedido] = useState([]);

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

  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [globalFilterValue3, setGlobalFilterValue3] = useState("");
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
  const [fornecedores, setFornecedores] = useState([""]);

  const [lojas, setLojas] = useState([""]);
  const [fator, setFator] = useState(1);

  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [visibleLeft, setVisibleLeft] = useState(false);
  const [displayDialog, setDisplayDialog] = useState(false);

  const [unidadeMedida, setUnidadeMedida] = useState(null);
  const [unidadeMedidaLista, setUnidadeMedidaLista] = useState([]);

  const [produto, setProduto] = useState([""]);
  const [quantidade, setQuantidade] = useState(0);

  const [preco, setPreco] = useState(0);
  const [total, setTotal] = useState(0);

  const [condicaoPagamento, setCondicaoPagamento] = useState([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [prazoEntrega, setPrazoEntrega] = useState(null);

  const [loadingAddPedido, setLoadingAddPedido] = useState(false);

  const toast = useRef(null);
  const toast2 = useRef(null);
  const toast3 = useRef(null);

  const [dialogDuplicatas, setDialogDuplicatas] = useState(false);
  const [duplicatas, setDuplicatas] = useState([]);

  const [tempoDiasPedido, setTempoDiasPedido] = useState(30);
  const [tempoDiasEntrega, settempoDiasEntrega] = useState(1);
  const [margemErroDiasEntrega, setMargemErroDiasEntrega] = useState(1);

  const [idPedido, setIdPedido] = useState(null);

  const [totalPedido, setTotalPedido] = useState(0);

  const [filialDuplicata, setFilialDuplicata] = useState(null);

  const [produtoPorFilialLista, setProdutoPorFilialLista] = useState([]);

  const [loadingLojas, setLoadingLojas] = useState(false);

  const [lojaSelecionada, setLojaSelecionada] = useState(null);

  const [loading2, setLoading2] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [dialogSelectedProducts, setDialogSelectedProducts] = useState(false);

  const [dialogSelectedProductsAtualizar, setDialogSelectedProductsAtualizar] =
    useState(false);

  const matchModes = [
    {
      label: "Maior ou igual que...",
      value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    },
    {
      label: "Menor ou igual que...",
      value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
    },
  ];

  const clearMessages = () => {
    msgs1.current.clear();
  };

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    quantidade_vendida: {
      value: null,
      matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    },
    quantidade_comprada: {
      value: null,
      matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    },
    saldo_estoque: {
      value: null,
      matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    },
    produto: { value: null, matchMode: FilterMatchMode.CONTAINS },
    codigo: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numeronfultcompra: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [filters3, setFilters3] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    idfilial: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const [produtoSelecionado, setProdutoSelecionado] = useState([]);

  const [itemPorPedido, setItemPorPedido] = useState([]);

  let eanUrl = "https://cdn-cosmos.bluesoft.com.br/products";

  let params = useParams();

  const getItensPedidoProduto = (data) => {
    setLoading2(true);
    setItemPorPedido([]);
    api
      .get(`/api/pedido/compra/itens/pedidoId/${idPedido}/${data.id}`)
      .then((r) => {
        setItemPorPedido(r.data);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoading2(false);
      });
  };

  const getPedidos = (id) => {
    if (id) {
      api
        .get(`/api/pedido/compra/${id}`)
        .then((r) => {
          setFornecedor(r.data.fornecedor);
          setPrazoEntrega(r.data.prazoEntrega);
          setCondicaoPagamento(r.data.condicaoPagamento);
        })
        .catch((e) => {
          //  console.log(e);
        });
    }
  };

  const getDuplicatas = () => {
    api
      .get(
        `/api/documentos/apagar/hoje/${
          filialDuplicata ? filialDuplicata.codigo : 0
        }`
      )
      .then((r) => {
        setDuplicatas(r.data);
        // console.log(r.data)
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error.data}`,
        });
      })
      .finally(() => {});
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
          detail: `${error.data}`,
        });
      })
      .finally(() => {
        setLoading(false);
      });
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
          detail: `${error.data}`,
        });
      })
      .finally(setLoading(false));
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
          detail: `${error.data}`,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const analisar = () => {
    setLoading(true);

    setDataFinalVenda(new Date());

    if (
      !dataInicialCompra ||
      !dataFinalCompra ||
      !fornecedor ||
      //  !dataInicialVenda ||
      //  !dataFinalVenda ||
      !diasVenda
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Preencha todos os campos",
      });
      setLoading(false);
    } else {
      //console.log(filial);
      api
        .post(
          `/api_react/compras/produtos/${moment(dataInicialCompra).format(
            "YYYY-MM-DD"
          )}/${moment(dataFinalCompra).format("YYYY-MM-DD")}/${
            fornecedor.id
          }/${moment(moment.now())
            .subtract(diasVenda, "days")
            .format("YYYY-MM-DD")}/${moment(dataFinalVenda).format(
            "YYYY-MM-DD"
          )}`
        )
        .then((r) => {
          setProdutos(r.data);
          // console.log(r.data);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${error.data}`,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const venda_diaria_template = (rowData) => {
    let total = rowData.quantidade_vendida;
    let venda_diaria = total / diasVenda;
    let totalF = Intl.NumberFormat("pt-BR", {
      style: "decimal",
      maximumFractionDigits: 2,
      maximumSignificantDigits: 2,
    }).format(venda_diaria);

    return (
      <>
        <h4 style={{ color: "green" }}>
          {totalF}
          {rowData.unidade_venda}
        </h4>
      </>
    );
  };

  const sugestao_quantidade_compra = (rowData) => {
    let total = rowData.quantidade_vendida;
    let venda_diaria = total / diasVenda;

    let qtdeAComprar =
      venda_diaria *
      (tempoDiasPedido + tempoDiasEntrega + margemErroDiasEntrega);

    let totalF = Intl.NumberFormat("pt-BR", {
      style: "decimal",
      maximumFractionDigits: 3,
      maximumSignificantDigits: 3,
    }).format(qtdeAComprar);

    return (
      <>
        <font style={{ fontSize: "18px" }} color="red">
          <b>{totalF}</b>
          {rowData.unidade_venda}
        </font>
        <h4 style={{ color: "red" }}> </h4>
      </>
    );
  };

  const total_comprado_template = (rowData) => {
    let total_comprado =
      rowData.ultimoprecocompra *
      (rowData.embalagem === 0 ? rowData.embalagem : rowData.quantidade_compra);

    let total = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total_comprado);
    return (
      <>
        <font style={{ fontSize: "1rem", color: "red", fontWeight: "800" }}>
          {total}
        </font>
      </>
    );
  };

  const total_comprado_template_02 = (rowData) => {
    let total_comprado =
      rowData.ultimoprecocompra *
      (rowData.embalagem === 0
        ? rowData.embalagem
        : rowData.quantidade_comprada);

    let total = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total_comprado);
    return (
      <>
        <font style={{ fontSize: "1rem", color: "red", fontWeight: "800" }}>
          {total}
        </font>
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
        <font color="green" style={{ fontSize: "1rem", fontWeight: "800" }}>
          {preco_medio_venda}{" "}
        </font>{" "}
      </>
    );
  };
  const valor_unitario_template = (rowData) => {
    let valor_unitario = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.ultimoprecocompra);
    return (
      <>
        <font style={{ fontSize: "1rem", color: "red", fontWeight: "800" }}>
          <h4>{valor_unitario}</h4>
        </font>{" "}
      </>
    );
  };

  const quantidade_comprada_template = (rowData) => {
    //console.log(rowData);
    let embalagem = Intl.NumberFormat("pt-BR", {
      style: "decimal",
    }).format(rowData.embalagem);
    return (
      <>
        <font color="red" style={{ fontWeight: "800" }}>
          {rowData.quantidade_compra * rowData.embalagem}
          {rowData.unidade_venda}
          <br />
          Embalagem <br />
          {rowData.quantidade_compra}
          {rowData.unidade_compra} ( {embalagem} )
        </font>
      </>
    );
  };

  const quantidade_comprada_template_02 = (rowData) => {
    return (
      <>
        <font color="red" style={{ fontWeight: "800" }}>
          {rowData.quantidade_comprada ? rowData.quantidade_comprada : 0}
          {rowData.unidade_venda}
          <br />
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
        <font color="green" style={{ fontSize: "1rem", fontWeight: "800" }}>
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
        <font color="green" style={{ fontSize: "1rem", fontWeight: "800" }}>
          {" "}
          {totalF}{" "}
        </font>
      </>
    );
  };
  const data_inclusao_template = (rowData) => {
    return (
      <>
        <div>
          Nº {rowData.numeronfultcompra}
          <br />
          Chegou dia{" "}
          {moment(rowData.data_inclusao).format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </>
    );
  };

  const giroTemplate = (rowData) => {
    let totalEstrelas =
      (rowData.quantidade_vendida /
        (rowData.quantidade_comprada <= 0
          ? rowData.quantidade_vendida
          : rowData.quantidade_comprada)) *
      5;

    return (
      <>
        {totalEstrelas.toFixed(2)}
        <Rating value={totalEstrelas} stars={5} readOnly cancel={false} />
      </>
    );
  };

  const EanOrCodigo = (rowData) => {
    //console.log(rowData);
    if (rowData?.ean) {
      return (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexWrap: "wrap",
              gap: "1px",
              flexDirection: "column",
            }}
          >
            <div>{rowData?.ean} </div>

            <div>
              <img
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "5px",
                  borderRadius: "25px",
                  padding: "5px",
                }}
                src={`${eanUrl}/${rowData?.ean}`}
                onError={(e) =>
                  (e.target.src =
                    "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
                }
                alt={rowData?.ean}
              />
            </div>
          </div>
        </>
      );
    } else {
      return rowData?.codigo;
    }
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

  const cfop_template = (rowData) => {
    return (
      <>
        {rowData.cfop === "5910" ||
        rowData.cfop === "2910" ||
        rowData.cfop === "1910" ? (
          <>
            <span
              className="cfop-button"
              data-pr-tooltip={rowData.cfop_descricao}
            >
              {rowData.cfop} - Bonificação
              <br />
              <FaGift />
            </span>
          </>
        ) : (
          <>
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

  const openNew = (produto) => {
    setQuantidade(null);
    getItensPedidoProduto(produto);
    setPreco(produto.ultimoprecocompra);
    setDisplayDialog(true);

    linhaSelecionada(produto);
    setProduto({ ...produto });
  };

  const botaoAddTemplate = (rowdata) => {
    //  setProduto({...rowdata})

    return (
      <>
        {idPedido ? (
          <>
            <Button
              disabled={idPedido ? false : true}
              style={{ margin: "5px" }}
              label={idPedido ? "Adicionar" : "Crie um pedido para habilitar"}
              className="p-button-rounded p-button-sm"
              icon="pi pi-shopping-bag"
              //  onClick={() => adicionarProduto(rowdata)}
              onClick={() => openNew(rowdata)}
            />
          </>
        ) : (
          <>
            <h4></h4>
          </>
        )}
      </>
    );
  };

  const hideDialog = () => {
    // setSubmitted(false);
    setProdutoPorFilialLista(null);
    setDisplayDialog(false);
    // setTotal(0);
  };

  const adicionarProduto = (rowData) => {
    if (!quantidade || !preco || !unidadeMedida || !fator) {
      toast3.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Existem campos não preenchidos!",
      });
    } else {
      api
        .post(`/api/pedido/compra/salvar/${idPedido}`, {
          idpedido: { id: idPedido },
          idproduto: { id: rowData.id },
          unidadeCompra: { id: unidadeMedida },
          quantidadeVenda: rowData.quantidade_vendida,
          fatorConversao: fator,

          embalagem: Intl.NumberFormat("pt-BR", {}).format(rowData.embalagem),

          quantidade: quantidade,
          filial: { id: lojaSelecionada.id },
          //  quantidade2: quantidade2,
          preco: preco,
          total: total,
        })
        .then((r) => {
          getItensPedido();
          getItensPedidoProduto(rowData);

          toast3.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Produto ${rowData.produto} adicionado a lista `,
            life: 3000,
          });
        })
        .catch((error) => {
          toast3.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${error.data}`,
            life: 3000,
          });
        })
        .finally((f) => {
          // hideDialog();
          setQuantidade(null);
        });

      //  console.log(rowData);
    }
  };

  const adicionarProdutoMassa = (rowData) => {
    if (!lojaSelecionada) {
      toast3.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Selecione uma loja para o pedido",
      });
    } else {
      setLoadingAddPedido(true);
      setLoading3(true);
      rowData.map((m) => {
        api
          .post(
            `/api_react/compras/produtos/${m?.id}/${moment(
              dataInicialCompra
            ).format("YYYY-MM-DD")}/${moment(dataFinalCompra).format(
              "YYYY-MM-DD"
            )}/${fornecedor.id}/${lojaSelecionada.id}/${moment(moment.now())
              .subtract(diasVenda, "days")
              .format("YYYY-MM-DD")}/${moment(dataFinalVenda).format(
              "YYYY-MM-DD"
            )}`
          )
          .then((r) => {
            let total = r.data[0].quantidade_vendida;

            let venda_diaria = total / diasVenda;

            let qtdeAComprar =
              venda_diaria *
              (tempoDiasPedido + tempoDiasEntrega + margemErroDiasEntrega);

            api
              .post(`/api/pedido/compra/salvar/${idPedido}`, {
                idpedido: { id: idPedido },
                idproduto: { id: m.id },
                unidadeCompra: {
                  id: r.data[0].id_unidade_compra
                    ? r.data[0].id_unidade_compra
                    : 30,
                },
                quantidadeVenda: r.data[0].quantidade_vendida,
                fatorConversao: fator,

                embalagem: Intl.NumberFormat("pt-BR", {}).format(
                  m.embalagem ? m.embalagem : 1
                ),

                quantidade: qtdeAComprar.toFixed(),
                filial: { id: lojaSelecionada.id },
                //  quantidade2: quantidade2,
                preco: r.data[0].ultimoprecocompra,
                total: total,
              })
              .then((r) => {
                // getItensPedidoProduto(rowData);

                setLoadingAddPedido(true);
                setLoading3(true);
                setSelectedProducts([]);
                /*  msgs1.current.show({
                  severity: "success",
                  life: 2000,
                  content: (
                    <React.Fragment>
                      <img
                        alt="logo"
                        src={`${eanUrl}/${m?.ean}`}
                        onError={(e) =>
                          (e.target.src =
                            "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
                        }
                        width="32"
                      />
                      <div className="ml-2">
                        {m.produto} adicionado com sucesso
                      </div>
                    </React.Fragment>
                  ), 
                });*/
              })
              .catch((error) => {
                toast.show({
                  severity: "error",
                  summary: "Erro",
                  detail: `${error.data}`,
                });
                msgs1.current.show({
                  severity: "error",
                  life: 2000,
                  content: (
                    <React.Fragment>
                      <img
                        alt="logo"
                        src={`${eanUrl}/${m?.ean}`}
                        onError={(e) =>
                          (e.target.src =
                            "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
                        }
                        width="32"
                      />
                      <div className="ml-2">
                        Não foi possível adicionar {m.produto} a lista,
                        verifique !
                      </div>
                    </React.Fragment>
                  ),
                });
              })
              .finally((f) => {
                setLoadingAddPedido(false);
                getItensPedido();
                setDialogSelectedProducts(false);
                setVisibleLeft(true);
                setSelectedProducts([]);
              });
          })
          .catch((e) => {})
          .finally((f) => {});
      });

      //  console.log(rowData);
      //setDialogSelectedProducts(false);
    }
  };

  const finalizarPedido = () => {
    if (
      fornecedor === null ||
      condicaoPagamento === null ||
      prazoEntrega === null
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
          id: idPedido,
          fornecedor: fornecedor,
          condicaoPagamento: condicaoPagamento,
          prazoEntrega: prazoEntrega,
          total: totalPedido,
          observacao: ``,
        })
        .then((r) => {
          setIdPedido(null);
          setVisibleLeft(false);
          setPedidos([]);
          setCondicaoPagamento(null);
          setFornecedor(null);
          setDisplayDialog(false);
          setProdutos([]);
          setPrazoEntrega(null);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Pedido finalizado",
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
    }
  };

  const leftContents = () => {
    return (
      <>
        <Button
          style={{ margin: "5px" }}
          icon="pi pi-times"
          className="p-button p-button-rounded p-button-danger"
          label="Voltar"
          onClick={() => setVisibleLeft(false)}
        />
        <Button
          disabled={idPedido ? false : true}
          style={{ margin: "5px" }}
          icon="pi pi-cloud-upload"
          className="p-button p-button-success p-button-rounded"
          label="Finalizar"
          onClick={() => finalizarPedido()}
        />
      </>
    );
  };

  const rightContents = () => {
    return (
      <>
        <Button
          disabled={selectedProductsPedido.length > 0 ? false : true}
          label="Deletar selecionados"
          className="p-button p-button-rounded p-button-danger"
          icon="pi pi-times"
          style={{ marginRight: "10px" }}
          onClick={() => deletarProdutoPedidoMassa(selectedProductsPedido)}
        />

        <Button
          disabled={selectedProductsPedido.length > 0 ? false : true}
          label="Atualizar selecionados"
          className="p-button p-button-rounded p-button-success"
          icon="pi pi-refresh"
          style={{ marginRight: "10px" }}
          onClick={() => setDialogSelectedProductsAtualizar(true)}
        />

        {idPedido ? <></> : <></>}
        <Button
          disabled={selectedProductsPedido.length > 0 ? false : true}
          label={`Imprimir produtos selecionados do pedido N° ${idPedido}`}
          style={{ margin: "5px" }}
          icon="pi pi-print"
          className="p-button p-button-warning p-button-rounded"
          onClick={() =>
            exibirPedido({
              selectedProductsPedido,
              idPedido,
              fornecedor,
              condicaoPagamento,
              prazoEntrega,
              totalPedido,
            })
          }
        />
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
      prazoEntrega === null
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
          id: "",
          fornecedor: fornecedor,
          condicaoPagamento: condicaoPagamento,
          prazoEntrega: prazoEntrega,
        })
        .then((r) => {
          //   console.log(r.data);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Pedido ${r.data.id} criado, adicione os itens ao seu pedido `,
            life: 3000,
          });
          setIdPedido(r.data.id);
          setVisibleLeft(false);
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

  const saldo_estoque_template = (rowdata) => {
    let saldo = Intl.NumberFormat("pt-BR", {}).format(rowdata.saldo_estoque);
    return saldo > 0 ? (
      <>
        <div style={{ color: "green", fontWeight: "800" }}>{saldo}</div>
      </>
    ) : (
      <>
        {" "}
        <div style={{ color: "red", fontWeight: "800" }}>{saldo}</div>
      </>
    );
  };

  const headerDataTable = () => renderHeader();

  const onGlobalFilterChange2 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters2(_filters2);
    setGlobalFilterValue2(value);
  };

  const onGlobalFilterChange3 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters3(_filters2);
    setGlobalFilterValue3(value);
  };

  const renderHeader = () => {
    return (
      <>
        <Dialog
          header="Pesquisa global"
          //    visible={exibirDialogPesquisa}
          position="bottom"
          modal={false}
          //    onHide={() => setExibirDialogPesquisa(false)}
        >
          <div className="pesquisa-rapida">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                autoFocus
                value={globalFilterValue2}
                onChange={onGlobalFilterChange2}
                placeholder="Produtos, Fornecedores, Notas"
              />
            </span>
          </div>
        </Dialog>

        <div className="pesquisa-rapida">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue2}
              onChange={onGlobalFilterChange2}
              placeholder="Pesquisa "
            />
          </span>
        </div>
      </>
    );
  };

  const renderHeader2 = () => {
    return (
      <>
        <div className="pesquisa-rapida">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue3}
              onChange={onGlobalFilterChange3}
              placeholder="Pesquisa "
            />
          </span>
        </div>
      </>
    );
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

  const template1 = {
    layout:
      "PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport",
    PrevPageLink: (options) => {
      return (
        <button
          type="button"
          className={options.className}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <span className="p-3">Anterior</span>
          <Ripple />
        </button>
      );
    },
    NextPageLink: (options) => {
      return (
        <button
          type="button"
          className={options.className}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <span className="p-3">Próximo</span>
          <Ripple />
        </button>
      );
    },
    PageLinks: (options) => {
      if (
        (options.view.startPage === options.page &&
          options.view.startPage !== 0) ||
        (options.view.endPage === options.page &&
          options.page + 1 !== options.totalPages)
      ) {
        const className = classNames(options.className, { "p-disabled": true });

        return (
          <span className={className} style={{ userSelect: "none" }}>
            ...
          </span>
        );
      }

      return (
        <button
          type="button"
          className={options.className}
          onClick={options.onClick}
        >
          {options.page + 1}
          <Ripple />
        </button>
      );
    },
    RowsPerPageDropdown: (options) => {
      const dropdownOptions = [
        { label: 3, value: 3 },
        { label: 5, value: 5 },
        { label: 10, value: 10 },
        { label: 15, value: 15 },
        { label: 20, value: 20 },
        { label: 50, value: 50 },
        { label: "Todos", value: options.totalRecords },
      ];

      return (
        <Dropdown
          value={options.value}
          options={dropdownOptions}
          onChange={options.onChange}
        />
      );
    },
  };

  let footerGroupPedido = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total:"
          colSpan={5}
          footerStyle={{ textAlign: "right" }}
        />
        <Column colSpan={5} footer={() => totalizarPedido()} />
      </Row>
    </ColumnGroup>
  );
  let footerGroupPedidoProduto = (
    <ColumnGroup>
      <Row>
        <Column
          footer={`Total para ${produtoSelecionado[0]?.produto} `}
          colSpan={5}
          footerStyle={{ textAlign: "right" }}
        />
        <Column colSpan={5} footer={() => totalizarPedidoPorProduto()} />
      </Row>
    </ColumnGroup>
  );

  let footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total:"
          colSpan={5}
          footerStyle={{ textAlign: "right" }}
        />
        <Column colSpan={2} footer={() => totalizarDuplicata()} />
      </Row>
    </ColumnGroup>
  );

  let footerGroupAnalise = (
    <ColumnGroup>
      <Row>
        <Column
          style={{ color: "red" }}
          footer="Total comprado "
          colSpan={4}
          footerStyle={{ textAlign: "right" }}
        />
        <Column
          style={{ color: "red" }}
          footer={() => totalizarAnaliseTotalComprado()}
        />

        <Column
          style={{ color: "green" }}
          footer="Total vendido "
          footerStyle={{ textAlign: "right" }}
        />
        <Column
          style={{ color: "green" }}
          colSpan={6}
          footer={() => totalizarAnaliseTotalVendido()}
        />
      </Row>
      <Row></Row>
    </ColumnGroup>
  );

  const totalizarAnaliseTotalComprado = () => {
    let tc = 0;

    for (let p of produtos) {
      tc += p.quantidade_comprada * p.ultimoprecocompra;
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(tc);
  };

  const precoPedido = (rowData) => {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco);
  };

  const dialogProdutoPorFilial = (data) => {
    setLoadingLojas(true);
    setLojaSelecionada(data.data);

    api
      .post(
        `/api_react/compras/produtos/${produtoSelecionado[0]?.id}/${moment(
          dataInicialCompra
        ).format("YYYY-MM-DD")}/${moment(dataFinalCompra).format(
          "YYYY-MM-DD"
        )}/${fornecedor.id}/${data.data.id}/${moment(moment.now())
          .subtract(diasVenda, "days")
          .format("YYYY-MM-DD")}/${moment(dataFinalVenda).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        //  console.log(r.data);
        setProdutoPorFilialLista(r.data);
        setPreco(r.data[0].ultimoprecocompra);
        setUnidadeMedida(r.data[0].id_unidade_compra);

        let total = r.data[0].quantidade_vendida;

        let venda_diaria = total / diasVenda;

        let qtdeAComprar =
          venda_diaria *
          (tempoDiasPedido + tempoDiasEntrega + margemErroDiasEntrega);

        setQuantidade(qtdeAComprar.toFixed());
      })
      .catch((e) => {})
      .finally((f) => {
        setLoadingLojas(false);
      });
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
          detail: `Erro ao deletar ${e.data}`,
          life: 3000,
        });
      })
      .finally(() => {
        getItensPedido();
        getItensPedidoProduto(produtoSelecionado[0]);
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
            detail: `Produto(s) deletado(s) com sucesso !`,
            life: 3000,
          });
          setSelectedProductsPedido([]);
        })
        .catch((e) => {
          toast2.current.show({
            severity: "error",
            summary: "Erro",
            detail: `Erro ao deletar ${e.data}`,
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
          label="Excluir"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deletarProdutoPedido(rowData)}
        />
      </>
    );
  };

  const totalizarAnaliseTotalVendido = () => {
    let tv = 0;

    for (let p of produtos) {
      tv += p.quantidade_vendida * p.preco_medio_venda;
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(tv);
  };

  const totalizarDuplicata = () => {
    let t = 0;
    for (let d of duplicatas) {
      t += d.valor;
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(t);
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

  const totalizarPedidoPorProduto = () => {
    let t = 0;
    for (let p of itemPorPedido) {
      t += p?.quantidade * p?.preco;
    }

    let tF = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(t);
    setTotalPedido(t);
    return tF;
  };

  const valor_duplicata_template = (rowData) => {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.valor);
  };

  const status_duplicate_template = (rowData) => {
    return (
      <>
        {rowData.status === "A" ? (
          <Badge value="Aberto" severity="warning"></Badge>
        ) : (
          <Badge value="Pago" severity="success"></Badge>
        )}
      </>
    );
  };

  const getIdPedidoUrl = () => {
    setIdPedido(params.id);
    getItensPedido(params.id);
  };

  useEffect(() => {
    getIdPedidoUrl();

    getPedidos(params.id);
    getUnidadeMedida();
    getFornecedores();
    getLojas();
    getCondficaoPagamento();
    getDuplicatas();
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      3000 // every 3 seconds
    );
    return () => clearTimeout(intervalId);
  }, []);

  const linhaSelecionada = (data) => {
    // console.log(data);

    let dados = [data];
    setProdutoSelecionado(dados);
  };

  const acoesRapida = () => {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        ></div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Button
            className="p-button p-button-rounded"
            icon="pi pi-list"
            style={{ margin: "5px" }}
            label="Lista de pedidos"
            onClick={() => setVisibleLeft(true)}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Button
            className="p-button p-button-rounded p-button-success"
            icon="pi pi-plus-circle"
            style={{ margin: "5px" }}
            label="Adicionar produtos selecionados"
            disabled={selectedProducts.length > 0 ? false : true}
            onClick={() => setDialogSelectedProducts(true)}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Button
            className="p-button p-button-rounded p-button-danger"
            icon="pi pi-times"
            style={{ margin: "5px" }}
            label="Limpar mensagens/notificações"
            onClick={() => clearMessages()}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Button
            className="p-button p-button-rounded p-button-secondary"
            icon="pi pi-list"
            style={{ margin: "5px" }}
            label="Duplicatas vencendo hoje"
            onClick={() => setDialogDuplicatas(true)}
          />
        </div>
      </>
    );
  };

  const fecharTemplate = () => {
    return (
      <>
        <Button
          style={{ margin: "0px 10px" }}
          className="p-button p-button-success p-button-rounded "
          label="Adicionar"
          icon="pi pi-plus"
          onClick={() => {
            adicionarProduto(produto);
          }}
        />
        <Button
          style={{ margin: "0px 10px" }}
          label="Listar pedido"
          icon="pi pi-list"
          onClick={() => setVisibleLeft(true)}
          className="p-button-rounded p-button-primary"
        />
        <Button
          style={{ margin: "0px 10px" }}
          label="Fechar / Próximo"
          icon="pi pi-times"
          onClick={() => setDisplayDialog(false)}
          className="p-button-rounded p-button-danger"
        />
      </>
    );
  };

  return (
    <>
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
      {displayDialog ? (
        <>
          <AdicionarProduto
            eanUrl={eanUrl}
            produto={produto}
            displayDialog={displayDialog}
            hideDialog={hideDialog}
            fecharTemplate={fecharTemplate}
            lojaSelecionada={lojaSelecionada}
            produtoSelecionado={produtoSelecionado}
            data_inclusao_template={data_inclusao_template}
            saldo_estoque_template={saldo_estoque_template}
            sugestao_quantidade_compra={sugestao_quantidade_compra}
            valor_unitario_template={valor_unitario_template}
            preco_media_venda_template={preco_media_venda_template}
            quantidade_vendida_template={quantidade_vendida_template}
            venda_diaria_template={venda_diaria_template}
            total_template={total_template}
            dialogProdutoPorFilial={dialogProdutoPorFilial}
            itemPorPedido={itemPorPedido}
            footerGroupPedidoProduto={footerGroupPedidoProduto}
            loading2={loading2}
            precoPedido={precoPedido}
            precoPedidoLinhaTotal={precoPedidoLinhaTotal}
            deletarItemPedido={deletarItemPedido}
            quantidade_comprada_template_02={quantidade_comprada_template_02}
            total_comprado_template_02={total_comprado_template_02}
            quantidade={quantidade}
            preco={preco}
            unidadeMedida={unidadeMedida}
            loadingLojas={loadingLojas}
            produtoPorFilialLista={produtoPorFilialLista}
            fator={fator}
            setFator={setFator}
            diasVenda={diasVenda}
            setQuantidade={setQuantidade}
            setTotal={setTotal}
            unidadeMedidaLista={unidadeMedidaLista}
            setUnidadeMedida={setUnidadeMedida}
            toast3={toast3}
            lojas={lojas}
            loadinglojas={loadingLojas}
          />
        </>
      ) : (
        <>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          ></div>
          <div className="container-fornecedor">
            <h1
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "cabin-sketch-regular",
                fontWeight: "400",
              }}
            >
              Análise de compras
            </h1>

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

                  <div className="fornecedor-input">
                    <h4>Selecione um fornecedor para análise</h4>
                    <Dropdown
                      disabled={idPedido ? true : false}
                      required
                      style={{ marginTop: "10px" }}
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
                </div>
                <div>
                  <div className="fornecedor-input">
                    <h4 style={{ color: "red" }}>
                      Informe o período inicial para análise de compra
                    </h4>

                    <Calendar
                      placeholder="dd/mm/yyyy"
                      mask="99/99/9999"
                      showOnFocus={false}
                      showButtonBar
                      showIcon
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
                      placeholder="dd/mm/yyyy"
                      mask="99/99/9999"
                      showButtonBar
                      showOnFocus={false}
                      showIcon
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
                      Informe a quantidade de dias para análise de vendas
                    </h4>

                    <InputNumber
                      showButtons
                      style={{ marginTop: "10px", width: "40%" }}
                      onChange={(e) => setDiasVenda(e.value)}
                      value={diasVenda}
                      placeholder="Informe a quantidade de dias para análise"
                    ></InputNumber>
                  </div>
                </div>

                <div>
                  <div className="fornecedor-input">
                    <h4 style={{ color: "green" }}>
                      Comprar para quantos dias?{" "}
                    </h4>

                    <InputNumber
                      showButtons
                      min={1}
                      style={{ marginTop: "10px", width: "40%" }}
                      onChange={(e) => {
                        setTempoDiasPedido(e.value);
                      }}
                      value={tempoDiasPedido}
                    ></InputNumber>
                  </div>

                  <div className="fornecedor-input">
                    <h4 style={{ color: "green" }}>
                      Tempo de entrega ( dias )
                    </h4>

                    <InputNumber
                      showButtons
                      min={1}
                      style={{ marginTop: "10px", width: "40%" }}
                      onChange={(e) => settempoDiasEntrega(e.value)}
                      value={tempoDiasEntrega}
                    ></InputNumber>
                  </div>

                  <div className="fornecedor-input">
                    <h4 style={{ color: "green" }}>Margem de erro (dias)</h4>

                    <InputNumber
                      min={1}
                      showButtons
                      style={{ marginTop: "10px", width: "40%" }}
                      onChange={(e) => setMargemErroDiasEntrega(e.value)}
                      value={margemErroDiasEntrega}
                    ></InputNumber>
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
                  <div className="fornecedor-input">
                    <h4>Selecione um fornecedor para análise</h4>
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
                      mask="99/99/9999"
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
                      disabled={idPedido ? true : false}
                      style={{ width: "100%", margin: "10px 0px" }}
                      icon="pi pi-save"
                      className="p-button p-button-success p-button-rounded p-button-md"
                      label={
                        idPedido
                          ? `Pedido número ` +
                            idPedido +
                            ` criado, adicione os itens a lista do pedido`
                          : "Gravar rascunho"
                      }
                      onClick={() => gravarPedido()}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <Toast ref={toast} position="bottom-center" />

          <Dialog
            closable={false}
            header="Adicionar produtos selecionados a lista de pedidos"
            visible={dialogSelectedProducts}
            onHide={() => setDialogSelectedProducts(false)}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {loadingAddPedido ? (
                <>
                  <h1>
                    <TextTransition springConfig={presets.wobbly}>
                      <h2
                        style={{
                          fontWeight: "700",
                          fontStyle: "normal",
                        }}
                      >
                        {TEXTS[index % TEXTS.length]}
                      </h2>
                    </TextTransition>
                  </h1>

                  <ReactLoading
                    type="cylon"
                    color="#8600C9"
                    height={100}
                    width={100}
                  />
                </>
              ) : (
                <></>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignContent: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <Toast ref={toast3} position="bottom" />
                <h4>Informe uma loja para o pedido</h4>
                <Dropdown
                  style={{ margin: "10px" }}
                  optionLabel="nome"
                  value={lojaSelecionada}
                  options={lojas}
                  onChange={(e) => setLojaSelecionada(e.value)}
                  placeholder="Selecione uma loja para o pedido"
                  disabled={loadingAddPedido}
                />
              </div>

              <div>
                <Button
                  loading={loadingAddPedido}
                  disabled={loadingAddPedido}
                  icon="pi pi-plus-circle"
                  className="p-button p-button-rounded p-button-success"
                  label="Adicionar"
                  style={{ width: "100%", margin: "10px" }}
                  onClick={() => adicionarProdutoMassa(selectedProducts)}
                />

                <Button
                  disabled={loadingAddPedido}
                  icon="pi pi-times"
                  className="p-button p-button-rounded p-button-danger"
                  label="Cancelar"
                  style={{ width: "100%", margin: "10px" }}
                  onClick={() => setDialogSelectedProducts(false)}
                />
              </div>
            </div>
          </Dialog>
          <Messages ref={msgs1} />

          <Card style={{ margin: "5px 10px" }}>
            <DataTable
              scrollable
              scrollHeight="650px"
              style={{
                width: "100%",
              }}
              selection={selectedProducts}
              selectionMode="multiple"
              onSelectionChange={(e) => setSelectedProducts(e.value)}
              dataKey="id"
              footerColumnGroup={footerGroupAnalise}
              rows={50}
              paginator
              paginatorTemplate={template1}
              footer={"Existem " + produtos.length + " produto(s) para análise"}
              breakpoint="968px"
              loading={loading}
              stripedRows
              value={produtos}
              //   reorderableColumns
              editMode="row"
              //   scrollDirection="vertical"
              //   scrollable
              //   scrollHeight="flex"

              filters={filters2}
              size="small"
              responsiveLayout="stack"
              emptyMessage="Nenhum produto encontrado para análise"
              showGridlines
              header={headerDataTable}
              rowGroupMode="subheader"
              filterDisplay="row"
              filter
              sortOrder={1}
              // resizableColumns
              columnResizeMode="fit"
              // onRowSelect={linhaSelecionada}
              globalFilterFields={[
                "codigo",
                "ean",
                "numeronfultcompra",
                "produto",
              ]}
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3em" }}
              ></Column>
              <Column
                field="data_inclusao"
                sortable
                body={data_inclusao_template}
                header="Nota fiscal última compra"
              ></Column>

              <Column
                field="codigo"
                sortable
                body={EanOrCodigo}
                header="Código"
              ></Column>

              <Column
                field="produto"
                //  filter
                //  showFilterMenu={true}
                //  filterPlaceholder="Pesquisar produto ..."
                sortable
                header="Produto"
              ></Column>

              <Column field={cfop_template} header="CFOP"></Column>

              <Column
                field={botaoAddTemplate}
                header={idPedido ? "Adicionar" : "Novo pedido "}
              ></Column>

              <Column
                filter
                showFilterMenu={true}
                filterMatchModeOptions={matchModes}
                filterPlaceholder="Filtrar compras  ..."
                field="quantidade_comprada"
                body={quantidade_comprada_template_02}
                header="Compra total no período"
              ></Column>
              <Column
                filter
                showFilterMenu={true}
                filterMatchModeOptions={matchModes}
                filterPlaceholder="Filtrar estoque  ..."
                field="saldo_estoque"
                sortable
                header="Saldo em Estoque"
                body={saldo_estoque_template}
              ></Column>
              <Column
                filter
                showFilterMenu={true}
                filterMatchModeOptions={matchModes}
                filterPlaceholder="Filtrar vendas"
                field="quantidade_vendida"
                body={quantidade_vendida_template}
                header={`Qtde venda ${diasVenda} dias`}
              ></Column>

              <Column
                field="sugestao"
                body={sugestao_quantidade_compra}
                header={`Sugestão de compra`}
              ></Column>

              <Column
                field="quantidade_vendida"
                header="Classificação"
                sortable
                body={giroTemplate}
              ></Column>
            </DataTable>
          </Card>
        </>
      )}

      <Sidebar
        fullScreen
        visible={visibleLeft}
        showCloseIcon={false}
        onHide={() => setVisibleLeft(false)}
      >
        <Toast ref={toast2} position="bottom-center" />
        <Messages ref={msgs1} />
        <div>
          <Toolbar
            style={{ margin: "20px" }}
            right={leftContents}
            left={rightContents}
          />
          <div style={{ width: "100%" }}>
            <PedidoListaSidebar
              dialogSelectedProductsAtualizar={dialogSelectedProductsAtualizar}
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
              tempoDiasPedido={tempoDiasPedido}
              tempoDiasEntrega={tempoDiasEntrega}
              margemErroDiasEntrega={margemErroDiasEntrega}
              msgs1={msgs1}
              loadingLojas={loadingLojas}
              produtoPorFilialLista={produtoPorFilialLista}
              data_inclusao_template={data_inclusao_template}
              saldo_estoque_template={saldo_estoque_template}
              sugestao_quantidade_compra={sugestao_quantidade_compra}
              valor_unitario_template={valor_unitario_template}
              quantidade_comprada_template={quantidade_comprada_template}
              total_comprado_template={total_comprado_template}
              preco_media_venda_template={preco_media_venda_template}
              quantidade_vendida_template={quantidade_vendida_template}
              diasVenda={diasVenda}
              venda_diaria_template={venda_diaria_template}
              total_template={total_template}
              lojas={lojas}
              getItensPedido={getItensPedido}
              pedidos={pedidos}
              footerGroupPedido={footerGroupPedido}
              loading3={loading3}
              template1={template1}
              EanOrCodigoPedido={EanOrCodigoPedido}
              precoPedido={precoPedido}
              precoPedidoLinhaTotal={precoPedidoLinhaTotal}
              deletarItemPedido={deletarItemPedido}
              unidadeMedidaLista={unidadeMedidaLista}
              quantidade_comprada_template_02={quantidade_comprada_template_02}
              total_comprado_template_02={total_comprado_template_02}
              giroTemplate={giroTemplate}
            />
          </div>
        </div>
      </Sidebar>

      <Dialog
        visible={dialogDuplicatas}
        header="Documentos vencendo hoje"
        modal={false}
        position="top"
        onHide={() => setDialogDuplicatas(false)}
      >
        <div className="fornecedor-input">
          <h4>Selecione uma loja</h4>
          <Dropdown
            style={{ marginTop: "10px" }}
            placeholder="Selecione uma loja"
            value={filialDuplicata}
            onChange={(e) => setFilialDuplicata(e.target.value)}
            options={lojas}
            optionLabel="nome"
            showClear
          />
        </div>

        <div
          style={{
            width: "15%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="card"
        >
          <Button
            className="p-button p-button-info p-button-rounded "
            icon="pi pi-search"
            label="Filtrar"
            onClick={() => getDuplicatas()}
          />
        </div>

        <DataTable
          breakpoint="968px"
          emptyMessage="Nenhum documento encontrado! 🥳"
          filterDisplay="row"
          filters={filters3}
          dataKey="id"
          header={renderHeader2}
          //  loading={loading}
          stripedRows
          value={duplicatas}
          footerColumnGroup={footerGroup}
          responsiveLayout="stack"
        >
          <Column field="idfilial" sortable header="Loja"></Column>
          <Column field="documento" sortable header="Documento"></Column>

          <Column field="nomeentidade" sortable header="Fornecedor"></Column>
          <Column field="observacao" header="Origem"></Column>
          <Column field="tipodocumento" sortable header="Tipo"></Column>
          <Column field={valor_duplicata_template} header="Valor"></Column>
          <Column field={status_duplicate_template} header="Status"></Column>
        </DataTable>
      </Dialog>
      {displayDialog ? (
        <> </>
      ) : (
        <>
          <div
            style={{
              display: "fixed",
              marginBottom: "1px",
              backgroundColor: "#F2F2F2",
              margin: "0px 3px",
            }}
          >
            <Toolbar left={acoesRapida} />
          </div>
        </>
      )}
    </>
  );
}
