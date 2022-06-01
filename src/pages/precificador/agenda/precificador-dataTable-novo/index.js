import React, { useState, useEffect, useRef } from "react";

import "./styless.css";
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
import { addLocale } from "primereact/api";
import { Tag } from "primereact/tag";

import api from "../../../../services/axios";

import moment from "moment";
import "moment/locale/pt-br";

const PrecificadorAgenda = () => {
  moment.locale("pt-br");
  //  const navigate = useNavigate();
  const [filiaisSelect, setFiliaisSelect] = useState(0);
  const toast = useRef(null);
  const [quantidadeFilial, setQuantidadeFilial] = useState([0]);
  const [headers, setHeaders] = useState();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();
  const [agendar, setAgendar] = useState(new Date());
  const [replicarPreco, setReplicarPreco] = useState(0);
  const [expandedRows, setExpandedRows] = useState([]);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
    razaosocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numeronotafiscal: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

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
    today: " Agora ",
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
        maximumSignificantDigits: "3",
      }).format(margem) + " %";

    return (
      <>
        {rsmargem > 0 ? (
          <>
            <div style={{ color: "green" }}>
              {rsmargemformatada} <br />
              <bold>Lucro de </bold>
              {margemformatada}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {rsmargemformatada} <br />
              <bold>Prejuizo de </bold>
              {margemformatada}
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
        maximumSignificantDigits: "3",
      }).format(margem) + " %";

    return (
      <>
        {rsmargem > 0 ? (
          <>
            <div style={{ color: "green" }}>
              {rsmargemformatada} <br />
              <bold>Lucro </bold>de {margemformatada}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
               {rsmargemformatada} <br />
              <bold>Prejuizo</bold> de {margemformatada}
            </div>
          </>
        )}
      </>
    );
  };

  const precoCustoTemplate = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precocusto);
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
              {markupFormatado} <br />
              Agendado a <br/>
              {precoAgendaFormatado}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              {markupFormatado} <br />
              Agendado a <br/>
              {precoAgendaFormatado}
            </div>
          </>
        )}
      </>
    );
  };

  const status = (rowData) => {
    return rowData.dataagendada ? (
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
            value={moment(rowData.dataagendada).format("DD/MM/YYYY (dddd)")}
          />
          <br/>
          {rowData.precoAtual < rowData.precocusto  ||  rowData.precoagendado < rowData.precocusto ? (
            <>
            <Tag style={{margin:'1rem'}}
            value="Preço abaixo do custo "
            icon="pi pi-exclamation-circle"
            severity="danger"
          ></Tag>
            </>
          ) :(<></>)}
        </div>
      </>
    ) : (
      <>
        <div> 
          <Tag
            severity="warning"
            style={{ margin: "1px", textAlign: "center" }}
            value=" Pendente "
          />{" "}
          <br />

          {rowData.precoAtual < rowData.precocusto   ? (
            <>
            <Tag style={{margin:'1rem'}}
            value="Preço abaixo do custo "
            icon="pi pi-exclamation-circle"
            severity="danger"
          ></Tag>
            </>
          ) :(<></>)}
          
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
        maximumSignificantDigits: "3",
      }).format(markup) + " %";

    let precoAtualFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoAtual);

    return (
      <>
        {rowData.precoAtual > rowData.precocusto ? (
          <>
            <div style={{ color: "green" }}>
              <div> {markupFormatado} </div>
              Vendendo atualmente a 
              <div> {precoAtualFormatado}</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "red" }}>
              <div> {markupFormatado} </div>
             Vendendo atualmente a 
              <div> {precoAtualFormatado}</div>
            </div>
          </>
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
              {mkf} <br />
              Sugestão de venda a <br/>
              {sf}
            </div>
          </>
        ) : (
          <>
           
            <div style={{ color: "red" }}>
              {mkf} <br />
           <del>  Sugestão de venda a </del> <br/>
              {sf}
            </div>
          </>
        )}
      </>
    );
  };

  const priceEditor = (options) => {
    return (
      <InputNumber
        placeholder="R$"
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

        if (quantidadeFilial.length < 1) {
          setQuantidadeFilial(0);
        } else {
        }
      })
      .catch((error) => {});
  };

  async function onRowEditComplete(e) {
    let _products2 = [...produtos];

    let { newData, index } = e;

    _products2[index] = newData;

    pegarTokenLocalStorage();

    let intFamilia = 0;

    if (_products2[index].idfamilia != null) {
      intFamilia = parseInt(_products2[index].idfamilia);
    }

    await api
      .put(
        `/api_precificacao/produtos/precificar/agenda/${
          _products2[index].idproduto
        }/${intFamilia}/${_products2[index].idnotafiscal}/${
          _products2[index].precoagendado
        }/${moment(agendar).format("YYYY-MM-DD")}/`,
        { headers: headers }
      )
      .then((response) => {
        buscarProdutos();
        //  console.log(response);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: ` ${_products2[index].descricao} agendado para o dia ${moment(
            agendar
          ).format("DD/MM/YYYY (dddd) ")} no valor de R$ ${
            _products2[index].precoagendado
          }  `,
        });
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: ` Erro ao atualizar ${_products2[index].descricao}  ... Erro : ${error}  `,
        });

        if (error.response.status === 401) {
        }
        buscarProdutos();
      });
  }

  const renderHeader = () => {
    return (
      <>
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

  const EanOrCodigo = (rowData) => {
    if (rowData.ean) {
      return rowData.ean;
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

  const headerTemplate = (data) => {
    return (
      <React.Fragment>
        <div className="headerTemplateDataTable">
          <Avatar icon="pi pi-user" shape="circle" />

          <span className="image-text"> Fornecedor : {data.razaosocial} </span>
          <span className="image-text">
            Nota fiscal : {data.numeronotafiscal}
          </span>
          <span className="image-text">
            Filial de entrada : {data.nomeFilial}
          </span>
          <span className="image-text">
            Data de inclusão :{" "}
            {moment(data.entradasaida).format("DD/MM/yyyy - HH:mm")}
          </span>
        </div>
      </React.Fragment>
    );
  };

  const familiaIcone = (rowData) => {
    if (rowData.idfamilia > 0) {
      return (
        <React.Fragment>
          <h5>{rowData.descricao}</h5>
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
          <h5>{rowData.descricao}</h5>
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
        let dataI = dataInicial?.toISOString().slice(0, 20);
        let dataF = dataFinal?.toISOString().slice(0, 20);

        if (dataI && dataF) {
          let filialId = filiaisSelect ? filiaisSelect.id : 0;

          setLoading(true);

          await api

            .get(
              `/api_precificacao/produtos/precificar/agendar/${dataI}/${dataF}/${filialId}`,
              {
                headers: headers,
              }
            )
            .then((response) => {
              setProdutos(response.data);

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
            locale="pt-BR"
            showIcon
            value={agendar}
            onChange={(e) => setAgendar(e.target.value)}
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
            <h4>Filial</h4>
          </div>
          <Dropdown
            showClear
            onChange={(e) => setFiliaisSelect(e.value)}
            value={filiaisSelect}
            options={quantidadeFilial}
            optionLabel="razaosocial"
            placeholder="Selecione uma filial "
            emptyMessage="Nenhuma filial encontrada."
            dropdownIcon="pi pi-chevron-down"
          />
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      {produtos.length < 1 ? (
        <>
          <div className="form-precificador">
            <div className="form-precificador-input">
              <div>
                <h5>Período</h5>
              </div>
              <Calendar
                required
                showIcon
                placeholder="Informe a data inicial"
                dateFormat="dd/mm/yy "
                viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                hideOnDateTimeSelect
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                showButtonBar
                locale="pt-BR"
                showTime
                showSeconds
              />
            </div>
            <div className="form-precificador-input">
              <div>
                <h5>até</h5>
              </div>

              <Calendar
                required
                showIcon
                placeholder="Informe a data final"
                dateFormat="dd/mm/yy"
                hideOnDateTimeSelect
                value={dataFinal}
                onChange={(e) => setDataFinal(e.value)}
                showButtonBar
                locale="pt-BR"
                showTime
                showSeconds
              />
            </div>

            <div className="form-precificador-input">
              <MostraListaFilial />
            </div>
          </div>
          <div className="form-precificador-btn"></div>
          <div className="form-precificador-btn">
            <Button
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
              label={loading ? "Pesquisando ..." : " Pesquisar "}
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

          <div className="datatable-templating-demo p-fluid">
            <Tooltip target=".export-buttons>button" position="bottom" />

            {window.innerWidth > 1125 ? (
              <>
                <DataTable
                  style={{
                    height: "99vh",
                    width: "99vw",
                    alignContent: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                  breakpoint="1125px"
                  loading={loading}
                  //   stripedRows
                  value={produtos}
                  selectionMode="single"
                  //   reorderableColumns
                  editMode="row"
                  dataKey="idproduto"
                  onRowEditComplete={onRowEditComplete}
                  scrollDirection="vertical"
                  scrollable
                  scrollHeight="flex"
                  globalFilterFields={[
                    "descricao",
                    "ean",
                    "numeronotafiscal",
                    "razaosocial",
                  ]}
                  filters={filters2}
                  size="large"
                  responsiveLayout="stack"
                  emptyMessage="Nenhum produto encontrado para precificação"
                  showGridlines
                  header={headerDataTable}
                  rowGroupMode="subheader"
                  groupRowsBy={agrupamento}
                  //  sortOrder={1}
                  rowGroupHeaderTemplate={headerTemplate}
                  resizableColumns
                  // columnResizeMode="expand"
                  expandableRowGroups
                  expandedRows={expandedRows}
                  onRowToggle={(e) => setExpandedRows(e.data)}
                >
                  <Column
                    header={<> Código </>}
                    field={EanOrCodigo}
                    style={{ textAlign: "center" }}
                  ></Column>

                  <Column
                    field="descricao"
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

                  <Column
                    field={margemAtual}
                    header={
                      <>
                        {" "}
                        <div>
                          {" "}
                          Preço Atual <hr />{" "}
                        </div>{" "}
                        <br /> <div> Margem % </div> <br /> <div> Lucro </div>{" "}
                      </>
                    }
                    body={margemAtual}
                    bodyStyle={{ textAlign: "center" }}
                  ></Column>

                  <Column
                    field={margem}
                    header={
                      <>
                        {" "}
                        <div>
                          {" "}
                          Preço Agendado <hr />{" "}
                        </div>{" "}
                        <br /> <div> Margem % </div> <br /> <div> Lucro </div>{" "}
                      </>
                    }
                    body={margem}
                    bodyStyle={{ textAlign: "center" }}
                  ></Column>

                  <Column
                    style={{  fontSize: "15px" }}
                    field={sugestaoVenda}
                    header={
                      <>
                        <div>
                          Sugestão  <hr />
                        </div>
                        <br /> <div> Markup % </div> <br /> <div> Venda </div>{" "}
                      </>
                    }
                    body={sugestaoVenda}
                    bodyStyle={{ textAlign: "center" }}
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
                    style={{  fontSize: "16px", fontWeight: "600" }}
                    bodyStyle={{
                      textAlign: "center",
                    }}
                    body={precoAtualTemplate}
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
                    style={{   fontSize: "17px",fontWeight: "600" }}
                    editor={(options) => priceEditor(options)}
                    body={precoAgendoTemplate}
                    bodyStyle={{ textAlign: "center" }}
                  ></Column>

                  <Column
                    field={status}
                    header="Status"
                    style={{ fontWeight: "600" }}
                    bodyStyle={{
                      textAlign: "center",
                    }}
                  ></Column>

                  <Column
                    header="Editar"
                    rowEditor
                    headerStyle={{ width: "10%", minWidth: "8rem" }}
                    bodyStyle={{ textAlign: "center" }}
                  ></Column>
                </DataTable>
              </>
            ) : (
              <>
                <DataTable
                  style={{
                    height: "99vh",
                    width: "99vw",
                  }}
                  breakpoint="1125px"
                  loading={loading}
                  //     stripedRows
                  value={produtos}
                  //   selectionMode="single"
                  //   reorderableColumns
                  editMode="row"
                  dataKey="idproduto"
                  onRowEditComplete={onRowEditComplete}
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
                  size="normal"
                  responsiveLayout="stack"
                  emptyMessage="Nenhum produto encontrado para precificação"
                  showGridlines
                  header={headerDataTable}
                  rowGroupMode="subheader"
                  groupRowsBy={agrupamento}
                  //  sortOrder={1}
                  rowGroupHeaderTemplate={headerTemplate}
                  //       resizableColumns
                  // columnResizeMode="expand"
                  expandableRowGroups
                  expandedRows={expandedRows}
                  onRowToggle={(e) => setExpandedRows(e.data)}
                >
                  <Column
                    header={<> Código </>}
                    field={EanOrCodigo}
                    style={{ textAlign: "center" }}
                  ></Column>

                  <Column
                    field="descricao"
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

                  <Column
                    field={margemAtual}
                    header={
                      <>
                        {" "}
                        <div>
                          {" "}
                          Preço Atual <hr />{" "}
                        </div>{" "}
                        <br /> <div> Margem % </div> <br /> <div> Lucro </div>{" "}
                      </>
                    }
                    body={margemAtual}
                  ></Column>

                  <Column
                    field={margem}
                    header={
                      <>
                        {" "}
                        <div>
                          {" "}
                          Preço Agendado <hr />{" "}
                        </div>{" "}
                        <br /> <div> Margem % </div> <br /> <div> Lucro </div>{" "}
                      </>
                    }
                    body={margem}
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
                    style={{ fontWeight: "600" }}
                    body={precoAtualTemplate}
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
                    style={{ fontWeight: "600" }}
                    editor={(options) => priceEditor(options)}
                    body={precoAgendoTemplate}
                  ></Column>

                  <Column
                    field={status}
                    header="Status"
                    style={{ fontWeight: "600" }}
                    bodyStyle={{
                      textAlign: "center",
                    }}
                  ></Column>

                  <Column
                    header="Editar"
                    rowEditor
                    headerStyle={{ width: "10%", minWidth: "8rem" }}
                    bodyStyle={{ textAlign: "center" }}
                  ></Column>
                </DataTable>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default PrecificadorAgenda;
