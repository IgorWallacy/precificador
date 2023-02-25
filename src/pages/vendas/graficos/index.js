import React, { useState, useEffect } from "react";

import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { addLocale } from "primereact/api";

import api from "../../../services/axios";
import GraficoVendaPorHora from "./por-hora";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import moment from "moment";
import TicketMedioGrafico from "./ticket-medio";

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

  const [dataInicial, setDataInicial] = useState(new Date());
  const [dataFinal, setDataFinal] = useState(new Date());

  const [dataInicialTicket, setDataInicialTicket] = useState(new Date());
  const [dataFinalTicket, setDataFinalTicket] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [loadingTicketMedio, setLoadingTicketMedio] = useState(false);

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

          justifyContent: "center",
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
      </div>
    </>
  );
};

export default GraficosIndex;
