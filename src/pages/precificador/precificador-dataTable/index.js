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

import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { addLocale } from "primereact/api";

import api from "../../../services/axios";
import { useNavigate } from "react-router-dom";

const Precificador = () => {
  const navigate = useNavigate()
  const toast = useRef(null);
  const [headers , setHeaders] = useState()
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();
  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    descricao: { value: null, matchMode: FilterMatchMode.CONTAINS },
    razaosocial: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numeronotafiscal: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {  }, []);

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
      'Authorization' : "Bearer " + a.access_token,
      'Content-Type' : "application/x-www-form-urlencoded",
    }; 
    setHeaders(headers)

    api.interceptors.request.use(
      config => {
        // Do something before request is sent
    
        config.headers["Authorization"] = "bearer " + a.access_token;
        return config;
      },
      error => {
        Promise.reject(error);
      }
    );
    
    
    
  }

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

  const onRowEditComplete = (e) => {
    let _products2 = [...produtos];

    let { newData, index } = e;

    _products2[index] = newData;

    pegarTokenLocalStorage()
   
    api
      .put(
        `/api_precificacao/produtos/precificar/${_products2[index].idproduto}/${_products2[index].idfamilia}/${_products2[index].precoNovo}`
        ,  { headers : headers }
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

      
        if(error.response.status === 401) {
          navigate("/")
         
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
   

    pegarTokenLocalStorage()

    if(dataInicial === undefined || dataFinal === undefined){
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: ` Informe a data inicial e final  `,
      });

  
    } else {

    let dataI = dataInicial?.toISOString().slice(0, 10);
    let dataF = dataFinal?.toISOString().slice(0, 10);

   

    if (dataI && dataF) {
      setLoading(true);

      api
        
        .get(`/api_precificacao/produtos/precificar/${dataI}/${dataF}` , { headers : headers })
        .then((response) => {
          setProdutos(response.data);
          setLoading(false);
          if(produtos.length < 1) {
            toast.current.show({
              severity: "warn",
              summary: "Aviso",
              detail: ` Nenhum produto encontrado para precificação !  `,
            });
          }
        })
        .catch((error) => {
         

          if(error?.response?.status === 401) {
            navigate("/")
           
          }

          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` ${error}  `,
          });

        

          setLoading(false);
        });
    }}
  };

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      {produtos.length < 1 ? (
        <>
          <div className="form-precificador">
            <div className="form-precificador-input">
              <h5>Período</h5>
              <Calendar
                placeholder="Informe a data inicial"
                dateFormat="dd/mm/yy"
                viewDate={dataInicial}
                value={dataInicial}
                onChange={(e) => setDataInicial(e.value)}
                showButtonBar
                locale="pt-BR"
              />

              <h5>até</h5>

              <Calendar
                placeholder="Informe a data final"
                dateFormat="dd/mm/yy"
                viewDate={dataFinal}
                value={dataFinal}
                onChange={(e) => setDataFinal(e.value)}
                showButtonBar
                locale="pt-BR"
              />
            </div>
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
          <div className="datatable-templating-demo p-fluid">
            <Button
              className="p-button-rounded p-button-danger p-button-lg"
              icon="pi pi-arrow-left"
              style={{
                margin: "10px",
              }}
              onClick={() => setProdutos([])}
            />

            <Tooltip target=".export-buttons>button" position="bottom" />

            <DataTable
              style={{ height: "75vh", width: "95vw" }}
              breakpoint="960px"
              loading={loading}
              stripedRows
              value={produtos}
              //  selectionMode="multiple"
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
              <Column field="idfilial" header="Filial"></Column>
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
                header="Margem sugerida"
                body={RSmargemSugerida}
                bodyStyle={{ textAlign: "center" }}
              ></Column>

              <Column
                style={{ fontWeight: "600" }}
                field={sugestaoVenda}
                header="Sugestão (Markup, Venda)"
                body={sugestaoVenda}
                bodyStyle={{ textAlign: "center" }}
              ></Column>

              <Column
                field={margem}
                header="Margem atual"
                body={margem}
                bodyStyle={{ textAlign: "center" }}
              ></Column>

              <Column
                field="precoNovo"
                header="Atual (markup, venda)"
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
