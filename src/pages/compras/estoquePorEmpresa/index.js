import { useEffect, useState, useMemo, useRef } from "react";

import api from "../../../services/axios";

import { MaterialReactTable } from "material-react-table";
import { Box, Stack } from "@mui/material";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { exportToExcel } from "react-json-to-excel";

import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Steps } from "primereact/steps";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { addLocale } from "primereact/api";

import moment from "moment/moment";

import Header from "../../../components/header";
import Footer from '../../../components/footer'
import {
  BadgeRounded,
  PointOfSaleSharp,
  ShoppingCart,
} from "@mui/icons-material";

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

const EstoquePorEmpresa = () => {
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

  const toast = useRef(null);
  const rowVirtualizerInstanceRef = useRef(null);

  const [produto, setProduto] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dataIncialCompra, setDataInicialCompra] = useState(new Date());
  const [dataFinalCompra, setDataFinalCompra] = useState(new Date());

  const [dataIncialVenda, setDataInicialVenda] = useState(new Date());
  const [dataFinalVenda, setDataFinalVenda] = useState(new Date());

  const [grupo, setGrupo] = useState([]);
  const [grupoList, setGrupoList] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);

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
    today: " Hoje ",
    clear: " Limpar ",
  });
  const items = [
    {
      label: "Compra",
    },
    {
      label: "Venda",
    },
    {
      label: "Fornecedor",
    },
  ];

  const optionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>
          {option?.grupo_pai} / {option?.grupo_filho} / {option?.nome} 
        </div>
      </div>
    );
  };

  const getFornecedores = () => {
    api
      .get("/api/grupos")
      .then((r) => {
        setGrupoList(r.data);
       //  console.log(r.data);
      })
      .catch((e) => {});
  };

  const getProdutos = () => {
    setLoading(true);

    const data = {
      grupo: grupo?.codigo,

      dataInicialVenda: moment(dataIncialVenda).format("YYYY-MM-DD"),
      dataFinalVenda: moment(dataFinalVenda).format("YYYY-MM-DD"),
      dataInicialCompra: moment(dataIncialCompra).format("YYYY-MM-DD"),
      dataFinalCompra: moment(dataFinalCompra).format("YYYY-MM-DD"),
    };

    api
      .post("/api/estoque/compras/empresa", data)
      .then((r) => {
        // console.log(r.data);
        setProduto(r.data);
        if (r.data.length === 0 && loading === false) {
          toast.current.show({
            severity: "info",
            summary: "Aviso",
            detail: "Nenhum produto encontrado para análise !",
          });
        }
      })
      .catch((e) => {
        console.log(e);
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${e?.message}`,
        });
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const sumQuantidadeComprada = useMemo(
    () => produto?.reduce((acc, curr) => acc + curr.quantidadecompra, 1),
    [produto]
  );

  const sumQuantidadeRSComprada = useMemo(
    () => produto?.reduce((acc, curr) => acc + curr.total, 1),
    [produto]
  );

  const sumQuantidadeVendida = useMemo(
    () => produto?.reduce((acc, curr) => acc + curr.quantidadevendida, 1),
    [produto]
  );

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row?.nomefilial,
        header: "Loja",
        size: 200,
      },
      {
        accessorFn: (row) => row?.codigoproduto, //access nested data with dot notation
        accessorKey: "codigoproduto",
        header: "Código",
        size: 100,
      },
      {
        accessorFn: (row) => row?.nomeproduto,
        header: "Produto",
        size: 250,
      },

      {
        accessorFn: (row) => row?.nomefornecedor,
        header: "Último Fornecedor",
        size: 200,
      },

      {
        header: "Preço de custo médio ",
        accessorKey: "precocusto",
        size: 150,

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
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                <h4 style={{ fontWeight: "bold" }}>Custo médio</h4>
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
        header: "Preço de custo da última compra ",
        accessorKey: "precoultimacompra",
        aggregationFn: "mean",
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
                <h4>Custo médio ult.compra</h4>
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
        accessorFn: (row) => row?.condicaopagamento,

        header: "Condição de pagamento ",
      },

      {
        accessorFn: (row) => row?.codigounidademedida,

        header: "UN compra",
      },

      {
        header: "Qtde comprada",
        accessorKey: "quantidadecompra",
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
                <h4>Qtde comprada</h4>
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

        Footer: () => (
          <Stack color="info.main">
            Qtde total comprada
            <Box color="info.main">
              {sumQuantidadeComprada?.toLocaleString?.("pt-BR", {
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
        header: "Total comprado R$ ",
        accessorKey: "total",

        aggregationFn: "sum",
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
              <h4 style={{ fontWeight: "bold" }}></h4>
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                <h4>Total comprado</h4>
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
        Footer: () => (
          <Stack color="info.main">
            Total comprado
            <Box color="info.main">
              {sumQuantidadeRSComprada?.toLocaleString?.("pt-BR", {
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
        header: "Qtde vendida",
        accessorKey: "quantidadevendida",

        aggregationFn: "sum",
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
              <h4 style={{ fontWeight: "bold" }}></h4>
              <Box sx={{ color: "success.main", fontWeight: "bold" }}>
                <h4>Qtde vendida</h4>
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

        Footer: () => (
          <Stack color="success.main">
            Total vendido
            <Box color="success.main">
              {sumQuantidadeVendida?.toLocaleString?.("pt-BR", {
                style: "decimal",

                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Box>
          </Stack>
        ),
      },
      {
        accessorFn: (row) => row?.unvenda,

        header: "UN venda",
      },
      {
        header: "Estoque",
        aggregationFn: "sum",
        accessorKey: "quantidadesaldoestoque",
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
              <h4 style={{ fontWeight: "bold" }}></h4>
              <Box
                sx={{
                  color: cell.getValue() > 0 ? "success.main" : "error.main",
                  fontWeight: "bold",
                }}
              >
                <h4>Total estoque</h4>
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
    ],

    []
  );

  const handleExportExcelRows = (rows) => {
    let dados = rows.map((row) => row);
    if (dados?.length > 0) {
      let dados2 = dados.map((d) => {
        return {
          // Emissao: moment(d.dataEmissao).format("DD/MM/YYYY"),
          // NF: d.numeronf,
          Loja: d.nomefilial,
          Codigo: d.codigoproduto,
          Produto: d.nomeproduto,
          Custo_Ultima_compra: Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.precoultimacompra),
          Custo_Medio: Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.precocusto),
          // Embalagem: d.quantidadeembalagem,
          UN_Compra: d.codigounidademedida,
          qtde_comprada: d.quantidadecompra,
          Condicao_pagamento: d.condicaopagamento,
          Fornecedor: d.nomefornecedor,
          Total_comprado: Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.total),
          UN_venda: d.unvenda,
          qtde_vendida: Intl.NumberFormat("pt-BR", {
            style: "decimal",

            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.quantidadevendida),
          estoque: Intl.NumberFormat("pt-BR", {
            style: "decimal",

            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.quantidadesaldoestoque),
        };
      });

      exportToExcel(dados2.sort(), "CompraXVendaPorFornecedor");
    }
  };

  useEffect(() => {
    getFornecedores();
  }, []);

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <Header />
      <Footer/>

      {loading ? (
        <>
          {" "}
          <ProgressBar mode="indeterminate" />
        </>
      ) : (
        <>
          <Toolbar
            left={
              <>
                {" "}
                <Button
                  onClick={() => {
                    setProduto([]);
                    setActiveIndex(0)
                  }}
                  label="Voltar"
                  icon="pi pi-backward"
                  className="p-button p-button-rounded p-button-danger"
                />{" "}
              </>
            }
            right={
              <>
                <Button
                  className="p-button p-button-rounded p-button-success"
                  icon="pi pi-file-excel"
                  label="Exportar em excel"
                  disabled={produto.length === 0}
                  onClick={() => handleExportExcelRows(produto)}
                />
              </>
            }
          />
          {produto.length === 0 ? (
            <>
              <div style={{ padding: "1px", margin: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    padding: "1px",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                ></div>
                <Steps
                  model={items}
                  activeIndex={activeIndex}
                  onSelect={(e) => setActiveIndex(e.index)}
                  readOnly={false}
                  style={{ backgroundColor: "#FFF", padding: " 5px" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  padding: "1rem",
                }}
              >
                {(() => {
                  switch (activeIndex) {
                    case 0:
                      return (
                        <>
                          <ShoppingCart
                            fontSize="large"
                            style={{ color: "#f2f2f2" }}
                          />
                          <h1 style={{ color: "#FFFF" }}>
                            Informe o período de{" "}
                            <i>
                              <u>compra</u>
                            </i>{" "}
                            desejado
                          </h1>
                          <p style={{ color: "#FFFF" }}>
                            O sistema consultará o total e quantidade comprada
                            de cada produto no período escolhido
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              margin: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <Calendar
                              value={dataIncialCompra}
                              onChange={(e) => setDataInicialCompra(e.value)}
                              showIcon
                              dateFormat="dd/mm/yy"
                              showButtonBar
                              locale="pt-BR"
                            />{" "}
                            <Calendar
                              value={dataFinalCompra}
                              onChange={(e) => setDataFinalCompra(e.value)}
                              showIcon
                              dateFormat="dd/mm/yy"
                              showButtonBar
                              locale="pt-BR"
                            />
                            <Button
                              label="Próximo passo"
                              className="p-button p-button-rounded p-button-primary"
                              onClick={() => setActiveIndex(activeIndex + 1)}
                            />
                          </div>
                        </>
                      );

                    case 1:
                      return (
                        <>
                          <PointOfSaleSharp
                            fontSize="large"
                            style={{ color: "#f2f2f2", margin: "2px" }}
                          />

                          <h1 style={{ color: "#FFFF" }}>
                            Informe o período de{" "}
                            <u>
                              <i>venda</i>{" "}
                            </u>{" "}
                            desejado
                          </h1>
                          <p style={{ color: "#FFFF" }}>
                            O sistema consultará o total vendido e quantidade de
                            cada produto no período escolhido
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              margin: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <Calendar
                              value={dataIncialVenda}
                              onChange={(e) => setDataInicialVenda(e.value)}
                              showIcon
                              dateFormat="dd/mm/yy"
                              showButtonBar
                              locale="pt-BR"
                            />{" "}
                            <Calendar
                              value={dataFinalVenda}
                              onChange={(e) => setDataFinalVenda(e.value)}
                              showIcon
                              dateFormat="dd/mm/yy"
                              showButtonBar
                              locale="pt-BR"
                            />
                            <Button
                              label="Próximo passo"
                              className="p-button p-button-rounded p-button-primary"
                              onClick={() => setActiveIndex(activeIndex + 1)}
                            />
                          </div>
                        </>
                      );

                    case 2:
                      return (
                        <>
                          <BadgeRounded
                            fontSize="large"
                            style={{ color: "#f2f2f2" }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                color: "#FFFF",
                                margin: "1rem",
                                alignItems: "center",
                              }}
                            >
                              <h1>Informe a seção desejada</h1>
                              <p>
                                O sistema consultará todos os produtos que já
                                foram comprados desta seção{" "}
                              </p>
                            </div>

                            <Dropdown
                              value={grupo}
                              onChange={(e) => setGrupo(e.value)}
                              options={grupoList}
                              optionLabel="nome"
                              placeholder="Selecione uma seção"
                              filter
                              filterBy="codigo,nome,grupo_pai,grupo_filho"
                              //valueTemplate={selectedCountryTemplate}
                              itemTemplate={optionTemplate}
                              // className="w-full md:w-14rem"
                            />
                          </div>
                          <div>
                            <Button
                              style={{ margin: "10px" }}
                              icon="pi pi-search"
                              className="p-button p-button-rounded p-button-success"
                              loading={loading}
                              label="Analisar"
                              onClick={() => getProdutos()}
                            />
                          </div>
                        </>
                      );

                    default:
                      return <></>;
                  }
                })()}
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: "2px" }}>
                <MaterialReactTable
                  icons={fontAwesomeIcons}
                  localization={MRT_Localization_PT_BR}
                  columns={columns}
                  data={produto ?? []}
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
                  positionExpandColumn="first"
                  positionGlobalFilter="right"
                  muiToolbarAlertBannerChipProps={{ color: "secondary" }}
                  muiTableContainerProps={{ sx: { maxHeight: 700 } }}
                  displayColumnDefOptions={{ "mrt-row-expand": { size: 200 } }} //change width of actions column to 300px
                  initialState={{
                    columnPinning: { left: ["Produto", "Loja"] },
                    columnVisibility: {
                      numeronfultcompra: true,
                      codigoproduto: false,
                      fornecedor: false,
                    },

                    density: "compact",
                    expanded: false,
                    grouping: ["Produto"],
                    // pagination: { pageIndex: 0, pageSize: 100 },
                    sorting: [{ id: "quantidadevendida", desc: false }],
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default EstoquePorEmpresa;
