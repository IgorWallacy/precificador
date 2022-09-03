import React, { useEffect, useState } from "react";

import { DataTable } from "primereact/datatable";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

import api from "../../../services/axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import Logo from "../../../assets/img/undraw_services_re_hu5n.svg";
import "./styles.css";
import { formataMoeda } from "../../../util";

const ListaCompras = () => {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },

    "fornecedor.nome": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const getPedidos = () => {
    api
      .get(`/api/pedido/compra/todos`)
      .then((r) => {
        //  console.log(r.data);
        setPedidos(r.data);
      })
      .catch((e) => {
        //  console.log(e);
      });
  };

  useEffect(() => {
    getPedidos();
  }, []);

  const consultaTemplate = (data) => {
    return (
      <>
        <Button
          label="Consultar"
          icon="pi pi-eye"
          className="p-button-rounded p-button-info"
          onClick={() =>
            navigate(`/compras/analise/fornecedor/pedido/${data.id}`)
          }
        />
      </>
    );
  };

  const condicaoPagamentoTemplate = (data) => {
    return <> {data.condicaoPagamento.descricao} </>;
  };

  const prazoEntregaTemplate = (data) => {
    return moment(data.prazoEntrega).format("DD/MM/YYYY");
  };

  const emissaoTemplate = (data) => {
    return moment(data?.dataEmissao).format("DD/MM/YYYY");
  };

  const totalTemplate = (data) => {
    return formataMoeda(data.total);
  };

  return (
    <>
      <Header />
      <Footer />

      <div className="container-pedido">
        <div>
          <h1 style={{ color: "#FFFF" }}>Consulta pedidos de compras</h1>
          <img src={Logo} style={{ width: "400px", height: "400px" }} />
        </div>
        <div className="tabela-pedidos">
          <DataTable
            filterDisplay="row"
            dataKey="id"
            filters={filters2}
            paginator
            rows={5}
            style={{ width: "100%" }}
            value={pedidos}
            responsiveLayout="stack"
          >
            <Column
              field="id"
              header="Número"
              filter
              filterPlaceholder="Pesquisar por número"
            ></Column>
            <Column
              field="fornecedor.nome"
              header="Fornecedor"
              filter
              filterPlaceholder="Pesquisar por fornecedor"
            ></Column>
            <Column
              header="Emissão"
              filterField="dataEmissao"
              dataType="date"
              body={emissaoTemplate}
            />
            <Column
              field={prazoEntregaTemplate}
              header="Prazo de entrega"
            ></Column>
            <Column
              field={condicaoPagamentoTemplate}
              header="Prazo para pagamento "
            ></Column>
            <Column header="Total" field={totalTemplate} />

            <Column header="Consultar" field={consultaTemplate} />
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default ListaCompras;
