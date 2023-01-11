import React, { useRef, useState, useEffect } from "react";



import SyncfusionPivot from "./syncfusion";

import Header from "../../components/header";
import Footer from "../../components/footer";

import api from "../../services/axios";



import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { Toolbar } from "primereact/toolbar";
import { ProgressBar } from 'primereact/progressbar';
import { addLocale } from 'primereact/api'


import moment from "moment/moment";


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

    })
    const [data, setData] = useState([]);


    const [date1, setDate1] = useState(null);
    const [date2, setDate2] = useState(null);

    const [loading, setLoading] = useState(null);
    const toast = useRef(null);



    const getDados = () => {
        setLoading(true);
        api
            .get(
                `/api_vendas/bi/${moment(date1).format("yyyy-MM-DD")}/${moment(
                    date2
                ).format("yyyy-MM-DD")}`
            )
            .then((r) => {

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
                setLoading(false)


            });
    };



    const leftContents = (
        <React.Fragment>
            <Button
                style={{
                    padding: "1em",
                }}
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

            <Header />
            <Footer />
            {data.length < 0 ? (
                <></>
            ) : (
                <>
                    <Toolbar left={leftContents} />



                </>
            )}

            {data.length > 0 && loading === false ? (
                <>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "1rem",
                            padding: "1rem",
                        }}
                    >
                        <h4 style={{ color: "#f2f2f2" }}>
                            Exibindo dados de {moment(date1).format("DD/MM/YYYY")} até{" "}
                            {moment(date2).format("DD/MM/YYYY")}
                        </h4>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: 'column',
                        justifyContent: "center",
                        alignItems: "center",
                        // margin: "1rem",
                        //  padding: "1rem",
                        border: '1px solid #f2f2f2'
                    }}>
                        <SyncfusionPivot date1={date1} date2={date2} data={data}></SyncfusionPivot>
                    </div>

                </>
            ) : (
                <>
                    {loading ? <>   <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar></> : <></>}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexWrap: "wrap",
                            flexDirection: "row",
                            gap: "2em",
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
                                justifyContent: "center",
                                alignItems: "center",
                                flexWrap: "wrap",
                                flexDirection: "row",
                            }}
                        >
                            <Button
                                className="p-button p-button-success p-button-rounded p-button-lg"
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
    );
};

export default Pivot;
<></>;