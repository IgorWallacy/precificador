import { useEffect, useState, useMemo, useRef } from "react";
import { DatePicker, Statistic, Select } from "antd";
import locale from "antd/es/date-picker/locale/pt_BR";

import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";

import { useReactToPrint } from "react-to-print";

import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";

import api from "../../../services/axios";
import moment from "moment";

const RecebimentoPorData = () => {
  const tabelaRef = useRef(null);
  const [recebimentos, setRecebimentos] = useState([]);
  const rowVirtualizerInstanceRef = useRef(null);

  const { RangePicker } = DatePicker;

  const [resumoData, setResumoData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [lojaList, setLojaList] = useState([]);

  const { Option } = Select;
  const [loja, setLoja] = useState(0);

  const getFilial = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setLojaList(r.data);
        // console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getRecebimentos = () => {
    setLoading(true);
    return api
      .get(
        `/api/recebimento/porPagamento/${moment(resumoData?.[0]?.$d).format(
          "YYYY-MM-DD"
        )}/${moment(resumoData?.[1]?.$d).format("YYYY-MM-DD")}/${
          loja ? loja : 0
        }`
      )
      .then((r) => {
        setRecebimentos(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const imprime = useReactToPrint({
    content: () => tabelaRef.current,
  });

  const sumValorPago = useMemo(
    () => recebimentos.reduce((acc, curr) => acc + curr.valorPago, 0),
    [recebimentos]
  );

  const sumValorDivida = useMemo(
    () => recebimentos.reduce((acc, curr) => acc + curr.valor, 0),
    [recebimentos]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "loja", //access nested data with dot notation
        header: "Loja",
        size: 150,
      },
      {
        accessorKey: "nomeCliente", //access nested data with dot notation
        header: "Nome do cliente",
        size: 400,
      },

      {
        accessorKey: "numeronfce", //normal accessorKey
        header: "Nº NFC-e ",
        size: 150,
      },
      {
        accessorKey: "emissao",
        accessorFn: (row) => moment(row.emissao).format("DD/MM/YYYY"),
        header: "Emissão",
        size: 150,
      },
      {
        accessorKey: "vencimento",
        accessorFn: (row) => moment(row.vencimento).format("DD/MM/YYYY"),
        header: "Vencimento",
        size: 150,
      },
      {
        accessorKey: "valor",
        header: "Valor da divída",
        size: 150,
        aggregationFn: "sum", //calc total points for each team by adding up all the points for each player on the team
        AggregatedCell: ({ cell }) => (
          <div style={{ backgroundColor: "red", color: "#f2f2f2" }}>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
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
          <>
            <div style={{ color: "red" }}>
              {" "}
              Total devido {"  "}
              <h4>
                {sumValorDivida?.toLocaleString?.("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h4>
            </div>
          </>
        ),
      },
      {
        accessorKey: "pagamento",
        accessorFn: (row) => moment(row.pagamento).format("DD/MM/YYYY"),
        header: "Pagamento",
        size: 150,
      },
      {
        accessorKey: "jurosPago",
        header: "Juros pago",
        size: 150,
        aggregationFn: "sum", //calc total points for each team by adding up all the points for each player on the team
        AggregatedCell: ({ cell }) => (
          <div style={{ backgroundColor: "green", color: "#f2f2f2" }}>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
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
        accessorKey: "multaPaga",
        header: "Multa paga",
        size: 150,
        AggregatedCell: ({ cell }) => (
          <div style={{ backgroundColor: "green", color: "#f2f2f2" }}>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
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
        accessorKey: "desconto",
        header: "Desconto",
        size: 150,
        aggregationFn: "sum", //calc total points for each team by adding up all the points for each player on the team
        AggregatedCell: ({ cell }) => (
          <div style={{ backgroundColor: "green", color: "#f2f2f2" }}>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
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
        accessorKey: "valorPago",
        header: "Valor do pagamento",
        size: 150,
        aggregationFn: "sum", //calc total points for each team by adding up all the points for each player on the team

        AggregatedCell: ({ cell }) => (
          <div style={{ backgroundColor: "green", color: "#f2f2f2" }}>
            <h4>
              {" "}
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
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
          <>
            <div style={{ color: "green" }}>
              {" "}
              Total recebido {"  "}
              {sumValorPago?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </>
        ),
      },
      {
        accessorKey: "saldo",
        header: "Falta receber",
        size: 150,
        aggregationFn: "sum", //calc total points for each team by adding up all the points for each player on the team

        AggregatedCell: ({ cell }) => (
          <div
            style={{
              backgroundColor: cell?.getValue() <= 0 ? "green " : "red",
              color: "#f2f2f2",
            }}
          >
            <h4>
              {" "}
              {cell.getValue()?.toLocaleString?.("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
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
        accessorKey: "usuariomovimentacao",
        header: "Baixado por",
        size: 150,
        Footer: () => (
          <>
            <Button
              label="Imprimir"
              icon="pi pi-print"
              className="p-button p-button-rounded"
              onClick={() => imprime()}
            />
          </>
        ),
      },
    ],
    [sumValorPago, sumValorDivida]
  );

  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [loading, sumValorDivida, sumValorPago]);

  useEffect(() => {
    getFilial();
    getRecebimentos();
  }, []);

  return (
    <>
      <div ref={tabelaRef} style={{ padding: "5px", margin: "5px" }}>
        {loading ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                color: "#f2f2f2",
              }}
            >
              <h4>Consultando recebimentos, Aguarde por favor ...</h4>
              <ProgressBar mode="indeterminate" />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: "100%",

                display: "flex",
                flexDirection: "row",
                gap: "5px",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                color: "#f2f2f2",
                margin: "5px",
                padding: "5px",
                backgroundColor: "#ec3b83",
              }}
            >
              <h1>Recebimentos por data do pagamento</h1>
              <RangePicker
                disabled={loading}
                format={"DD/MM/YYYY"}
                locale={locale}
                showToday
                onChange={(e) => setResumoData(e)}
              />
              <Select
                disabled={loading}
                placeholder="Selecione uma loja"
                allowClear
                defaultActiveFirstOption={false}
                style={{ width: 240 }}
                onChange={(e) => setLoja(e)}
              >
                {lojaList.map((option) => (
                  <Option key={option.id} value={option.codigo}>
                    {option.nome}
                  </Option>
                ))}
              </Select>
              <Button
                style={{ margin: "2px" }}
                label="Pesquisar recebimentos"
                icon="pi pi-search"
                className="p-btton p-button-secondary p-button-rounded"
                onClick={() => getRecebimentos()}
              />
              Exibindo os dados de{" "}
              {moment(resumoData?.[0]?.$d).format("DD/MM/YYYY")} até{" "}
              {moment(resumoData?.[1]?.$d).format("DD/MM/YYYY")}{" "}
            </div>

            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "black",
                  width: "100%",
                  backgroundColor: "#f2f2f2",
                }}
              >
                {recebimentos?.length > 0 ? (
                  <>
                    <MaterialReactTable
                      style={{ with: "100%", margin: "10px", height: "100 vh" }}
                      localization={MRT_Localization_PT_BR}
                      columns={columns}
                      data={recebimentos}
                      enableFilters={false}
                      enableRowVirtualization
                      enablePagination={false}
                      enableGrouping={true}
                      enablePinning
                      enableColumnResizing
                      enableStickyFooter={true}
                      enableStickyHeader={true}
                      enableTopToolbar={true}
                      rowVirtualizerInstanceRef={rowVirtualizerInstanceRef} //optional
                      rowVirtualizerProps={{ overscan: 8 }} //optionally customize the virtualizer
                      state={{ loading }}
                      initialState={{
                        grouping: ["nomeCliente"],
                        expanded: true,
                        density: "compact",
                        columnPinning: { left: ["nomeCliente"] },
                        columnVisibility: {
                          numeronfce: false,
                          jurosPago: true,
                          multaPaga: true,
                          desconto: true,
                        },
                      }} //group by location and department by default
                      muiTableContainerProps={{ sx: { maxHeight: "1366 px" } }}
                      defaultColumn={{
                        minSize: 20, //allow columns to get smaller than default
                        maxSize: 9001, //allow columns to get larger than default
                        size: 260, //make columns wider by default
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
            </>
          </>
        )}
      </div>
    </>
  );
};

export default RecebimentoPorData;
