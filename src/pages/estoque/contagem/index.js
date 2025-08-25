import React, { useState, useRef } from "react";

import Footer from "../../../components/footer";

import DestaqueImg from "../../../assets/img/package.json";
import DestaqueImg2 from "../../../assets/img/Animation - 1720833923478.json";
import { Player } from "@lottiefiles/react-lottie-player";

import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from 'primereact/api';
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

import api from "../../../services/axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";


export default function ContagemInventario() {
  const navigate = useNavigate();

  const toast = useRef(null);
  const toastDialog = useRef(null);

  const [inventariosList, setInventariosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCongelarEstoque, setLoadingCongelarEstoque] = useState(false);

  const [visible, setVisible] = useState(false);

  const [nome, setNome] = useState(null);
  const [loja, setLoja] = useState(null);
  const [filiais, setFiliais] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'id': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'nome': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'loja': { value: null, matchMode: FilterMatchMode.STARTS_WITH },

  });

  const onGlobalFilterChange2 = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  }

  const getInvenaritos = () => {
    setLoading(true);
    return api
      .get("/api/produto/contagem/inventarios")
      .then((r) => {
        setInventariosList(r.data);
        //console.log(r.data);
      })
      .catch((e) => {
        //    console.log(e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const getFiliais = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setFiliais(r.data);
      })
      .catch((e) => {
        //  console.log(e);
      })
      .finally((f) => { });
  };

  const gravar = () => {
    if (nome && loja) {
      return api
        .post("/api/produto/contagem/inventario/salvar", {
          id: "",
          nome: nome,
          idfilial: loja?.id,
          loja: loja?.nome,
          status: 1,
        })
        .then((r) => {
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Inventário cadastrado",
          });
          getInvenaritos();
          setVisible(false);
          setNome(null);
          setLoja(null);
        })
        .catch((e) => {
          toastDialog.current.show({
            severity: "error",
            summary: "Erro",
            detail: e?.message,
          });
        });
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Informe uma descrição e a loja",
      });
    }
  };

  const finalizarInventario = (data) => {
    setLoadingCongelarEstoque(true);

    return api
      .put(`/api/produto/contagem/inventario/finalizar/${data}`)
      .then((r) => {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Inventário finalizado",
          life: 3000,
        });
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `Erro ao finalizar o inventário ${e?.message}`,
          life: 3000,
        });
      })
      .finally((f) => {
        getInvenaritos();
        setLoadingCongelarEstoque(false);
      });
  };

  const reabrirInventario = (data) => {
    setLoadingCongelarEstoque(true);

    return api
      .put(`/api/produto/contagem/inventario/reabrir/${data}`)
      .then((r) => {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Inventário reaberto",
          life: 3000,
        });
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `Erro ao reabrir o inventário ${e?.message}`,
          life: 3000,
        });
      })
      .finally((f) => {
        getInvenaritos();
        setLoadingCongelarEstoque(false);
      });
  };

  const statusTemplate = (rowData) => {
    return (
      <div>
        {" "}
        {rowData?.status ? (
          <Tag severity="success" value={'Aberto em ' + moment(rowData?.inicio).format("DD/MM/YYYY HH:mm:ss")}></Tag>
        ) : (
          <Tag severity="danger" value={'Fechado em ' + moment(rowData?.fim).format("DD/MM/YYYY HH:mm:ss")}></Tag>
        )}{" "}
      </div>
    );
  };
  const inicioTemplate = (row) => {
    return moment(row?.inicio).format("DD/MM/YYYY HH:mm:ss");
  }

  const visualizarTemplate = (rowData) => {
    return (
      <>
        {" "}
        <Button
          label={rowData?.status ? 'Encerre p/ habilitar o resultado' : 'Analisar resultado'}
          className="p-button p-button-rounded"
          icon="pi pi-eye"
          disabled={rowData?.status}
          onClick={() => navigate(`/estoque/lista-inventario/${rowData?.id}`)}
        />
      </>
    );
  };

  const finalizarTemplate = (rowData) => {
    return rowData?.status ? (
      <>
        <Button
          label="Encerrar"
          disabled={!rowData?.status}
          icon="pi pi-lock"
          className="p-button p-button-rounded p-button-success"
          onClick={() => finalizarInventario(rowData?.id)}
          loading={loadingCongelarEstoque}
        />
      </>
    ) : (
      <>
        <Button
          icon="pi pi-lock-open"
          className="p-button p-button-rounded p-button-warning"
          label="Reabrir"
          disabled={rowData?.status}
          onClick={() => reabrirInventario(rowData?.id)}
        ></Button>
      </>
    );
  };

  useEffect(() => {
    getInvenaritos();
    getFiliais();
  }, []);

  return (
    <div className="page-container">
      <Toast ref={toast} position="top-center" />
      <Footer />

      <div className="page-card">
        <div className="page-header">
          <h1>Controle de Inventário</h1>
          <p>Gerencie contagens de estoque e inventários</p>
        </div>
        <div

          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "5px",
            color: "#f2f2f2",
            width: "100%",
            padding: "1rem",
            marginTop: '50px'
          }}
        >
          <Toolbar
            left={
              <Button
                    label="Novo Inventário"
                    icon="pi pi-plus"
                    onClick={() => setVisible(true)}
                    className="action-button"
                  />
            }
            right={
              <>
                <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
                  
                  <Button
                    label="Recarregar"
                    icon="pi pi-refresh"
                    onClick={() => getInvenaritos()}
                    className="action-button"
                  />
                </div>
              </>
            }
          />
        </div>


        <DataTable
          rows={5}
          paginator
          responsiveLayout="stack"
          breakpoint="968px"
          stripedRows
          loading={loading}
          style={{ width: "100%", margin: "10px" }}
          value={inventariosList}
          tableStyle={{ width: "100%" }}
          removableSort
          filterDisplay="row"
          globalFilterFields={['nome', 'id', 'loja']}
        >
          <Column field="inicio" header="Abertura" body={inicioTemplate} />
          <Column field="id" filter filterPlaceholder="Procurar por código" header="Código"></Column>

          <Column field="nome" filter filterPlaceholder="Procurar por nome" header="Nome"></Column>
          <Column field="loja" filter filterPlaceholder="Procurar por loja" header="Loja"></Column>
          <Column

            sortable
            field="status"
            body={statusTemplate}
            header="Status"
          ></Column>
          <Column header="Visualizar" body={visualizarTemplate}></Column>

          <Column header="Finalizar" body={finalizarTemplate} />
        </DataTable>
      </div>

      <Dialog
        header="Cadastrar novo inventário"
        visible={visible}
        style={{ width: "450px", height: '100vh' }}
        onHide={() => setVisible(false)}
        modal={false}
        position="bottom-left"

        draggable={false}
      >
        <Toast ref={toastDialog} position="bottom-center" />
        <div
          style={{
            display: "flex",
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            margin: '25px',
          }}
        >
          <Player
            src={DestaqueImg2}
            loop
            autoplay
            style={{ width: "350px" }}
          />
          <div>
            <InputText
              placeholder="Descrição"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div>
            <Dropdown
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              options={filiais}
              optionLabel="nome"
              placeholder="Selecione uma loja"
              className="w-full md:w-14rem"
              showClear
            />
          </div>
          <div>
            <Button
              label="Gravar"
              icon="pi pi-save"
              onClick={() => gravar()}
              className="p-button p-button-rounded p-button-success"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
