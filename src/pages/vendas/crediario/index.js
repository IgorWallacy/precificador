import { useEffect, useState, useMemo, useRef } from "react";
import { DatePicker, Statistic, Select } from "antd";
import { useReactToPrint } from "react-to-print";

import locale from "antd/es/date-picker/locale/pt_BR";

import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

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

const VendasCrediarioPorData = () => {
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
        `/api/recebimento/vendas/crediario/${moment(resumoData?.[0]?.$d).format(
          "YYYY-MM-DD"
        )}/${moment(resumoData?.[1]?.$d).format("YYYY-MM-DD")}/${0}`
      )
      .then((r) => {
        const filteredData = r?.data.filter(item => item !== null);
        setRecebimentos(filteredData);
       // console.log(filteredData);
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
        if (r?.nomeCliente === row?.nomeCliente) {
          total += r?.valorPago;
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
        if (r?.nomeCliente === row?.nomeCliente) {
          if (r?.documento === row?.documento) {
            total = r?.valor;
          } else {
            total += r?.valor;
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
        if (r?.nomeCliente === row?.nomeCliente) {
          total += r?.jurosPago;
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
        if (r?.nomeCliente === row?.nomeCliente) {
          total += r?.multaPaga;
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
        if (r?.nomeCliente === row?.nomeCliente) {
          total += r?.desconto;
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
        setLojas(r?.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const exportToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Recebimentos");

    // Adiciona o título da planilha
    worksheet.mergeCells("A1:N1");
    worksheet.mergeCells("A2:N2");

    const header = `Vendas no crediário de 
      ${moment(resumoData?.[0]?.$d).format("DD/MM/YYYY")}
      até ${moment(resumoData?.[1]?.$d).format("DD/MM/YYYY")}`;
    worksheet.addRow(header);
    const titleCell = worksheet.getCell("A2");
    titleCell.value = header;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB0E0E6" }, // Azul claro
    };
    titleCell.border = {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };

    // Adiciona uma linha em branco após o título
    worksheet.addRow({});

    // Adiciona os cabeçalhos
    worksheet.columns = [
      { header: "Nome Cliente", key: "nomeCliente", width: 0, hidden: true },
      { header: "Documento", key: "documento", width: 20 },
      { header: "Loja", key: "loja", width: 20 },
      { header: "Data da Compra", key: "emissao", width: 15 },
      {
        header: "Valor da Compra",
        key: "valor",
        width: 15,
        style: { numFmt: '"R$"#,##0.00' },
      },
      { header: "Vencimento", key: "vencimento", width: 15 },
      {
        header: "Juros",
        key: "jurosPago",
        width: 15,
        style: { numFmt: '"R$"#,##0.00' },
      },
      {
        header: "Multa",
        key: "multaPaga",
        width: 15,
        style: { numFmt: '"R$"#,##0.00' },
      },
      {
        header: "Desconto",
        key: "desconto",
        width: 15,
        style: { numFmt: '"R$"#,##0.00' },
      },
      { header: "Data do Pagamento", key: "pagamento", width: 15 },
      {
        header: "Valor do Pagamento",
        key: "valorPago",
        width: 15,
        style: { numFmt: '"R$"#,##0.00' },
      },
      {
        header: "Falta",
        key: "saldo",
        width: 15,
        style: { numFmt: '"R$"#,##0.00' },
      },
      { header: "Recebido por", key: "usuariomovimentacao", width: 20 },
    ];

    // Formatação do cabeçalho
    const headerRow = worksheet.addRow(
      Object.keys(worksheet.columns).map((key) => worksheet.columns[key].header)
    );
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFE4B5" }, // Amarelo claro
    };
    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: "center" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF000000" } },
        top: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    // Fixar o cabeçalho
    worksheet.views = [{ state: "frozen", ySplit: 5 }];

    // Agrupa os recebimentos por cliente
    const groupedByClient = recebimentos.reduce((acc, curr) => {
      const client = acc[curr?.nomeCliente] || [];
      client.push(curr);
      acc[curr?.nomeCliente] = client;
      return acc;
    }, {});

    // Variáveis para total geral
    let totalGeralValor = 0;
    let totalGeralJuros = 0;
    let totalGeralMulta = 0;
    let totalGeralDesconto = 0;
    let totalGeralFalta = 0;

    // Adiciona os dados ao worksheet
    Object.keys(groupedByClient).forEach((clientName) => {
      const clientRecebimentos = groupedByClient[clientName];

      // Adiciona um cabeçalho para o cliente
      worksheet.addRow({ nomeCliente: clientName });
      const clientrow = worksheet.lastRow;
      worksheet.mergeCells(`A${clientrow?.number}:N${clientrow?.number}`);
      clientrow.getCell(1).value = clientName;
      clientrow.font = { bold: true };
      clientrow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFE4B5" }, // Amarelo claro
      };
      clientrow.alignment = { horizontal: "center" };

      let totalValor = 0;
      let totalJuros = 0;
      let totalMulta = 0;
      let totalDesconto = 0;
      let totalFalta = 0;

      // Adiciona os dados do cliente e calcula os totais
      clientRecebimentos.forEach((item) => {
        // Formata as datas para o formato brasileiro

        item.emissao = item?.emissao
          ? moment(item?.emissao).format("DD/MM/YYYY")
          : "";
        item.vencimento = item?.vencimento
          ? moment(item?.vencimento).format("DD/MM/YYYY")
          : "";
        item.pagamento = item?.pagamento
          ? moment(item?.pagamento).format("DD/MM/YYYY")
          : "";

        worksheet.addRow(item);

        // Acumula os totais por cliente
        totalValor += item?.valor || 0;
        totalJuros += item?.jurosPago || 0;
        totalMulta += item?.multaPaga || 0;
        totalDesconto += item?.desconto || 0;
        totalFalta += item?.saldo || 0;

        // Acumula os totais gerais
        totalGeralValor += item?.valor || 0;
        totalGeralJuros += item?.jurosPago || 0;
        totalGeralMulta += item?.multaPaga || 0;
        totalGeralDesconto += item?.desconto || 0;
        totalGeralFalta += item?.saldo || 0;
      });

      // Adiciona uma linha de subtotal
      const subtotalRow = {
        nomeCliente: "Subtotal",
        valor: totalValor,
        jurosPago: totalJuros,
        multaPaga: totalMulta,
        desconto: totalDesconto,
        saldo: totalFalta,
      };

      worksheet.addRow(subtotalRow);
      worksheet.lastRow.font = { bold: true };
      worksheet.lastRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFE4B5" }, // Amarelo claro
      };

      // Adiciona uma linha em branco entre clientes
      worksheet.addRow({});
    });

    // Adiciona uma linha para o total geral
    const totalGeralRow = {
      nomeCliente: "Total Geral",
      valor: totalGeralValor,
      jurosPago: totalGeralJuros,
      multaPaga: totalGeralMulta,
      desconto: totalGeralDesconto,
      saldo: totalGeralFalta,
    };

    worksheet.addRow(totalGeralRow);
    const lastRow = worksheet.lastRow;
    lastRow.font = { bold: true, size: 14 }; // Formatação para destacar
    lastRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFE4B5" }, // Amarelo claro
    };

    // Formatação das bordas do total geral
    lastRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    // Salva o arquivo
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: "application/octet-stream" });
      saveAs(blob, `recebimentos_${moment().format("DDMMYYYY")}.xlsx`);
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
            marginTop: "50px",
          }}
        >
          <h1>Vendas no crediário </h1>
          <RangePicker
            disabled={loading}
            format={"DD/MM/YYYY"}
            locale={locale}
            showToday
            onChange={(e) => setResumoData(e)}
          />
          <Button
            style={{ margin: "2px" }}
            label="Pesquisar vendas"
            icon="pi pi-search"
            className="p-btton p-button-secondary p-button-rounded"
            onClick={() => getRecebimentos()}
          />
          <Button
            style={{ margin: "2px" }}
            label="Imprimir vendas"
            icon="pi pi-print"
            className="p-btton p-button-warning p-button-rounded"
            onClick={() => handlePrint()}
          />
          <Button
            style={{ margin: "2px" }}
            label="Exportar vendas excel"
            icon="pi pi-file-excel"
            className="p-btton p-button-success p-button-rounded"
            onClick={() => exportToExcel()}
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
              footer={`Exibindo os dados pela data da venda de ${moment(
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
                          color: `${row?.saldo === 0 ? "green" : "red"}`,
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

export default VendasCrediarioPorData;
