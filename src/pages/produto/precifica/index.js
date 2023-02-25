import { useEffect, useState, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Calendar } from "primereact/calendar";
import { Toolbar } from "primereact/toolbar";

import { addLocale } from "primereact/api";

import {
  PivotViewComponent,
  Inject,
  CalculatedField,
  FieldList,
  GroupingBar,
  VirtualScroll,
  ExcelExport,
  PDFExport,
  PivotChart,
} from "@syncfusion/ej2-react-pivotview";

import api from "../../../services/axios";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import moment from "moment/moment";

const PrecificaProduto = () => {
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

  const pivotObj = useRef(null);
  const toast = useRef(null);
  const toast2 = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [valorSelecionado, setValorSelecionado] = useState([]);
  const [codigoSelecionado, setCodigoSelecionado] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [produtoDatatables, setProdutosDatatables] = useState([]);
  const [exibirdialogSugestao, setExibirDialogSugestao] = useState(false);
  const [produtoEmExibicaoSugestaoDialog, setprodutoEmExibicaoSugestaoDialog] =
    useState("");
  const [novoPercentualMarkupMinimo, setNovoPercentualMarkupMinimo] =
    useState(null);

  const [headers, setHeaders] = useState();
  const [agendar, setAgendar] = useState(new Date());
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();

  const getProdutoDataTable = () => {
    setLoading2(true);

    return api
      .get(
        `/api/produto/consulta/codigo/${valorSelecionado.substring(
          0,
          valorSelecionado.indexOf("-")
        )}`
      )
      .then((r) => {
        setProdutosDatatables(r.data);
        // console.log(r.data);
      })
      .catch((e) => {
        setProdutosDatatables([]);
      })
      .finally((f) => {
        setLoading2(false);
      });
  };

  const getProdutos = () => {
    setLoading(true);
    return api
      .get("/api/produto/consulta/todos")
      .then((r) => {
        setProdutos(r.data);
        //  console.log(produtos);
      })

      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getProdutos();
    pegarTokenLocalStorage();
  }, []);

  useEffect(() => {
    if (valorSelecionado?.length > 0) {
      setCodigoSelecionado(
        valorSelecionado.substring(0, valorSelecionado.indexOf("-"))
      );
      getProdutoDataTable();
    } else {
      setCodigoSelecionado(null);
    }
  }, [valorSelecionado]);

  let dataSourceSettings = {
    enableSorting: false,
    allowSelection: true,
    showGrandTotals: true,
    excludeFields: [
      "precopromocionalfilial",
      "precopromocional",
      "precopromocionalfamilia",

      "usuarioAgendado",
      "dataAgendada",
      "precoAgendado",
      "idfamilia",
      "unidade",
      "idfilial",
      "dataprecocusto",
      "custoalteradopor",
      "dataalteracaopreco",
      "percentualmarkup",
      "dataultimacompra",
      "idproduto",
      "id",
    ],
    columns: [{ name: "filial", caption: "Loja" }],
    valueSortSettings: { headerDelimiter: " - " },
    values: [
      { name: "precocustomedio", caption: "Custo" },
      { name: "precomedio", caption: "Preço", type: "CalculatedField" },

      {
        name: "markup",
        caption: "Markup %",
        type: "CalculatedField",
      },
      { name: "estoque", caption: "Estoque" },
    ],
    dataSource: produtos,
    rows: [
      { name: "hierarquiaII", caption: "Grupo I" },
      { name: "hierarquiaIII", caption: "Grupo II" },
      { name: "hierarquia", caption: "GrupoIII" },
      { name: "produto", caption: "Produto" },
    ],

    calculatedFieldSettings: [
      {
        name: "markup",
        formula: '("Avg(preco)"-"Avg(precocusto)") / "Avg(precocusto)" * 100 ',
      },
      {
        name: "precomedio",
        formula: '"Avg(preco)"',
      },
      {
        name: "precocustomedio",
        formula: '"Avg(precocusto)"',
      },
    ],

    expandAll: false,
    filters: [
      {
        name: "codigo",
        caption: "Código",
      },
      {
        name: "ean",
        caption: "Código de barras",
      },
      {
        name: "produto",
        caption: "Produto",
      },
    ],
    formatSettings: [
      { name: "markup", format: "N2" },
      { name: "estoque", format: "N2" },
      { name: "precocustomedio", format: "C2" },
      { name: "precomedio", format: "C2" },
    ],
  };

  let gridSettings = {
    allowTextWrap: true,
    allowSelection: true,
    selectionSettings: {
      mode: "Cel",
      type: "Single",
      cellSelectionMode: "Box",
    },

    columnWidth: 25,
    rowHeight: 45,
    gridLines: "Both",
    clipMode: "EllipsisWithTooltip",
  };

  const dataultimacompraFormat = (row) => {
    return moment(row.dataultimacompra).format("DD/MM/YYYY");
  };

  const precoAtualTemplate = (rowData) => {
    let markup =
      ((rowData.preco - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markup) + " %";

    let precoAtualFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco);

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
        {rowData.preco > rowData.precocusto ? (
          <>
            {rowData.precopromocional || rowData.precopromocionalfamilia ? (
              <div style={{ color: "green" }}>
                <div> {markupFormatado} de markup </div>

                <div>
                  <font style={{ marginTop: "5px" }} size="3">
                    <del> {precoAtualFormatado}</del>
                    <hr />
                    {rowData.precopromocionalfamilia
                      ? markupPromocaoFamiliaFormatado
                      : markupPromocaoFormatado}{" "}
                    de markup <br />
                    <b> Promoção </b>
                    {precoPromocaoFormatado}
                  </font>
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: "green" }}>
                  <div> {markupFormatado} de markup </div>

                  <div>{precoAtualFormatado}</div>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ color: "red" }}>
            {rowData.precopromocional || rowData.precopromocionalfamilia ? (
              <div style={{ color: "red" }}>
                <div> {markupFormatado} de markup </div>

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
                  <div> {markupFormatado} de markup </div>

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

  const precoCustoTemplate = (rowData) => {
    let custo = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precocusto);
    return (
      <>
        <font color="red">{custo} </font>
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
              {sf}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {mkf} <br />
              {sf}
            </div>
          </>
        )}
      </>
    );
  };

  const buttonSugestao = (rowData) => {
    return (
      <>
        <Button
          onClick={() => abrirDialogSugestao(rowData)}
          icon="pi pi-angle-double-up"
          className="p-button p-button-sm p-button-rounded"
        />
      </>
    );
  };

  const abrirDialogSugestao = (rowData) => {
    setExibirDialogSugestao(true);
    setprodutoEmExibicaoSugestaoDialog(rowData);
  };

  const atualizarmarkupminimo = () => {
    if (novoPercentualMarkupMinimo) {
      setLoading2(true);

      api
        .put(
          `/api/produto/atualizarmarkupminimo/${
            produtoEmExibicaoSugestaoDialog.idproduto
          }/${
            produtoEmExibicaoSugestaoDialog.idfamilia
              ? produtoEmExibicaoSugestaoDialog.idfamilia
              : 0
          }/${novoPercentualMarkupMinimo}`
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
          setLoading2(false);
          setNovoPercentualMarkupMinimo(null);
          getProdutoDataTable();
        });
    } else {
      toast2.current.show({
        severity: "warn",
        summary: "Aviso",

        detail: ` Informe o novo percentual de markup mínimo `,
      });
    }
  };

  const precoAgendoTemplate = (rowData) => {
    let markup =
      ((rowData.precoAgendado - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "3",
      }).format(markup) + " %";

    let precoAgendaFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoAgendado);

    return (
      <>
        {rowData.precoAgendado > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              <div> {markupFormatado} de markup </div>
              <font size="5"> {precoAgendaFormatado} </font>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {markupFormatado} de markup <br />
              <font size="5"> {precoAgendaFormatado} </font>
            </div>
          </>
        )}
      </>
    );
  };

  const priceEditor = (options) => {
    let sugestao =
      (options.rowData.precocusto * options.rowData.percentualmarkup) / 100 +
      options.rowData.precocusto;

    let sf = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(sugestao);
    return (
      <InputNumber
        placeholder={`Sugestão ${sf}`}
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.value)}
        mode="currency"
        currency="BRL"
        locale="pt-BR"
      />
    );
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

  async function onRowEditComplete(e) {
    let { newData, index } = e;

    let _produtos = [...produtoDatatables];

    _produtos[index] = newData;

    pegarTokenLocalStorage();

    let intFamilia = 0;

    if (_produtos[index].idfamilia != null) {
      intFamilia = parseInt(_produtos[index].idfamilia);
    }

    let usuarioFormatado = usuarioLogado.replace("/", "");
    if (_produtos[index].precoAgendado) {
      await api
        .put(
          `/api_precificacao/produtos/precificar/agenda/produto/${
            _produtos[index].idfilial
          }/${_produtos[index].idproduto}/${intFamilia}/${
            _produtos[index].precoAgendado
          }/${moment(agendar).format("YYYY-MM-DD")}/${usuarioFormatado}`,
          { headers: headers }
        )
        .then((response) => {
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: ` ${_produtos[index].produto} agendado para o dia ${moment(
              agendar
            ).format("DD/MM/YYYY (dddd) ")} no valor de R$ ${
              _produtos[index].precoAgendado
            }  `,
          });
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` Erro ao atualizar ${_produtos[index]?.produto}  ... Erro : ${error}  `,
          });

          if (error.response.status === 401) {
          }
        })
        .finally((e) => {
          getProdutoDataTable();
        });
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Informe o preço agendado`,
      });
    }
  }

  const dataAgendadaTemplate = (rowData) => {
    return (
      <>
        {rowData.dataAgendada ? (
          moment(rowData.dataAgendada).isSameOrBefore(moment()) ? (
            <Tag
              severity="warning"
              value={moment(rowData.dataAgendada).format("DD/MM/yyyy (dddd)")}
            />
          ) : (
            <Tag
              severity="success"
              value={moment(rowData.dataAgendada).format("DD/MM/yyyy (dddd)")}
            />
          )
        ) : (
          <>
            {" "}
            <Tag severity="info" value="Sem agendamento" />
          </>
        )}
      </>
    );
  };

  const leftContents = () => {
    return (
      <>
        <Button
          label="Voltar"
          className="p-button p-button-rounded p-button-danger"
          icon="pi pi-backward"
          onClick={() => navigate("/menu")}
        />
      </>
    );
  };

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      <Toast ref={toast2} position="center" />
      <Header />
      <Footer />
      <Toolbar left={leftContents} />
      {!loading ? (
        <>
          <div style={{ padding: "2px" }}>
            <div>
              <PivotViewComponent
                ref={pivotObj}
                id="PivotView"
                dataSourceSettings={dataSourceSettings}
                showTooltip={false}
                showGroupingBar={true}
                showFieldList={true}
                width={"100%"}
                height={500}
                gridSettings={gridSettings}
                cellSelected={(e) =>
                  setValorSelecionado(e.selectedCellsInfo[0]?.value)
                }
              >
                <Inject
                  services={[
                    CalculatedField,
                    FieldList,
                    GroupingBar,

                    VirtualScroll,
                    ExcelExport,
                    PDFExport,
                    PivotChart,
                  ]}
                />
              </PivotViewComponent>
            </div>
            <div style={{ marginTop: "1px" }}>
              <DataTable
                responsiveLayout="stack"
                editMode="row"
                dataKey="id"
                onRowEditComplete={onRowEditComplete}
                emptyMessage="Selecione um produto"
                header={
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <h4>
                        {produtoDatatables[0]?.ean +
                          " - " +
                          produtoDatatables[0]?.produto +
                          " " +
                          " "}
                        {produtoDatatables[0]?.idfamilia ? (
                          <>
                            <i
                              className="pi pi-users"
                              style={{ fontSize: "2em" }}
                            ></i>
                          </>
                        ) : (
                          <></>
                        )}
                      </h4>
                      <div>
                        <h4>UN</h4>
                        {produtoDatatables[0]?.unidade}
                      </div>

                      <div>
                        <h4>Agendar para </h4>
                        <Calendar
                          showButtonBar
                          showIcon
                          locale="pt-BR"
                          style={{ marginTop: "2px" }}
                          value={agendar}
                          dateFormat="dd/mm/yy"
                          onChange={(e) => setAgendar(e.value)}
                        ></Calendar>
                      </div>
                    </div>
                  </>
                }
                value={produtoDatatables}
                stripedRows
                showGridlines
                loading={loading2}
              >
                <Column field="filial" header="Loja"></Column>

                <Column
                  field={precoCustoTemplate}
                  header="Custo"
                  body={precoCustoTemplate}
                ></Column>

                <Column
                  field={precoAtualTemplate}
                  header={<>Preço atual</>}
                  body={precoAtualTemplate}
                ></Column>

                <Column
                  field={dataultimacompraFormat}
                  header="Última compra"
                ></Column>
                <Column
                  field="custoalteradopor"
                  header="Custo alterado por"
                ></Column>
                <Column
                  field={sugestaoVenda}
                  header={<>Sugestão</>}
                  body={sugestaoVenda}
                ></Column>
                <Column
                  header="Editar sugestão"
                  field={buttonSugestao}
                  body={buttonSugestao}
                ></Column>

                <Column
                  field="precoAgendado"
                  header="Markup/Preço agendado"
                  editor={(options) => priceEditor(options)}
                  body={precoAgendoTemplate}
                ></Column>
                <Column
                  header="Agendado"
                  field="dataAgendada"
                  body={dataAgendadaTemplate}
                ></Column>
                <Column
                  header="Editar preço agendado"
                  rowEditor
                  headerStyle={{ width: "10%", minWidth: "8rem" }}
                  bodyStyle={{ textAlign: "center" }}
                ></Column>
              </DataTable>
            </div>
          </div>
        </>
      ) : (
        <>
          <ProgressBar mode="indeterminate" />
        </>
      )}
      <Dialog
        modal={false}
        position="bottom"
        visible={exibirdialogSugestao}
        onHide={() => setExibirDialogSugestao(false)}
      >
        <div className="dialog-sugestao">
          <div>
            <h4>{produtoEmExibicaoSugestaoDialog?.produto}</h4>
          </div>

          <div>Percentual de markup mínimo atual</div>

          <h4> {produtoEmExibicaoSugestaoDialog.percentualmarkup} % </h4>

          <div>
            <b>Novo percentual de markup mínimo </b>
          </div>

          <div>
            <InputNumber
              value={novoPercentualMarkupMinimo}
              mode="decimal"
              minFractionDigits={2}
              maxFracionDigits={2}
              onChange={(e) => setNovoPercentualMarkupMinimo(e.value)}
              autoFocus
              style={{ margin: "1rem" }}
            />{" "}
            %
            <Button
              onClick={() => atualizarmarkupminimo()}
              style={{ margin: "1rem" }}
              label="Atualizar"
              icon="pi pi-refresh"
              className="p-button p-buttun-sucess p-button-rounded"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PrecificaProduto;
