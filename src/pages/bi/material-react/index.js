import React, { useRef, useMemo, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from 'primereact/toast';

import api from "../../../services/axios";

import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { Box, Stack } from "@mui/material";

import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownWideShort,
  faBars,
  faBarsStaggered,
  faColumns,
  faCompress,
  faEllipsisH,
  faEllipsisVertical,
  faExpand,
  faEyeSlash,
  faFilter,
  faFilterCircleXmark,
  faGripLines,
  faSearch,
  faSearchMinus,
  faSortDown,
  faThumbTack,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

const MaterialReactComponent = () => {
  const fontAwesomeIcons = {
    ArrowDownwardIcon: (props) => (
      <FontAwesomeIcon icon={faSortDown} {...props} />
    ),
    // ExpandMoreIcon: () => <FontAwesomeIcon size="1x" icon={faEye} />,
    ClearAllIcon: () => <FontAwesomeIcon icon={faBarsStaggered} />,
    DensityLargeIcon: () => <FontAwesomeIcon icon={faGripLines} />,
    DensityMediumIcon: () => <FontAwesomeIcon icon={faBars} />,
    DensitySmallIcon: () => <FontAwesomeIcon icon={faBars} />,
    DragHandleIcon: () => <FontAwesomeIcon icon={faGripLines} />,
    FilterListIcon: (props) => <FontAwesomeIcon icon={faFilter} {...props} />,
    FilterListOffIcon: () => <FontAwesomeIcon icon={faFilterCircleXmark} />,
    FullscreenExitIcon: () => <FontAwesomeIcon icon={faCompress} />,
    FullscreenIcon: () => <FontAwesomeIcon icon={faExpand} />,
    SearchIcon: (props) => <FontAwesomeIcon icon={faSearch} {...props} />,
    SearchOffIcon: () => <FontAwesomeIcon icon={faSearchMinus} />,
    ViewColumnIcon: () => <FontAwesomeIcon icon={faColumns} />,
    MoreVertIcon: () => <FontAwesomeIcon icon={faEllipsisVertical} />,
    MoreHorizIcon: () => <FontAwesomeIcon icon={faEllipsisH} />,
    SortIcon: (props) => (
      <FontAwesomeIcon icon={faArrowDownWideShort} {...props} /> //props so that style rotation transforms are applied
    ),
    PushPinIcon: (props) => (
      <FontAwesomeIcon icon={faThumbTack} {...props} /> //props so that style rotation transforms are applied
    ),
    VisibilityOffIcon: () => <FontAwesomeIcon icon={faEyeSlash} />,
  };

  const [loading, setLoading] = useState(false);
  const [dataInicial, setDataInicial] = useState(new Date());
  const [dataFinal, setDataFinal] = useState(new Date());
  const [modocalculo, setModocalculo] = useState(1);
  const [dados, setDados] = useState([]);
  const toast = useRef(null);
  const [sorting, setSorting] = useState([]);
  const modocalculoList = [
    { name: "Preço de compra na venda (Sem impostos)", value: 0 },
    { name: "Preço de custo na venda (Com impostos)", value: 1 },
  ];
  const rowVirtualizerInstanceRef = useRef(null);

  const sumQuantidade = useMemo(
    () => dados?.reduce((acc, curr) => acc + curr.quantidade, 0),
    [dados]
  );

  const averagePrecoMedioVenda = useMemo(
    () =>
      dados?.reduce((acc, curr) => acc + curr.precounitario, 0) / dados?.length,
    [dados]
  );

  const averagePrecoMedioCusto = useMemo(
    () =>
      dados?.reduce((acc, curr) => acc + curr.precoultimacompra, 0) /
      dados?.length,
    [dados]
  );
  const SumPrecoCusto = useMemo(
    () =>
      dados?.reduce(
        (acc, curr) => acc + curr.precoultimacompra * curr.quantidade,
        0
      ),
    [dados]
  );
  const SumValorTotalVendido = useMemo(
    () => dados?.reduce((acc, curr) => acc + curr.valorTotal, 0),
    [dados]
  );
  const SumLucro = useMemo(
    () =>
      dados?.reduce(
        (acc, curr) => acc + curr.valorTotal - curr.precoultimacompratotal,
        0
      ),
    [dados]
  );
  const avgMarkup = useMemo(
    () =>
      dados?.reduce(
        (acc, curr) => acc + curr?.valorTotal - curr?.precoultimacompratotal,
        0
        //(row.valorTotal - row.precoultimacompratotal) / row.valorTotal) * 100
      ),
    [dados]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "descricao", //access nested data with dot notation
        header: "Produto",
        size: 450,
        enableSorting: true,
        
      
        Header: ({ column }) => <div>{column.columnDef.header}</div>,
        Cell: ({ cell, column }) => (
          <Box>
            <h4 style={{ color: "blue" }}>{cell.getValue()}</h4>
          </Box>
        ),
      },
      {
        accessorKey: "grupoPai",
        header: "Seção I",
        enablePinning: true,
        size: 200,
        Header: ({ column }) => <div>{column.columnDef.header}</div>,
        Cell: ({ cell, column }) => (
          <Box style={{ backgroundColor: "#f3f4f2" }}>
            <h4 style={{ color: "blue" }}>{cell.getValue()}</h4>
          </Box>
        ),
      },
      {
        accessorKey: "grupoFilho", //normal accessorKey
        enablePinning: true,
        header: "seção II",
        size: 100,
        Header: ({ column }) => <div>{column.columnDef.header}</div>,
        Cell: ({ cell, column }) => (
          <Box style={{ backgroundColor: "#f3f4f2" }}>
            <h4 style={{ color: "blue" }}>{cell.getValue()}</h4>
          </Box>
        ),
      },
      {
        accessorKey: "grupoNeto",
        enablePinning: true,
        header: "Seção III",
        size: 150,
        Header: ({ column }) => <div>{column.columnDef.header}</div>,
        Cell: ({ cell, column }) => (
          <Box style={{ backgroundColor: "#f3f4f2" }}>
            <h4 style={{ color: "blue" }}>{cell.getValue()}</h4>
          </Box>
        ),
      },
      {
        accessorKey: "nomeFilial",
        enablePinning: true,
        header: "Loja",
        size: 120,
        Header: ({ column }) => <div>{column.columnDef.header}</div>,
        Cell: ({ cell, column }) => (
          <Box style={{ backgroundColor: "#f3f4f2" }}>
            <h4 style={{ color: "blue" }}>{cell.getValue()}</h4>
          </Box>
        ),
      },

      {
        accessorKey: "promocaoNome",
        enablePinning: true,
        header: "Promoção",
        size: 150,
      },

      {
        accessorFn: (row) =>
          moment(row.dataEmissao).format("DD/MM/yyyy - dddd"),
        accessorKey: "dataEmissao",
        header: "Data da venda",
        size: 200,
        enableGlobalFilter: false,
      },

      {
        header: "Custo médio",
        accessorKey: "precoultimacompra",
        size: 150,
        aggregationFn: "mean",
        enableGlobalFilter: false,

        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: "red", fontWeight: "bold" }}>
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </>
        ),
        //customize normal cell render on normal non-aggregated rows
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
        header: "Qtde vendida",
        accessorKey: "quantidade",
        size: 150,
        aggregationFn: "sum",
        enableGlobalFilter: false,

        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: "info.main", fontWeight: "bold" }}>
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "decimal",
                // currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </>
        ),
        //customize normal cell render on normal non-aggregated rows
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "decimal",
              //    currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ),
        Footer: () => (
          <Stack color="info.main">
            Qtde total vendida
            <Box color="info.main">
              {sumQuantidade?.toLocaleString?.("pt-BR", {
                style: "decimal",
                // currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </Stack>
        ),
      },

      {
        header: "Custo total",
        accessorKey: "precoultimacompratotal",
        aggregationFn: "sum",
        size: 150,
        enableGlobalFilter: false,

        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: "red", fontWeight: "bold" }}>
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </>
        ),
        //customize normal cell render on normal non-aggregated rows
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
        Footer: () => (
          <Stack color="red">
            Total de custo
            <Box color="red">
              {SumPrecoCusto?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </Stack>
        ),
      },

      {
        header: "Venda média",
        accessorKey: "precounitario",
        aggregationFn: "mean",
        size: 100,
        enableGlobalFilter: false,
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: "success.main", fontWeight: "bold" }}>
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </>
        ),
        //customize normal cell render on normal non-aggregated rows
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
        header: "Lucro",
        accessorKey: "lucro",
        aggregationFn: "sum",
        size: 150,
        enableGlobalFilter: false,
        accessorFn: (row) => row.valorTotal - row.precoultimacompratotal,
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: "success.main", fontWeight: "bold" }}>
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </>
        ),
        //customize normal cell render on normal non-aggregated rows
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

        Footer: () => (
          <Stack color="success.main">
            Lucro
            <Box color="success.main">
              {SumLucro?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </Stack>
        ),
      },

      {
        header: "Total vendido",
        accessorKey: "valorTotal",
        aggregationFn: "sum",
        size: 150,
        enableGlobalFilter: false,

        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <Box sx={{ color: "success.main", fontWeight: "bold" }}>
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </>
        ),
        //customize normal cell render on normal non-aggregated rows
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

        Footer: () => (
          <Stack color="success.main">
            Total vendido
            <Box color="success.main">
              {SumValorTotalVendido?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </Stack>
        ),
      },
      {
        header: "Markup %",
        accessorKey: "markup",
        aggregationFn: ["sum"],
        accessorFn : (row ) => (row?.valorTotal - row?.precoultimacompratotal) / row?.valorTotal,
        enableGlobalFilter: false,
        size: 150,
        
        Cell : ({cell}) => (

          <>
           <Stack color="success.main">
          
            <Box color="success.main">
              {new Intl.NumberFormat("pt-BR", {
                style: "percent",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(cell.getValue())}
            </Box>
          </Stack>
          </>

        ),
       
      
        Footer: () => (
          <Stack color="success.main">
            Markup %
            <Box color="success.main">
              {new Intl.NumberFormat("pt-BR", {
                style: "percent",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(avgMarkup / SumValorTotalVendido)}
            </Box>
          </Stack>
        ),
      },
    ],
    [
      averagePrecoMedioVenda,
      sumQuantidade,
      averagePrecoMedioCusto,
      SumPrecoCusto,
      SumValorTotalVendido,
      SumLucro,
      avgMarkup,
    ]
  );

  const analisar = () => {
    setLoading(true);
    api
      .get(
        `/api_vendas/bi/${moment(dataInicial).format("yyyy-MM-DD")}/${moment(
          dataFinal
        ).format("yyyy-MM-DD")}/${modocalculo}`
      )
      .then((r) => {
        //  console.log(r.data);
        setDados(r.data);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${e.message}`,
        });
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  return (
    <>
      <Header />
      <Footer />
      <Toast ref={toast} />
      {loading ? (
        <>
          <ProgressBar mode="indeterminate" />
        </>
      ) : (
        <>
          {dados?.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "1rem",
                  padding: "1rem",
                }}
              >
                <h4 style={{ color: "#f2f2f2" }}>
                  {" "}
                  Exibindo o custo{" "}
                  {modocalculo === 0
                    ? "pela compra ( SEM IMPOSTOS )"
                    : "pelo preco de custo ( COM IMPOSTOS)"}{" "}
                  na data da venda <br />
                  Exibindo dados de {moment(dataInicial).format(
                    "DD/MM/YYYY"
                  )}{" "}
                  até {moment(dataFinal).format("DD/MM/YYYY")}
                </h4>
              </div>
              <Toolbar
                left={
                  <>
                    {" "}
                    <Button
                      onClick={() => setDados([])}
                      label="Voltar"
                      icon="pi pi-backward"
                      className="p-button p-button-rounded p-button-danger"
                    />{" "}
                  </>
                }
              />
              <MaterialReactTable
               
                icons={fontAwesomeIcons}
                localization={MRT_Localization_PT_BR}
                columns={columns}
                data={dados ?? []}
                enableRowVirtualization
                // enableColumnVirtualization
                rowVirtualizerInstanceRef={rowVirtualizerInstanceRef} //optional
                rowVirtualizerProps={{ overscan: 8 }} //optionally customize the virtualizer
                enableGlobalFilterModes
                enableColumnFilterModes 
                enableColumnResizing
                enableGrouping
                enableStickyHeader
                enableStickyFooter
                enablePagination={false}
                enableColumnOrdering
                enablePinning
                positionExpandColumn="last"
                positionGlobalFilter="right"
                muiToolbarAlertBannerChipProps={{ color: "secondary" }}
                muiTableContainerProps={{ sx: { maxHeight: 700 } }}
                displayColumnDefOptions={{ "mrt-row-expand": { size: 115 } }} //change width of actions column to 300px
             
                initialState={{
                  columnPinning: {
                    left: [
                      "grupoPai",
                      "grupoFilho",
                      "grupoNeto",
                      "nomeFilial",
                      "descricao",
                     
                    
                    ],
                   
                  },
                  sorting: [
                    { id: "dataEmissao", desc: false },
                    { id: "nomeFilial", desc: false },
                  ], //sort by state by default
                  density: "compact",

                  expanded: false, //expand all groups by default
                  grouping: [
                    "grupoPai",
                    "grupoFilho",
                    "grupoNeto",
                    "descricao",
                    "nomeFilial",
                  ], //an array of columns to group by by default (can be multiple)
                }}
              />
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  padding: "1rem",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <h1 style={{ color: "#FFFF" }}>
                  Informe a data incial e final para análise dos dados de venda
                </h1>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <Calendar
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.value)}
                    showIcon
                    showButtonBar
                    dateFormat="dd/mm/yy"
                  />
                  <Calendar
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.value)}
                    showIcon
                    showButtonBar
                    dateFormat="dd/mm/yy"
                  />

                  <Dropdown
                    value={modocalculo}
                    onChange={(e) => setModocalculo(e.value)}
                    options={modocalculoList}
                    optionLabel="name"
                    placeholder="Selecione o modo de cálculo do custo "
                  />
                  <Button
                    loading={loading}
                    label={loading ? "Analisando..." : "Pesquisar"}
                    className="p-button p-button-rounded p-button-success"
                    icon="pi pi-search"
                    onClick={() => analisar()}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default MaterialReactComponent;
