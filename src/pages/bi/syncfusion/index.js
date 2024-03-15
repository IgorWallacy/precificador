import { useReactToPrint } from "react-to-print";
import {
  PivotViewComponent,
  Inject,
  CalculatedField,
  FieldList,
  GroupingBar,
  Toolbar,
  VirtualScroll,
  ExcelExport,
  PDFExport,
  PivotChart,
  DrillThrough,
} from "@syncfusion/ej2-react-pivotview";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import {
  L10n,
  setCulture,
  setCurrencyCode,
  loadCldr,
} from "@syncfusion/ej2-base";

import * as currencies from "./currencies.json";
import * as numbers from "./numbers.json";

import "primeicons/primeicons.css";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";

import "./styless.css";

import ptBR from "./ptBR.json";

import { useRef, useState } from "react";

import moment from "moment";

L10n.load(ptBR);

loadCldr(currencies, numbers);

setCulture("pt");
setCurrencyCode("BRL");

const SyncfusionPivot = ({
  data,
  date1,
  date2,
  expandido,
  modocalculo,
  somenteVendasPdv,
}) => {
  const ref = useRef();

  const [expandirTudo, setExpandirTudo] = useState(expandido);

  let chartInstance = useRef(null);
  let chartInstance2 = useRef(null);

  const trend = () => {
    //  ref.current.grid.autoFitColumns();
    // console.log(data)
  };
  const groupSettings = {
    showFieldsPanel: true,
    showRemoveIcon: false,
  };

  const gridSettings = {
    allowReordering: true,
    allowAutoResizing: true,
    allowSelection: true,
    allowTextWrap: true,
    selectionSettings: {
      mode: "Row",
      type: "Single",
      cellSelectionMode: "Box",
    },

    columnWidth: 40,
    rowHeight: 40,
    gridLines: "Both",
    clipMode: "EllipsisWithTooltip",
  };

  const dataSourceSettings = {
    allowLabelFilter: true,
    allowValueFilter: true,
    enableSorting: true,
    columns: [],
    dataSource: data,
    excludeFields: [
      "id",
      "codigo",
      "promocao",
      "dataEmissao",
      "codigoFilial",
      "desconto",
      "meta",
    ],
    expandAll: expandirTudo,
    filters: [
      { name: "nomeFilial", caption: "Loja" },
      { name: "promocaoNome", caption: "Nome da promoção" },
      { name: "codigo", caption: "Código do produto" },
    ],

    rows: [
      { name: "grupoPai", caption: "Seção I", showValueTypeIcon: false },
      { name: "grupoFilho", caption: "Seção II", showValueTypeIcon: false },
      { name: "grupoNeto", caption: "Seção III", showValueTypeIcon: false },
      { name: "descricao", caption: "Produto", showValueTypeIcon: false },
    ],
    values: [
      {
        name: "precoultimacompratotal",
        caption: "Custo Total",
        type: "Sum",
      },
      {
        name: "precoultimacompra",
        caption: "Custo Médio",
        type: "Avg",
      },
      { name: "quantidade", caption: "Quantidade", type: "Sum" },

      { name: "precounitario", caption: "Preço Médio", type: "Avg" },

      {
        name: "lucrounitario",
        caption: "Lucro Unitário",
        type: "CalculatedField",
      },

      { name: "valorTotal", caption: "Total vendido (Líquido)" },
      { name: "lucrototalrs", caption: "R$ Lucro Total (Líquido)" },

      { name: "metapercent", caption: "% Meta ", type: "Avg" },
      { name: "lucrototalpercent", caption: "% Lucro Total(Líquido)" },
      {
        name: "metacalculo",
        caption: "Atingiu % da meta ",
        type: "Avg",
      },
    ],
    calculatedFieldSettings: [
      {
        name: "metapercent",
        formula: '"Avg(meta)" / 100',
      },
      {
        name: "lucrounitario",
        formula: '"Avg(precounitario)"-"Avg(precoultimacompra)"',
      },

      {
        name: "lucrototalrs",
        formula: '"Sum(valorTotal)"-"Sum(precoultimacompratotal)"',
      },

      {
        name: "metacalculo",

        formula:
          ' (("Sum(valorTotal)"-"Sum(precoultimacompratotal)") / "Sum(valorTotal)") / ("Avg(meta)" / 100 )  ',
      },
      {
        name: "lucrototalpercent",
        formula:
          ' ("Sum(valorTotal)"-"Sum(precoultimacompratotal)") / "Sum(valorTotal)" ',
      },
    ],
    formatSettings: [
      { name: "quantidade", format: "N2" },
      { name: "lucrounitario", format: "C2" },
      { name: "precounitario", format: "C2" },

      { name: "precoultimacompra", format: "C2" },
      { name: "precoultimacompratotal", format: "C2" },
      { name: "lucrototalrs", format: "C2" },
      { name: "lucrototalpercent", format: "P2" },
      { name: "metapercent", format: "P2" },
      { name: "metacalculo", format: "P2" },
      { name: "valorTotal", format: "C2" },
    ],
  };

  const excelExportProperties = {
    fileName: `analise_de_custo_x_venda_de_${moment(date1).format(
      "DD_MM_YY"
    )}_a_${moment(date2).format("DD_MM_YY")}.xlsx`,
  };

  const chartOnLoad = (args) => {
    let selectedTheme = "Material";
    args.chart.theme = (
      selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
    ).replace(/-dark/i, "Dark");
  };

  let fields = { text: "text", value: "value" };
  let chartTypes = [
    { value: "Column", text: "Coluna" },
    { value: "Bar", text: "Barra" },
    { value: "Pie", text: "Pizza" },
    { value: "Doughnut", text: "Doughnut" },
    
  ];

  function ddlOnChange(args) {
    chartInstance.current.chartSettings.chartSeries.type = args.value;
  }

  const handlePrint = useReactToPrint({
    content: () => chartInstance2.current,
    documentTitle: "Análise de vendas",
  });

  return (
    <>
      <div
        ref={chartInstance2}
        style={{
          backgroundColor: "#f2f2f2",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          flexDirection: "row",
          // padding: "2rem",
          width: "100%",
        }}
      >
        <div
          style={{ width: "100%", height: "100vh" }}
          className="control-section"
        >
          <div style={{ display: "flex", flexDirection:'column', alignItems: "center" }}>
            <h2 style={{ color: "#000" }}>
              {" "}
              Exibindo o custo{" "}
              {modocalculo === 0
                ? "pela compra ( SEM IMPOSTOS )"
                : "pelo preço de aquisição ( COM IMPOSTOS)"}{" "}
              no momento da venda
            </h2>
          
            <p>{somenteVendasPdv ? 'Exibindo somente as vendas do PDV' : 'Exibindo todas as vendas ( NFE, NFCE, ECF)'}</p>
          </div>

          <TabView className="tabview-header-icon">
            <TabPanel header="Tabela" leftIcon="pi pi-table">
              <div>
                <Button
                  icon="pi pi-file-excel"
                  className="p-button p-button-rounded p-button-success"
                  style={{ margin: "1em" }}
                  label="Exportar Excel"
                  onClick={() => ref.current.excelExport(excelExportProperties)}
                />
                {/* <Button
                  icon="pi pi-file-pdf"
                  className="p-button p-button-rounded p-button-secondary"
                  style={{ margin: "1em" }}
                  label="Exportar PDF"
                  onClick={() => ref.current.pdfExport(pdfExportProperties)}
      /> */}
               
              </div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}> 
              <h1>Exibindo dados de {moment(date1).format("DD/MM/YYYY")} até{" "}
                {moment(date2).format("DD/MM/YYYY")}</h1> 
              </div>

              <PivotViewComponent
                spinnerTemplate={
                  '<div class="custom-texto "> <h1>Calculando vendas, Aguarde por favor </h1> </div>'
                }
                ref={ref}
                locale="pt"
                currencyCode="BRL"
                allowDrillThrough={false}
                allowLabelFilter={true}
                allowValueFilter={true}
                allowNumberFormatting={true}
                allowExcelExport={true}
                exportAllPages={true}
                allowPdfExport={true}
                allowRepeatHeader={false}
                allowDataCompression={false}
                enableFieldSearching={true}
                enableValueSorting={false}
                enableSorting={false}
                showGroupingBar={true}
                showTooltip={false}
                id="PivotView"
                showFieldList={true}
                gridSettings={gridSettings}
                groupingBarSettings={groupSettings}
                dataSourceSettings={dataSourceSettings}
                allowCalculatedField={true}
                dataBound={trend.bind()}
                width={"100%"}
                height={800}
                displayOption={{ view: "Table" }}
                chartSettings={{
                  title: "Análise de vendas",
                  chartSeries: { type: "Column" },
                  load: chartOnLoad.bind(),
                }}
              >
                <Inject
                  services={[
                    CalculatedField,
                    FieldList,
                    GroupingBar,
                    Toolbar,
                    DrillThrough,
                    ExcelExport,
                    PDFExport,
                    PivotChart,
                  ]}
                />
              </PivotViewComponent>
            </TabPanel>
            <TabPanel header="Gráficos" rightIcon="pi pi-chart-bar">
              <div className="col-lg-3 property-section">
                <table
                  id="property"
                  title="Properties"
                  className="property-panel-table"
                  style={{ width: "100%" }}
                >
                  <tbody>
                    <tr style={{ height: "50px" }}>
                      <td>
                        <div>
                          <h1>Escolha um gráfico</h1>
                          <DropDownListComponent
                            placeholder={"Escolha um gráfico"}
                            floatLabelType={"Auto"}
                            fields={fields}
                            change={ddlOnChange.bind()}
                            id="charttypes"
                            index={0}
                            enabled={true}
                            dataSource={chartTypes}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  margin: "5px",
                }}
              >
                <Button
                  label="Imprimir"
                  className="p-button p-button-rounded "
                  icon="pi pi-print"
                  onClick={() => {
                    handlePrint();
                  }}
                />
              </div>

              <PivotViewComponent
                spinnerTemplate={
                  '<div class="custom-texto "> <h1>Montando gráfico, Aguarde por favor </h1> </div>'
                }
                ref={chartInstance}
                locale="pt"
                currencyCode="BRL"
                allowDrillThrough={false}
                allowLabelFilter={true}
                allowValueFilter={true}
                allowNumberFormatting={true}
                allowExcelExport={true}
                exportAllPages={true}
                allowPdfExport={true}
                allowRepeatHeader={false}
                allowDataCompression={false}
                enableFieldSearching={true}
                enableValueSorting={true}
                enableVirtualization={true}
                enableSorting={true}
                showGroupingBar={true}
                showTooltip={false}
                showFieldList={true}
                id="PivotView2"
                gridSettings={gridSettings}
                groupingBarSettings={groupSettings}
                dataSourceSettings={dataSourceSettings}
                allowCalculatedField={true}
                dataBound={trend.bind()}
                width="100%"
                height={800}
                displayOption={{ view: "Chart" }}
                chartSettings={{
                  title: "Análise de vendas",
                  chartSeries: { type: "Column" },
                  load: chartOnLoad.bind(),
                }}
              >
                <Inject
                  services={[
                    DrillThrough,
                    CalculatedField,
                    FieldList,
                    GroupingBar,
                    Toolbar,
                    VirtualScroll,
                    ExcelExport,
                    PDFExport,
                    PivotChart,
                  ]}
                />
              </PivotViewComponent>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "2rem",
                }}
              >
                <h1>
                  Exibindo os dados de {moment(date1).format("DD/MM/YYYY")} até{" "}
                  {moment(date2).format("DD/MM/YYYY")}
                </h1>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </>
  );
};

export default SyncfusionPivot;
