import React, { useState, useEffect } from "react";

import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { addLocale } from "primereact/api";
import { Dropdown } from "primereact/dropdown";

import api from "../../../services/axios";
import GraficoVendaPorHora from "./por-hora";

import {
  PivotViewComponent,
  Inject,
  FieldList,
} from "@syncfusion/ej2-react-pivotview";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import moment from "moment";
import TicketMedioGrafico from "./ticket-medio";
import GraficoMeioDePagamento from "./por-meio-de-pagamento";

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

  const [vendas, setVendas] = useState([]);
  const [ticketMedio, setTicketMedio] = useState([]);
  const [vendasMeioPagamento, setVendasMeioPagamento] = useState([]);

  const [dataInicial, setDataInicial] = useState(new Date());
  const [dataFinal, setDataFinal] = useState(new Date());

  const [dataInicialTicket, setDataInicialTicket] = useState(new Date());
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

  let dataSourceSettings = {
    enableSorting: true,
    valueSortSettings: { headerDelimiter: " - " },
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

  const getFilial = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setLojaList(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getVendasMeioPagamento = () => {
    setLoadingMeioPagamento(true);

    if (!pdv) {
      setPdv({ pdv: "0" });
    }

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    return api
      .get(
        `/api_vga/vendas/total/${codigo}/${moment(
          dataInicialMeioPagamento
        ).format("YYYY-MM-DD")}/${moment(dataFinalMeioPagamento).format(
          "YYYY-MM-DD"
        )}/${pdv.pdv}`
      )
      .then((r) => {
        console.log(r.data);
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
        //console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getVendas();
    getTicketMedio();
    getVendasMeioPagamento();
    getFilial();
  }, []);

  return (
    <>
      <Header />
      <Footer />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px",
          margin: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            gap: "5px",
            padding: "1px",
            justifyContent: "center",
            border: "1px solid #FFFF",
            width: "49%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexWrap: "wrap",
              gap: "1px",
            }}
          >
            <Calendar
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
            justifyContent: "center",
            flexWrap: "wrap",
            border: "1px solid #FFFF",
            width: "49%",
            padding: "1px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                flexWrap: "wrap",
                gap: "1px",
              }}
            >
              <Calendar
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

            flexWrap: "wrap",
            border: "1px solid #FFFF",
            width: "55%",
            padding: "5px",
          }}
        >
          <div>
            <Calendar
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
              style={{ margin: "5px" }}
              value={loja}
              options={lojaList}
              onChange={(e) => setLoja(e.value)}
              optionLabel="nome"
              placeholder="Selecione uma loja"
            />

            <Button
              style={{ margin: "5px" }}
              label="Gerar"
              loading={loadingMeioPagamento}
              className="p-button p-button-rounded"
              icon="pi pi-chart-bar"
              onClick={getVendasMeioPagamento}
            />

            <div>
              {loadingMeioPagamento ? (
                <>
                  <ProgressBar mode="indeterminate" />
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignContent: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <PivotViewComponent
                      enableValueSorting={true}
                      showFieldList={true}
                      allowCalculatedField={true}
                      width={600}
                      height={"400"}
                      id="PivotView"
                      dataSourceSettings={dataSourceSettings}
                    >
                      <Inject services={[FieldList]} />
                    </PivotViewComponent>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #FFFF",
            width: "40%",
          }}
        >
          <GraficoMeioDePagamento dados={vendasMeioPagamento} />
        </div>
      </div>
    </>
  );
};

export default GraficosIndex;
