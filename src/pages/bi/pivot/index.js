import React, { useRef, useState, useEffect } from "react";
import * as FlexmonsterReact from "react-flexmonster";


import SyncfusionPivot from "../syncfusion";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import api from "../../../services/axios";

import local from "../../../assets/language/pivot.json";

import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { Toolbar } from "primereact/toolbar";
import { TabView, TabPanel } from 'primereact/tabview';
import { Avatar } from 'primereact/avatar';

import moment from "moment/moment";

const Pivot = () => {
  const [data, setData] = useState([]);
  const ref = useRef(null);

  const [date1, setDate1] = useState(null);
  const [date2, setDate2] = useState(null);

  const [loading, setLoading] = useState(null);
  const toast = useRef(null);

  const onReportComplete = () => {
    setLoading(false);
    console.log(">>>>>", ref.current.webdatarocks.getReport());
  };
  const customizeToolbar = (toolbar) => {
    let tabs = toolbar.getTabs();
    toolbar.getTabs = function () {
      tabs = tabs.filter(
        (tab) => tab.id != "fm-tab-connect" && tab.id != "fm-tab-open"
      );
      return tabs;
    };
  };

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

  const onReady = () => {
    // Connect Flexmonster to the data
    ref.pivot.flexmonster.connectTo({ data });

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

  const tabHeaderITemplate = (options) => {
    return (
      <div className="flex align-items-center px-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
        <Avatar image="images/avatar/amyelsner.png" onImageError={(e) => e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} shape="circle" className="mx-2" />
        FlexMonster
      </div>
    )
  };

  const tabHeaderIITemplate = (options) => {
    return (
      <div className="flex align-items-center px-3" style={{ cursor: 'pointer' }} onClick={options.onClick}>
        <Avatar image="images/avatar/amyelsner.png" onImageError={(e) => e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} shape="circle" className="mx-2" />
        SyncFusion
      </div>
    )
  };

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
          { /*
           <TabView>
            <TabPanel header="Header I" headerTemplate={tabHeaderITemplate}>
              
               <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              // padding: "2px",
            }}
          >
            <FlexmonsterReact.Pivot
              ref={ref}
              beforetoolbarcreated={customizeToolbar}
              componentFolder="https://cdn.webdatarocks.com/"
              toolbar={true}
              width="100%"
              height={600}
              reportcomplete={onReportComplete}
              ready={onReady}
              global={{
                options: {
                  readOnly: false,
                  datePattern: "DD/MM/yyyy",
                  grid: {
                    title: "Análise de custo x venda",
                  },
                },
                localization: local,
              }}
              report={{
                dataSource: {
                  data: data? data : [],

                  mapping: {
                    id: {
                      type: "integer",
                    },
                    dataEmissao: {
                      type: "date",
                    },
                    dataEmissao: {
                      type: "date",
                    },
                    codigo: {
                      type: "number",
                    },
                    grupoPai: {
                      type: "string",
                    },
                    grupoFilho: {
                      type: "string",
                    },
                    grupoNeto: {
                      type: "string",
                    },
                    descricao: {
                      type: "string",
                    },
                    promocaoNome: {
                      type: "string",
                    },
                    quantidade: {
                      type: "number",
                    },
                    precoultimacompra: {
                      type: "number",
                    },
                    precounitario: {
                      type: "number",
                    },
                    codigoFilial: {
                      type: "number",
                    },
                  },
                },
                formats: [
                  {
                    name: "number", // for measure with format number
                    decimalSeparator: ",",
                    thousandsSeparator: ".",
                    currencySymbol: "",
                    decimalPlaces: 3,
                  },
                  {
                    name: "lucropercent", // for measure with format number
                    decimalSeparator: ",",
                    thousandsSeparator: ".",
                    currencySymbol: "",
                    decimalPlaces: 2,
                  },
                  {
                    name: "currency", // for measures with format = "currency"
                    decimalSeparator: ",",
                    thousandsSeparator: ".",
                    currencySymbol: "R$ ",
                    decimalPlaces: 2,
                  },
                ],

                slice: {
                  reportFilters: [
                    {
                      uniqueName: "nomeFilial",
                      caption: "Loja",
                    },
                    {
                      uniqueName: "promocaoNome",
                      caption: "Nome da promoção",
                    },
                  ],

                  rows: [
                    {
                      uniqueName: "grupoPai",
                      caption: "Seção nível I",
                    },
                    {
                      uniqueName: "grupoFilho",
                      caption: "Seção nível II ",
                    },
                    {
                      uniqueName: "grupoNeto",
                      caption: "Seção nível III",
                    },
                    {
                      uniqueName: "descricao",
                      caption: "Produto",
                    },
                  ],
                  measures: [
                    {
                      uniqueName: "precoultimacompra2",
                      caption: "Preço de custo ",
                      formula: "'precoultimacompra' * 'quantidade' ",
                      individual: true,
                      format: "currency",
                    },

                    {
                      uniqueName: "quantidade",
                      caption: "Quantidade vendida",
                      aggregation: "sum",
                      format: "number",
                    },
                    {
                      uniqueName: "precoultimacompra",
                      caption: "Preço de custo ",
                      aggregation: "average",
                      format: "currency",
                    },

                    {
                      uniqueName: "precounitario",
                      caption: "Preço de venda",
                      aggregation: "average",
                      format: "currency",
                    },
                    {
                      uniqueName: "lucrounitario",
                      caption: "Lucro unitário R$",
                      format: "currency",
                      formula:
                        "(average('precounitario')) - (average('precoultimacompra')) ",
                    },
                    {
                      uniqueName: "valorTotal",
                      format: "currency",
                      caption: "Valor total R$",
                    },

                    {
                      uniqueName: "lucrototalrs",
                      caption: "Lucro",
                      format: "currency",
                      formula: "sum('valorTotal') - sum('precoultimacompra2')",
                    },
                    {
                      uniqueName: "lucrototalpercent",
                      caption: "Lucro %",
                      format: "lucropercent",
                      formula: "(sum('lucrototalrs')/ sum('valorTotal')) * 100",
                    },
                  ],
                },
              }}
              //licenseKey="XXXX-XXXX-XXXX-XXXX-XXXX"
            /> 
           
          </div>
                       
                    </TabPanel>
                    <TabPanel headerTemplate={tabHeaderIITemplate} headerClassName="flex align-items-center">
                       <SyncfusionPivot data={data}></SyncfusionPivot>
                    </TabPanel>
           
                </TabView>
          */}
          <div style={{
            display: "flex",
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: "center",
            // margin: "1rem",
            //  padding: "1rem",
            border: '1px solid #f2f2f2'
          }}>
            <SyncfusionPivot data={data}></SyncfusionPivot>
          </div>

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
