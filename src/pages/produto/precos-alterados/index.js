import React, { useState } from "react";
import api from "../../../services/axios";

import { addLocale } from "primereact/api";
import { Calendar } from "primereact/calendar";

import moment from "moment";
import { Button } from "primereact/button";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const PrecosAlteradosComponent = () => {
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

  const [produtos, setProdutos] = useState([]);
  const agora = new Date();
  const [dataInicial, setDataInicial] = useState(
    new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0)
  );
  const [dataFinal, setDataFinal] = useState(
    new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59)
  );

  const getProdutos = () => {
    return api
      .get(
        `/api/formacaoprecoproduto/filial/1/dataInicial/${moment(
          dataInicial
        ).format("YYYY-MM-DD HH:mm:ss")}/dataFinal/${moment(dataFinal).format(
          "YYYY-MM-DD HH:mm:ss"
        )}`
      )
      .then((r) => {
        setProdutos(r.data);
        console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {});
  };

  return (
    <>
      <Header />
      <Footer />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            flexDirection: "column",
          }}
        >
          <h1 style={{ color: "#f2f2f2" }}>Preços alterados</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <p style={{ color: "#f2f2f2" }}>Data inicial</p>
            <Calendar
              value={dataInicial}
              onChange={(e) => setDataInicial(e.value)}
              showTime
              showButtonBar
              showIcon
              hourFormat="24"
              dateFormat="dd/mm/yy"
              locale="pt-BR"
            />

            <p style={{ color: "#f2f2f2" }}>Data final</p>
            <Calendar
              value={dataFinal}
              onChange={(e) => setDataFinal(e.value)}
              showTime
              showButtonBar
              showIcon
              hourFormat="24"
              dateFormat="dd/mm/yy"
              locale="pt-BR"
            />
            <Button
              label="Pesquisar"
              className="p-button p-button-rounded"
              icon="pi pi-search"
              onClick={() => getProdutos()}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrecosAlteradosComponent;
