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

const Precificador = () => {
 
  const toast = useRef(null);
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

  useEffect(() => {}, []);

 

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

  const margem = (rowData) => {
    //Margem em %: (Preço de venda - Preço de compra) / Preço de venda * 100.
    let margem =
      ((rowData.precoNovo - rowData.precocusto) / rowData.precoNovo) * 100;

    return (
      new Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(margem) + " %"
    );
  };

  const markup = (rowData) => {
    //Markup em %: (Preço de venda - Preço de compra) / Preço de compra * 100.
    let markup =
      ((rowData.precoNovo - rowData.precocusto) / rowData.precocusto) * 100;
    return (
      new Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(markup) + " %"
    );
  };

  const sugestaoVenda = (rowData) => {
    let sugestao =
      (rowData.precocusto * rowData.percentualmarkup) / 100 +
      rowData.precocusto;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(sugestao);
  };

  const RSmargemSugerida = (rowData) => {
    // Margem em valor monetário: Preço de venda - Preço de compra

    let sugestao =
      (rowData.precocusto * rowData.percentualmarkup) / 100 +
      rowData.precocusto;

    let RSmargem = sugestao - rowData.precocusto;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(RSmargem);
  };

  const margemSugerida = (rowData) => {
    let sugestao =
      (rowData.precocusto * rowData.percentualmarkup) / 100 +
      rowData.precocusto;

    let margemSugerida = ((sugestao - rowData.precocusto) / sugestao) * 100;

    return (
      new Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
        maximumSignificantDigits: "4",
      }).format(margemSugerida) + " %"
    );
  };

  const percentualmarkupSugerido = (rowData) => {
    let percentualmarkupSugerido = rowData.percentualmarkup;

    return (
      new Intl.NumberFormat("pt-BR", {
        style: "decimal",
        currency: "BRL",
      }).format(percentualmarkupSugerido) + " %"
    );
  };

  const RSmargem = (rowData) => {
    // Margem em valor monetário: Preço de venda - Preço de compra
    let margem = rowData.precoNovo - rowData.precocusto;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(margem);
  };

  const precoCustoTemplate = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precocusto);
  };

  const precoVendaTemplate = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.precoNovo);
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

    api
      .put(
        `/api_precificacao/produtos/precificar/${_products2[index].idproduto}/${_products2[index].idfamilia}/${_products2[index].precoNovo}`
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
        setProdutos([]);
      });
  };

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(produtos);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      saveAsExcelFile(excelBuffer, "produtos_precificados");
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    import("file-saver").then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        let EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], {
          type: EXCEL_TYPE,
        });

        module.default.saveAs(
          data,
          fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
        );
      }
    });
  };

  const renderHeader = () => {
    return (
      <div className="pesquisa-rapida">
        <div className="flex align-items-center export-buttons">
          <Button
            type="button"
            onClick={exportExcel}
            icon="pi pi-file-excel"
            style={{ marginRight: "10px" }}
            className="p-button-success mr-2"
            data-pr-tooltip="Exportar para Excel"
          />
        </div>

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
          <h5> {rowData.descricao}</h5>
        </React.Fragment>
      );
    }
  };

  const header = renderHeader();

  const agrupamento = (rowData) => {
    let i = parseInt(rowData.numeronotafiscal);
    return i;
  };

  const buscarProdutos = () => {
    let dataI = dataInicial.toISOString().slice(0, 10);
    let dataF = dataFinal.toISOString().slice(0, 10);

    if (dataI && dataF) {
      setLoading(true);

      api
        .get(`/api_precificacao/produtos/precificar/${dataI}/${dataF}`)
        .then((response) => {
          setProdutos(response.data);
          setLoading(false);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` ${error}  `,
          });

          setLoading(false);
        });
    }
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
              onClick={() => buscarProdutos()}
            />
          </div>
        </>
      ) : (
        <>
          <div className="datatable-templating-demo p-fluid">
            <Button
              label="Voltar "
              className="p-button-rounded p-button-danger"
              icon="pi pi-arrow-left"
              style={{
                padding: "10px",
                margin: "10px",
                width: "150px",
                height: "100%",
              }}
              onClick={() => setProdutos([])}
            />

            <Tooltip target=".export-buttons>button" position="bottom" />

            <DataTable
              style={{ height: "95vh", width: "95vw" }}
              breakpoint="960px"
              loading={loading}
              value={produtos}
              selectionMode="multiple"
              //   reorderableColumns
              editMode="row"
              dataKey="idproduto"
              onRowEditComplete={onRowEditComplete}
              scrollDirection="both"
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
              responsiveLayout="scroll"
              emptyMessage="Nenhum produto encontrado para precificação"
              showGridlines
              header={header}
              rowGroupMode="subheader"
              groupRowsBy={agrupamento}
              //  sortOrder={1}
              rowGroupHeaderTemplate={headerTemplate}
              //resizableColumns
              //columnResizeMode="fit"
            >
              <Column
                style={{ width: "5%" }}
                field="idfilial"
                header="Filial"
              ></Column>
              <Column
                style={{ width: "10%" }}
                field={EanOrCodigo}
                header="Código / Ean"
              ></Column>

              <Column
                style={{ width: "20%" }}
                field="descricao"
                header="Produto"
                body={familiaIcone}
              ></Column>
              <Column
                style={{ width: "5%" }}
                field={precoCustoTemplate}
                header="R$ Custo"
                body={precoCustoTemplate}
              ></Column>

              <Column
                style={{ width: "7%" }}
                field={margemSugerida}
                header="%Margem sugerida"
                body={margemSugerida}
              ></Column>

              <Column
                style={{ width: "5%" }}
                field={RSmargemSugerida}
                header="R$ Margem sugerida"
                body={RSmargemSugerida}
              ></Column>

              <Column
                style={{ width: "7%" }}
                field={percentualmarkupSugerido}
                header="%Markup sugerido"
                body={percentualmarkupSugerido}
              ></Column>

              <Column
                style={{ fontWeight: "600", width: "5%" }}
                field={sugestaoVenda}
                header="Sugestão de venda (Markup sugerido)"
                body={sugestaoVenda}
              ></Column>

              <Column
                style={{ width: "7%" }}
                field={margem}
                header="%Margem atual"
                body={margem}
              ></Column>

              <Column
                style={{ width: "5%" }}
                field={RSmargem}
                header="R$ Margem atual"
                body={RSmargem}
              ></Column>

              <Column
                style={{ width: "7%" }}
                field={markup}
                header="%Markup atual"
                body={markup}
              ></Column>

              <Column
                field="precoNovo"
                header="R$ Venda atual"
                body={precoVendaTemplate}
                style={{ fontWeight: "600", width: "7%" }}
                editor={(options) => priceEditor(options)}
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
