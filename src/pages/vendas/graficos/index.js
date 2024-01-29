import React, { useState, useEffect, useRef } from "react";

import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { addLocale } from "primereact/api";
import { Dropdown } from "primereact/dropdown";

import { Card, DatePicker, Statistic, Select } from "antd";
import locale from "antd/es/date-picker/locale/pt_BR";

import api from "../../../services/axios";
import GraficoVendaPorHora from "./por-hora";

import { PivotViewComponent } from "@syncfusion/ej2-react-pivotview";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import moment from "moment";
import TicketMedioGrafico from "./ticket-medio";
import GraficoMeioDePagamento from "./por-meio-de-pagamento";

import { useReactToPrint } from "react-to-print";

const GraficosIndex = () => {
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

  const tabelaRef = useRef();
  const tabelaMeioPagamentoRef = useRef();

  const [headers, setHeaders] = useState();
  const [vendas, setVendas] = useState([]);
  const [ticketMedio, setTicketMedio] = useState([]);
  const [vendasMeioPagamento, setVendasMeioPagamento] = useState([]);

  const [dataInicial, setDataInicial] = useState(new Date());
  const [dataFinal, setDataFinal] = useState(new Date());

  const [dataInicialTicket, setDataInicialTicket] = useState(
    moment().subtract(1, "month")
  );
  const [dataFinalTicket, setDataFinalTicket] = useState(new Date());

  const [dataInicialMeioPagamento, setDataInicialMeioPagamento] = useState(
    new Date()
  );
  const [dataFinalMeioPagamento, setDataFinalMeioPagamento] = useState(
    new Date()
  );
  const [loja, setLoja] = useState(0);
  const [lojaList, setLojaList] = useState([]);

  const [pdv, setPdv] = useState(0);

  const [loading, setLoading] = useState(false);
  const [loadingTicketMedio, setLoadingTicketMedio] = useState(false);
  const [loadingMeioPagamento, setLoadingMeioPagamento] = useState(false);

  const [resumoVendas, setResumoVendas] = useState([]);
  const [loadingResumoVendas, setLoadingResumoVendas] = useState(false);
  const [lojaResumoSelecionada, setLojaResumoSelecionada] = useState(null);

  const { RangePicker } = DatePicker;
  const { Option } = Select;

  const [ResumoData, setResumoData] = useState([]);

  let dataSourceSettings = {
    enableSorting: true,
    valueSortSettings: {
      headerText: "TotalVendido",
      headerDelimiter: "-",
      sortOrder: "Ascending",
    },
    values: [
      { name: "TotalVendido", caption: "Total vendido", type: "Sum" },
      {
        name: "total",
        caption: "% Total vendido",
        type: "PercentageOfParentRowTotal",
      },
    ],
    calculatedFieldSettings: [
      { name: "TotalVendido", formula: '"Sum(total)"' },
    ],
    dataSource: vendasMeioPagamento,
    rows: [{ name: "nomefinalizador", caption: "Meio de pagamento" }],
    formatSettings: [
      { name: "total", format: "C2" },
      { name: "TotalVendido", format: "C2" },
    ],
    expandAll: false,
    filters: [],
    showGrandTotals: true,
    grandTotalsPosition: "Bottom",
  };
  const pegarTokenLocalStorage = () => {
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);
    var headers = {
      Authorization: "Bearer " + a.access_token,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    setHeaders(headers);

    api.interceptors.request.use(
      (config) => {
        // Do something before request is sent

        config.headers["Authorization"] = "bearer " + a.access_token;
        return config;
      },

      (error) => {
        Promise.reject(error);
      }
    );
  };

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

  const geTResumoVendas = () => {
    setLoadingResumoVendas(true);
    return api
      .get(
        `/api/vendas/resumo/${moment(ResumoData?.[0]?.$d).format(
          "YYYY-MM-DD"
        )}/${moment(ResumoData?.[1]?.$d).format("YYYY-MM-DD")}/${
          lojaResumoSelecionada ? lojaResumoSelecionada : 0
        }`
      )
      .then((r) => {
        //console.table(r.data)
        setResumoVendas(r.data[0]);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoadingResumoVendas(false);
      });
  };

  const getVendasMeioPagamento = () => {
    setLoadingMeioPagamento(true);

    return api
      .get(
        `/api_vga/vendas/total/${loja?.codigo ? loja.codigo : 0}/${moment(
          dataInicialMeioPagamento
        ).format("YYYY-MM-DD")}/${moment(dataFinalMeioPagamento).format(
          "YYYY-MM-DD"
        )}/${pdv ? pdv : 0}`
      )
      .then((r) => {
        //  console.log(r.data);
        setVendasMeioPagamento(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoadingMeioPagamento(false);
      });
  };

  const getTicketMedio = () => {
    setLoadingTicketMedio(true);

    return api
      .get(
        `/api/vendas/ticket_medio/${moment(dataInicialTicket).format(
          "YYYY-MM-DD"
        )}/${moment(dataFinalTicket).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        setTicketMedio(r.data);
        // console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoadingTicketMedio(false);
      });
  };

  const getVendas = () => {
    setLoading(true);
    return api

      .get(
        `/api/vendas/por_hora/${moment(dataInicial)
          .format("YYYY-MM-DDTHH:MM:ss.")
          .slice(0, 20)}/${moment(dataFinal)
          .format("YYYY-MM-DDTHH:MM:ss.")
          .slice(0, 20)}/1`
      )
      .then((r) => {
        setVendas(r.data);
        setLoading(false);
        //  console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const handlePrint = useReactToPrint({
    content: () => tabelaRef.current,
  });
  const handlePrintMeioPagamento = useReactToPrint({
    content: () => tabelaMeioPagamentoRef.current,
  });

  useEffect(() => {
    pegarTokenLocalStorage();
    getVendas();
    getTicketMedio();
    getVendasMeioPagamento();
    getFilial();
    geTResumoVendas();
  }, []);

  return (
    <>
      <Header />
      <Footer />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          padding: "5px",
          gap: "5px",
          //margin: "1px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <div
          ref={tabelaRef}
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            padding: "10px",
            width: "100%",
            justifyContent: "center",
            border: "1px solid #FFFF",
            backgroundColor: "#9C9BDE",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <RangePicker
              disabled={loadingResumoVendas}
              format={"DD/MM/YYYY"}
              locale={locale}
              showToday
              onChange={(e) => setResumoData(e)}
            />
            <Select
              disabled={loadingResumoVendas}
              placeholder="Selecione uma loja"
              allowClear
              defaultActiveFirstOption={false}
              style={{ width: 240 }}
              onChange={(e) => setLojaResumoSelecionada(e)}
            >
              {lojaList.map((option) => (
                <Option key={option.id} value={option.codigo}>
                  {option.nome}
                </Option>
              ))}
            </Select>
            <Button
              style={{ margin: "5px" }}
              icon="pi pi-search"
              onClick={() => geTResumoVendas()}
              label={loadingResumoVendas ? "Gerando..." : "Gerar"}
              loading={loadingResumoVendas}
              className="p-button p-button-rounded p-button-success"
            />
            <Button
              style={{ margin: "0px 5px" }}
              label="Imprimir"
              className="p-button p-button-rounded p-button-warning"
              onClick={() => handlePrint()}
              icon="pi pi-print"
            />

            <h4 style={{ color: "#f2f2f2" }}>
              {" "}
              Exibindo os dados de{" "}
              {moment(ResumoData?.[0]?.$d).format("DD/MM/YYYY")} até{" "}
              {moment(ResumoData?.[1]?.$d).format("DD/MM/YYYY")}{" "}
            </h4>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Card bordered={true} title="Cupons">
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Total"
                value={
                  resumoVendas?.quantidade_cupom
                    ? resumoVendas?.quantidade_cupom
                    : 0
                }
                loading={loadingResumoVendas}
              />
            </Card>
            <Card bordered={true} title="Cupons Cancelados">
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Cancelados"
                value={
                  resumoVendas?.quantidade_cupom_cancelado
                    ? resumoVendas?.quantidade_cupom_cancelado
                    : 0
                }
                loading={loadingResumoVendas}
              />
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Total Cancelado"
                value={
                  resumoVendas?.venda_cancelada_cupom
                    ? resumoVendas?.venda_cancelada_cupom
                    : 0
                }
                precision={2}
                prefix="R$"
                loading={loadingResumoVendas}
              />
            </Card>
            <Card bordered={true} title="Itens Cancelados">
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Cancelados"
                value={
                  resumoVendas?.quantidade_item_cancelado
                    ? resumoVendas?.quantidade_item_cancelado
                    : 0
                }
                loading={loadingResumoVendas}
              />
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Total Cancelado"
                value={
                  resumoVendas?.venda_cancelada_item
                    ? resumoVendas?.venda_cancelada_item
                    : 0
                }
                precision={2}
                prefix="R$"
                loading={loadingResumoVendas}
              />
            </Card>
            <Card bordered={true} title="Itens + Cupons Cancelados">
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Cancelados"
                value={
                  resumoVendas?.quantidade_item_cancelado +
                  resumoVendas?.quantidade_cupom_cancelado
                }
                loading={loadingResumoVendas}
              />
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Total Cancelado"
                value={
                  resumoVendas?.venda_cancelada_item +
                  resumoVendas?.venda_cancelada_cupom
                }
                precision={2}
                prefix="R$"
                loading={loadingResumoVendas}
              />
            </Card>
            <Card bordered={true} title="Venda Bruta (PDV + RETAGUARDA)">
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Total Bruto"
                value={resumoVendas?.venda_bruta}
                precision={2}
                prefix="R$"
                loading={loadingResumoVendas}
              />
            </Card>
            <Card bordered={true} title="Descontos">
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Total de Descontos"
                value={resumoVendas?.descontos ? resumoVendas?.descontos : 0}
                precision={2}
                prefix="R$"
                loading={loadingResumoVendas}
              />
            </Card>
            <Card bordered={true} title="Venda - Descontos">
              <Statistic
                groupSeparator="."
                decimalSeparator=","
                title="Total Líquido"
                value={resumoVendas?.venda_bruta - resumoVendas?.descontos}
                precision={2}
                prefix="R$"
                loading={loadingResumoVendas}
              />
            </Card>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            gap: "5px",
            width: "100%",

            justifyContent: "flex-start",
            border: "1px solid #FFFF",
            backgroundColor: "#f2f2f2",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignContent: "center",
              flexWrap: "wrap",
              gap: "1px",
            }}
          >
            <Calendar
              selectOtherMonths
              style={{ margin: "5px" }}
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              showIcon
              showButtonBar
              placeholder="Data inicial"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.value)}
            ></Calendar>
            <Calendar
              selectOtherMonths
              style={{ margin: "5px" }}
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              showIcon
              showButtonBar
              placeholder="Data final"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.value)}
            ></Calendar>
            <Button
              style={{ margin: "5px" }}
              label="Gerar"
              loading={loading}
              className="p-button p-button-rounded"
              icon="pi pi-chart-line"
              onClick={getVendas}
            />
          </div>

          {vendas?.length > 0 || !loading ? (
            <>
              {" "}
              <GraficoVendaPorHora dados={vendas} />{" "}
            </>
          ) : (
            <>
              <ProgressBar mode="indeterminate" />
            </>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            border: "1px solid #FFFF",
            width: "100%",
            backgroundColor: "#9C9BDE",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignContent: "center",
                flexWrap: "wrap",
                gap: "1px",
              }}
            >
              <Calendar
                selectOtherMonths
                style={{ margin: "5px" }}
                dateFormat="dd/mm/yy"
                locale="pt-BR"
                showIcon
                showButtonBar
                placeholder="Data inicial"
                value={dataInicialTicket}
                onChange={(e) => setDataInicialTicket(e.value)}
              ></Calendar>
              <Calendar
                selectOtherMonths
                style={{ margin: "5px" }}
                dateFormat="dd/mm/yy"
                locale="pt-BR"
                showIcon
                showButtonBar
                placeholder="Data final"
                value={dataFinalTicket}
                onChange={(e) => setDataFinalTicket(e.value)}
              ></Calendar>
              <Button
                style={{ margin: "5px" }}
                label="Gerar"
                loading={loadingTicketMedio}
                className="p-button p-button-rounded"
                icon="pi pi-chart-line"
                onClick={getTicketMedio}
              />
            </div>
            {ticketMedio?.length > 0 || !loadingTicketMedio ? (
              <>
                <TicketMedioGrafico dados={ticketMedio} />{" "}
              </>
            ) : (
              <>
                <ProgressBar mode="indeterminate" />
              </>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            border: "1px solid #FFFF",
            width: "100%",
            gap:'10px',
            padding: "5px",
            justifyContent: "flex-start",
            alignItems: "center",
            backgroundColor: "#9C9BDE",
          }}
          ref={tabelaMeioPagamentoRef}
        >
          <h1
            style={{
              fontFamily: "cabin-sketch-bold",
              fontWeight: "800",
              color: "#FFFF",
              margin: "5px",
              textAlign: "center",
            }}
          >
            Resumo de vendas ( SOMENTE PDV )
          </h1>
          <div style={{ width: "100%" }}>
            <Calendar
              selectOtherMonths
              style={{ margin: "5px" }}
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              showIcon
              showButtonBar
              placeholder="Data inicial"
              value={dataInicialMeioPagamento}
              onChange={(e) => setDataInicialMeioPagamento(e.value)}
            ></Calendar>
            <Calendar
              selectOtherMonths
              style={{ margin: "5px" }}
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              showIcon
              showButtonBar
              placeholder="Data final"
              value={dataFinalMeioPagamento}
              onChange={(e) => setDataFinalMeioPagamento(e.value)}
            ></Calendar>
            <Dropdown
              showClear
              style={{ margin: "5px" }}
              value={loja}
              options={lojaList}
              onChange={(e) => setLoja(e.value)}
              optionLabel="nome"
              placeholder="Selecione uma loja"
            />

            <Button
              style={{ margin: "0px 5px" }}
              label="Gerar"
              loading={loadingMeioPagamento}
              className="p-button p-button-rounded"
              icon="pi pi-chart-bar"
              onClick={getVendasMeioPagamento}
            />
            <Button
              label="Imprimir"
              className="p-button p-button-rounded p-button-warning"
              onClick={() => handlePrintMeioPagamento()}
              icon="pi pi-print"
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection : 'column-reverse',
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <GraficoMeioDePagamento dados={vendasMeioPagamento} />

            <PivotViewComponent
              id="PivotView"
              dataSourceSettings={dataSourceSettings}
              enableValueSorting={true}
              width="95%"
              height={500}
              gridSettings={{ columnWidth: 10 }}
            ></PivotViewComponent>
          </div>
        </div>
      </div>
    </>
  );
};

export default GraficosIndex;
