import React, { useState, useEffect, useRef } from "react";

import "./styless.css";

import { SelectButton } from "primereact/selectbutton";
import Header from "../../../../../components/header";
import Footer from "../../../../../components/footer";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";

import { Tooltip } from "primereact/tooltip";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { addLocale } from "primereact/api";

import JsBarcode from "jsbarcode/bin/JsBarcode";

import { Tag } from "primereact/tag";
import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";

import Typing from "react-typing-animation";

import api from "../../../../../services/axios";
//import { useNavigate } from "react-router-dom";

import moment from "moment";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const ProdutoPrecificadorExecuta = () => {
  //  const navigate = useNavigate();
  const [lojas, setLojas] = useState([]);
  const [filiaisSelect, setFiliaisSelect] = useState(0);
  const [etiquetaSelecionada, setEtiquetaSelecionada] = useState("");
  const toast = useRef(null);
  const [quantidadeFilial, setQuantidadeFilial] = useState([0]);
  const [headers, setHeaders] = useState();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();
  const [replicarPreco, setReplicarPreco] = useState(1);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  //const [expandedRows, setExpandedRows] = useState(null);
  const replicarPrecoOpcoes = [
    { label: "Sim", value: 1 },
    { label: "Não", value: 0 },
  ];
  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    produto: { value: null, matchMode: FilterMatchMode.CONTAINS },
    razaosocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numeronotafiscal: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [layoutDatable, setLayoutDatable] = useState(false);

  //let eanUrl = "https://cdn-cosmos.bluesoft.com.br/products";
  let eanUrl = "http://www.eanpictures.com.br:9000/api/gtin";

  useEffect(() => {
    pegarTokenLocalStorage();
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

  const pegarTokenLocalStorage = () => {
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);
    var headers = {
      Authorization: "Bearer " + a.access_token,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    setHeaders(headers);

    api.interceptors.request.use(
      (config) => {
        // Do something before request is sent

        config.headers["Authorization"] = "bearer " + a.access_token;
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
      ((rowData.precoAgendado - rowData.precocusto) / rowData.precoAgendado) *
      100;

    // Margem em valor monetário: Preço de venda - Preço de compra
    let rsmargem = rowData.precoAgendado - rowData.precocusto;

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
    let margem = ((rowData.preco - rowData.precocusto) / rowData.preco) * 100;

    // Margem em valor monetário: Preço de venda - Preço de compra
    let rsmargem = rowData.preco - rowData.precocusto;

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
      ((rowData.precoAgendado - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(markup) + " %";

    let precoAgendadoFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoAgendado);

    return (
      <>
        {rowData.precoAgendado > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              {markupFormatado} de Markup <br />
              Agendado a <br />
              <font size="5"> {precoAgendadoFormatado} </font>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {markupFormatado} de Markup <br />
              Agendado a <br />
              <font size="5"> {precoAgendadoFormatado} </font>
            </div>
          </>
        )}
      </>
    );
  };

  const precoTemplate = (rowData) => {
    let markup =
      ((rowData.preco - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(markup) + " %";

    let precoFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco);

    return rowData.preco === rowData.precoAgendado &&
      rowData.preco > rowData.precocusto ? (
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
            <font size="5"> {precoFormatado} </font>{" "}
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
            <font size="5"> {precoFormatado} </font>{" "}
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
    return rowData.preco === rowData.precoAgendado ? (
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
          {rowData.preco < rowData.precocusto ||
          rowData.precoAgendado < rowData.precocusto ? (
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
          {rowData.preco < rowData.precocusto ||
          rowData.precoAgendado < rowData.precocusto ? (
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
      .get("/api/filial", { headers: headers })
      .then((response) => {
        setQuantidadeFilial(response.data);
        setLojas(response.data);

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

    pegarTokenLocalStorage();

    setProdutoSelecionado(null);

    let intFamilia = 0;

    if (_products2[index].idfamilia != null) {
      intFamilia = parseInt(_products2[index].idfamilia);
    }

    await api
      .put(
        `/api_precificacao/produtos/precificar/${_products2[index].idproduto}/${intFamilia}/${_products2[index].precoAgendado}/${_products2[index].idfilial}/${replicarPreco}`,
        { headers: headers }
      )
      .then((response) => {
        //   toast.current.show({severity: 'success', summary: 'Success Message', detail: 'Order submitted'});
        setProdutos(_products2);
        buscarProdutos();
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: ` ${_products2[index].produto} atualizado para R$ ${_products2[index].precoAgendado}  `,
        });
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: ` Erro ao atualizar ${_products2[index].produto}  ... Erro : ${error}  `,
        });

        if (error.response.status === 401) {
          //  navigate("/");
        }
        //  setProdutos([]);
      });
  }

  const renderHeader = () => {
    return (
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
          </div>
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
        columns: ["Relatório de preços agendados"],
        style: "header",
      },
      footer: {
        columns: [`${lojas.map((m) => m.id + " - " + m.nome + " ")}`],
        style: "footer",
      },

      styles: {
        i: { fontSize: 8 },
        header: {
          fontSize: 20,
          alignment: "center",
          marginTop: 5,
        },
        footer: {
          fontSize: 8,
          alignment: "center",
          marginTop: 5,
        },

        ean: {
          bold: true,
          fontSize: 8,
          //   fontSize : 50
        },
        loja: {
          bold: true,
          fontSize: 8,
          //   fontSize : 50
        },
        produto: {
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
            widths: [25, 10, 65, 60, 100, 70, 70, "*"],

            body: [
              ["", "", "", "", "", "", "", ""],

              [
                { text: i + 1, style: "i" },
                { text: item.idfilial, style: "loja" },
                {
                  text: moment(item.dataagendada).format("DD/MM/YY"),
                  style: "ean",
                },
                { text: item.ean ? item.ean : item.codigo, style: "ean" },
                { text: item.produto, style: "produto" },

                {
                  text:
                    "Agendado a R$ " +
                    Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      currency: "BRL",
                      minimumFractionDigits: "2",
                      maximumFractionDigits: "2",
                    }).format(item.precoAgendado),
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
                    }).format(item.preco),
                  style: "preco",
                },
                {
                  text: item.usuarioAgendado?.substring(0, 35),
                  style: "produto",
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
          produto: {
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
                    text: "\n\n" + item.produto.substring(0, 50),
                    margin: [-1140, 30],
                    style: "produto",
                  },

                  {
                    text:
                      "\n R$ " +
                      Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        currency: "BRL",
                        minimumFractionDigits: "2",
                        maximumFractionDigits: "2",
                      }).format(item.precoAgendado),
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
          produto: {
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
                    text: "\n\n" + item.produto.substring(0, 50),
                    margin: [0, -100],
                    style: "produto",
                  },

                  {
                    text:
                      "\n R$ " +
                      Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        currency: "BRL",
                        minimumFractionDigits: "2",
                        maximumFractionDigits: "2",
                      }).format(item.precoAgendado),
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
          produto: {
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
                    text: item.produto.substring(0, 50),
                    margin: [-950, 0],
                    style: "produto",
                  },

                  {
                    text:
                      "\n R$ " +
                      Intl.NumberFormat("pt-BR", {
                        style: "decimal",
                        currency: "BRL",
                        minimumFractionDigits: "2",
                        maximumFractionDigits: "2",
                      }).format(item.precoAgendado),
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
        <React.Fragment>
          <h5>{rowData.produto}</h5>
          <Button
            className="p-button-rounded p-button-secondary p-button-sm"
            tooltip="Será atualizado o preço da família"
            style={{ width: "1rem", margin: "5px" }}
            icon="pi pi-users"
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {" "}
          <h5>{rowData.produto}</h5>
        </React.Fragment>
      );
    }
  };

  const headerDataTable = renderHeader();

  const agrupamento = (rowData) => {
    let i = parseInt(rowData.numeronotafiscal);
    return i;
  };

  async function buscarProdutos() {
    pegarTokenLocalStorage();

    usarTabelaFormacaoPreecoProduto();

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
              `/api_precificacao/produtos/precificar/produto/${moment(
                dataInicial
              ).format("YYYY-MM-DD HH:mm:ss [GMT]Z")}/${moment(
                dataFinal
              ).format(
                "YYYY-MM-DD HH:mm:ss [GMT]Z"
              )}/${filialId}/0`,
              {
                headers: headers,
              }
            )
            .then((response) => {
              setProdutos(response.data);
              console.log(response.data);
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
                //   navigate("/");
              }

              toast.current.show({
                severity: "error",
                summary: "Erro",
                detail: ` ${error}  `,
              });

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

  const botaovoltar = (
    <React.Fragment>
      <Button
        className="p-button-rounded p-button-danger p-button-sm"
        tooltip="Voltar"
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-arrow-left"
        style={{
          margin: "0px 10px",
        }}
        onClick={() => setProdutos([])}
      />

      <Button
        onClick={() => buscarProdutos()}
        tooltip="Atualizar"
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-refresh"
        className=" p-button-rounded p-button-success p-button-sm"
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
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-file-pdf"
        style={{ margin: "5px" }}
        className=" p-button-rounded p-button-info p-button-sm"
      />

      <Dropdown
        style={{ margin: "10px" }}
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
        tooltip="Imprimir etiqueta selecionada "
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-print"
        className="p-button-rounded p-button-info"
        onClick={() => selecionarEtiqueta(etiquetaSelecionada)}
      />

      {window.innerWidth <= 1390 ? (
        <SelectButton
          style={{ margin: "10px" }}
          value={layoutDatable}
          options={[
            { name: "Layout 1", value: true },
            { name: "Layout 2", value: false },
          ]}
          optionLabel="name"
          onChange={(e) => setLayoutDatable(e.value)}
        />
      ) : (
        <></>
      )}
    </React.Fragment>
  );

  const botaoatualizar =
    quantidadeFilial.length > 1 ? (
      <React.Fragment>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Button
            style={{ margin: "10px" }}
            label="Gravar preços agendados"
            tooltip="Atualizar produtos selecionados"
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-save"}
            disabled={!produtoSelecionado || !produtoSelecionado.length}
            className="p-button-rounded p-button-success"
            onClick={() => atualizarProdutosSelecionados()}
          />
        </div>
        {replicarPreco ? (
          <Tag
            className="mr-1"
            style={{ margin: "5px" }}
            rounded
            value="Replicar a atualização de preços para todas as lojas"
            severity="info"
            icon="pi pi-check"
          ></Tag>
        ) : (
          <Tag
            className="mr-1"
            style={{ margin: "5px" }}
            icon="pi pi-times"
            rounded
            severity="danger"
            value="Não replicar a atualização de preços para todas as lojas"
          ></Tag>
        )}
      </React.Fragment>
    ) : (
      <>
        <Button
          label="Gravar preços agendados"
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-save"}
          disabled={!produtoSelecionado || !produtoSelecionado.length}
          className="p-button-rounded p-button-success"
          onClick={() => atualizarProdutosSelecionados()}
        />
      </>
    );

  const MostraListaFilial = () => {
    if (quantidadeFilial.length > 1) {
      return (
        <>
          <div>
            <h4>Loja</h4>
          </div>
          <Dropdown
            showClear
            onChange={(e) => setFiliaisSelect(e.value)}
            value={filiaisSelect}
            options={quantidadeFilial}
            optionLabel="razaosocial"
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

  const atualizarProdutosSelecionados = () => {
    let _products = produtos.filter((val) => produtoSelecionado.includes(val));

    _products.forEach((element) => {
      let intFamilia = 0;

      if (element.idfamilia != null) {
        intFamilia = parseInt(element.idfamilia);
      }

      api
        .put(
          `/api_precificacao/produtos/precificar/${element.idproduto}/${intFamilia}/${element.precoAgendado}/${element.idfilial}/${replicarPreco}`,
          { headers: headers }
        )
        .then((r) => {})
        .catch((e) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` ${e.data}  `,
          });
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
      <div className="header">
        <Header />
        <Footer />
      </div>
      <div className="agenda-label">
        <h1 style={{ fontFamily: "cabin-sketch-bold" }}>
          Pesquisar agendamentos de preços de produtos,{" "}
        </h1>

        <h4
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "cabin-sketch-bold",
          }}
        >
          Atualizar os preços de venda
        </h4>
      </div>

      {produtos.length < 1 ? (
        <>
          <div className="container-flex">
            <div className="form-precificador">
              <div className="form-precificador-input">
                <div>
                  <h5>Período</h5>
                </div>
                <Calendar
                  selectOtherMonths
                  required
                  showIcon
                  placeholder="Data inicial do agendamento"
                  dateFormat="dd/mm/yy "
                  viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  hideOnDateTimeSelect
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  showButtonBar
                  locale="pt-BR"
                  //   showTime
                  //  showSeconds
                />
              </div>
              <div className="form-precificador-input">
                <div>
                  <h5>até</h5>
                </div>

                <Calendar
                  selectOtherMonths
                  required
                  showIcon
                  placeholder="Data final do agendamento"
                  dateFormat="dd/mm/yy"
                  hideOnDateTimeSelect
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.value)}
                  showButtonBar
                  locale="pt-BR"
                  //    showTime
                  //  showSeconds
                />
              </div>

              <div className="form-precificador-input">
                <MostraListaFilial />
              </div>
            </div>
            <div className="form-precificador-btn">
              <MostraSelectReplicarPrecoFilial />
            </div>
            <div className="form-precificador-btn">
              <Button
                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
                label={loading ? "Pesquisando ..." : " Pesquisar "}
                disabled={loading}
                className="p-button-rounded p-button-success p-button-md"
                onClick={() => buscarProdutos()}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="container-flex">
            <Toolbar
              style={{ border: "none" }}
              left={botaovoltar}
              right={botaoatualizar}
            />

            <div>
              <DataTable
                responsiveLayout={layoutDatable ? "stack" : "scroll"}
                breakpoint="1390px"
                style={{ width: "100%", backgroundColor: "#F2F2F2" }}
                footer={
                  "Existem " + produtos.length + " produto(s) para análise"
                }
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
                  "filial",
                  "produto",
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
                paginator
                rows={3}
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
                <Column header="Loja " sortable field="filial"></Column>
                <Column header="Código " field={EanOrCodigo}></Column>

                <Column
                  field="produto"
                  header="Produto"
                  sortable
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
                  field="precoAgendado"
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
                  field={precoTemplate}
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
                  body={precoTemplate}
                ></Column>

                <Column
                  header="Agendado por"
                  field="usuarioAgendado"
                  style={{ textAlign: "center", fontWeight: "600" }}
                ></Column>

                <Column
                  header="Status"
                  field={status}
                  style={{ textAlign: "center", fontWeight: "600" }}
                ></Column>

                <Column
                  header="Atualizar e Confirmar"
                  rowEditor
                  headerStyle={{ width: "10%", minWidth: "8rem" }}
                  bodyStyle={{ textAlign: "center" }}
                ></Column>
              </DataTable>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProdutoPrecificadorExecuta;
