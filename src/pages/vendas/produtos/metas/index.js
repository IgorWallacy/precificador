import React, { useMemo, useEffect, useState, useRef } from "react";

import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";

import api from "../../../../services/axios";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";

const MetasComponent = () => {
  const toast = useRef(null);
  const [loadingMeta, setloadinMeta] = useState(false);
  const [grupos, setGrupos] = useState([]);
  const [dialogMeta, setDialogMeta] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState([]);
  const [novaMeta, setNovaMeta] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const dadosDialog = (row) => {
    setGrupoSelecionado(row);
    setDialogMeta(true);
    getProdutos(row);
  };

  const getProdutos = (rowData) => {
    setProdutos([]);
    setLoading(true);
    api
      .get(`/api/produto/${rowData?.original?.codigo}`)
      .then((r) => {
        setProdutos(r.data);
        //console.log(r.data);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoading(false);
      });
  };

  const columns = useMemo(
    () => [
      {
        header: "Código",
        accessorKey: "codigo",
        enableGrouping: true, //do not let this column be grouped
      },
      {
        header: "Seção I",
        accessorKey: "grupo_pai",
        enableGrouping: true, //do not let this column be grouped
      },
      {
        header: "Seção II",
        accessorKey: "grupo_filho",
        enableGrouping: true, //do not let this column be grouped
      },
      {
        header: "Seção III",
        accessorKey: "nome",
        enableGrouping: true, //do not let this column be grouped
      },
      {
        header: "Meta de Markup %",
        accessorFn: (row) =>
          `${Intl.NumberFormat("pt-BR", {
            mode: "decimal",
          }).format(row.meta)}`,
        enableGrouping: true, //do not let this column be grouped
      },
    ],
    []
  );

  const getGrupos = () => {
    return api
      .get("/api/grupos")
      .then((r) => {
        //  console.log(r.data);
        setGrupos(r.data);
      })
      .catch((err) => {})
      .finally(() => {});
  };

  const atualizarMeta = async () => {
    setloadinMeta(true);
    return await api
      .put(
        `/api/grupos/atualizarmeta/${grupoSelecionado?.original?.codigo}/${novaMeta}`
      )
      .then((response) => {
        toast.current.show({
          severity: "success",
          summary: "Sucesso !",
          detail: "Meta atualizada",
        });

        getGrupos();
      })
      .catch((e) => {
        // console.log(e);
        toast.current.show({
          severity: "error",
          summary: "Erro !",
          detail: `${e.message}`,
        });
      })
      .finally((f) => {
        setloadinMeta(false);
        setDialogMeta(false);
        setNovaMeta(null);
      });
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Pesquisar"
          />
        </span>
      </div>
    );
  };
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  useEffect(() => {
    getGrupos();
  }, []);

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      <Header />
      <Footer />
      <Dialog
        modal={false}
        position="bottom"
        header={"Atualizar meta do grupos " + grupoSelecionado?.original?.nome}
        visible={dialogMeta}
        style={{ width: "50vw" }}
        onHide={() => setDialogMeta(false)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "10px",
            flexDirection: "column",
          }}
        >
          <div>
            <h2>
              Meta atual{" "}
              {grupoSelecionado?.original?.meta
                ? Intl.NumberFormat("pt-BR", {
                    mode: "decimal",
                  }).format(grupoSelecionado?.original?.meta)
                : 0 + " % "}
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <h1>Nova meta</h1>
            <InputNumber
              autoFocus
              value={novaMeta}
              onValueChange={(e) => setNovaMeta(e.value)}
              minFractionDigits={2}
            />
            {"  % "}
            <Button
              loading={loadingMeta}
              disabled={loadingMeta}
              label="Atualizar meta"
              className="p-button p-button-rounded p-button-success"
              icon="pi pi-refresh"
              onClick={atualizarMeta}
            />
          </div>
        </div>
        <div>
          <h1>Produtos</h1>
          <DataTable
            filters={filters}
            header={renderHeader}
            globalFilterFields={["codigo", "ean", "nome"]}
            loading={loading}
            value={produtos}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column field="codigo" header="Código"></Column>
            <Column field="ean" header="Ean"></Column>
            <Column field="nome" header="Nome"></Column>
          </DataTable>
        </div>
      </Dialog>

      {grupos.length > 0 ? (
        <>
          <MaterialReactTable
            columns={columns}
            data={grupos}
            enableColumnResizing
            enableGrouping
            enableStickyHeader
            enableStickyFooter
            enablePagination={false}
            initialState={{
              density: "compact",
              expanded: false, //expand all groups by default
              grouping: ["grupo_pai", "grupo_filho"], //an array of columns to group by by default (can be multiple)
              columnVisibility: { codigo: false },
              sorting: [{ id: "codigo", desc: false }], //sort by state by default
            }}
            muiToolbarAlertBannerChipProps={{ color: "primary" }}
            muiTableContainerProps={{ sx: { maxHeight: 700 } }}
            localization={MRT_Localization_PT_BR}
            enableRowActions
            renderRowActions={({ row }) => (
              <>
                {row?.original?.codigo?.trim()?.split("   ").length === 2 ? (
                  <>
                    <Button
                      className="p-button p-button-rounded p-button-danger"
                      icon="pi pi-chart-line"
                      tooltip="Atenção ! Alterar em vermelho, altera todos os grupos abaixo"
                      onClick={() => dadosDialog(row)}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      className="p-button p-button-rounded p-button-secondary"
                      icon="pi pi-chart-line"
                      onClick={() => dadosDialog(row)}
                    />
                  </>
                )}
              </>
            )}
          />
        </>
      ) : (
        <>
          <ProgressBar
            mode="indeterminate"
            style={{ height: "6px" }}
          ></ProgressBar>
        </>
      )}
    </>
  );
};

export default MetasComponent;
