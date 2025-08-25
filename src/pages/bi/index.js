import React, { useRef, useState, useEffect } from "react";

import SyncfusionPivot from "./syncfusion";

import Footer from "../../components/footer";

import api from "../../services/axios";
import { Player } from "@lottiefiles/react-lottie-player";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { Toolbar } from "primereact/toolbar";
import { ProgressBar } from "primereact/progressbar";
import { addLocale } from "primereact/api";

import ImagemDestque from '../../assets/img/analisando.json'

import moment from "moment/moment";
import { SelectButton } from "primereact/selectbutton";

const Pivot = () => {
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
  const [data, setData] = useState([]);

  const [date1, setDate1] = useState(null);
  const [date2, setDate2] = useState(null);

  const [modocalculo, setModocalculo] = useState(1);

  const [loading, setLoading] = useState(null);
  const toast = useRef(null);

  const modocalculoList = [
    { name: "Preço de compra na venda (Sem impostos)", value: 0 },
    { name: "Preço de custo na venda (Com impostos)", value: 1 },
  ];
  const options = [
    { value: 0, label: "Não" },
    { value: 1, label: "Sim" },
  ];
  const [expandido, SetExpandido] = useState(0);
  const [somenteVendasPdv,setSomenteVendasPdv] = useState(0);

  const getDados = () => {
    setLoading(true);
    //  console.log(expandido);
    api
      .get(
        `/api_vendas/bi/sync/${moment(date1).format("yyyy-MM-DD")}/${moment(
          date2
        ).format("yyyy-MM-DD")}/${modocalculo}/${somenteVendasPdv}`
      )
      .then((r) => {
      //  console.log(r.data);
        setData(r.data);
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

  const leftContents = (
    <React.Fragment>
      <Button
        style={{
          padding: "1em",
        }}
        disabled={data?.length === 0}
        label="Voltar"
        icon="pi pi-backward"
        onClick={() => setData([])}
        className="p-button p-button-rounded p-button-danger mr-2"
      />
    </React.Fragment>
  );

  useEffect(() => {
    // getDados();
  }, []);

  return (
    <>
      <Toast ref={toast} position="top-center" />

      <Footer />
      {data.length < 0 ? (
        <></>
      ) : (
        <>
          <Toolbar style={{marginTop:'50px'}} left={leftContents} />
        </>
      )}

      {data.length > 0 && loading === false ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              width: "100%",
            }}
          >
           
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              // margin: "1rem",
              //  padding: "1rem",
              border: "1px solid #f2f2f2",
            }}
          >
            <SyncfusionPivot
              date1={date1}
              date2={date2}
              data={data}
              expandido={expandido}
              somenteVendasPdv={somenteVendasPdv}
              modocalculo={modocalculo}
            ></SyncfusionPivot>

            {/*  <DevExpressComponentPivot data ={ data} /> */}
          </div>
        </>
      ) : (
        <>
          {loading ? (
            <>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
            <h1 style={{color:'#f2f2f2'}}>Buscando dados, aguarde por favor</h1>
            </div>
            <ProgressBar
                mode="indeterminate"
                style={{ height: "6px" }}
              ></ProgressBar> 
             <Player src={ImagemDestque} loop autoplay style={{ width: "350px" }} />
             
              
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  flexDirection: "row",
                  gap: "2em",
                  width: "95%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    flexDirection: "column",
                    margin: "2rem",
                  }}
                >
                  <label style={{ color: "#F2f2f2" }} htmlFor="basic">
                    Informe a data inicial
                  </label>
                  <Calendar
                    selectOtherMonths
                    showButtonBar
                    locale="pt-BR"
                    dateFormat="dd/mm/yy"
                    id="date1"
                    value={date1}
                    onChange={(e) => setDate1(e.value)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    flexDirection: "column",
                  }}
                >
                  <label style={{ color: "#F2f2f2" }} htmlFor="basic">
                    Informe a data final
                  </label>
                  <Calendar
                    selectOtherMonths
                    showButtonBar
                    locale="pt-BR"
                    dateFormat="dd/mm/yy"
                    id="date2"
                    value={date2}
                    onChange={(e) => setDate2(e.value)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    flexDirection: "column",
                  }}
                >
                  <label style={{ color: "#F2f2f2" }}>
                    Modo de cálculo de custo
                  </label>
                  <Dropdown
                    value={modocalculo}
                    onChange={(e) => setModocalculo(e.value)}
                    options={modocalculoList}
                    optionLabel="name"
                    placeholder="Selecione o modo de cálculo do custo "
                  />
                </div>
                <div>
                  <label style={{ color: "#F2f2f2" }}>
                    Exibir a tabela de forma expandida ?
                  </label>
                  <SelectButton
                    value={expandido}
                    onChange={(e) => SetExpandido(e.value)}
                    options={options}
                  />
                </div>

                <div>
                  <label style={{ color: "#F2f2f2" }}>
                    Exibir somente as vendas do PDV ?
                  </label>
                  <SelectButton
                    value={somenteVendasPdv}
                    onChange={(e) => setSomenteVendasPdv(e.value)}
                    options={options}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                    flexDirection: "row",
                  }}
                >
                  <Button
                    className="p-button p-button-success p-button-rounded p-button-lg"
                    style={{
                      marginTop: "10px",
                    }}
                    icon="pi pi-search"
                    label={!loading ? "Analisar" : "Analisando..."}
                    loading={loading}
                    disabled={loading}
                    onClick={() => getDados()}
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

export default Pivot;
<></>;
