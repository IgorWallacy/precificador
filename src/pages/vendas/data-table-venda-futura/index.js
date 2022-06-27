import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Button } from "primereact/button";

export default function VendaFutura() {
  let headerGroup = (
    <ColumnGroup>
     <Row>
    <Column></Column>
    <Column></Column>
    <Column></Column>
    <Column></Column>
     <Column colSpan={11}  header="Preenchimento da loja" ></Column>
     </Row>
      <Row>
        <Column header="Loja" ></Column>
        <Column header="Código" ></Column>
        <Column header="Produto"></Column>
        <Column header="Estoque"></Column>
        <Column header="Venda diária"></Column>
        <Column header="Quantidade sugerida"></Column>
        <Column header="Quantidade vendida no périodo"></Column>
        <Column header="Tempo do pedido"></Column>
        <Column header="Tempo de  entrega"></Column>
        <Column header="Margem de erro da entrega"></Column>
        <Column header="Valor unitário"></Column>
        <Column header="Valor bruto"></Column>
        <Column header="% Individual"></Column>
        <Column header="% Acumulada"></Column>
        <Column header="Classificação"></Column>
      </Row>
    </ColumnGroup>
  );

  return (
    <>
      <div className="container-flex">
        <h4
          style={{
            color: "#FFF",
            display: "flex",
            fontWeight: "800",
            margin: "10px",
            fontSize: "25px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Tabela de simulação para venda futura
        </h4>

        <div className="datatable-templating-demo p-fluid">
          <DataTable emptyMessage="Nenhum produto encontrado"
            style={{ width: "100%", padding: "5px" }}
            responsiveLayout="scroll"
            headerColumnGroup={headerGroup}
          >
             <Column field="loja" header="Loja" expander></Column>
            <Column field="codigo" header="Código" expander></Column>
            <Column field="produto" header="Produto"></Column>
            <Column field="venda_diaria" header="Venda diária"></Column>
            <Column
              field="quantidade_a_comprar"
              header="Quantidade sugerida"
            ></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
             <Column field="venda_diaria" header="Venda diária"></Column>
          </DataTable>
        </div>
      </div>
    </>
  );
}
