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
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";

import api from "../../../services/axios";
//import { useNavigate } from "react-router-dom";

import moment from "moment";

const Precificador = () => {
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
  const [replicarPreco, setReplicarPreco] = useState(0);
  const replicarPrecoOpcoes = [
    { label: "Sim", value: 1 },
    { label: "Não", value: 0 },
  ];
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
    today: "Hoje",
    clear: "Limpar",
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
      ((rowData.precoNovo - rowData.precocusto) / rowData.precoNovo) * 100;

    // Margem em valor monetário: Preço de venda - Preço de compra
    let rsmargem = rowData.precoNovo - rowData.precocusto;

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
        <div style={{ textAlign: "center" }}>
          {rsmargemformatada} <br />
          {margemformatada}
        </div>
      </>
    );
  };

  const RSmargemSugerida = (rowData) => {
    // Margem em valor monetário: Preço de venda - Preço de compra

    let sugestao =
      (rowData.precocusto * rowData.percentualmarkup) / 100 +
      rowData.precocusto;

    let RSmargem = sugestao - rowData.precocusto;

    let margemSugerida = ((sugestao - rowData.precocusto) / sugestao) * 100;

    let mgsf =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(margemSugerida) + " %";

    let rsmsf = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(RSmargem);

    return (
      <>
        {mgsf} <br />
        {rsmsf}
      </>
    );
  };

  const precoCustoTemplate = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precocusto);
  };

  const precoVendaTemplate = (rowData) => {
    let markup =
      ((rowData.precoNovo - rowData.precocusto) / rowData.precocusto) * 100;

    let markupFormatado =
      Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(markup) + " %";

    let preconovoFormatado = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoNovo);

    return (
      <>
        {markupFormatado} <br />
        {preconovoFormatado}
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
        {mkf} <br />
        {sf}
      </>
    );
  };

  const priceEditor = (options) => {
    return (
      <InputNumber
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

  const onRowEditComplete = (e) => {
    let _products2 = [...produtos];

    let { newData, index } = e;

    _products2[index] = newData;

    pegarTokenLocalStorage();

    let intFamilia = 0;

    if (_products2[index].idfamilia != null) {
      intFamilia = parseInt(_products2[index].idfamilia);
    }

   

    api
      .put(
        `/api_precificacao/produtos/precificar/${_products2[index].idproduto}/${intFamilia}/${_products2[index].precoNovo}/${_products2[index].idfilial}/${replicarPreco}`,
        { headers: headers }
      )
      .then((response) => {
        //   toast.current.show({severity: 'success', summary: 'Success Message', detail: 'Order submitted'});
        setProdutos(_products2);
        buscarProdutos();
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: ` ${_products2[index].descricao} atualizado para R$ ${_products2[index].precoNovo}  `,
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
  };

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
          <span className="image-text">Filial de entrada : {data.nomeFilial}</span>
          <span className="image-text">Data de inclusão : {moment(data.entradasaida).format("DD/MM/yyyy - HH:mm")}</span>
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
            className="p-button-rounded p-button-primary"
            tooltip="Será atualizado o preço da família"
            style={{ fontSize: "2rem", marginLeft: "5px" }}
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

  const buscarProdutos = () => {
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

          api

            .get(
              `/api_precificacao/produtos/precificar/${dataI}/${dataF}/${filialId}`,
              {
                headers: headers,
              }
            )
            .then((response) => {
              setProdutos(response.data);
              // console.log(response.data)
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
  };
  const botaovoltar = (
    <React.Fragment>
      <Button
        className="p-button-rounded p-button-danger p-button-lg"
        tooltip="Voltar"
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-arrow-left"
        style={{
          margin: "10px",
        }}
        onClick={() => setProdutos([])}
      />

      <Button
        onClick={() => buscarProdutos()}
        tooltip="Atualizar"
        tooltipOptions={{ position: "bottom" }}
        icon="pi pi-refresh"
        className=" p-button-rounded p-button-secondary p-button-lg"
      />
    </React.Fragment>
  );

  const botaoatualizar =
    quantidadeFilial.length > 1 ? (
      <React.Fragment>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h5
            style={{
              color: replicarPreco ? "green" : "red",
              margin: "5px",
              fontWeight: "bold",
            }}
          >
            {" "}
            Deseja replicar os preços para todas as filiais ?{" "}
          </h5>

          {replicarPreco ? (
            <Tag
              className="mr-2"
              rounded
              value="Sim"
              severity="success"
              icon="pi pi-check"
            ></Tag>
          ) : (
            <Tag
              className="mr-2"
              icon="pi pi-times"
              rounded
              severity="danger"
              value="Não"
            ></Tag>
          )}
        </div>
      </React.Fragment>
    ) : (
      <></>
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
          />
        </>
      );
    } else {
      return <></>;
    }
  };

  const MostraSelectReplicarPrecoFilial = () => {
    if (quantidadeFilial.length > 1) {
      return (
        <>
          <h5 style={{ margin: "5px" }}>Replicar preços para filiais ?</h5>
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
                placeholder="Informe a data inicial"
                dateFormat="dd/mm/yy"
                viewDate={new Date(new Date().setHours(0,0,0,0))}
                
                value={dataInicial}
                onChange={(e) => setDataInicial(e.value)}
                showButtonBar
                locale="pt-BR"
                showTime showSeconds
                
              />
            </div>
            <div className="form-precificador-input">
              <div>
                <h5>até</h5>
              </div>

              <Calendar
                placeholder="Informe a data final"
                dateFormat="dd/mm/yy"
                
                value={dataFinal}
                onChange={(e) => setDataFinal(e.value)}
                showButtonBar
                locale="pt-BR"
                showTime showSeconds
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
              icon="pi pi-search"
              label="Pesquisar"
              className="p-button-rounded p-button-secondary p-button-lg"
              onClick={() => buscarProdutos()}
            />
          </div>
        </>
      ) : (
        <>
          <Toolbar left={botaovoltar} right={botaoatualizar} />

          <div className="datatable-templating-demo p-fluid">
            <Tooltip target=".export-buttons>button" position="bottom" />

            <DataTable
              style={{
                height: "75vh",
                width: "99vw",
                alignContent: "center",
                justifyContent: "center",
              }}
              breakpoint="960px"
              loading={loading}
              //   stripedRows
              value={produtos}
              selectionMode="multiple"
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
              //size="large"
              responsiveLayout="stack"
              emptyMessage="Nenhum produto encontrado para precificação"
              showGridlines
              header={headerDataTable}
              rowGroupMode="subheader"
              groupRowsBy={agrupamento}
              //  sortOrder={1}
              rowGroupHeaderTemplate={headerTemplate}
              // resizableColumns
              // columnResizeMode="expand"
            >
              <Column
                header="Código de barras / Código interno"
                field={EanOrCodigo}
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
                field={RSmargemSugerida}
                header="Sugestão (Margem%, Lucro)"
                body={RSmargemSugerida}
                bodyStyle={{ textAlign: "center" }}
              ></Column>

              <Column
                style={{ fontWeight: "600" }}
                field={sugestaoVenda}
                header="Sugestão (Markup%, Venda)"
                body={sugestaoVenda}
                bodyStyle={{ textAlign: "center" }}
              ></Column>

              <Column
                field={margem}
                header="Atual (Margem%, Lucro)"
                body={margem}
                bodyStyle={{ textAlign: "center" }}
              ></Column>

              <Column
                field="precoNovo"
                header="Atual (Markup, Venda)"
                body={precoVendaTemplate}
                style={{ fontWeight: "600" }}
                editor={(options) => priceEditor(options)}
                bodyStyle={{ textAlign: "center" }}
              ></Column>

              <Column
                header="Editar"
                rowEditor
                headerStyle={{ width: "10%", minWidth: "8rem" }}
                bodyStyle={{ textAlign: "center" }}
              ></Column>
            </DataTable>
          </div>
        </>
      )}
    </>
  );
};

export default Precificador;
