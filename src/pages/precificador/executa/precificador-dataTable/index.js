import React, { useState, useEffect, useRef, useContext } from "react";

import "./styless.css";
import DestaqueImg from "../../../../assets/img/animaccao_check.json";
import { Player } from "@lottiefiles/react-lottie-player";
import { SelectButton } from "primereact/selectbutton";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { ProgressBar } from "primereact/progressbar";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { addLocale } from "primereact/api";

import JsBarcode from "jsbarcode/bin/JsBarcode";

import { Tag } from "primereact/tag";
import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";

import { useReactToPrint } from "react-to-print";

import api from "../../../../services/axios";
import api_uniplus from "../../../../services/axios/axios_uniplus";
import { useNavigate } from "react-router-dom";

import Context from "../../../../contexts";

import moment from "moment";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Card, message } from "antd";
import { element } from "prop-types";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const PrecificadorExecuta = () => {
  const navigate = useNavigate();

  const [mensagens, setMensagens] = useState([]);

  const tabelaRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => tabelaRef.current,
  });
  const [produtoStatusPendente, setProdutoStatusPendente] = useState([]);
  const [usuario, SetUsuario] = useState(null);
  const context = useContext(Context);
  const [modoPesquisa, setModoPesquisa] = useState(0);
  const [filiaisSelect, setFiliaisSelect] = useState(0);
  const [etiquetaSelecionada, setEtiquetaSelecionada] = useState("");
  const toast = useRef(null);
  const [quantidadeFilial, setQuantidadeFilial] = useState([0]);
  const [loadingApiUniplus, setloadingApiUniplus] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();
  const [replicarPreco, setReplicarPreco] = useState(0);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  //const [expandedRows, setExpandedRows] = useState(null);
  const replicarPrecoOpcoes = [
    { label: "Sim", value: 1 },
    { label: "Não", value: 0 },
  ];
  const modosDePesquisa = [
    {
      label: "Agendamento",
      value: 0,
    },
    {
      label: "Inclusão",
      value: 1,
    },
  ];
  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
    razaosocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numeronotafiscal: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  //let eanUrl = "https://cdn-cosmos.bluesoft.com.br/products";
  let eanUrl = "http://www.eanpictures.com.br:9000/api/gtin";

  useEffect(() => {
    pegarTokenLocalStorageUniplus();
    buscarUsuarioPorCodigo();

    usarTabelaFormacaoPreecoProduto();
    // eslint-disable-next-line
  }, []);

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

  const pegarTokenLocalStorageUniplus = () => {
    let token = localStorage.getItem("access_token_uniplus");
    let a = JSON.parse(token);

    var headers = {
      Authorization: "Bearer " + a?.access_token,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // setHeaders(headers);

    api_uniplus.interceptors.request.use(
      (config) => {
        // Do something before request is sent

        config.headers["Authorization"] = "bearer " + a?.access_token;
        return config;
      },

      (error) => {
        Promise.reject(error);
      }
    );
  };

  const margem = (rowData) => {
    //Margem em %: (Preço de venda - Preço de compra) / Preço de venda * 100.
    let margem =
      ((rowData.precoagendado - rowData.precocusto) / rowData.precoagendado) *
      100;

    // Margem em valor monetário: Preço de venda - Preço de compra
    let rsmargem = rowData.precoagendado - rowData.precocusto;

    let margemformatada = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rsmargem);

    let rsmargemformatada =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(margem) + " %";

    return (
      <>
        {margem > 0 ? (
          <>
            <div style={{ color: "green" }}>
              {rsmargemformatada} de markdown
              <br />
              <b>Lucro de</b> {margemformatada} <br /> no preço agendado
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {rsmargemformatada} de markdown <br />
              <b>Prejuizo de</b> {margemformatada}
              <br /> no preço agendado
            </div>
          </>
        )}
      </>
    );
  };

  const margemAtual = (rowData) => {
    //Margem em %: (Preço de venda - Preço de compra) / Preço de venda * 100.
    let margem =
      ((rowData.precoAtual - rowData.precocusto) / rowData.precoAtual) * 100;

    // Margem em valor monetário: Preço de venda - Preço de compra
    let rsmargem = rowData.precoAtual - rowData.precocusto;

    let margemformatada = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rsmargem);

    let rsmargemformatada =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(margem) + " %";

    return (
      <>
        {margem > 0 ? (
          <>
            <div style={{ color: "green" }}>
              {rsmargemformatada} de markdown <br />
              <b>Lucro de</b> {margemformatada}
              <br /> no preço atual
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {rsmargemformatada} de markdown
              <br />
              <b>Prejuizo de</b> {margemformatada}
              <br /> no preço atual
            </div>
          </>
        )}
      </>
    );
  };

  const precoCustoTemplate = (rowData) => {
    let custo = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precocusto);
    return (
      <>
        {" "}
        <font color="red"> Custo de {custo}</font>
      </>
    );
  };

  const precoAgendadoTemplate = (rowData) => {
    let markup =
      ((rowData.precoagendado - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(markup) + " %";

    let precoagendadoFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoagendado);

    return (
      <>
        {rowData.precoagendado > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              {markupFormatado} de Markup <br />
              Agendado a <br />
              <font size="5"> {precoagendadoFormatado} </font>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {markupFormatado} de Markup <br />
              Agendado a <br />
              <font size="5"> {precoagendadoFormatado} </font>
            </div>
          </>
        )}
      </>
    );
  };

  const usuarioAgendadoTemplate = (row) => {
    return (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            gap: "5px",
          }}
        >
          <h7> {moment(row?.dataInclusao).format("DD/MM/YYYY HH:mm")} </h7>
          {row?.usuarioAgendado}
        </div>
      </>
    );
  };

  const precoAtualTemplate = (rowData) => {
    let markup =
      ((rowData.precoAtual - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(markup) + " %";

    let precoAtualFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoAtual);

    return rowData.precoAtual === rowData.precoagendado &&
      rowData.precoAtual > rowData.precocusto ? (
      <>
        <div
          style={{
            fontSize: "17",
            display: "flex",
            flexDirection: "column",
            rowGap: "1px",
            color: "#0F9D58",
            margin: "5px",
          }}
        >
          <div> {markupFormatado} de Markup </div>
          Vendendo atualmente a
          <div>
            {" "}
            <font size="5"> {precoAtualFormatado} </font>{" "}
          </div>
        </div>
      </>
    ) : (
      <>
        <div
          style={{
            fontSize: "17",
            color: "#f69c22",
            margin: "5px",
            display: "flex",
            flexDirection: "column",
            rowGap: "1px",
          }}
        >
          <div> {markupFormatado} de Markup </div>
          <i> Vendendo atualmente a </i>
          <div>
            {" "}
            <font size="5"> {precoAtualFormatado} </font>{" "}
          </div>
        </div>
      </>
    );
  };

  const sugestaoVenda = (rowData) => {
    let sugestao =
      (rowData.precocusto * rowData.percentualmarkup) / 100 +
      rowData.precocusto;

    let sf = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(sugestao);

    let percentualmarkupSugerido = rowData.percentualmarkup;

    let mkf =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
      }).format(percentualmarkupSugerido) + " %";

    /********* */

    let margem = ((sugestao - rowData.precocusto) / sugestao) * 100;

    let margemformatada =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        // currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(margem) + " %";

    return (
      <>
        {sugestao > rowData.precocusto ? (
          <>
            <div style={{ fontSize: "14", color: "green" }}>
              <div>{mkf} de markup</div>
              <div> {margemformatada} de markdown</div>
              Sugestão de venda a <div>{sf}</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "14", color: "red" }}>
              <div>{mkf} de markup</div>
              <div> {margemformatada} de markdown</div>
              <s>Sugestão de venda a </s> <div>{sf}</div>
            </div>
          </>
        )}
      </>
    );
  };

  const status = (rowData) => {
    return rowData?.precoAtual === rowData?.precoagendado ? (
      <>
        <div
          style={{
            color: "#0F9D58",
          }}
        >
          <Tag
            value="Preço atual igual ao agendado"
            icon="pi pi-check-square"
            severity="success"
          ></Tag>
          <br />
          {rowData?.precoAtual < rowData?.precocusto ||
          rowData?.precoagendado < rowData?.precocusto ? (
            <>
              <Tag
                style={{ margin: "1rem" }}
                value="Preço abaixo do custo "
                icon="pi pi-exclamation-circle"
                severity="danger"
              ></Tag>
            </>
          ) : (
            <></>
          )}
        </div>
      </>
    ) : (
      <>
        <div style={{ color: "#f69c22" }}>
          <Tag
            value="Preço agendado 
            diverge do atual "
            icon="pi pi-exclamation-circle"
            severity="warning"
          ></Tag>
          <br />
          {rowData?.precoAtual < rowData?.precocusto ||
          rowData?.precoagendado < rowData?.precocusto ? (
            <>
              <Tag
                style={{ margin: "1rem" }}
                value="Preço abaixo do custo "
                icon="pi pi-exclamation-circle"
                severity="danger"
              ></Tag>
            </>
          ) : (
            <></>
          )}
        </div>
      </>
    );
  };

  const priceEditor = (options) => {
    return (
      <InputNumber
        autoFocus
        prefix="R$ "
        placeholder="Confirme ou altere o preço de venda"
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.value)}
        //   mode="currency"
        //  currency="BRL"
        mode="decimal"
        minFractionDigits={2}
        locale="pt-BR"
      />
    );
  };

  const usarTabelaFormacaoPreecoProduto = () => {
    api
      .get("/api/filial")
      .then((response) => {
        setQuantidadeFilial(response.data);

        if (quantidadeFilial.length < 1) {
          // console.log("tem uma filial" + quantidadeFilial.length);
          setQuantidadeFilial(0);
        } else {
          //  console.log('Tem diuas ou mais filial' + quantidadeFilial.length)
        }
      })
      .catch((error) => {
        // console.log(error)
        //    navigate("/");
      });
  };

  async function onRowEditComplete(e) {
    let _products2 = [...produtos];

    let { newData, index } = e;

    _products2[index] = newData;

    setProdutoSelecionado(null);

    let intFamilia = 0;

    if (_products2[index].idfamilia != null) {
      intFamilia = parseInt(_products2[index].idfamilia);
    }

    await api
      .put(
        `/api_precificacao/produtos/precificar/${_products2[index].idproduto}/${intFamilia}/${_products2[index].precoagendado}/${_products2[index].idfilial}/${replicarPreco}`,
        { produtos: _products2 }
      )
      .then((response) => {
        //   toast.current.show({severity: 'success', summary: 'Success Message', detail: 'Order submitted'});
        setProdutos(_products2);

        buscarProdutos();
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: ` ${_products2[index].descricao} atualizado para R$ ${_products2[index].precoagendado}  `,
        });
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: ` Erro ao atualizar ${_products2[index].descricao}  ... Erro : ${error}  `,
        });

        if (error.response.status === 401) {
          //  navigate("/");
        }
        //  setProdutos([]);
      });
  }

  const renderHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue2}
            onChange={onGlobalFilterChange2}
            placeholder="Pesquisa "
          />
        </span>

        <div>
          <h4>
            Exibindo dados de{" "}
            {moment(dataInicial).format("DD/MM/YYYY HH:mm:ss")} até{" "}
            {moment(dataFinal).format("DD/MM/YYYY HH:mm:ss")}{" "}
          </h4>
          <h3>
            {quantidadeFilial.length > 1 ? (
              replicarPreco ? (
                <h4 style={{ color: "green" }}>
                  {" "}
                  Replicando preços para todas as lojas
                </h4>
              ) : (
                <h4 style={{ color: "red" }}>
                  {" "}
                  Não replicando preços para todas as lojas
                </h4>
              )
            ) : (
              ""
            )}
          </h3>
        </div>

        <Card
          style={{
            backgroundColor:
              produtoStatusPendente?.length > 0 ? "red" : "green",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              color: "white",
            }}
          >
            <h1>
              {produtoStatusPendente?.length
                ? produtoStatusPendente?.length
                : ""}
            </h1>
            <h4>
              {produtoStatusPendente?.length > 0
                ? " produtos com preço divergente do agendado"
                : "Todos os preços estão atualizados"}
            </h4>
          </div>
        </Card>
      </div>
    );
  };

  const EanOrCodigo = (rowData) => {
    if (rowData.ean) {
      return (
        <>
          {rowData.ean}
          {/* <div>
            <img
              style={{
                width: "75px",
                height: "75px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${rowData.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={rowData.ean}
            />
            </div> */}
        </>
      );
    } else {
      return rowData.codigo;
    }
  };

  const onGlobalFilterChange2 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters2(_filters2);
    setGlobalFilterValue2(value);
  };

  const imprimePDFPrecosAgendados = () => {
    // console.log(produtos)

    var dd = {
      //   pageSize: {width : 1001 , height : 200},
      pageOrientation: "portrait",

      header: {
        columns: [{ text: "Relatório de preços agendados", style: "header" }],
      },

      footer: {
        columns: [
          {
            text: "Impresso em " + moment().format("DD/MM/yyyy HH:mm:ss"),

            style: "footer",
          },
        ],
      },

      styles: {
        i: { fontSize: 8 },
        header: {
          fontSize: 20,
          alignment: "center",
          marginTop: 5,
        },
        footer: {
          fontSize: 10,
          alignment: "center",
          marginTop: 5,
        },

        ean: {
          bold: true,
          fontSize: 8,
          //   fontSize : 50
        },
        descricao: {
          alignment: "left",
          bold: true,
          fontSize: 8,
          //   fontSize : 40,
        },
        preco: {
          alignment: "right",
          bold: true,
          fontSize: 8,
          //  fontSize : 85,
        },
      },

      content: produtos.map(function (item, i) {
        return {
          layout: "lightHorizontalLines", // optional
          lineHeight: 1,

          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: [20, 50, 40, 60, 90, 70, 70, "*"],

            body: [
              ["", "", "", "", "", "", "", ""],

              [
                { text: i + 1, style: "i" },
                {
                  text: "L" + item.idfilial + "-" + "N" + item.numeronotafiscal,
                  style: "ean",
                },
                {
                  text: moment(item.dataagendada).format("DD/MM/YY"),
                  style: "ean",
                },
                { text: item.ean ? item.ean : item.codigo, style: "ean" },
                { text: item.descricao, style: "descricao" },

                {
                  text:
                    "Agendado a R$ " +
                    Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      currency: "BRL",
                      minimumFractionDigits: "2",
                      maximumFractionDigits: "2",
                    }).format(item.precoagendado),
                  style: "preco",
                },
                {
                  text:
                    " Preço atual a R$ " +
                    Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      currency: "BRL",
                      minimumFractionDigits: "2",
                      maximumFractionDigits: "2",
                    }).format(item.precoAtual),
                  style: "preco",
                },
                {
                  text: item.usuarioAgendado?.substring(0, 35),
                  style: "descricao",
                },
              ],
            ],
          },
        };
      }),
    };

    pdfMake.createPdf(dd).open();
  };

  const textToBase64Barcode = (text) => {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, text, {
      format: "CODE128",
      displayValue: false,
      //  with: 2,
      // height: 50,
      // fontSize: 15,
    });
    return canvas.toDataURL("image/png");
  };

  const imprimeEtiquetaPrecosAgendadosModelo1 = () => {
    if (produtoSelecionado?.length) {
      var dd = {
        pageSize: { width: 1010, height: 310 },
        pageOrientation: "landscape",

        styles: {
          data: {
            fontSize: 25,
            bold: true,
          },
          eanTexto: { fontSize: 25, bold: true },
          ean: {
            fontSize: 100,
            alignment: "left",
            bold: true,
          },
          descricao: {
            alignment: "left",
            bold: true,
            fontSize: 48,
          },
          preco: {
            alignment: "left",
            bold: true,
            fontSize: 85,
          },
        },

        content: produtoSelecionado.map(function (item) {
          return {
            layout: "noBorders", // optional
            lineHeight: 1,

            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 0,
              widths: [1000, 100, 100, 100, 50, "*"],

              body: [
                //   ['', '', ''],

                [
                  {
                    image: textToBase64Barcode(
                      item.ean ? item.ean : item.codigo
                    ),
                    margin: [-30, -40],
                    style: "ean",
                  },

                  {
                    text: item.ean
                      ? "\n\n\n" + "Cód.Barras " + item.ean
                      : "\n\n\n" + "Código " + item.codigo,
                    style: "eanTexto",
                    margin: [-370, 0],
                  },
                  //    { qr: item.ean ? item.ean : item.codigo },

                  {
                    text: "\n\n" + item.descricao.substring(0, 50),
                    margin: [-1140, 30],
                    style: "descricao",
                  },

                  {
                    text:
                      "\n R$ " +
                      Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        currency: "BRL",
                        minimumFractionDigits: "2",
                        maximumFractionDigits: "2",
                      }).format(item.precoagendado),
                    margin: [-900, -145],
                    style: "preco",
                  },
                  {
                    text:
                      "Impresso em \n " +
                      moment(new Date()).format("DD/MM/YYYY"),
                    style: "data",
                    margin: [-540, 10],
                  },
                ],
              ],
            },
          };
        }),
      };

      pdfMake.createPdf(dd).open();
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Selecione os produtos que deseja imprimir as etiquetas`,
      });
    }
  };

  const imprimeEtiquetaPrecosAgendados = () => {
    if (produtoSelecionado?.length) {
      var dd = {
        pageSize: { width: 1010, height: 310 },
        pageOrientation: "landscape",

        styles: {
          data: {
            fontSize: 30,
            bold: true,
          },
          eanTexto: {
            fontSize: 25,
            bold: true,
            alignment: "right",
          },
          ean: {
            fontSize: 25,
            alignment: "center",
            bold: true,
          },
          descricao: {
            alignment: "left",
            bold: true,
            fontSize: 40,
          },
          preco: {
            alignment: "left",
            bold: true,
            fontSize: 75,
          },
        },

        content: produtoSelecionado.map(function (item) {
          return {
            layout: "noBorders", // optional
            lineHeight: 1,

            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 0,
              widths: [235, 500, 400, 200, 300, 0],

              body: [
                //   ['', '', ''],

                [
                  {
                    text: item.ean
                      ? "\n\n\n\n\n\n" + "Cód.Barras " + item.ean
                      : "\n\n\n\n\n\n" + "Código " + item.codigo,
                    style: "eanTexto",
                    margin: [-55, 0],
                  },
                  //    { qr: item.ean ? item.ean : item.codigo },

                  {
                    text: "\n\n" + item.descricao.substring(0, 50),
                    margin: [0, -100],
                    style: "descricao",
                  },

                  {
                    text:
                      "\n R$ " +
                      Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        currency: "BRL",
                        minimumFractionDigits: "2",
                        maximumFractionDigits: "2",
                      }).format(item.precoagendado),
                    margin: [-150, 0],
                    style: "preco",
                  },
                  {
                    text:
                      "Impresso em \n " +
                      moment(new Date()).format("DD/MM/YYYY"),
                    style: "data",
                    margin: [-380, 0],
                  },
                  {
                    image: textToBase64Barcode(
                      item.ean ? item.ean : item.codigo
                    ),
                    width: 225,
                    height: 150,
                    margin: [1400, 0],
                    style: "ean",
                  },
                ],
              ],
            },
          };
        }),
      };

      pdfMake.createPdf(dd).open();
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Selecione os produtos que deseja imprimir as etiquetas`,
      });
    }
  };

  const imprimeEtiquetaPrecosAgendadosQRCode = () => {
    if (produtoSelecionado?.length) {
      var dd = {
        pageSize: { width: 1010, height: 310 },
        pageOrientation: "landscape",

        styles: {
          data: {
            fontSize: 25,
            bold: true,
          },
          eanTexto: { fontSize: 25, bold: true },
          ean: {
            fontSize: 100,
            alignment: "left",
            bold: true,
          },
          descricao: {
            alignment: "left",
            bold: true,
            fontSize: 40,
          },
          preco: {
            alignment: "left",
            bold: true,
            fontSize: 85,
          },
        },

        content: produtoSelecionado.map(function (item) {
          return {
            layout: "noBorders", // optional
            lineHeight: 1,

            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 0,
              widths: [1000, 100, 100, 100, 50, "*"],

              body: [
                //   ['', '', ''],

                [
                  {
                    qr: item.ean
                      ? window.location.protocol +
                        "//" +
                        window.location.hostname +
                        ":" +
                        window.location.port +
                        "/consulta/" +
                        item.ean
                      : window.location.protocol +
                        "//" +
                        window.location.hostname +
                        ":" +
                        window.location.port +
                        "/consulta/" +
                        item.codigo,
                    margin: [-30, 0],
                    style: "ean",
                  },
                  /*     {
                    image: textToBase64Barcode(
                      item.ean ? item.ean : item.codigo
                    ),
                    margin: [-30, -40],
                    style: "ean",
                  }, */

                  {
                    text:
                      "\n\n\nImpresso em \n " +
                      moment(new Date()).format("DD/MM/YYYY"),
                    style: "eanTexto",
                    margin: [-750, 0],
                  },
                  //    { qr: item.ean ? item.ean : item.codigo },

                  {
                    text: item.descricao.substring(0, 50),
                    margin: [-950, 0],
                    style: "descricao",
                  },

                  {
                    text:
                      "\n R$ " +
                      Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        currency: "BRL",
                        minimumFractionDigits: "2",
                        maximumFractionDigits: "2",
                      }).format(item.precoagendado),
                    margin: [-650, 0],
                    style: "preco",
                  },
                  {
                    text: "",
                    style: "data",
                    margin: [-950, 0],
                  },
                ],
              ],
            },
          };
        }),
      };

      pdfMake.createPdf(dd).open();
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Selecione os produtos que deseja imprimir as etiquetas`,
      });
    }
  };

  const familiaIcone = (rowData) => {
    if (rowData.idfamilia > 0) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {rowData.descricao}
          <Button
            className="p-button-rounded p-button-secondary p-button-sm"
            tooltip="Será atualizado o preço da família"
            style={{ width: "1rem", margin: "5px" }}
            icon="pi pi-users"
          />
        </div>
      );
    } else {
      return <React.Fragment>{rowData.descricao}</React.Fragment>;
    }
  };

  const headerDataTable = renderHeader();

  const agrupamento = (rowData) => {
    let i = parseInt(rowData.numeronotafiscal);
    return i;
  };

  async function buscarProdutos() {
    usarTabelaFormacaoPreecoProduto();
    getProdutosPendentePreco();

    if (replicarPreco === undefined) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: ` Informe se deseja replicar a precificação para todas as filiais (Sim ou Não) `,
      });
    } else {
      if (dataInicial === undefined || dataFinal === undefined) {
        toast.current.show({
          severity: "warn",
          summary: "Aviso",
          detail: ` Informe a data inicial e final  `,
        });
      } else {
        if (dataInicial && dataFinal) {
          let filialId = filiaisSelect ? filiaisSelect.id : 0;

          setLoading(true);

          await api

            .get(
              `/api_precificacao/produtos/precificar/${moment(
                dataInicial
              ).format("YYYY-MM-DD HH:mm:ss [GMT]Z")}/${moment(
                dataFinal
              ).format(
                "YYYY-MM-DD HH:mm:ss [GMT]Z"
              )}/${filialId}/${modoPesquisa}`
            )
            .then((response) => {
              setProdutos(response.data);
              //  console.log(response.data);
              setLoading(false);

              if (response.data.length === 0) {
                toast.current.show({
                  severity: "warn",
                  summary: "Aviso",
                  detail: ` Nenhum produto encontrado para precificação !  `,
                });
              }
            })
            .catch((error) => {
              if (error?.response?.status === 401) {
                alert("Token expirado! Por favor faça login novamente!");
                navigate("/");
                localStorage.clear();
              }

              toast.current.show({
                severity: "error",
                summary: "Erro",
                detail: ` ${error}  `,
              });
            })
            .finally((f) => {
              setLoading(false);
            });
        }
      }
    }
  }

  const selecionarEtiqueta = (e) => {
    switch (e) {
      case 1:
        imprimeEtiquetaPrecosAgendadosModelo1();
        setEtiquetaSelecionada(e);
        break;
      case 2:
        imprimeEtiquetaPrecosAgendados();
        setEtiquetaSelecionada(e);
        break;
      case 3:
        imprimeEtiquetaPrecosAgendadosQRCode();
        setEtiquetaSelecionada(e);
        break;
      default:
        break;
    }
  };

  const getProdutosPendentePreco = () => {
    return api
      .get(
        `/api_precificacao/produtos/pendentes/${moment(dataInicial).format(
          "YYYY-MM-DD HH:mm:ss [GMT]Z"
        )}/${moment(dataFinal).format(
          "YYYY-MM-DD HH:mm:ss [GMT]Z"
        )}/${modoPesquisa}`
      )
      .then((r) => {
        setProdutoStatusPendente(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const botaovoltar = (
    <React.Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <Button
          className="p-button-rounded p-button-danger p-button-sm"
          tooltip="Voltar"
          label="Voltar"
          tooltipOptions={{ position: "bottom" }}
          icon="pi pi-arrow-left"
          style={{
            margin: "0px 5px",
          }}
          onClick={() => setProdutos([])}
        />

        <Button
          onClick={() => buscarProdutos()}
          tooltip="Atualizar"
          label="Recarregar"
          tooltipOptions={{ position: "bottom" }}
          icon="pi pi-refresh"
          className=" p-button-rounded p-button-success p-button-sm"
          style={{
            margin: "0px 5px",
          }}
        />
        {/*
      <Button
        onClick={() => imprimeEtiquetaPrecosAgendados()}
        tooltip="Imprimir etiqueta dos preços agendados selecionados "
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-print"
        style={{ margin: "10px" }}
        className=" p-button-rounded p-button-segundary p-button-sm"
      />
      
      */}

        <Button
          onClick={() => imprimePDFPrecosAgendados()}
          tooltip="Imprimir relatório dos preços agendados "
          label="Relatório de preços agendados"
          tooltipOptions={{ position: "bottom" }}
          icon="pi pi-file-pdf"
          style={{
            margin: "0px 5px",
          }}
          className=" p-button-rounded p-button-info p-button-sm"
        />

        <Dropdown
          style={{
            margin: "0px 5px",
          }}
          value={etiquetaSelecionada}
          options={[
            {
              name: "Etiqueta 101x31 - Quebra linha, preço a direita, cod.Barras",
              value: 2,
            },
            {
              name: "Etiqueta 101x31 - Preço centralizado, cod.Barras",
              value: 1,
            },

            {
              name: "Etiqueta 101x31 - Preço a direita QRCODE",
              value: 3,
            },
          ]}
          onChange={(e) => selecionarEtiqueta(e.value)}
          optionLabel="name"
          placeholder="Selecione um modelo de etiqueta"
        />
        <Button
          style={{
            margin: "0px 5px",
          }}
          tooltip="Imprimir etiqueta selecionada "
          label="Imprimir etiquetas"
          tooltipOptions={{ position: "bottom" }}
          icon="pi pi-print"
          className="p-button-rounded p-button-info"
          onClick={() => selecionarEtiqueta(etiquetaSelecionada)}
        />
      </div>
    </React.Fragment>
  );

  const botaoatualizar = () => (
    <>
      <Button
        onClick={() => handlePrint()}
        label="Imprimir tabela "
        tooltip="Imprimir tabela"
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-file-pdf"
        style={{ margin: "1rem" }}
        className=" p-button-rounded p-button-info"
      />
    </>
  );

  const MostraListaFilial = () => {
    if (quantidadeFilial.length > 1) {
      return (
        <>
          Loja
          <Dropdown
            showClear
            onChange={(e) => setFiliaisSelect(e.value)}
            value={filiaisSelect}
            options={quantidadeFilial}
            optionLabel="nome"
            placeholder="Selecione uma loja "
            emptyMessage="Nenhuma loja encontrada."
            dropdownIcon="pi pi-chevron-down"
          />
        </>
      );
    } else {
      return <></>;
    }
  };

  const buscarUsuarioPorCodigo = () => {
    return api
      .get(`/api/usuarios/logado/${context?.usuarioLogado}`)
      .then((r) => {
        SetUsuario(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const fetchFamilia = async (idFamilia) => {
    return api
      .get(`/api/produto/familia/${idFamilia}`)
      .then((r) => {
        //console.log(r.data);

        api_uniplus
          .post("/public-api/v1/produtos/precos", r.data)
          .then((response) => {
            // console.log(response.data);
            // setMensagens([response?.data]);
            console.log(response.data);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const fetchFamiliaMultEmpresa = async (idFamilia, idfilial) => {
    return api
      .get(`/api/produto/familia/multempresa/${idFamilia}/${idfilial}`)
      .then((r) => {
        // console.log(r.data);

        let selectedProductsFamilia = r?.data.map((element) => ({
          codigo: element?.codigo,

          precos: [
            {
              filial: idfilial,
              preco: element?.preco,
            },
          ],
        }));

        // console.log(selectedProductsFamilia);

        api_uniplus
          .post("/public-api/v1/produtos/precos", selectedProductsFamilia)
          .then((response) => {
            // console.log(response.data);
            // setMensagens([response?.data]);
            console.log(response.data);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const atualizarProdutosSelecionadosUniplusApiMultEmpresa = async () => {
    if (quantidadeFilial.length > 1) {
      let results = [];

      let selectedProducts = produtos
        .filter((val) => produtoSelecionado.includes(val))
        .map((element) => ({
          codigo: element?.codigo,
          precos: [
            {
              filial: element.idfilial,
              preco: element.precoagendado,
            },
          ],
        }));

      let selectedProductsFamilia = produtos
        .filter((val) => produtoSelecionado.includes(val))
        .map((element) => ({
          codigo: element?.codigo,
          precos: [
            {
              filial: element?.idfilial,
              preco: element?.precoagendado,
            },
          ],
          idfamilia: element?.idfamilia,
          idfilial: element?.idfilial,
        }));

      setMensagens([]);
      setloadingApiUniplus(true);

      await api_uniplus
        .post("/public-api/v1/produtos/precos", selectedProducts)
        .then((response) => {
          // console.log(response.data);
          setMensagens([response?.data]);
        })
        .catch((error) => {
          console.log(error);

          /*  toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` ${error.message}  `,
          }); */
        })
        .finally(() => {
          setloadingApiUniplus(false);
          buscarProdutos();
          setProdutoSelecionado(null);
        });

      for (const element of selectedProductsFamilia) {
        if (element.idfamilia != null) {
          let familiaData = await fetchFamiliaMultEmpresa(
            element?.idfamilia,
            element?.idfilial
          );
          if (familiaData) {
            results.push(familiaData);
          }
        }
      }
    }
  };

  const atualizarProdutosSelecionadosUniplusApi = async () => {
    if (quantidadeFilial.length === 1) {
      let results = [];

      let selectedProducts = produtos
        .filter((val) => produtoSelecionado.includes(val))
        .map((element) => ({
          codigo: element?.codigo,
          preco: element?.precoagendado,
        }));

      let selectedProductsFamilia = produtos
        .filter((val) => produtoSelecionado.includes(val))
        .map((element) => ({
          codigo: element?.codigo,
          preco: element?.precoAtual,
          idfamilia: element?.idfamilia,
        }));

      setMensagens([]);
      setloadingApiUniplus(true);

      await api_uniplus
        .post("/public-api/v1/produtos/precos", selectedProducts)
        .then((response) => {
          // console.log(response.data);
          setMensagens([response?.data]);
        })
        .catch((error) => {
          console.log(error);

          /*  toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` ${error.message}  `,
          }); */
        })
        .finally(() => {
          setloadingApiUniplus(false);
          buscarProdutos();
          setProdutoSelecionado(null);
        });

      for (const element of selectedProductsFamilia) {
        if (element.idfamilia != null) {
          let familiaData = await fetchFamilia(element?.idfamilia);
          if (familiaData) {
            results.push(familiaData);
          }
        }
      }
    }
  };

  const atualizarProdutosSelecionados = () => {
    let _products = produtos.filter((val) => produtoSelecionado.includes(val));

    //console.log(_products);

    _products.forEach((element) => {
      let intFamilia = 0;

      if (element.idfamilia != null) {
        intFamilia = parseInt(element.idfamilia);
      }

      api
        .put(
          `/api_precificacao/produtos/precificar/${element.idproduto}/${intFamilia}/${element.precoagendado}/${element.idfilial}/${replicarPreco}/${usuario?.id}`,
          {
            idproduto: element?.idproduto,
            idfamilia: intFamilia,
            precoAgendado: element?.precoagendado,
            precoAtual: element?.precoAtual,
            idfilial: element?.idfilial,
            idusuario: usuario?.id,
          }
        )
        .then((r) => {})
        .catch((e) => {
          /*  toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` ${e.message}  `,
          }); */
        })
        .finally((f) => {
          buscarProdutos();
          setProdutoSelecionado(null);
          _products = null;
        });
    });
  };

  const MostraSelectReplicarPrecoFilial = () => {
    if (quantidadeFilial.length > 1) {
      return (
        <>
          <h5 style={{ margin: "10px" }}>
            Replicar os preços para todas as lojas ?
          </h5>
          <SelectButton
            value={replicarPreco}
            options={replicarPrecoOpcoes}
            onChange={(e) => setReplicarPreco(e.value)}
          ></SelectButton>
        </>
      );
    } else {
      return <></>;
    }
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

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <Header />
      <Footer />

      <div className="agenda-label">
        <h1 style={{ fontFamily: "cabin-sketch-bold" }}>
          {produtos?.length < 1 ? "Pesquisar agendamentos de preços," : ""}
        </h1>

        <h4
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "cabin-sketch-bold",
          }}
        >
          {produtos?.length < 1 ? "Atualizar os preços de venda" : ""}
        </h4>

        {quantidadeFilial.length > 1 ? (
          <>
            {replicarPreco ? (
              <Tag
                className="mr-10"
                style={{ margin: "5px" }}
                rounded
                value="Replicar a atualização de preços para todas as lojas"
                severity="info"
                icon="pi pi-check"
              ></Tag>
            ) : (
              <Tag
                className="mr-10"
                style={{ margin: "5px" }}
                icon="pi pi-times"
                rounded
                severity="danger"
                value="Não replicar a atualização de preços para todas as lojas"
              ></Tag>
            )}
          </>
        ) : (
          <></>
        )}
      </div>

      {produtos.length < 1 ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              color: "#f2f2f2",
              margin: "5px",
              justifyContent: "center",
              alignContent: "center",
              flexWrap: "wrap",
              gap: "5px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                flexWrap: "wrap",

                gap: "5px",
              }}
            >
              Pesquisar por
              <SelectButton
                value={modoPesquisa}
                onChange={(e) => {
                  setDataInicial(null);
                  setDataFinal(null);
                  setModoPesquisa(e.value);
                }}
                options={modosDePesquisa}
              />
              Período
              <Calendar
                selectOtherMonths
                required
                showIcon
                placeholder="Data inicial do agendamento"
                dateFormat="dd/mm/yy "
                viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                hideOnDateTimeSelect
                value={dataInicial}
                onChange={(e) => {
                  setDataInicial(e.target.value);
                  dataInicial?.setUTCHours(dataInicial.getUTCHours() - 3);
                }}
                showButtonBar
                locale="pt-BR"
                showTime={modoPesquisa}
                //  showSeconds
              />
              até
              <Calendar
                selectOtherMonths
                required
                showIcon
                placeholder="Data final do agendamento"
                dateFormat="dd/mm/yy"
                hideOnDateTimeSelect
                value={dataFinal}
                onChange={(e) => {
                  setDataFinal(e.value);
                  dataFinal?.setUTCHours(dataFinal.getUTCHours() - 3);
                }}
                showButtonBar
                locale="pt-BR"
                showTime={modoPesquisa}
                //  showSeconds
              />
              <MostraListaFilial />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              flexDirection: "column",
              margin: "10px",
            }}
          >
            <MostraSelectReplicarPrecoFilial />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
              label={loading ? "Pesquisando ..." : " Pesquisar agendamento(s) "}
              disabled={loading}
              className="p-button-rounded p-button-success p-button-md"
              onClick={() => buscarProdutos()}
            />
          </div>
        </>
      ) : (
        <>
          {produtoStatusPendente?.length > 0 ? (
            <></>
          ) : (
            <Player
              src={DestaqueImg}
              loop
              autoplay
              style={{ width: "350px" }}
            />
          )}
          <div
            style={{
              border: "1px solid #F2f2f2",
              padding: "1px",
              margin: "1px",
            }}
          >
            <Toolbar
              style={{ border: "none" }}
              left={botaovoltar}
              right={botaoatualizar}
            />

            {localStorage.getItem("access_token_uniplus")?.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                ></div>

                {/* <Messages ref={messages} /> */}

                {/* <Tag
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  severity="success"
                  value="Utilizando a API do uniplus"
                ></Tag> */}

                {loadingApiUniplus ? (
                  <>
                    <div
                      style={{
                        backgroundColor: "#f2f2f2",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <h4> Aguarde por favor, Enviando ao PDV !</h4>
                    </div>

                    <ProgressBar
                      mode="indeterminate"
                      style={{ height: "36px" }}
                    ></ProgressBar>
                  </>
                ) : (
                  <></>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "stretch",
                    gap: "1rem",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  {mensagens[0]?.mensagens?.length > 0 ? (
                    <>
                      <div style={{ color: "green" }}>
                        <p>
                          Os seguintes produtos foram enviados ao PDV com
                          sucesso !{" "}
                        </p>
                        {mensagens[0]?.mensagens?.map((m, index) => (
                          <p key={index}>{m}</p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <></>
                  )}

                  {mensagens[0]?.erros.length > 0 ? (
                    <>
                      <div style={{ color: "red" }}>
                        <p>
                          Os seguintes produtos não foram enviados ao PDV devido
                          aos seguintes erros :{" "}
                        </p>
                        {mensagens[0]?.erros?.map((m, index) => (
                          <p key={index}>{m}</p>
                        ))}
                        <p>Corrija os erros e tente novamente</p>
                      </div>
                    </>
                  ) : (
                    <> </>
                  )}
                  {mensagens?.length > 0 ? (
                    <>
                      <div style={{ margin: "5px" }}>
                        <Button
                          label="Fechar"
                          onClick={() => setMensagens([])}
                          icon="pi pi-times"
                          className="p-button p-button-rounded p-button-danger"
                        />
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "1rem",
              }}
            >
              <Button
                label={`Gravar ( ${
                  produtoSelecionado ? produtoSelecionado?.length : 0
                }  ) preços agendados `}
                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-save"}
                disabled={!produtoSelecionado || !produtoSelecionado.length}
                className={!produtoSelecionado?.length > 0 ? 'p-button-rounded p-button-danger' : 'p-button-rounded p-button-success'}
                onClick={() => {
                  atualizarProdutosSelecionadosUniplusApi();
                  atualizarProdutosSelecionadosUniplusApiMultEmpresa()
                  atualizarProdutosSelecionados();
                }}
              />
            </div>
          </div>
          <div ref={tabelaRef}>
            <DataTable
              style={{ padding: "1px", margin: "1px", marginBottom: "10px" }}
              footer={"Existem " + produtos.length + " produto(s) para análise"}
              loading={loading}
              stripedRows
              value={produtos}
              //   reorderableColumns
              editMode="row"
              dataKey="idproduto"
              onRowEditComplete={onRowEditComplete}
              //    scrollDirection="vertical"
              //    scrollable
              //    scrollHeight="flex"
              globalFilterFields={[
                "descricao",
                "ean",
                "numeronotafiscal",
                "razaosocial",
              ]}
              filters={filters2}
              size="small"
              emptyMessage="Nenhum produto encontrado para precificação"
              showGridlines
              header={headerDataTable}
              //   rowGroupMode="subheader"
              //    groupRowsBy={agrupamento}
              //paginator
              //rows={3}
              paginatorTemplate={template1}
              //  sortOrder={1}
              //     rowGroupHeaderTemplate={headerTemplate}
              // resizableColumns
              // columnResizeMode="expand"
              //  expandableRowGroups
              //  expandedRows={expandedRows}
              //   onRowToggle={(e) => setExpandedRows(e.data)}
              selection={produtoSelecionado}
              onSelectionChange={(e) => setProdutoSelecionado(e.value)}
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
                exportable={false}
              ></Column>
              <Column sortable header="Loja" field="nomeFilial"></Column>
              <Column header="N° Nota fiscal" field="numeronotafiscal"></Column>
              <Column header="Código " body={EanOrCodigo}></Column>

              <Column
                field="descricao"
                header="Produto"
                sortable
                rowSpan={2}
                body={familiaIcone}
              ></Column>
              <Column
                field={precoCustoTemplate}
                header="Custo"
                body={precoCustoTemplate}
              ></Column>

              <Column
                field={margem}
                header={
                  <>
                    {" "}
                    <div>
                      {" "}
                      Agendado <hr />{" "}
                    </div>{" "}
                    <br /> <div> Margem % </div> <br /> <div> Lucro </div>{" "}
                  </>
                }
                body={margem}
              ></Column>

              <Column
                field={margemAtual}
                header={
                  <>
                    <div>
                      Preço Atual <hr />
                    </div>
                    <br /> <div> Margem % </div> <br /> <div> Lucro </div>
                  </>
                }
                body={margemAtual}
                bodyStyle={{
                  textAlign: "center",
                }}
              ></Column>

              <Column
                style={{ fontWeight: "600", fontSize: "14px" }}
                field={sugestaoVenda}
                header={
                  <>
                    {" "}
                    <div>
                      {" "}
                      Sugestão <hr />{" "}
                    </div>{" "}
                    <br /> <div> Markup % </div> <br /> <div> Venda </div>{" "}
                  </>
                }
                body={sugestaoVenda}
              ></Column>

              <Column
                field="precoagendado"
                header={
                  <>
                    {" "}
                    <div>
                      {" "}
                      Preço Agendado <hr />{" "}
                    </div>{" "}
                    <br /> <div> Markup % </div> <br /> <div> Venda </div>{" "}
                  </>
                }
                body={precoAgendadoTemplate}
                style={{ fontWeight: "600" }}
                editor={(options) => priceEditor(options)}
              ></Column>

              <Column
                field={precoAtualTemplate}
                header={
                  <>
                    {" "}
                    <div>
                      {" "}
                      Preço Atual <hr />{" "}
                    </div>{" "}
                    <br /> <div> Markup % </div> <br /> <div> Venda </div>{" "}
                  </>
                }
                style={{ fontSize: "17", fontWeight: "600" }}
                body={precoAtualTemplate}
              ></Column>

              <Column
                header="Agendado por"
                field={usuarioAgendadoTemplate}
                style={{ textAlign: "center", fontWeight: "600" }}
              ></Column>

              <Column
                header="Status"
                field={status}
                body={status}
                style={{ textAlign: "center", fontWeight: "600" }}
              ></Column>
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
                exportable={false}
              ></Column>
            </DataTable>
          </div>
        </>
      )}
    </>
  );
};

export default PrecificadorExecuta;
