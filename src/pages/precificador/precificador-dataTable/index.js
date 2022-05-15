import React, { useState, useEffect, useRef } from "react";

import "./styless.css";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { Avatar } from 'primereact/avatar';

import PrecificadorForm from "../precificador-form";

import api from "../../../services/axios";

import Context from "../../../contexts";
import { Button } from "primereact/button";

const Precificador = () => {
  const toast = useRef(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    descricao: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    razaosocial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    numeronotafiscal: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  useEffect(() => {}, []);

  const margem = (rowData) => {
    //Margem em %: (Preço de venda - Preço de compra) / Preço de venda * 100.
    let margem =
      ((rowData.precoNovo - rowData.precocusto) / rowData.precoNovo) * 100;

    return margem.toFixed(2) + " %";
  };

  const markup = (rowData) => {
    //Markup em %: (Preço de venda - Preço de compra) / Preço de compra * 100.
    let markup =
      ((rowData.precoNovo - rowData.precocusto) / rowData.precocusto) * 100;
    return markup.toFixed(2) + " %";
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
        `/produtos/precificar/${_products2[index].idproduto}/${_products2[index].precoNovo}`
      )
      .then((response) => {
        //console.log(response.data);
        setProdutos(_products2);
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
        
        <Avatar icon="pi pi-user"   shape="circle" />

        <span className="image-text"> Fornecedor  :  {data.razaosocial} </span> 
        <span className="image-text"> Nota fiscal :  {data.numeronotafiscal} </span>
        </div>
      </React.Fragment>
    );
  };

  const familiaIcone = (rowData) =>{
  
    if(rowData.idfamilia > 0) {
      return (
       <React.Fragment>
         <h4>{rowData.descricao}</h4>
         <Button tooltip="Será atualizado o preço da família" style={{fontSize: "2rem"}} icon="pi pi-users" />
       </React.Fragment>
      )
    } else {
      return (
        <React.Fragment>
        <h4>{rowData.descricao}</h4>
       
      </React.Fragment>
      )
    }
  }

  const header = renderHeader();

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      {produtos.length < 1 ? (
        <Context.Provider value={{ setProdutos, setLoading }}>
          <PrecificadorForm />
        </Context.Provider>
      ) : (
        <div className="datatable-templating-demo p-fluid">
          <Button
            label="Voltar a Pesquisa"
            className="p-button-rounded p-button-danger"
            icon="pi pi-trash"
            style={{ margin: "10px", width: "200px", height: "100%" }}
            onClick={() => setProdutos([])}
          />
          <DataTable
            loading={loading}
            value={produtos}
              selectionMode="multiple"
            className="editable-cells-table"
            responsiveLayout="scroll"
            editMode="row"
            dataKey="id"
            onRowEditComplete={onRowEditComplete}
            scrollDirection="vertical"
            scrollable
            scrollHeight="flex"
            globalFilterFields={[
              "descricao",
              "numeronotafiscal",
              "razaosocial",
            ]}
            filters={filters2}
            emptyMessage="Nenhum produto encontrado para precificação"
            size="large"
            showGridlines
            header={header}
            rowGroupMode="subheader"
            groupRowsBy="razaosocial"
            sortOrder={1}
            rowGroupHeaderTemplate={headerTemplate}
            style={{ height: "calc(100vh - 145px)" }}
          >
            <Column
              style={{ fontWeight: "600" }}
              field="idfilial"
              header="Filial"
            ></Column>
            <Column
              style={{ fontWeight: "600" }}
              field="ean"
              header="Código/Ean"
              body={EanOrCodigo}
            ></Column>

            <Column
              style={{ fontWeight: "600" }}
              field="descricao"
              header="Produto"
              body={familiaIcone}
            ></Column>
            <Column
              style={{ fontWeight: "600" }}
              field="precocusto"
              header="Custo"
              body={precoCustoTemplate}
            ></Column>
            <Column
              style={{ fontWeight: "600" }}
              field="margem"
              header="Margem"
              body={RSmargem}
            ></Column>

            <Column
              style={{ fontWeight: "600" }}
              field="margem"
              header="%Margem"
              body={margem}
            ></Column>
            <Column
              style={{ fontWeight: "600" }}
              field="markup"
              header="%Markup"
              body={markup}
            ></Column>

            <Column
              field="precoNovo"
              header="Venda"
              body={precoVendaTemplate}
              style={{ fontWeight: "600" }}
              editor={(options) => priceEditor(options)}
            ></Column>

            <Column rowEditor></Column>
          </DataTable>
        </div>
      )}
    </>
  );
};

export default Precificador;
