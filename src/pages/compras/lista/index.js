import React, { useEffect, useState } from "react";

import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import api from "../../../services/axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";

//import Logo from "../../../assets/img/undraw_services_re_hu5n.svg";
import "./styles.css";
import { formataMoeda } from "../../../util";

const ListaCompras = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState([]);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    dataEmissao: {
      value: null,
      matchMode: FilterMatchMode.DATE_IS,
    },

    "fornecedor.nome": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const getPedidos = () => {
    api
      .get(`/api/pedido/compra/todos`)
      .then((r) => {
        //  console.log(r.data);
        setPedidos(r.data);
        setLoading(true);
      })
      .catch((e) => {
        //  console.log(e);
      })
      .finally((f) => {
        setLoading(false);
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

  const totalTemplate = (data) => {
    return formataMoeda(data.total);
  };

  const dataEmissaoTemplate = (data) => {
    return moment(data.dataEmissao).format("DD/MM/YYYY");
  };

  const deletarTemplate = (data) => {
    return (
      <>
        <Button
          label="Deletar"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deletar(data)}
        />
      </>
    );
  };

  const deletar = (data) => {
    setLoading(true);
    api
      .delete(`/api/pedido/compra/deletar/pedido/${data.id}`)
      .then((r) => {
        setLoading(false);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoading(false);
        getPedidos();
      });
  };

  const leftContents = (
    <React.Fragment>
      <Button
        label="Novo pedido"
        icon="pi pi-plus"
        className="mr-2 p-button p-button-rounded"
        onClick={() => navigate("/compras/analise/fornecedor")}
      />
    </React.Fragment>
  );

  return (
    <>
      <Header />
      <Footer />

      <div className="container-pedido">
        <div className="logo-consulta-pedido">
          <h1 style={{ color: "#FFFF", fontFamily: "cabin-sketch-bold" }}>
            Consulta pedidos de compras
          </h1>
        </div>
        <div className="botao-novo">
          <Toolbar left={leftContents} />
        </div>
        <div className="tabela-pedidos">
          <DataTable
            loading={loading}
            filterDisplay="row"
            dataKey="id"
            filters={filters2}
            paginator
            size="small"
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
              field="dataEmissao"
              body={dataEmissaoTemplate}
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
            <Column header="Deletar" field={deletarTemplate} />
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default ListaCompras;
