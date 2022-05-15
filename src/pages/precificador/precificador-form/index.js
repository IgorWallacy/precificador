import React, { useContext, useState, useRef } from "react";

import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { addLocale } from "primereact/api";
import { Toast } from "primereact/toast";


import api from "../../../services/axios";

import Context from "../../../contexts";

const PrecificadorForm = () => {
  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();

  const { setProdutos } = useContext(Context);
  const { setLoading } = useContext(Context);


  const toast = useRef(null);

  const buscarProdutos = () => {
    setProdutos([])
    let dataI = dataInicial.toISOString().slice(0, 10);
    let dataF = dataFinal.toISOString().slice(0, 10);

    if (dataI && dataF) {
      setLoading(true);
      
     

      api
        .get(`/produtos/precificar/${dataI}/${dataF}`)
        .then((response) => {
          setProdutos(response.data);
          setLoading(false);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: ` ${error}  `,
          });

          setLoading(false);
        });
    }
  };

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
    today: "Hoje",
    clear: "Limpar",
  });

  

  return (
    <>
       
      
      <Toast ref={toast} position="top-left"></Toast>
      
      <div className="form-precificador">
     
        <div  className="form-precificador-input">
          <h5>Período</h5>
          <Calendar
            placeholder="Informe a data inicial"
            dateFormat="dd/mm/yy"
            viewDate={dataInicial}
            value={dataInicial}
            onChange={(e) => setDataInicial(e.value)}
            showButtonBar
            locale="pt-BR"
          />

          <h5>até</h5>

          <Calendar
            placeholder="Informe a data final"
            dateFormat="dd/mm/yy"
            viewDate={dataFinal}
            value={dataFinal}
            onChange={(e) => setDataFinal(e.value)}
            showButtonBar
            locale="pt-BR"
          />
        </div>
      </div>
      <div className="form-precificador-btn">
        <Button
          icon="pi pi-search"
          label="Pesquisar"
          onClick={() => buscarProdutos()}
        />
      </div>
    </>
  );
};

export default PrecificadorForm;
