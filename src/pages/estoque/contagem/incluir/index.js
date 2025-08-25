import { useState, useRef } from "react";
import Footer from "../../../../components/footer";
import api from "../../../../services/axios";

import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useEffect } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const IncluirContagemInventario = () => {
  const toast = useRef(null);

  const [inventario, setInventario] = useState([]);

  const navigate = useNavigate()

  const getInventario = () => {
    return api
      .get(`/api/produto/contagem/inventarios`)
      .then((r) => {
        setInventario(r.data);
        console.log(r.data);
      })
      .catch((e) => {
        //console.log(e?.message);
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao recuperar dados do inventário " + e?.message,
        });
      })
      .finally((f) => {});
  };

  useEffect(() => {
    getInventario();
  }, []);
  return (
    <>
      <Footer />
      <Toast ref={toast} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "50px",
          width: "100%",
        }}
      >
        
          <h1>Selecione um inventário para iniciar a contagem</h1>
      
        <div style={{ width: "100%", padding: "1rem" }}>
          <DataTable
            style={{ width: "100%" }}
            value={inventario}
            responsiveLayout="stack"
          >
            <Column field="id" header="Código"></Column>
            <Column field="loja" header="Loja"></Column>
            <Column field="nome" header="Inventário"></Column>

            <Column
              field={(row) => {
                return moment(row?.inicio).format("DD/MM/YYYY - HH:mm");
              }}
              header="Início"
            ></Column>
            <Column
              header="Status"
              body={(row) => {
                return row?.status ? (
                  <Tag value="Aberto" icon="pi pi-lock-open" severity="success" />
                ) : (
                  <Tag value="Fechado" icon="pi pi-lock" severity="danger" />
                );
              }}
            ></Column>

            <Column
              header="Finalizado"
              body={(row) => {
                return row?.fim
                  ? moment(row?.fim).format("DD/MM/YYYY - HH:mm")
                  : "";
              }}
            ></Column>
            <Column
              header="Iniciar"
              body={(row) => {
                return row?.status ? (
                  <Button
                    label="Iniciar a contagem"
                    icon="pi pi-qrcode"
                    className="p-button p-button-rounded p-button-success"
                    onClick={() =>  navigate('/estoque/inventario/contar', { state: { inventario : row } })}
                  />
                ) : (
                  <Tag value="Inventário encerrado" icon="pi pi-lock" severity="danger" />
                );
              }}
            ></Column>
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default IncluirContagemInventario;
