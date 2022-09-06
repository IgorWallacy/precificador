import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import { useNavigate, useParams } from "react-router-dom";
import ImagemDestque from "../../../../assets/img/compras-fornecedor.svg";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
//import { Tooltip } from "primereact/tooltip";
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

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { formataMoeda } from "../../../../util";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
    today: " Hoje ",
    clear: " Limpar ",
  });
  const navigate = useNavigate();

  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [globalFilterValue3, setGlobalFilterValue3] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataInicialCompra, setDataInicialCompra] = useState(
    new Date(new Date().setDate(new Date().getDate() - 90))
  );
  const [dataFinalCompra, setDataFinalCompra] = useState(new Date());
  // const [dataInicialVenda, setDataInicialVenda] = useState(new Date());
  const [diasVenda, setDiasVenda] = useState(90);
  const [dataFinalVenda, setDataFinalVenda] = useState();
  const [fornecedor, setFornecedor] = useState(null);
  const [fornecedores, setFornecedores] = useState([""]);
  const [filial, setFilial] = useState(null);
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

  const [condicaoPagamento, setCondicaoPagamento] = useState(null);
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [prazoEntrega, setPrazoEntrega] = useState(null);

  const toast = useRef(null);
  const toast2 = useRef(null);
  const toast3 = useRef(null);

  const [dialogDuplicatas, setDialogDuplicatas] = useState(false);
  const [duplicatas, setDuplicatas] = useState([]);

  const [tempoDiasPedido, setTempoDiasPedido] = useState(0);
  const [tempoDiasEntrega, settempoDiasEntrega] = useState(0);
  const [margemErroDiasEntrega, setMargemErroDiasEntrega] = useState(0);

  const [pedido, setPedido] = useState(false);

  const [idPedido, setIdPedido] = useState(null);

  const [totalPedido, setTotalPedido] = useState(0);

  const [filialDuplicata, setFilialDuplicata] = useState(null);

  const [produtoPorFilialLista, setProdutoPorFilialLista] = useState([]);

  const [loadingLojas, setLoadingLojas] = useState(false);

  const [lojaSelecionada, setLojaSelecionada] = useState(null);

  const [loading2, setLoading2] = useState(false);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
          setCondicaoPagamento(r.data.condicaoPagamento.id);

          //     console.log(r.data);
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
          detail: `${error}`,
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
        setTempoDiasPedido(r.data.leadttimecompra);
        console.log(r.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error}`,
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
        toast.show({ severity: "error", summary: "Erro", detail: `${error}` });
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
          detail: `${error}`,
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
            detail: `${error}`,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const venda_diaria_template = (rowData) => {
    let total = rowData.quantidade_vendida * rowData.preco_medio_venda;
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
    let total = rowData.quantidade_vendida * rowData.preco_medio_venda;
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
        <font color="red">
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
        (rowData.quantidade_comprada
          ? rowData.quantidade_comprada
          : 0 * rowData.embalagem
          ? rowData.embalagem
          : 0)) *
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
        </>
      );
    } else {
      return rowData?.codigo;
    }
  };

  const EanOrCodigoPedido = (rowData) => {
    //console.log(rowData);
    if (rowData.idproduto.ean) {
      return (
        <>
          <div>{rowData.idproduto.ean} </div>
          <div>
            <img
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${rowData.idproduto.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={rowData.idproduto.ean}
            />
          </div>
        </>
      );
    } else {
      return rowData.idproduto.codigo;
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
              {rowData.cfop} <br />
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
              label={idPedido ? "" : "Crie um pedido para habilitar"}
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
          filial: lojaSelecionada.id,
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
          condicaoPagamento: { id: condicaoPagamento },
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
          setFilial(null);
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
            navigate("/compras/analise/fornecedor");
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
        {/*  <Button
          style={{ margin: "5px" }}
          icon="pi pi-trash"
          className="p-button p-button-danger p-button-rounded"
          label="Esvaziar lista"
          onClick={() => setPedidos([])}
        />
    */}
        {idPedido ? (
          <></>
        ) : (
          <>
            <Button
              disabled={idPedido ? true : false}
              style={{ margin: "5px" }}
              icon="pi pi-save"
              className="p-button p-button-success p-button-rounded"
              label={
                idPedido
                  ? `Pedido número ` +
                    idPedido +
                    ` criado, adicione os itens a lista do pedido`
                  : "Gravar pedido"
              }
              onClick={() => gravarPedido()}
            />
          </>
        )}
        <Button
          disabled={pedidos[0]?.id ? false : true}
          label="Imprimir pedido"
          style={{ margin: "5px" }}
          icon="pi pi-print"
          className="p-button p-button-warning p-button-rounded"
          onClick={() => imprimirPedido()}
        />
      </>
    );
  };

  const imprimirPedido = () => {
    console.log(pedidos);
    var dd = {
      styles: {
        header: {
          fontSize: 12,
          alignment: "left",
          marginTop: 5,
        },
      },
      //   pageSize: {width : 1001 , height : 200},
      pageSize: "A4",
      pageMargins: [25, 50, 10, 25],
      fontSize: 12,
      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: "portrait",
      header: [
        {
          text: `Pedido de compra N° ${idPedido} - Fornecedor : ${
            fornecedor.nome
          } -
        Condição de pagamento : ${
          condicaoPagamento.descricao
        }  - Prazo para entrega : ${moment(prazoEntrega).format("DD/MM/YY")}  
`,
          style: "header",
          margin: [40, 10],
        },
      ],

      footer: {
        columns: [
          {
            text: "Total do pedido " + formataMoeda(totalPedido),
            alignment: "center",
          },
        ],
      },

      content: pedidos.map(function (item, i) {
        return {
          layout: "lightHorizontalLines", // optional
          lineHeight: 2,
          fontSize: 9,
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: [5, 100, 200, 50, 50, 25, 50],

            body: [
              ["#", "EAN", "Produto", "Preço U", "Quantidade", "Loja", "Total"],

              [
                { text: i + 1 },

                {
                  text: item.idproduto.ean
                    ? item.idproduto.ean
                    : item.idproduto.codigo,
                  style: "ean",
                },
                {
                  text: item.idproduto.nome.substring(0, 35),
                  style: "descricao",
                },

                {
                  text: Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: "2",
                    maximumFractionDigits: "2",
                  }).format(item.preco),
                  style: "preco",
                },

                {
                  text:
                    item.quantidade +
                    ` ${
                      item.unidadeCompra ? item.unidadeCompra.codigo : ""
                    } (  ${
                      item.fatorConversao === 0 ? 1 : item.fatorConversao
                    })`,
                },

                {
                  text: item.filial,
                },

                {
                  text: Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.preco * item.quantidade),
                },
              ],
            ],
          },
        };
      }),
    };

    pdfMake.createPdf(dd).open();
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
        .finally((f) => {});
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
          condicaoPagamento: { id: condicaoPagamento },
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
            detail: `Erro ao criar o pedido ${error} `,
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

  const novoPedido = () => {
    setVisibleLeft(true);
    setPedido(true);
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
        <Column colSpan={2} footer={() => totalizarPedido()} />
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
        setProdutoPorFilialLista(r.data);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoadingLojas(false);
      });
  };

  const deletarProdutoPedido = (rowData) => {
    // console.log(rowData);
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

  const deletarItemPedido = (rowData) => {
    console.log(rowData);
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
  }, []);

  const linhaSelecionada = (data) => {
    // console.log(data);

    let dados = [data];
    setProdutoSelecionado(dados);
  };

  return (
    <>
      <Header />
      <Footer />
      <Button
        icon="pi pi-shopping-cart"
        className="botao-add-colado"
        onClick={() => setVisibleLeft(true)}
      />
      <Button
        label="Consultar outro pedido"
        icon="pi pi-arrow-right"
        className="botao-pedido-colado"
        onClick={() => navigate("/compras/consulta")}
      />
      <div className="img-fornecedor">
        <img src={ImagemDestque} style={{ width: "250px" }} alt="logo" />
      </div>
      <Dialog
        style={{ width: "100%", height: "100%" }}
        header="Adicionar produto a lista de compras"
        modal={true}
        visible={displayDialog}
        onHide={hideDialog}
        // style={{ width: "100%" }}
        maximizable
        resizable
        position="top"
      >
        <Toast ref={toast3} position="top-center" />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "2px",
            justifyContent: "space-around",
          }}
        >
          <div>
            {produto?.ean ? produto.ean : produto.codigo}
            <br />
            <img
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${produto.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={produto?.ean}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              flexWrap: "wrap",
              justifyContent: "space-around",
            }}
          >
            <label style={{ fontWeight: "800", width: "100%" }} htmlFor="nome">
              Produto
            </label>
            <h1 style={{ fontSize: "25px", width: "100%" }}>
              {produto.produto}
            </h1>
          </div>
          <br />
          <div>
            <div>
              Quantidade para {lojaSelecionada?.nome}
              <InputNumber
                style={{ width: "50%", margin: "10px" }}
                id="quantidade"
                autoFocus
                disabled={lojaSelecionada ? false : true}
                value={quantidade}
                onChange={(e) => setQuantidade(e.value)}
                required
                onBlur={(e) => setTotal(preco * quantidade)}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "5px",
              justifyContent: "center",
            }}
          >
            <h4>UN COMPRA </h4>
            <Dropdown
              required
              value={unidadeMedida}
              options={unidadeMedidaLista}
              optionLabel="nome"
              optionValue="id"
              onChange={(e) => setUnidadeMedida(e.value)}
              placeholder="Selecione uma unidade"
            />

            <h4>Embalagem com </h4>
            <InputNumber
              placeholder="Fator de conversão"
              value={fator}
              onChange={(e) => setFator(e.value)}
              onBlur={(e) => setTotal(preco * quantidade)}
            />

            <label
              style={{ fontWeight: "800", margin: "10px" }}
              htmlFor="preco"
            >
              Preço para compra (unitário)
            </label>
            <InputNumber
              style={{ width: "30%", margin: "10px" }}
              mode="decimal"
              prefix="R$ "
              locale="pt-BR"
              minFractionDigits={2}
              maxFractionDigits={2}
              id="preco"
              value={preco}
              onChange={(e) => setPreco(e.value)}
              required
              onBlur={(e) => setTotal(preco * quantidade)}
            />

            <h1 style={{ marginRight: "15px" }}>
              {formataMoeda(preco * quantidade)}
            </h1>

            <Button
              style={{ marginTop: "20px" }}
              className="p-button p-button-success p-button-rounded p-button-sm"
              label="Adicionar"
              icon="pi pi-plus"
              onClick={() => {
                adicionarProduto(produto);
              }}
            />
          </div>

          <DataTable
            value={itemPorPedido}
            style={{ width: "100%" }}
            responsiveLayout="scroll"
            loading={loading2}
          >
            <Column field="filial" header="Loja"></Column>
            <Column field="idproduto.nome" header="Produto"></Column>
            <Column field="quantidade" header="Quantidade" />
            <Column header="Deletar item" field={deletarItemPedido}></Column>
          </DataTable>

          <DataTable
            value={lojas}
            style={{ width: "100%" }}
            responsiveLayout="scroll"
            selectionMode="single"
            dataKey="id"
            onRowSelect={dialogProdutoPorFilial}
          >
            <Column field="codigo" header="Código"></Column>
            <Column field="nome" header="Loja"></Column>
          </DataTable>

          <DataTable
            loading={loadingLojas}
            style={{ width: "100%" }}
            value={produtoPorFilialLista}
            responsiveLayout="scroll"
          >
            <Column field="idfilial" header="Loja"></Column>
            <Column
              field={data_inclusao_template}
              header="Nota fiscal última compra"
            ></Column>
            <Column field={saldo_estoque_template} header="Estoque"></Column>
            <Column
              field={sugestao_quantidade_compra}
              header="Sugestão"
            ></Column>

            <Column
              field={valor_unitario_template}
              header="Custo Últm.Compra"
            ></Column>

            <Column
              field={quantidade_comprada_template}
              header="Compra"
            ></Column>

            <Column
              field={total_comprado_template}
              header="Total comprado"
            ></Column>

            <Column
              header="Preço médio de venda"
              field={preco_media_venda_template}
            ></Column>

            <Column
              field={quantidade_vendida_template}
              header={`Qtde venda ${diasVenda} dias`}
            ></Column>

            <Column
              field={venda_diaria_template}
              header="Qtde venda diária"
            ></Column>

            <Column
              field={total_template}
              header={`Total vendido ${diasVenda} dias`}
            ></Column>
          </DataTable>

          <DataTable
            value={produtoSelecionado}
            responsiveLayout="scroll"
            style={{ width: "100%" }}
          >
            <Column header="Loja" body="Todas" />

            <Column
              field={saldo_estoque_template}
              header="Estoque total"
            ></Column>

            <Column
              field={sugestao_quantidade_compra}
              header="Sugestão"
            ></Column>

            <Column
              field={quantidade_comprada_template_02}
              header="Compra total no período"
            ></Column>

            <Column
              field={total_comprado_template_02}
              header="Total comprado no período"
            ></Column>

            <Column
              header="Preço médio de venda"
              field={preco_media_venda_template}
            ></Column>

            <Column
              field={quantidade_vendida_template}
              header={`Qtde venda ${diasVenda} dias`}
            ></Column>

            <Column
              field={venda_diaria_template}
              header="Qtde venda diária"
            ></Column>

            <Column
              field={total_template}
              header={`Total vendido ${diasVenda} dias`}
            ></Column>
          </DataTable>
        </div>
      </Dialog>

      <Sidebar
        style={{ width: "100%" }}
        visible={visibleLeft}
        onHide={() => setVisibleLeft(false)}
      >
        <Toast ref={toast2} position="bottom-center" />
        <div className="lista-itens">
          <div style={{ width: "100%" }}>
            <DataTable
              style={{
                padding: "10px",
                backgroundColor: "#FFF",
                borderRadius: "25px",
                border: "1px solid #FFF",
              }}
              footer={`Existem ${pedidos.length} produto(s) adicionado(s) a lista de compras`}
              footerColumnGroup={footerGroupPedido}
              value={pedidos}
              emptyMessage="Nenhum produto adicionado a lista"
            >
              <Column field="filial" header="Loja" />
              <Column field={EanOrCodigoPedido} header="Código/Ean"></Column>
              <Column field="idproduto.nome" header="Produto"></Column>
              <Column field="quantidade" header={`Quantidade`}></Column>

              <Column field="unidadeCompra.nome" header="UN"></Column>
              <Column
                field="fatorConversao"
                header="Quantidade (dentro da embalagem)"
              ></Column>

              <Column field={precoPedido} header="Preço unitário "></Column>

              <Column
                field={precoPedidoLinhaTotal}
                header="Preço Total "
              ></Column>

              <Column header="Deletar item" field={deletarItemPedido}></Column>

              <Column
              //  body={() => abrirDialogDeleteProduto()}
              ></Column>
            </DataTable>
          </div>
        </div>
      </Sidebar>

      <div>
        <Button
          icon="pi pi-box"
          onClick={() => novoPedido()}
          style={{ marginTop: "30px", marginLeft: "30px" }}
          className="p-button p-button-secondary p-button-rounded "
          label={`${idPedido ? "Pedido " + idPedido : ""} `}
        />
      </div>

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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
            color: "#FFF",
          }}
        >
          <h4> Pedido para a(s) loja(s) </h4>
          <h1>
            {lojas[0]?.nome} <br /> {lojas?.length > 1 ? lojas[1]?.nome : ""}
          </h1>
          <h4> Fornecedor </h4>
          <h1> {fornecedor?.nome} </h1>
          Prazo de entrega
          <Calendar
            mask="99/99/9999"
            showIcon
            showButtonBar
            locale="pt-BR"
            dateFormat="dd/mm/yy"
            style={{ width: "100%", margin: "10px 0px" }}
            value={prazoEntrega}
            onChange={(e) => setPrazoEntrega(e.value)}
          />
          Condição de Pagamento (dias)
          <Dropdown
            filter
            value={condicaoPagamento}
            optionValue="id"
            options={condicoesPagamento}
            optionLabel="descricao"
            onChange={(e) => setCondicaoPagamento(e.value)}
            placeholder="Selecione uma condição de pagamento"
          />
        </div>

        <Toolbar
          style={{ margin: "20px" }}
          right={leftContents}
          left={rightContents}
        />

        <div>
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
                setTempoDiasPedido(fornecedor?.leadttimecompra);
              }}
            />
          </div>
          {/*
          <div className="fornecedor-input">
            <h4>Selecione uma loja para análise</h4>
            <MultiSelect
              value={filial}
              options={lojas}
              onChange={(e) => setFilial(e.target.value)}
              optionLabel="nome"
              placeholder="Selecione uma loja"
              // showClear
              display="chip"
            />
          </div>
        */}
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
            <h4 style={{ color: "green" }}>Tempo do pedido (dias) </h4>

            <InputNumber
              showButtons
              style={{ marginTop: "10px", width: "40%" }}
              onChange={(e) => {
                setTempoDiasPedido(e.value);
              }}
              value={tempoDiasPedido}
            ></InputNumber>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>Tempo de entrega ( dias )</h4>

            <InputNumber
              showButtons
              style={{ marginTop: "10px", width: "40%" }}
              onChange={(e) => settempoDiasEntrega(e.value)}
              value={tempoDiasEntrega}
            ></InputNumber>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>Margem de erro (dias)</h4>

            <InputNumber
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
        <div>
          <Button
            icon="pi pi-chart-line"
            onClick={() => setDialogDuplicatas(true)}
            style={{ marginTop: "30px", marginLeft: "30px" }}
            className="p-button p-button-info p-button-rounded "
            label="Duplicatas hoje"
          />
        </div>
      </div>
      <Toast ref={toast} position="bottom-center" />

      <DataTable
        style={{
          width: "100%",
        }}
        rows={3}
        paginator
        footerColumnGroup={footerGroupAnalise}
        paginatorTemplate={template1}
        footer={"Existem " + produtos.length + " produto(s) para análise"}
        breakpoint="968px"
        loading={loading}
        //     stripedRows
        value={produtos}
        selectionMode="single"
        //   reorderableColumns
        editMode="row"
        dataKey="idproduto"
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
        sortOrder={1}
        // resizableColumns
        columnResizeMode="fit"
        // onRowSelect={linhaSelecionada}
        globalFilterFields={["codigo", "ean", "numeronfultcompra", "produto"]}
      >
        <Column
          field="data_inclusao"
          sortable
          body={data_inclusao_template}
          header="Nota fiscal última compra"
        ></Column>

        <Column field={EanOrCodigo} header="Código"></Column>

        <Column field="produto" sortable header="Produto"></Column>

        <Column field={cfop_template} header="CFOP"></Column>

        <Column
          field={botaoAddTemplate}
          header={idPedido ? "Adicionar" : "Novo pedido "}
        ></Column>

        <Column
          field="saldo_estoque"
          sortable
          header="Saldo em Estoque"
          body={saldo_estoque_template}
        ></Column>

        <Column
          field="quantidade_vendida"
          header="Classificação"
          sortable
          body={giroTemplate}
        ></Column>
      </DataTable>

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
    </>
  );
}
