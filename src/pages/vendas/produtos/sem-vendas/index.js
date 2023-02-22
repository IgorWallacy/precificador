import React, { useState, useMemo, useRef } from "react";

import api from "../../../../services/axios";

import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { addLocale } from "primereact/api";
import { ProgressBar } from "primereact/progressbar";
import { Toolbar } from "primereact/toolbar";

import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { Typography } from "@mui/material";

import { ExportToCsv } from "export-to-csv";

import MaterialReactTable from "material-react-table";

import Header from "../../../../components/header";
import Footer from "../../../../components/footer";

import moment from "moment";
import { useEffect } from "react";

const ProdutosSemVendas = () => {
  const [produtos, setProdutos] = useState([]);

  const [loading, setLoading] = useState(false);

  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();
  const [dataUltimaCompra, setDataUltimaCompra] = useState();

  const [selectLojas, setSelectLojas] = useState([]);
  const [lojaSelecionada, setLojaSelecionada] = useState();

  const getLojas = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setSelectLojas(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const pesquisar = () => {
    setLoading(true);
    return api

      .get(
        `/api_vendas/sem_vendas/produto/${moment(dataInicial).format(
          "YYYY-MM-DD"
        )}/${moment(dataFinal).format("YYYY-MM-DD")}/${
          lojaSelecionada?.id
        }/${moment(dataUltimaCompra).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        //  console.log(r.data);
        setProdutos(r.data);
        setLoading(false);
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
        header: "Grupo I",
        accessorKey: "grupoI",
        enableGrouping: true, //do not let this column be grouped
      },
      {
        header: "Grupo II",
        accessorKey: "grupoII",
        enableGrouping: true,
      },
      {
        header: "Grupo III",
        accessorKey: "grupoIII",
      },

      {
        header: "Código",
        accessorKey: "codigo",
        enableGrouping: false,
      },

      {
        header: "Produto",
        accessorKey: "produto",
        enableGrouping: false,
      },
      {
        header: "Fornecedor",
        accessorKey: "fornecedor",
        enableGrouping: true,
      },
      {
        header: "Última compra",

        accessorFn: (row) => moment(row.ultimacompra).format("DD/MM/YYYY"),
      },
      {
        header: "Estoque",
        accessorKey: "saldo_estoque",
        enableGrouping: false,
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "decimal",

              minimumFractionDigits: 0,
              maximumFractionDigits: 3,
            })}
          </>
        ),
      },
    ],
    []
  );

  const csvOptions = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: true,
    headers: columns.map((c) => c.header),
  };

  const csvExporter = new ExportToCsv(csvOptions);

  const handleExportRows = (rows) => {
    csvExporter.generateCsv(rows.map((row) => row.original));
  };

  useEffect(() => {
    getLojas();
  }, []);
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
    today: " Agora ",
    clear: " Limpar ",
  });

  const leftContents = (
    <React.Fragment>
      <Button
        label="Voltar"
        icon="pi pi-backward"
        className=" p-button p-button-rounded p-button-danger mr-2"
        onClick={() => setProdutos([])}
        disabled={produtos?.length <= 0}
      />
    </React.Fragment>
  );
  return (
    <>
      <Header />
      <Footer />
      <Toolbar left={leftContents} />
      {loading ? (
        <>
          <ProgressBar mode="indeterminate" />
        </>
      ) : (
        <>
          {produtos?.length > 0 && !loading ? (
            <>
              <div>
                <MaterialReactTable
                  columns={columns}
                  data={produtos}
                  memoMode="cells"
                  enablePagination={false}
                  enableColumnResizing
                  enableGrouping
                  enableStickyHeader
                  enableStickyFooter
                  enableColumnOrdering
                  enablePinning
                  //enableRowVirtualization
                  initialState={{
                    density: "compact",
                    expanded: false, //expand all groups by default
                    grouping: ["grupoI", "grupoII", "grupoIII"], //an array of columns to group by by default (can be multiple)
                    pagination: { pageIndex: 0, pageSize: 20 },
                    sorting: [{ id: "grupoI", desc: false }], //sort by state by default
                  }}
                  muiToolbarAlertBannerChipProps={{ color: "primary" }}
                  muiTableContainerProps={{ sx: { maxHeight: 700 } }}
                  localization={MRT_Localization_PT_BR}
                  renderTopToolbarCustomActions={({ table }) => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                        gap: "25px",
                      }}
                    >
                      <div>
                        <Typography component="span" variant="h5">
                          {lojaSelecionada?.nome}
                          <br />
                          Produtos sem venda de{" "}
                          {moment(dataInicial).format("DD/MM/YY")} até{" "}
                          {moment(dataFinal).format("DD/MM/YY")} <br />
                          Última compra em{" "}
                          {moment(dataUltimaCompra).format("DD/MM/YY")}
                        </Typography>
                      </div>
                      <div>
                        <Button
                          className="p-button p-button-rounded p-button-success"
                          icon="pi pi-file-excel"
                          //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                          onClick={() =>
                            handleExportRows(table.getRowModel().rows)
                          }
                          variant="contained"
                          label="Exportar CSV"
                        ></Button>
                      </div>
                    </div>
                  )}
                />
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: "#f2f2f2",
                  marginTop: "20px",
                }}
              >
                <h2>Pesquisar produtos sem venda no período</h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  color: "#FFFF",

                  padding: "5px",
                  margin: "5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <h4>Data de início</h4>
                  <Calendar
                    dateFormat="dd/mm/yy"
                    locale="pt-BR"
                    showIcon
                    showButtonBar
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.value)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <h4>Data final</h4>
                  <Calendar
                    dateFormat="dd/mm/yy"
                    locale="pt-BR"
                    showIcon
                    showButtonBar
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.value)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <h4>Loja</h4>
                  <Dropdown
                    optionLabel="nome"
                    value={lojaSelecionada}
                    options={selectLojas}
                    onChange={(e) => setLojaSelecionada(e.value)}
                    placeholder="Selecione uma loja"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <h4>Data última compra</h4>
                  <Calendar
                    dateFormat="dd/mm/yy"
                    locale="pt-BR"
                    showIcon
                    visible
                    value={dataUltimaCompra}
                    onChange={(e) => setDataUltimaCompra(e.value)}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "20px",
                }}
              >
                <Button
                  className="p-button p-button-rounded p-button-success"
                  label="Pesquisar"
                  loading={loading}
                  icon="pi pi-search"
                  onClick={pesquisar}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default ProdutosSemVendas;
