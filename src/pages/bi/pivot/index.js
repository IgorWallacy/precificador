
import * as FlexmonsterReact from "react-flexmonster";
import local from "../../../assets/language/pivot.json";

const PivotComponent = ({ data }) => {

  const onReady = () => {
    // Connect Flexmonster to the data
    ref.pivot.flexmonster.connectTo({ data });

  };

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

  return (
    <>

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
            data: data ? data : [],

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

    </>
  )
}

export default PivotComponent;