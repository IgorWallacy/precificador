import React, { useState, useEffect, useRef } from "react";
import DestaqueImg from "../../../../assets/img/price_analise.json";
import LoadingNotas from "../../../../assets/img/notas_loading.json";

import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import "./styless.css";
import { Player } from "@lottiefiles/react-lottie-player";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { Avatar } from "primereact/avatar";
import { Tooltip } from "primereact/tooltip";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { ToggleButton } from "primereact/togglebutton";
import { TriStateCheckbox } from "primereact/tristatecheckbox";



import { SelectButton } from "primereact/selectbutton";

import { useReactToPrint } from "react-to-print";

import api from "../../../../services/axios";

import moment from "moment";
import "moment/locale/pt-br";
import { useNavigate } from "react-router-dom";

const PrecificadorAgenda = () => {
  moment.locale("pt-br");

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
    now: "Agora",
    today: "Hoje",
    clear: " Limpar ",
  });

  const tabelaRef = useRef();

  const navigate = useNavigate();

  const [produtoFilter, setProdutoFilter] = useState([]);

  const [precoMarkupcalculo, setPrecoMarkupCalculo] = useState(0);

  const [agrupadoPorFornecedor, setAgrupadoPorFornecedor] = useState(1);

  const inputPreco = useRef(null);

  const [produtoCustoComposicao, setProdutosCustoComposicao] = useState([]);
  const [custoComposicaoDialog, setCustoComposicaoDialog] = useState(false);

  const [linhas, setLinhas] = useState(5);

  const [dialogFamilia, setDialogFamilia] = useState(false);
  const [produtosFamilia, setProdutosFamilia] = useState([]);
  const [filiaisSelect, setFiliaisSelect] = useState(0);
  const toast = useRef(null);
  const toast2 = useRef(null);
  const [quantidadeFilial, setQuantidadeFilial] = useState([0]);
  const [headers, setHeaders] = useState();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFamilia, setLoadingFamilia] = useState(false);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();
  const [agendar, setAgendar] = useState(new Date());
  const [replicarPreco, setReplicarPreco] = useState(0);
  const [expandedRows, setExpandedRows] = useState([]);
  const [exibirDialogPesquisa, setExibirDialogPesquisa] = useState(false);
  const [exibirdialogSugestao, setExibirDialogSugestao] = useState(false);
  const [exibirDialogSugestaoMarDown, setExibirDialogSugestaoMarDown] =
    useState(false);
  const [produtoEmExibicaoSugestaoDialog, setprodutoEmExibicaoSugestaoDialog] =
    useState("");
  const [
    produtoEmExibicaoSugestaoDialogMarDownDialog,
    setprodutoEmExibicaoSugestaoMarDownDialog,
  ] = useState("");
  const [novoPercentualMarkupMinimo, setNovoPercentualMarkupMinimo] =
    useState(null);

  const [novoPercentualMarkDownMinimo, setNovoPercentualMarkDownMinimo] =
    useState(null);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
    razaosocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numeronotafiscal: { value: null, matchMode: FilterMatchMode.CONTAINS },
    revisado: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.CONTAINS },
    codigo: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [usarMarkup, setUsarMarkup] = useState(true);
  const options = [
    { name: "Markup", value: true },
    { name: "Markdown", value: false },
  ];

  const [usuarioLogado, setUsuarioLogado] = useState(null);

  //let eanUrl = "https://cdn-cosmos.bluesoft.com.br/products";

  let eanUrl = "http://www.eanpictures.com.br:9000/api/gtin";

  useEffect(() => {
    // window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    pegarTokenLocalStorage();
    usarTabelaFormacaoPreecoProduto();

    // eslint-disable-next-line
  }, []);

  const imprime = () => {
    if (linhas === 9999) {
      handlePrint();
    } else {
      setLinhas(9999);
      toast.current.show({
        severity: "info",
        summary: "Aviso",
        detail: "Tabela ajustada, Imprima novamente! ",
        life: 3000,
      });
    }
  };

  const handlePrint = useReactToPrint({
    content: () => tabelaRef.current,
    onAfterPrint: () => setLinhas(5),
  });

  const renderHeaderFamilia = () => {
    return (
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChangeFamilia}
            placeholder="Pesquisar"
          />
        </span>
      </div>
    );
  };

  const onGlobalFilterChangeFamilia = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const atualizarmarkupminimo = (data) => {
    if (novoPercentualMarkupMinimo) {
      setLoading(true);

      api
        .put(
          `/api/produto/atualizarmarkupminimo/${
            produtoEmExibicaoSugestaoDialog.idproduto
          }/${
            produtoEmExibicaoSugestaoDialog.idfamilia
              ? produtoEmExibicaoSugestaoDialog.idfamilia
              : 0
          }/${data}`
        )
        .then((r) => {})
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` Erro ao atualizar  ... Erro : ${error}  `,
          });
        })
        .finally(() => {
          setExibirDialogSugestao(false);
          setLoading(false);
          setNovoPercentualMarkupMinimo(null);
          buscarProdutos();
        });
    } else {
      toast2.current.show({
        severity: "warn",
        summary: "Aviso",

        detail: ` Informe o novo percentual de markup mínimo `,
      });
    }
  };

  const atualizarmarkdownminimo = () => {
    if (novoPercentualMarkDownMinimo) {
      setLoading(true);

      api
        .put(
          `/api/produto/atualizarmarkdownminimo/${
            produtoEmExibicaoSugestaoDialogMarDownDialog.idproduto
          }/${
            produtoEmExibicaoSugestaoDialogMarDownDialog.idfamilia
              ? produtoEmExibicaoSugestaoDialogMarDownDialog.idfamilia
              : 0
          }/${novoPercentualMarkDownMinimo}`
        )
        .then((r) => {})
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` Erro ao atualizar  ... Erro : ${error}  `,
          });
        })
        .finally(() => {
          setExibirDialogSugestaoMarDown(false);
          setLoading(false);
          setNovoPercentualMarkDownMinimo(null);
          buscarProdutos();
        });
    } else {
      toast2.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Informe o novo percentual de markdown mínimo`,
      });
    }
  };

  const abrirDialogSugestao = (rowData) => {
    setExibirDialogSugestao(true);
    setNovoPercentualMarkupMinimo(rowData?.percentualmarkup);
    setPrecoMarkupCalculo(null);

    setprodutoEmExibicaoSugestaoDialog(rowData);
  };

  const abrirDialogSugestaoMarkDown = (rowData) => {
    setExibirDialogSugestaoMarDown(true);
    setprodutoEmExibicaoSugestaoMarDownDialog(rowData);
  };

  const pegarTokenLocalStorage = () => {
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);

    setUsuarioLogado(a.nome);

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

  const precoCustoTemplate = (rowData) => {
    let custo = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precocusto);
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "cenetr",
            flexWrap: "wrap",
            color: "red",
          }}
        >
          {agrupadoPorFornecedor ? (
            <> </>
          ) : (
            <>
              {" "}
              <div>Fornecedor {rowData?.razaosocial} </div>{" "}
              <div>Nota fiscal nº {rowData?.numeronotafiscal}</div>{" "}
            </>
          )}
          <div>
            <Button
              className="p-buuton p-button-rounded"
              label="Composição"
              onClick={() => getProdutoCustoComposicao(rowData)}
            />
          </div>

          <p>CFOP {rowData?.cfop}</p>
          <h3> Custo de {custo}</h3>
        </div>
      </>
    );
  };

  const precoAgendoTemplate = (rowData) => {
    let markup =
      ((rowData.precoagendado - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markup) + " %";

    let precoAgendaFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoagendado);

    return (
      <>
        {rowData.precoagendado > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              <i className="pi pi-calendar" style={{ fontSize: "1em" }}></i>{" "}
              <Tag 
                value={
                  `Lucro de  ` +
                  Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(rowData.precoagendado - rowData.precocusto)
                }
                severity="success"
              ></Tag >
              <br />
              {rowData.precoagendado > 0 ? (
                <>
                  {" "}
                  {markupFormatado} de markup <br />
                  <b> Agendado a </b> <br />
                  <font size="5"> {precoAgendaFormatado} </font>
                </>
              ) : (
                <> </>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
             
              {rowData.precoagendado > 0 ? (
                <>
                 <i className="pi pi-calendar" style={{ fontSize: "1em" }}></i>{" "}
                  <Tag 
                    value={
                      `Prejuízo de ` +
                      Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(rowData.precoagendado - rowData.precocusto)
                    }
                    severity="danger"
                  ></Tag >
                </>
              ) : (
                <></>
              )}
              <br />
              {rowData.precoagendado > 0 ? (
                <>
                  {" "}
                  {markupFormatado} de markup <br />
                  <b> Agendado </b> a <br />
                  <font size="5"> {precoAgendaFormatado} </font>
                </>
              ) : (
                <></>
              )}
             
            </div>
          </>
        )}
      </>
    );
  };

  const marcarRevisao = (rowData, status) => {
    return api
      .put(`/api_precificacao/revisado/${rowData?.id}/${status}`)
      .then((r) => {})
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${e?.message}`,
        });
      })
      .finally((f) => {
        buscarProdutos();
      });
  };

  const precoAgendoMarkDownTemplate = (rowData) => {
    //Margem em %: (Preço de venda - Preço de compra) / Preço de venda * 100.

    let markdown =
      ((rowData.precoagendado - rowData.precocusto) / rowData.precoagendado) *
      100;

    let markdownFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markdown) + " %";

    let precoAgendaFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoagendado);

    return (
      <>
        {rowData.precoagendado > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              <i className="pi pi-calendar" style={{ fontSize: "1em" }}></i>{" "}
              <br />
              {markdownFormatado} de markdown <br />
              <b> Agendado a </b> <br />
              <font size="5"> {precoAgendaFormatado} </font>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              <i className="pi pi-calendar" style={{ fontSize: "1em" }}></i>{" "}
              <br />
              {markdownFormatado} de markdown <br />
              <b> Agendado </b> a <br />
              <font size="5"> {precoAgendaFormatado} </font>
            </div>
          </>
        )}
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
        maximumSignificantDigits: "3",
      }).format(markup) + " %";

    let precoAtualFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoAtual);

    let markupPromocao =
      ((rowData.precopromocional - rowData.precocusto) / rowData.precocusto) *
      100;

    let markupPromocaoFamilia =
      ((rowData.precopromocionalfamilia - rowData.precocusto) /
        rowData.precocusto) *
      100;

    let markupPromocaoFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markupPromocao) + " %";

    let markupPromocaoFamiliaFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markupPromocaoFamilia) + " %";

    let precoPromocaoFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(
      rowData.precopromocional
        ? rowData.precopromocional
        : rowData.precopromocionalfamilia
    );

    return (
      <>
        {rowData.precoAtual > rowData.precocusto ? (
          <>
            {rowData.precopromocional || rowData.precopromocionalfamilia ? (
              <div style={{ color: "green" }}>
                <i className="pi pi-tag" style={{ fontSize: "1em" }}></i>
                <div> {markupFormatado} de markup </div>
                <b> Vendendo atualmente </b> a
                <div>
                  <font style={{ marginTop: "5px" }} size="5">
                    <del> {precoAtualFormatado}</del>

                    <h6>
                      {rowData.precopromocionalfamilia
                        ? markupPromocaoFamiliaFormatado
                        : markupPromocaoFormatado}
                      de markup
                    </h6>
                    <b> Promoção </b>

                    {precoPromocaoFormatado}
                  </font>
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: "green" }}>
                  <i className="pi pi-tag " style={{ fontSize: "1em" }}></i>
                  <div> {markupFormatado} de markup </div>
                  <b> Vendendo atualmente </b> a{" "}
                  <div>
                    <font style={{ marginTop: "5px" }} size="5">
                      {precoAtualFormatado}
                    </font>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ color: "red" }}>
            {rowData.precopromocional || rowData.precopromocionalfamilia ? (
              <div style={{ color: "red" }}>
                <i className="pi pi-tag" style={{ fontSize: "1em" }}></i>
                <div> {markupFormatado} de markup </div>
                <b> Vendendo atualmente </b> a
                <div>
                  <font style={{ marginTop: "5px" }} size="5">
                    <del> {precoAtualFormatado}</del>

                    <h6>
                      {rowData.precopromocionalfamilia
                        ? markupPromocaoFamiliaFormatado
                        : markupPromocaoFormatado}
                      de markup
                    </h6>
                    <b> Promoção </b>

                    {precoPromocaoFormatado}
                  </font>
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: "red" }}>
                  <i className="pi pi-tag" style={{ fontSize: "1em" }}></i>
                  <div> {markupFormatado} de markup </div>
                  <b> Vendendo atualmente </b> a{" "}
                  <div>
                    <font style={{ marginTop: "5px" }} size="5">
                      {precoAtualFormatado}
                    </font>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </>
    );
  };

  const precoAtualMarkDownTemplate = (rowData) => {
    let markdown =
      ((rowData.precoAtual - rowData.precocusto) / rowData.precoAtual) * 100;

    let markdownFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markdown) + " %";

    let precoAtualFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoAtual);

    let markdownPromocao =
      ((rowData.precopromocional - rowData.precocusto) /
        rowData.precopromocional) *
      100;

    let markdownPromocaoFamilia =
      ((rowData.precopromocionalfamilia - rowData.precocusto) /
        rowData.precopromocionalfamilia) *
      100;

    let markdownPromocaoFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markdownPromocao) + " %";

    let markdownPromocaoFamiliaFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markdownPromocaoFamilia) + " %";

    let precoPromocaoFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(
      rowData.precopromocional
        ? rowData.precopromocional
        : rowData.precopromocionalfamilia
    );

    return (
      <>
        {rowData.precoAtual > rowData.precocusto ? (
          <>
            {rowData.precopromocional || rowData.precopromocionalfamilia ? (
              <div style={{ color: "green" }}>
                <i className="pi pi-tag" style={{ fontSize: "1em" }}></i>
                <div> {markdownFormatado} de Markdown </div>
                <b> Vendendo atualmente </b> a
                <div>
                  <font style={{ marginTop: "5px" }} size="5">
                    <del> {precoAtualFormatado}</del>

                    <h6>
                      {rowData.precopromocionalfamilia
                        ? markdownPromocaoFamiliaFormatado
                        : markdownPromocaoFormatado}
                      de markdown
                    </h6>
                    <b> Promoção </b>

                    {precoPromocaoFormatado}
                  </font>
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: "green" }}>
                  <i className="pi pi-tag" style={{ fontSize: "1em" }}></i>
                  <div> {markdownFormatado} de markdown </div>
                  <b> Vendendo atualmente </b> a{" "}
                  <div>
                    <font style={{ marginTop: "5px" }} size="5">
                      {precoAtualFormatado}
                    </font>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ color: "red" }}>
            {rowData.precopromocional || rowData.precopromocionalfamilia ? (
              <div style={{ color: "red" }}>
                <i className="pi pi-tag" style={{ fontSize: "1em" }}></i>
                <div> {markdownFormatado} de markdown </div>
                <b> Vendendo atualmente </b> a
                <div>
                  <font style={{ marginTop: "5px" }} size="5">
                    <del> {precoAtualFormatado}</del>

                    <h6>
                      {rowData.precopromocionalfamilia
                        ? markdownPromocaoFamiliaFormatado
                        : markdownPromocaoFormatado}
                      de markdown
                    </h6>
                    <b> Promoção </b>

                    {precoPromocaoFormatado}
                  </font>
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: "red" }}>
                  <i className="pi pi-tag" style={{ fontSize: "1em" }}></i>
                  <div> {markdownFormatado} de markdown </div>
                  <b> Vendendo atualmente </b> a{" "}
                  <div>
                    <font style={{ marginTop: "5px" }} size="5">
                      {precoAtualFormatado}
                    </font>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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

    return (
      <>
        {sugestao > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              {mkf} de markup <br />
              <b>
                {" "}
                <i> Sugestão de venda </i>{" "}
              </b>{" "}
              a <br />
              {sf}
            </div>
            <Button
              onClick={() => abrirDialogSugestao(rowData)}
              style={{ margin: "1rem" }}
              icon="pi pi-angle-double-up"
              className="p-button p-button-sm p-button-rounded"
            />
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {mkf} <br />
              <del> Sugestão de venda a </del> <br />
              {sf}
            </div>
            <Button
              onClick={() => abrirDialogSugestao(rowData)}
              style={{ margin: "1rem" }}
              icon="pi pi-angle-double-up"
              className="p-button p-button-sm p-button-rounded"
            />
          </>
        )}
      </>
    );
  };

  const sugestaoVendaMarkDown = (rowData) => {
    // Preço = Custo / (1 - Margem) = 200 / (1 - 0,2) = 200 / 0,8 = 250

    let sugestao = rowData.precocusto / (1 - rowData.percentualmarkdown / 100);

    let sf = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(sugestao);

    let percentualmarkdownSugerido = rowData.percentualmarkdown;

    let mkf =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
      }).format(percentualmarkdownSugerido) + " %";

    return (
      <>
        {sugestao > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              {mkf} de markdown <br />
              <b>
                {" "}
                <i> Sugestão de venda </i>{" "}
              </b>{" "}
              a <br />
              {sf}
            </div>
            <Button
              onClick={() => abrirDialogSugestaoMarkDown(rowData)}
              style={{ margin: "1rem" }}
              icon="pi pi-angle-double-down"
              className="p-button p-button-sm p-button-rounded"
            />
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {mkf} <br />
              <del> Sugestão de venda a </del> <br />
              {sf}
            </div>
            <Button
              onClick={() => abrirDialogSugestaoMarkDown(rowData)}
              style={{ margin: "1rem" }}
              icon="pi pi-angle-double-down"
              className="p-button p-button-sm p-button-rounded"
            />
          </>
        )}
      </>
    );
  };

  const priceEditor = (rowData) => {
    let mdown = rowData.precocusto / (1 - rowData.percentualmarkdown / 100);
    let mup =
      (rowData.precocusto * rowData.percentualmarkup) / 100 +
      rowData.precocusto;
    let sugestao = usarMarkup ? mup : mdown;

    let sf = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(sugestao);

    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {rowData.dataagendada ? (
            <>
              <div style={{ color: "green" }}>
                <Tag
                  severity="success"
                  style={{ margin: "1rem", textAlign: "center" }}
                  value=" Agendado "
                />{" "}
                <br />
                <Tag
                  severity="success"
                  value={moment(rowData.dataagendada).format(
                    "DD/MM/YYYY (dddd)"
                  )}
                />
                <br />
                {rowData.precoAtual < rowData.precocusto ||
                rowData.precoagendado < rowData.precocusto ? (
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
              <div>
                <Tag
                  severity="info"
                  style={{ margin: "1px", padding: "1px", textAlign: "center" }}
                  value=" Sem agendamento "
                />
                <br />
                {rowData.precoAtual < rowData.precocusto ? (
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
          )}

          <InputNumber
            ref={inputPreco}
            //autoFocus

            tooltip={
              rowData?.precoagendado ? "" : "Pressione Enter para salvar"
            }
            tooltipOptions={{ position: "bottom" }}
            prefix="R$ "
            placeholder={`Sugestão ${sf}`}
            //  value={rowData?.value}
            onChange={(e) => (inputPreco.current = e.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                //  console.log(inputPreco.current)
                onRowEditComplete(rowData, inputPreco.current);
              }
            }}
            currency="BRL"
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
            locale="pt-BR"
          />
        </div>
      </>
    );
  };

  const usarTabelaFormacaoPreecoProduto = () => {
    api
      .get("/api/filial", { headers: headers })
      .then((response) => {
        setQuantidadeFilial(response.data);

        if (quantidadeFilial.length < 1) {
          setQuantidadeFilial(0);
        } else {
        }
      })
      .catch((error) => {});
  };

  async function onRowEditComplete(e, value) {
    pegarTokenLocalStorage();

    let intFamilia = 0;

    if (e.idfamilia != null) {
      intFamilia = parseInt(e.idfamilia);
    }

    let usuarioFormatado = usuarioLogado.replace("/", "");

    if (value > 0) {
      await api
        .put(
          `/api_precificacao/produtos/precificar/agenda/${
            e.idproduto
          }/${intFamilia}/${e.idnotafiscal}/${value}/${moment(agendar).format(
            "YYYY-MM-DD"
          )}/${usuarioFormatado}`,
          { headers: headers }
        )
        .then((response) => {
          /*  toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: ` ${
              _produtos[index].descricao
            } agendado para o dia ${moment(agendar).format(
              "DD/MM/YYYY (dddd) "
            )} no valor de R$ ${_produtos[index].precoagendado}  `,
          });
*/
          marcarRevisao(e, 1);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` Erro ao atualizar ${e.descricao}  ... Erro : ${error}  `,
          });

          if (error.response.status === 401) {
          }
        })
        .finally((e) => {
          buscarProdutos();
          inputPreco.current = null;
        });
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Informe o preço agendado`,
      });
    }
  }

  const renderHeader = () => {
    return (
      <>
        <Dialog
          header="Pesquisa global"
          visible={exibirDialogPesquisa}
          position="bottom"
          modal={false}
          onHide={() => setExibirDialogPesquisa(false)}
        >
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              autoFocus
              value={globalFilterValue2}
              onChange={onGlobalFilterChange2}
              placeholder="Produtos, Fornecedores, Notas"
            />
          </span>
        </Dialog>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h4>
            ⚠️ Atenção, regravar a nota no uniplus deleta o agendamento aqui ⚠️
          </h4>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              className="p-inputtext-lg"
              value={globalFilterValue2}
              onChange={onGlobalFilterChange2}
              placeholder="Pesquisar "
            />
          </span>
        </div>
      </>
    );
  };

  const EanOrCodigo = (rowData) => {
    if (rowData.ean) {
      return (
        <>
          {quantidadeFilial.length > 1 ? (
            <>
              {" "}
              <div>{rowData?.nomeFilial}</div>{" "}
            </>
          ) : (
            <></>
          )}

          <div>{rowData?.ean} </div>
          {linhas < 1000 ? (
            <div>
              <img
                style={{
                  width: "80px",
                  height: "80px",
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
          ) : (
            <></>
          )}
        </>
      );
    } else {
      return rowData.codigo;
    }
  };

  const header = renderHeaderFamilia();

  const onGlobalFilterChange2 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters2(_filters2);
    setGlobalFilterValue2(value);
  };

  const dataInclusaoNota = (data) => {
    return moment(data.entradasaida).format("DD/MM/yyyy - HH:mm");
  };

  const statusPrecificacao = (rowData) => {
    return (
      <>
        {rowData.precificado ? (
          <>
            <Button
              label="Precificado"
              icon="pi pi-check"
              className="p-button-success p-button-rounded"
              onClick={() => reabrirPrecificacao(rowData)}
            />
          </>
        ) : (
          <>
            <Button
              icon="pi pi-clock"
              label="Pendente"
              className="p-button-warning p-button-rounded"
              onClick={() => finalizarPrecificacao(rowData)}
            />
          </>
        )}
      </>
    );
  };

  const headerTemplate = (data) => {
    let dados = [data];

    return (
      <>
        <DataTable
          showGridlines
          size="small"
          stripedRows
          value={dados}
          responsiveLayout="stack"
          breakpoint="960px"
          style={{
            width: "100%",
            backgroundColor: data?.precificado ? "#D3D3D3" : "#f1f1f1",
            padding: "1.5rem",
          }}
        >
          <Column
            field="razaosocial"
            bodyStyle={{ fontWeight: 800 }}
            header={
              <Avatar
                icon="pi pi-user"
                shape="circle"
                style={{ margin: "5px" }}
              />
            }
          ></Column>
          <Column
            field="numeronotafiscal"
            bodyStyle={{ fontWeight: 800 }}
            header="Nota fiscal"
          ></Column>
          <Column
            field="nomeFilial"
            bodyStyle={{ fontWeight: 800 }}
            header="Loja"
          ></Column>
          <Column
            field={dataInclusaoNota}
            bodyStyle={{ fontWeight: 800 }}
            header="Data de inclusão"
          ></Column>

          <Column
            field={statusPrecificacao}
            bodyStyle={{ fontWeight: 800 }}
            header="Status"
          ></Column>
        </DataTable>
      </>
    );
  };

  const familiaIcone = (rowData) => {
    if (rowData.idfamilia > 0) {
      return (
        <React.Fragment>
          <h4>{rowData.descricao}</h4>
          <Button
            className="p-button-rounded p-button-secondary p-button-sm"
            tooltip="Será atualizado o preço da família"
            style={{ width: "1rem", margin: "5px" }}
            icon="pi pi-users"
            onClick={() => abrirDialogFamilia(rowData)}
          />
          <br />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {" "}
          <h4>{rowData.descricao}</h4>
          <br />
        </React.Fragment>
      );
    }
  };

  const abrirDialogFamilia = (data) => {
    setDialogFamilia(true);
    getProdutosFamilia(data?.idfamilia);
  };

  const getProdutosFamilia = (idfamilia) => {
    setLoadingFamilia(true);
    return api
      .get(`/api/produto/familia/${idfamilia}`)
      .then((r) => {
        setProdutosFamilia(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoadingFamilia(false);
      });
  };

  const onRowToggle = (e) => {
    setExpandedRows(e.data);
  };

  const finalizarPrecificacao = (rowData) => {
    let status = 1;
    api
      .put(`/api_precificacao/notaId/${rowData.idnotafiscal}/status/${status}`)
      .then((r) => {
        buscarProdutos();
      })
      .catch((e) => {});
  };

  const reabrirPrecificacao = (rowData) => {
    let status = 0;
    api
      .put(`/api_precificacao/notaId/${rowData.idnotafiscal}/status/${status}`)
      .then((r) => {
        buscarProdutos();
      })
      .catch((e) => {});
  };

  const headerDataTable = renderHeader();

  const agrupamento = (rowData) => {
    let i = parseInt(rowData.idnotafiscal);
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
              `/api_precificacao/produtos/precificar/agendar/${moment(
                dataInicial
              ).format("YYYY-MM-DD HH:mm:ss [GMT]Z")}/${moment(
                dataFinal
              ).format("YYYY-MM-DD HH:mm:ss [GMT]Z")}/${filialId}`,
              {
                headers: headers,
              }
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
                //   navigate("/");
              }

              toast.current.show({
                severity: "error",
                summary: "Erro",
                detail: ` ${error}  `,
              });

              setLoading(false);
            })
            .finally((f) => {});
        }
      }
    }
  }

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
      {agrupadoPorFornecedor ? (
        <></>
      ) : (
        <>
          {" "}
          <Button
            onClick={() => imprime()}
            label="Imprimir"
            tooltip="Imprimir tabela"
            tooltipOptions={{ position: "bottom" }}
            icon="pi pi-file-pdf"
            style={{ margin: "1rem" }}
            className="p-button-rounded p-button-info "
          />
        </>
      )}

      <Button
        onClick={() => buscarProdutos()}
        tooltip="Atualizar"
        tooltipOptions={{ position: "bottom" }}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
        className=" botao-flutuante-atualizar p-button-rounded p-button-success p-button-sm"
      />
      <Button
        onClick={() => navigate("/precificar-executar")}
        tooltip="Navegar para carga e atualização de preços agendados"
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-dollar"
        className=" botao-flutuante-pesquisar p-button-rounded p-button-info p-button-sm"
      />

      <SelectButton
        value={usarMarkup}
        options={options}
        optionLabel="name"
        onChange={(e) => setUsarMarkup(e.target.value)}
        className=" botao-flutuante-up-down p-button-rounded  p-button-sm"
      />
    </React.Fragment>
  );

  const botaoatualizar = (
    <React.Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          color: "#FFF",
        }}
      >
        <div style={{ margin: "15px" }} className="p-inputgroup">
          <span className="p-inputgroup-addon">Agendar para</span>
          <Calendar
            dateFormat="dd/mm/yy"
            showIcon
            value={agendar}
            onChange={(e) => setAgendar(e.target.value)}
            showButtonBar
            locale="pt-BR"
          />
        </div>
      </div>
    </React.Fragment>
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

  const verifiedBodyTemplate = (rowData) => {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {rowData?.revisado === null || rowData?.revisado === false ? (
            <>
              {rowData.revisado === null ? (
                <>
                  {" "}
                  <Tag
                    icon="pi pi-bookmark"
                    onClick={() => marcarRevisao(rowData, 0)}
                    severity="warning"
                    value="Marcar Revisão"
                  ></Tag>
                </>
              ) : (
                <>
                  {" "}
                  <Tag
                    icon="pi pi-times"
                    onClick={() => marcarRevisao(rowData, 1)}
                    severity="danger"
                    value="Revisar"
                  ></Tag>
                </>
              )}
            </>
          ) : (
            <>
              <Tag
                icon="pi pi-check-circle"
                onClick={() => marcarRevisao(rowData, 0)}
                severity="success"
                value="Revisado"
              ></Tag>
            </>
          )}
        </div>
      </>
    );
  };

  const verifiedRowFilterTemplate = (options) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TriStateCheckbox
          value={options.value}
          onChange={(e) => options.filterApplyCallback(e.value)}
        />
      </div>
    );
  };

  const getProdutoCustoComposicao = (rowData) => {
    return api
      .get(`/api/custo-composicao/listar/${rowData?.id}`)
      .then((r) => {
        setProdutosCustoComposicao([r.data]);
        setCustoComposicaoDialog(true);
        setprodutoEmExibicaoSugestaoDialog(rowData);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      <Toast ref={toast2} position="center" />

      <Header />
      <Footer />

      <Dialog
        header="Composição do Custo"
        visible={custoComposicaoDialog}
        position="bottom"
        style={{ width: "50vw" }}
        onHide={() => {
          if (!custoComposicaoDialog) return;
          setCustoComposicaoDialog(false);
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            justifyContent: "center",
            alignItems: "center",
            color: "#333",
          }}
        >
          {/* Informações do Produto */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
              alignItems: "flex-start",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
            }}
          >
            <p>Produto: {produtoCustoComposicao[0]?.produto}</p>
            <p>Quantidade: {produtoCustoComposicao[0]?.quantidade}</p>
            <p>
              Unidade de Medida: {produtoCustoComposicao[0]?.unidade} -
              Embalagem com {produtoCustoComposicao[0]?.embalagem}
            </p>
          </div>

          {/* Preços */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
              alignItems: "flex-start",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>Preço de Compra :</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produtoCustoComposicao[0]?.precodecompra)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>Preço de Compra UN :</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  produtoCustoComposicao[0]?.precodecompra /
                    produtoCustoComposicao[0]?.embalagem
                )}
              </span>
            </div>
          </div>

          {/* Descontos */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
              alignItems: "flex-start",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
              color: "red",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( - ) Desconto:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produtoCustoComposicao[0]?.desconto)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( - ) Desconto UN:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  produtoCustoComposicao[0]?.desconto /
                    produtoCustoComposicao[0]?.quantidade /
                    produtoCustoComposicao[0]?.embalagem
                )}
              </span>
            </div>
          </div>

          {/* ICMS ST */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
              alignItems: "flex-start",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
              color: "green",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) ICMS ST:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produtoCustoComposicao[0]?.icmsst)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) ICMS ST UN:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  produtoCustoComposicao[0]?.icmsst /
                    produtoCustoComposicao[0]?.quantidade /
                    produtoCustoComposicao[0]?.embalagem
                )}
              </span>
            </div>
          </div>

          {/* FCP ST */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
              alignItems: "flex-start",
              color: "green",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
             
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) FCP ST:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produtoCustoComposicao[0]?.fcpst)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) FCP ST UN:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  produtoCustoComposicao[0]?.fcpst /
                    produtoCustoComposicao[0]?.quantidade /
                    produtoCustoComposicao[0]?.embalagem
                )}
              </span>
            </div>
          </div>
          {/* IPI */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
              alignItems: "flex-start",
              color: "green",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
            
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) IPI:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produtoCustoComposicao[0]?.ipi)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) IPI UN:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  produtoCustoComposicao[0]?.ipi /
                    produtoCustoComposicao[0]?.quantidade /
                    produtoCustoComposicao[0]?.embalagem
                )}
              </span>
            </div>
          </div>
          {/*FREETE */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              width: "100%",
              alignItems: "flex-start",
              color: "green",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
             
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) Frete / Outras despesas:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produtoCustoComposicao[0]?.frete)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>( + ) Frete / Outras despesas (UN):</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  produtoCustoComposicao[0]?.frete /
                    produtoCustoComposicao[0]?.quantidade /
                    produtoCustoComposicao[0]?.embalagem
                )}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            <h1>
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(produtoEmExibicaoSugestaoDialog?.precocusto)}
            </h1>
          </div>
          <div>
            <Button
              icon="pi pi-times"
              className="p-button p-button-rounded p-button-danger"
              label="Fechar"
              onClick={() => setCustoComposicaoDialog(false)}
            />
          </div>
        </div>
      </Dialog>

      <div className="agenda-label">
        <h1 style={{ fontFamily: "cabin-sketch-bold" }}>
          {produtos?.length < 1
            ? "Pesquisar notas de entrada e"
            : " Agendar os preços de vendas"}
        </h1>

        <h4
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "cabin-sketch-bold",
          }}
        >
          {produtos?.length < 1
            ? " Agendar os preços de venda"
            : "Informe os preços abaixo"}
        </h4>
        {loading ? (
          <Player src={LoadingNotas} loop autoplay style={{ width: "350px" }} />
        ) : (
          <>
            {produtos.length < 1 ? (
              <Player
                src={DestaqueImg}
                loop
                autoplay
                style={{ width: "350px" }}
              />
            ) : (
              <></>
            )}
          </>
        )}
      </div>

      {produtos.length < 1 ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#000",
              gap: "10px",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#000",
                flexDirection: "column",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <h5>Período</h5>
              </div>
              <Calendar
                locale="pt-BR"
                selectOtherMonths
                required
                showIcon
                placeholder="Data inicial para pesquisa de notas fiscais"
                dateFormat="dd/mm/yy "
                viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                hideOnDateTimeSelect
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                showTime
                showButtonBar
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#000",
                flexDirection: "column",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <h5>até</h5>
              </div>

              <Calendar
                locale="pt-BR"
                selectOtherMonths
                viewDate={new Date(new Date().setHours(23, 59, 59, 59))}
                required
                showIcon
                placeholder="Data final para pesquisa de notas fiscais"
                dateFormat="dd/mm/yy"
                hideOnDateTimeSelect
                value={dataFinal}
                onChange={(e) => {
                  setDataFinal(e.value);
                  dataFinal?.setUTCHours(dataFinal.getUTCHours());
                }}
                showTime
                showButtonBar
                position="bottom"
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#000",
                flexDirection: "column",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <MostraListaFilial />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#000",
              flexDirection: "column",
              flexWrap: "wrap",
            }}
          >
            <h4
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#000",
                flexDirection: "column",
                flexWrap: "wrap",
                gap: "10px",
                margin: "10px",
              }}
            >
              Clique para escolher um layout{" "}
            </h4>
            <ToggleButton
              onLabel="Fornecedor"
              offLabel="Produto"
              onIcon="pi pi-users"
              offIcon="pi pi-inbox"
              checked={agrupadoPorFornecedor}
              onChange={(e) => setAgrupadoPorFornecedor(e.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#000",
              flexDirection: "column",
              flexWrap: "wrap",
              margin: "20px",
            }}
          >
            <Button
              style={{ margin: "5px" }}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
              label={
                loading ? " Pesquisando ..." : " Pesquisar notas fiscais  "
              }
              disabled={loading}
              className="p-button-rounded p-button-success p-button-md"
              onClick={() => buscarProdutos()}
            />
          </div>
        </>
      ) : (
        <>
          <Toolbar
            style={{ border: "none" }}
            left={botaovoltar}
            right={botaoatualizar}
          />

          <Dialog
            modal={false}
            position="bottom"
            visible={exibirdialogSugestao}
            onHide={() => setExibirDialogSugestao(false)}
          >
            <div className="dialog-sugestao">
              <div>
                <h4>{produtoEmExibicaoSugestaoDialog.descricao}</h4>
              </div>

              <div>Percentual de markup mínimo atual</div>

              <h4>
                {" "}
                {Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  maximumFractionDigits: "2",
                  minimumFractionDigits: "2",
                }).format(
                  produtoEmExibicaoSugestaoDialog.percentualmarkup
                )}{" "}
                %{" "}
              </h4>

              <div>
                <b>Novo percentual de markup mínimo </b>
              </div>

              <div style={{ marginTop: "5px" }}>
                %{" "}
                <InputNumber
                  value={novoPercentualMarkupMinimo}
                  mode="decimal"
                  minFractionDigits={2}
                  maxFracionDigits={2}
                  onChange={(e) => {
                    setNovoPercentualMarkupMinimo(e.value);
                  }}
                  autoFocus
                  style={{ margin: "1rem" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      atualizarmarkupminimo(novoPercentualMarkupMinimo);
                    }
                  }}
                  placeholder="0,00%"
                  maxFractionDigits={2}
                  locale="pt-BR"
                />{" "}
                {" = "}
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  (novoPercentualMarkupMinimo *
                    produtoEmExibicaoSugestaoDialog?.precocusto) /
                    100 +
                    produtoEmExibicaoSugestaoDialog?.precocusto
                )}
              </div>
              <div>
                R${" "}
                <InputNumber
                  value={precoMarkupcalculo}
                  mode="decimal"
                  minFractionDigits={2}
                  maxFracionDigits={2}
                  onChange={(e) => setPrecoMarkupCalculo(e.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      atualizarmarkupminimo(
                        (precoMarkupcalculo /
                          produtoEmExibicaoSugestaoDialog?.precocusto -
                          1) *
                          100
                      );
                    }
                  }}
                  style={{ margin: "1rem" }}
                  placeholder="R$ 0,00"
                  maxFractionDigits={2}
                  locale="pt-BR"
                />{" "}
                ={" "}
                {Intl.NumberFormat("pt-BR", {
                  style: "decimal",
                  maximumFractionDigits: "2",
                  minimumFractionDigits: "2",
                }).format(
                  (precoMarkupcalculo /
                    produtoEmExibicaoSugestaoDialog?.precocusto -
                    1) *
                    100
                )}{" "}
                %
              </div>
            </div>
          </Dialog>

          <Dialog
            modal={false}
            position="bottom"
            visible={exibirDialogSugestaoMarDown}
            onHide={() => setExibirDialogSugestaoMarDown(false)}
          >
            <div className="dialog-sugestao">
              <div>
                <h4>
                  {produtoEmExibicaoSugestaoDialogMarDownDialog.descricao}
                </h4>
              </div>

              <div>Percentual de markdown mínimo atual</div>

              <h4>
                {" "}
                {
                  produtoEmExibicaoSugestaoDialogMarDownDialog.percentualmarkdown
                }{" "}
                %{" "}
              </h4>

              <div>
                <b>Novo percentual de markdown mínimo </b>
              </div>

              <div>
                <InputNumber
                  value={novoPercentualMarkDownMinimo}
                  mode="decimal"
                  minFractionDigits={2}
                  maxFracionDigits={2}
                  onChange={(e) => setNovoPercentualMarkDownMinimo(e.value)}
                  autoFocus
                  style={{ margin: "1rem" }}
                />
                %
                <Button
                  onClick={() => atualizarmarkdownminimo()}
                  style={{ margin: "1rem" }}
                  label="Atualizar"
                  icon="pi pi-refresh"
                  className="p-button p-buttun-sucess p-button-rounded"
                />
              </div>
            </div>
          </Dialog>
          <div ref={tabelaRef}>
            <Tooltip target=".export-buttons>button" position="bottom" />

            <DataTable
              onValueChange={(filteredData) => setProdutoFilter(filteredData)}
              responsiveLayout="stack"
              breakpoint="960px"
              loading={loading}
              size="small"
              stripedRows
              footer={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Existem {produtos.length} produto(s) para análise /{" "}
                  {produtoFilter?.length === produtos?.length
                    ? 0
                    : produtoFilter?.length}{" "}
                  produto(s) filtrado(s)
                </div>
              }
              value={produtos}
              selectionMode="single"
              //   reorderableColumns
              editMode="row"
              dataKey="id"
              //   scrollDirection="vertical"
              //   scrollable
              //   scrollHeight="flex"
              globalFilterFields={[
                "descricao",
                "ean",
                "numeronotafiscal",
                "razaosocial",
              ]}
              filters={filters2}
              filterDisplay="row"
              style={{
                backgroundColor: "#f2f2f2",
                width: "100%",
                padding: "1.0rem",
              }}
              emptyMessage="Nenhum produto encontrado para precificação"
              showGridlines
              header={headerDataTable}
              rowGroupMode={agrupadoPorFornecedor ? "subheader" : null}
              groupRowsBy={agrupamento}
              sortField={agrupadoPorFornecedor ? "idnotafiscal" : "descricao"}
              removableSort
              sortOrder={1}
              rowGroupHeaderTemplate={
                agrupadoPorFornecedor ? headerTemplate : null
              }
              //       resizableColumns
              // columnResizeMode="expand"
              expandableRowGroups={agrupadoPorFornecedor}
              expandedRows={expandedRows}
              onRowToggle={(e) => onRowToggle(e)}
              paginator={!agrupadoPorFornecedor}
              rows={linhas}
              rowsPerPageOptions={[2, 3, 4, 5, 6, 10, 25, 50, 100]}
            >
              <Column
                header={<> Código </>}
                field={EanOrCodigo}
                style={{ textAlign: "center" }}
              ></Column>

              <Column
                field="descricao"
                sortable
                header="Produto"
                body={familiaIcone}
                bodyStyle={{ textAlign: "center" }}
              ></Column>
              <Column
                field={precoCustoTemplate}
                header="Custo"
                body={precoCustoTemplate}
                bodyStyle={{ textAlign: "center" }}
              ></Column>
              {usarMarkup ? (
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
                  style={{}}
                  body={precoAtualTemplate}
                ></Column>
              ) : (
                <Column
                  field={precoAtualMarkDownTemplate}
                  header={
                    <>
                      <div>
                        Preço Atual <hr />
                      </div>
                      <br /> <div> Markdown % </div> <br /> <div> Venda </div>
                    </>
                  }
                  style={{}}
                  body={precoAtualMarkDownTemplate}
                ></Column>
              )}

              {usarMarkup ? (
                <Column
                  style={{ fontSize: "16px" }}
                  field={sugestaoVenda}
                  header={
                    <>
                      <div>
                        Sugestão <hr />{" "}
                      </div>
                      <br /> <div> Markup % </div> <br /> <div> Venda </div>
                    </>
                  }
                  body={sugestaoVenda}
                ></Column>
              ) : (
                <Column
                  style={{ fontSize: "16px" }}
                  field={sugestaoVendaMarkDown}
                  header={
                    <>
                      <div>
                        Sugestão <hr />{" "}
                      </div>
                      <br /> <div> Markdown % </div> <br /> <div> Venda </div>
                    </>
                  }
                  body={sugestaoVendaMarkDown}
                ></Column>
              )}

              {usarMarkup ? (
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
                  editor={(options) => priceEditor(options)}
                  body={precoAgendoTemplate}
                ></Column>
              ) : (
                <Column
                  field="precoagendado"
                  header={
                    <>
                      <div>
                        Preço Agendado <hr />
                      </div>
                      <br /> <div> Markdown % </div> <br /> <div> Venda </div>
                    </>
                  }
                  style={{}}
                  body={precoAgendoMarkDownTemplate}
                ></Column>
              )}

              <Column
                header="Atualizar"
                body={priceEditor}
                headerStyle={{ width: "10%", minWidth: "8rem" }}
                bodyStyle={{ textAlign: "center" }}
              ></Column>
              <Column
                field="revisado"
                header="Revisado?"
                dataType="boolean"
                style={{ minWidth: "6rem" }}
                body={verifiedBodyTemplate}
                filter
                filterElement={verifiedRowFilterTemplate}
              />
            </DataTable>
          </div>

          <Dialog
            visible={dialogFamilia}
            onHide={() => setDialogFamilia(false)}
            header="Os seguintes produtos pertencem a esta família "
          >
            <DataTable
              stripedRows
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              globalFilterFields={["codigo", "ean", "nome"]}
              emptyMessage="Nada encontrado"
              header={header}
              filters={filters}
              loading={loadingFamilia}
              value={produtosFamilia}
              responsiveLayout="stack"
            >
              <Column field="codigo" header="Código" />
              <Column field="ean" header="Ean" />
              <Column field="nome" header="Produto" />
            </DataTable>
          </Dialog>
        </>
      )}
    </>
  );
};

export default PrecificadorAgenda;
