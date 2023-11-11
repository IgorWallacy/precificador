import React, { useState, useEffect, useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Header from "../../.././../components/header";
import Footer from "../../../../components/footer";

import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";

import api from "../../../../services/axios";
import AuditoriaInventario from "../auditoria";
import moment from "moment";

export default function AnaliseInventario() {
  let { id } = useParams();

  const toast = useRef(null);

  const navigate = useNavigate();

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const [produto, setProduto] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inventario, setInventario] = useState([]);

  const [dialogAuditoria, setDialogAuditoria] = useState(false);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    produto: { value: null, matchMode: FilterMatchMode.CONTAINS },

    ean: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const header = () => {
    return (
      <div className="flex justify-content-around flex-row-reverse ">
        <div>
          {`Quantidade vendida durante o inventário de ${moment(
            inventario?.inicio
          ).format("DD/MM/YYYY - HH:mm:ss")} até ${moment(
            inventario?.fim
          ).format("DD/MM/YYYY - HH:mm:ss")}`}
          <h4 style={{ color: "red" }}>
            ** QUANTIDADE VENDIDA NÃO ENTRA NO CÁLCULO DAS DIVERGÊNCIAS **
          </h4>
        </div>
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

  const getItens = () => {
    setLoading(true);
    return api
      .get(`/api/produto/contagem/porInventario/${id}`)
      .then((r) => {
        setProduto(r.data);
        //  console.log(r.data);
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao carregar os itens " + e?.message,
        });
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const getInventario = () => {
    return api
      .get(`/api/produto/contagem/inventarios/${id}`)
      .then((r) => {
        setInventario(r.data);
        //  console.log(r.data);
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

  const quantidadeEstoqueTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(row?.quantidadeEstoque)}
        </div>
      </>
    );
  };
  const quantidadeLidaTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(row?.quantidadeLida)}
        </div>
      </>
    );
  };

  const quantidadeVendidaDuranteTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(row?.quantidadeVendidaDurante)}
        </div>
      </>
    );
  };

  const levantamentoFinalTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(
            row?.quantidadeLida -
              (row?.quantidadeVendidaDurante
                ? row?.quantidadeVendidaDurante
                : 0)
          )}
        </div>

        {row?.quantidadeLida -
          (row?.quantidadeVendidaDurante
            ? row?.quantidadeVendidaDurante
            : 0) ===
        row?.quantidadeEstoque ? (
          <Tag value="Corrigido" severity="success" />
        ) : (
          <Tag value="Precisa recontar" severity="danger" />
        )}
      </>
    );
  };
  const divergenciaEstoqueTemplate = (row) => {
    return row?.divergencia >= 0 ? (
      <>
        {row?.divergencia === 0 ? (
          <>
            <div>
              <Tag severity="success" value={"Sem divergências"} />
            </div>
          </>
        ) : (
          <>
            <div>
              <Tag
                severity="warning"
                value={
                  "Sobrando " +
                  Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    maximumFractionDigits: "3",
                    minimumFractionDigits: 0,
                  }).format(row?.divergencia)
                }
              />
            </div>
          </>
        )}
      </>
    ) : (
      <>
        {row?.divergencia === 0 ? (
          <>
            <div>
              <Tag severity="success" value={"Sem divergências"} />
            </div>
          </>
        ) : (
          <>
            <div>
              <Tag
                severity="danger"
                value={
                  "Faltando " +
                  Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    maximumFractionDigits: "3",
                    minimumFractionDigits: 0,
                  }).format(row?.divergencia)
                }
              />
            </div>
          </>
        )}
      </>
    );
  };
  const converterParaCSV = (jsonData) => {
    const separator = ";";
    const keys = Object.keys(jsonData[0]);

    const csvContent = jsonData.map((item) =>
      keys.map((key) => item[key]).join(separator)
    );

    return keys.join(separator) + "\n" + csvContent.join("\n");
  };

  const exportarContagem = () => {
    const csvData = converterParaCSV(
      produto.map((m) => ({
        produto: m?.codigo,
        quantidade: parseFloat(
          m?.quantidadeLida -
            (m?.quantidadeVendidaDurante ? m?.quantidadeVendidaDurante : 0)
        ),
      }))
    );

    const blob = new Blob([csvData.slice(18)], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "Contagem do inventario do dia " +
      moment(inventario?.inicio).format("DD-MM-YYYY");
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    getItens();
    getInventario();
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <Header />
      <Footer />
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
        }}
      >
        <h1>
          {" "}
          Análise do invetário {inventario?.id} - {inventario?.nome} -{" "}
          {inventario?.loja}
        </h1>
        {inventario?.status ? (
          <Tag
            severity="success"
            value={
              " Aberto em " +
              moment(inventario?.inicio).format("DD/MM/YYYY - HH:mm:ss") +
              " Posição do estoque em " +
              moment().format("DD/MM/YYYY HH:mm:ss")
            }
          />
        ) : (
          <Tag
            severity="danger"
            value={
              "Fechado. Posição do estoque congelado em " +
              moment(inventario?.fim).format("DD/MM/YYYY - HH:mm:ss")
            }
          />
        )}

        <Toolbar
          left={
            <Button
              label="Voltar"
              className="p-button p-button-rounded p-button-danger"
              onClick={() => navigate("/estoque/lista-inventario")}
              icon="pi pi-backward"
            />
          }
          right={
            <>
              <div>
                <Button
                  style={{ margin: "0px 5px" }}
                  label="Recarregar"
                  className="p-button p-button-rounded p-button-secondary"
                  onClick={() => getItens()}
                  icon="pi pi-refresh"
                  loading={loading}
                />
                <Button
                  style={{ margin: "0px 5px" }}
                  label="Auditoria"
                  className="p-button p-button-rounded p-button-info"
                  onClick={() => setDialogAuditoria(true)}
                  icon="pi pi-search"
                />

                <Button
                  style={{ margin: "0px 5px" }}
                  label="Exportar contagens"
                  className="p-button p-button-rounded p-button-primary"
                  onClick={() => exportarContagem()}
                  icon="pi pi-file-excel"
                />
              </div>
            </>
          }
        />

        <DataTable
          removableSort
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          loading={loading}
          value={produto}
          stripedRows
          dataKey="id"
          emptyMessage="Nenhum produto encontrado"
          filters={filters}
          filterDisplay="row"
          globalFilterFields={["produto", "ean", "divergencia"]}
          style={{ width: "100%" }}
          header={header}
        >
          <Column sortable field="ean" header="Código"></Column>
          <Column sortable field="produto" header="Produto"></Column>
          <Column
            sortable
            field="quantidadeLida"
            header="Quantidade no inventário (Físico)"
            body={quantidadeLidaTemplate}
          ></Column>
          <Column
            sortable
            field="quantidadeEstoque"
            body={quantidadeEstoqueTemplate}
            header="Quantidade no estoque ( Sistema ) "
          ></Column>
          <Column
            sortable
            field="divergencia"
            body={divergenciaEstoqueTemplate}
            header="Divergências"
          ></Column>

          <Column
            sortable
            field="quantidadeVendidaDurante"
            body={quantidadeVendidaDuranteTemplate}
            header="Qtde vendida durante o inventário"
          ></Column>
          <Column
            sortable
            body={levantamentoFinalTemplate}
            header="Levantamento de estoque"
          ></Column>
        </DataTable>
      </div>
      <Dialog
        modal={false}
        maximizable
        header={`Auditoria do inventário ${id}`}
        visible={dialogAuditoria}
        onHide={() => setDialogAuditoria(false)}
      >
        <AuditoriaInventario id={id} />
      </Dialog>
    </>
  );
}
