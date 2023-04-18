import { Button } from "primereact/button";
import { useState, useMemo, useEffect, useRef } from "react";
import api from "../../../services/axios";

import MaterialReactTable from "material-react-table";
import { Box } from "@mui/material";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { exportToExcel } from "react-json-to-excel";

import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import moment from "moment";

const EstoqueComprasFornecedor = () => {
  const toast = useRef(null);
  const [produtos, setProdutos] = useState([]);
  const [dataIncial, setDataInicial] = useState(new Date());
  const [dataFinal, setDataFinal] = useState(new Date());
  const [fornecedor, setFornecedor] = useState([]);
  const [fornecedorList, setFornecedorList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleExportExcelRows = (rows) => {
    let dados = rows.map((row) => row);
    if (dados?.length > 0) {
      let dados2 = dados.map((d) => {
        return {
          Emissao: moment(d.dataEmissao).format("DD/MM/YYYY"),
          NF: d.numeronf,
          Loja: d.nomefilial,
          Codigo: d.codigoproduto,
          Produto: d.nomeproduto,
          Custo_Ultima_compra: d.precoultimacompra,
          Custo: d.precocusto,
          // Embalagem: d.quantidadeembalagem,
          UN_COMPRA: d.codigounidademedida,
          quantidade_comprada: d.quantidadecompra,
          Condicao_pagamento: d.condicaopagamento,
          Fornecedor: d.nomefornecedor,
          Total_comprado: Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.total),
          UN_VENDA: d.unvenda,
          quantidade_vendida: d.quantidadevendida,
          "ATENÇÃO A QUANTIDADE VENDIDA NÃO DEVE SER SOMADA... JÁ É O  TOTAL VENDIDO DO PRODUTO NO PÉRIODO":
            "",
        };
      });

      exportToExcel(dados2.sort(), "CompraXVendaPorFornecedor");
    }
  };

  const voltar = () => {
    return (
      <>
        <Button
          style={{ margin: "5px" }}
          className="p-button p-button-rounded p-button-danger"
          icon="pi pi-backward"
          label="Voltar"
          onClick={() => setProdutos([])}
        />

        <Button
          className="p-button p-button-rounded p-button-success"
          icon="pi pi-file-excel"
          label="Exportar em excel"
          onClick={() => handleExportExcelRows(produtos)}
        />
      </>
    );
  };

  const getFornecedores = () => {
    api
      .get("/api/entidade/fornecedores")
      .then((r) => {
        setFornecedorList(r.data);
        // console.log(r.data);
      })
      .catch((e) => {});
  };

  const getProdutos = () => {
    setLoading(true);
    return api
      .get(
        `/api/estoquecompras/${moment(dataIncial).format(
          "YYYY-MM-DD"
        )}/${moment(dataFinal).format("YYYY-MM-DD")}/${fornecedor?.id}`
      )
      .then((r) => {
        setProdutos(r.data);

        if (r.data.length === 0) {
          toast.current.show({
            severity: "warn",
            summary: "Aviso",
            detail: "Nenhum produto encontrado !",
          });
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row?.nomefilial,
        header: "Loja",
      },
      {
        accessorFn: (row) => row?.codigoproduto, //access nested data with dot notation
        accessorKey: "codigoproduto",
        header: "Código",
      },
      {
        accessorFn: (row) => row?.nomeproduto,
        header: "Produto",
      },

      {
        accessorFn: (row) => row?.nomefornecedor,
        header: "Fornecedor",
      },

      {
        header: "Preço de custo ",
        accessorKey: "precocusto",

        aggregationFn: "mean",
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <h4 style={{ fontWeight: "bold" }}>Custo médio</h4>
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                {cell.getValue()?.toLocaleString?.("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Box>
            </div>
          </>
        ),
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ),
      },

      {
        accessorFn: (row) => row?.numeronfultcompra,
        accessorKey: "numeronfultcompra",
        header: "Nota fiscal última compra",
      },
      {
        accessorFn: (row) =>
          `${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(row?.precoultimacompra)}`,

        header: "Preço de custo da última compra ",
      },
      {
        accessorFn: (row) => row?.numeronf,

        header: "Nota fiscal ",
      },
      {
        accessorFn: (row) => row?.condicaopagamento,

        header: "Condição de pagamento ",
      },
      {
        accessorFn: (row) => moment(row?.dataEmissao).format("DD/MM/YYYY"),

        header: "Entrada",
      },

      {
        accessorFn: (row) => row?.codigounidademedida,

        header: "UN compra",
      },

      {
        header: "Quantidade comprada",
        accessorKey: "quantidadecomprada",
        aggregationFn: "sum",
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell }) => (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                {cell.getValue()?.toLocaleString?.("pt-BR", {
                  style: "decimal",

                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Box>
            </div>
          </>
        ),
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "decimal",

              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ),
      },
      {
        header: "Total comprado R$ ",
        accessorKey: "total",

        aggregationFn: "sum",
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell }) => (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <h4 style={{ fontWeight: "bold" }}></h4>
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                {cell.getValue()?.toLocaleString?.("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Box>
            </div>
          </>
        ),
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ),
      },
      {
        header: "Quantidade vendida",
        accessorFn: (row) => row?.quantidadevendida,
        accessorKey: "quantidadevendida",
      },
      {
        accessorFn: (row) => row?.unvenda,

        header: "UN venda",
      },
    ],

    []
  );
  const optionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>
          {option?.codigo} - {option?.nome}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getFornecedores();
  }, []);

  return (
    <>
      <Toast position="top-center" ref={toast} />
      <Header />
      <Footer />

      {produtos.length > 0 ? (
        <>
          <Toolbar start={voltar} />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: "2px",
              gap: "5px",
            }}
          >
            <h2 style={{ color: "#f2f2f2", marginBottom: "5px" }}>
              Período : {moment(dataIncial).format("DD-MM-YYYY")} até{" "}
              {moment(dataFinal).format("DD-MM-YYYY")}
            </h2>
            <h2 style={{ color: "#f2f2f2", marginBottom: "5px" }}>
              Fornecedor {fornecedor?.codigo} - {fornecedor?.nome}
            </h2>
          </div>
          <div>
            <MaterialReactTable
              columns={columns}
              data={produtos}
              enableColumnResizing
              enableGrouping
              enableStickyHeader
              enableStickyFooter
              enableColumnFilterModes
              enableColumnOrdering
              enablePinning
              enableSelectAll={false}
              enablePagination={false}
              // enableRowVirtualization
              initialState={{
                columnVisibility: {
                  numeronfultcompra: false,
                  codigoproduto: false,
                },
                density: "compact",
                expanded: true,
                grouping: ["Produto", "quantidadevendida"],
                pagination: { pageIndex: 0, pageSize: 100 },
                sorting: [{ id: "Produto", desc: false }],
              }}
              localization={MRT_Localization_PT_BR}
            />
          </div>
        </>
      ) : (
        <>
          {loading === true ? (
            <>
              {" "}
              <ProgressBar
                mode="indeterminate"
                style={{ height: "6px" }}
              ></ProgressBar>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "5px",
                  padding: "1rem",
                  flexDirection: "row",
                }}
              >
                <Calendar
                  value={dataIncial}
                  onChange={(e) => setDataInicial(e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  showButtonBar
                />{" "}
                <Calendar
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  showButtonBar
                />
                <Dropdown
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.value)}
                  options={fornecedorList}
                  optionLabel="nome"
                  placeholder="Selecione um fornecedor"
                  filter
                  filterBy="codigo,nome"
                  //valueTemplate={selectedCountryTemplate}
                  itemTemplate={optionTemplate}
                  className="w-full md:w-14rem"
                />
                <Button
                  className="p-button p-button-rounded p-button-success "
                  icon="pi pi-search"
                  label="Pesquisar"
                  loading={loading}
                  onClick={getProdutos}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default EstoqueComprasFornecedor;
