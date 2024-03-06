import { useEffect, useState, useMemo, useRef } from "react";
import { DatePicker, Statistic, Select } from "antd";
import { useReactToPrint } from "react-to-print";

import locale from "antd/es/date-picker/locale/pt_BR";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";

import api from "../../../services/axios";
import moment from "moment";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const RecebimentoPorData = () => {
  const tabelaRef = useRef(null);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [recebimentos, setRecebimentos] = useState([]);

  const { RangePicker } = DatePicker;

  const [resumoData, setResumoData] = useState(null);

  const [lojas, setLojas] = useState([]);

  const [loading, setLoading] = useState(false);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nomeCliente: { value: null, matchMode: FilterMatchMode.CONTAINS },
    usuariomovimentacao: { value: null, matchMode: FilterMatchMode.CONTAINS },
    loja: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const onGlobalFilterChange2 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters2(_filters2);
    setGlobalFilterValue2(value);
  };

  const getRecebimentos = () => {
    setLoading(true);
    return api
      .get(
        `/api/recebimento/porPagamento/${moment(resumoData?.[0]?.$d).format(
          "YYYY-MM-DD"
        )}/${moment(resumoData?.[1]?.$d).format("YYYY-MM-DD")}/${0}`
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

  const somarValorPago = (row) => {
    let total = 0;

    if (recebimentos) {
      for (let r of recebimentos) {
        if (r.nomeCliente === row.nomeCliente) {
          total += r.valorPago;
        }
      }
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(total);
  };

  const somarValorComprado = (row) => {
    let total = 0;

    if (recebimentos) {
      for (let r of recebimentos) {
        if (r.nomeCliente === row.nomeCliente) {
          if (r.documento === row.documento) {
            total = r.valor;
          } else {
            total += r.valor;
          }
        }
      }
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(total);
  };
  const somarTotalDeJuros = (row) => {
    let total = 0;

    if (recebimentos) {
      for (let r of recebimentos) {
        if (r.nomeCliente === row.nomeCliente) {
          total += r.jurosPago;
        }
      }
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(total);
  };

  const somarTotalDeMulta = (row) => {
    let total = 0;

    if (recebimentos) {
      for (let r of recebimentos) {
        if (r.nomeCliente === row.nomeCliente) {
          total += r.multaPaga;
        }
      }
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(total);
  };

  const somarTotalDeDesconto = (row) => {
    let total = 0;

    if (recebimentos) {
      for (let r of recebimentos) {
        if (r.nomeCliente === row.nomeCliente) {
          total += r.desconto;
        }
      }
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(total);
  };

  const headerTemplate = (data) => {
    return (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "5px",
          }}
        >
          <h4 style={{ fontWeight: "bold" }}>{data?.nomeCliente}</h4>
          <h4 style={{ fontWeight: "bold" }}>CNPJ ou CPF - {data?.cnpjcpf}</h4>

          <h4 style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
            Total comprado {somarValorComprado(data)}
          </h4>

          <h4
            style={{ textAlign: "center", color: "green", fontWeight: "bold" }}
          >
            Total de juros {somarTotalDeJuros(data)}
          </h4>
          <h4
            style={{ textAlign: "center", color: "green", fontWeight: "bold" }}
          >
            Total de multa {somarTotalDeMulta(data)}
          </h4>
          <h4 style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
            Total de descontos {somarTotalDeDesconto(data)}
          </h4>
          <h4
            style={{ textAlign: "center", color: "green", fontWeight: "bold" }}
          >
            Total pago {somarValorPago(data)}
          </h4>
        </div>
      </>
    );
  };

  const handlePrint = useReactToPrint({
    pageStyle: `@media print {
      @page {
        size: 500mm 500mm;
        margin: 5;
      }
    }`,
    content: () => tabelaRef.current,
  });





  const lojaRowFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={lojas}
        onChange={(e) => options.filterApplyCallback(e.value)}
      //  itemTemplate={lojaItemTemplate}
        placeholder="Selecione uma loja"
        optionLabel="nome"
        optionValue="nome"
        className="p-column-filter"
        showClear
      />
    );
  };

  const getlojas = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setLojas(r.data);
       
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getlojas();
    getRecebimentos();
  }, []);

  return (
    <>
      <Header />
      <Footer />
      <div ref={tabelaRef} style={{ padding: "1px", margin: "1px" }}>
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
            height: "150px",
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
          <Button
            style={{ margin: "2px" }}
            label="Pesquisar recebimentos"
            icon="pi pi-search"
            className="p-btton p-button-secondary p-button-rounded"
            onClick={() => getRecebimentos()}
          />
          <Button
            style={{ margin: "2px" }}
            label="Imprimir recebimentos"
            icon="pi pi-print"
            className="p-btton p-button-warning p-button-rounded"
            onClick={() => handlePrint()}
          />
          Exibindo os dados de{" "}
          {moment(resumoData?.[0]?.$d).format("DD/MM/YYYY")} até{" "}
          {moment(resumoData?.[1]?.$d).format("DD/MM/YYYY")}{" "}
        </div>

        <>
          <div>
            <DataTable
              size="normal"
              loading={loading}
              style={{ width: "100%" }}
              value={recebimentos}
              selectionMode="single"
              emptyMessage="Sem recebimentos"
              header={(row) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="p-input-icon-left">
                      <i className="pi pi-search" />
                      <InputText
                        value={globalFilterValue2}
                        onChange={onGlobalFilterChange2}
                        placeholder="Pesquisa "
                      />
                    </span>
                  </div>
                );
              }}
              //  stripedRows
              rowGroupMode="rowspan"
              groupRowsBy="nomeCliente"
              sortMode="single"
              sortField="nomeCliente"
              sortOrder={1}
              responsiveLayout="stack"
              breakpoint="968px"
              globalFilterFields={["nomeCliente", "usuariomovimentacao"]}
              filters={filters2}
              filterDisplay="row"
              rowGroupHeaderTemplate={headerTemplate}
              footer={`Exibindo os dados pela data de recebimento de ${moment(
                resumoData?.[0]?.$d
              ).format("DD/MM/YYYY")} até 
                      ${moment(resumoData?.[1]?.$d).format("DD/MM/YYYY")}`}
            >
              <Column
                field="nomeCliente"
                header="Cliente"
                body={headerTemplate}
              ></Column>

              <Column
                field="loja"
                header="Loja"
                showFilterMenu={false}
            //    filterMenuStyle={{ width: "14rem" }}
                style={{ minWidth: "12rem" }}
                filter
               
                filterElement={lojaRowFilterTemplate}
              />
              <Column header="Documento" field="documento"></Column>
              <Column
                field="emissao"
                body={(row) => {
                  return <>{moment(row?.emissao).format("DD/MM/YYYY")}</>;
                }}
                header="Data da compra"
              ></Column>
              <Column
                field="valor"
                body={(row) => {
                  return (
                    <div style={{ color: "red" }}>
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(row?.valor)}
                    </div>
                  );
                }}
                header="Valor da compra"
              ></Column>
              <Column
                field="vencimento"
                body={(row) => {
                  return <>{moment(row?.vencimento).format("DD/MM/YYYY")}</>;
                }}
                header="Vencimento"
              ></Column>
              <Column
                field="jurosPago"
                header="Juros"
                body={(row) => {
                  return (
                    <>
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(row?.jurosPago)}
                    </>
                  );
                }}
              ></Column>
              <Column
                field="multaPaga"
                header="Multa"
                body={(row) => {
                  return (
                    <>
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(row?.multaPaga)}
                    </>
                  );
                }}
              ></Column>
              <Column
                field="desconto"
                header="Desconto"
                body={(row) => {
                  return (
                    <>
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(row?.desconto)}
                    </>
                  );
                }}
              ></Column>
              <Column
                field="pagamento"
                header="Data do pagamento"
                body={(row) => {
                  return <>{moment(row?.pagamento).format("DD/MM/YYYY")}</>;
                }}
              ></Column>
              <Column
                field="valorPago"
                header="Valor do pagamento"
                body={(row) => {
                  return (
                    <div style={{ color: "green" }}>
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      }).format(row?.valorPago)}
                    </div>
                  );
                }}
              ></Column>

              <Column
                field="saldo"
                header="Falta"
                body={(row) => {
                  return (
                    <>
                      <div
                        style={{
                          color: `${row.saldo === 0 ? "green" : "red"}`,
                        }}
                      >
                        {Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        }).format(row?.saldo)}
                      </div>
                    </>
                  );
                }}
              ></Column>
              <Column
                field="usuariomovimentacao"
                header="Recebido por"
              ></Column>
            </DataTable>
          </div>
        </>
      </div>
    </>
  );
};

export default RecebimentoPorData;
