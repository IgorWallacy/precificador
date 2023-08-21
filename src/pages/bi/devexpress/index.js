import React, { useRef } from "react";
import "devextreme/dist/css/dx.material.teal.light.compact.css";
import deMessages from "devextreme/localization/messages/pt.json";
import config from "devextreme/core/config";
import { locale, loadMessages } from "devextreme/localization";
import PivotGridDataSource from "devextreme/ui/pivot_grid/data_source";
import PivotGrid, {
  FieldChooser,
  HeaderFilter,
  Search,
  FieldPanel,
  
} from "devextreme-react/pivot-grid";

const DevExpressComponentPivot = ({ data }) => {
  loadMessages(deMessages);
  locale(navigator.language);
  config({ defaultCurrency: "BRL" });

  const pivotGrid = useRef("pivotgrid");

  const dataSource = new PivotGridDataSource({
  
    allowExpandAll: true,
   
  
    fields: [
      {
        caption: "Loja",

        dataField: "nomeFilial",
        area: "column",
        sortBySummaryField: "Total",
      },
      {
        caption: "Grupo I",
        dataField: "grupoPai",

        area: "row",
      },
      {
        caption: "Descrição",
        dataField: "descricao",
        area: "row",
      },

      {
        caption: "Custo Total",
        dataField: "precoultimacompratotal",
        dataType: "number",

        summaryType: "sum",
        format: {
          type: "currency",
          precision: "2",
        },
        area: "data",
      },
      {
        caption: "Custo Médio",
        dataField: "precoultimacompra",
        dataType: "number",
        summaryType: "avg",
        format: {
          type: "currency",
          precision: "2",
        },
        area: "data",
      },
      {
        caption: "Quantidade",
        dataField: "quantidade",
        dataType: "number",
        summaryType: "sum",
        format: {
          type: "fixedPoint",
          precision: "2",
        },
        area: "data",
      },
      {
        caption: "Preço médio",
        dataField: "precounitario",
        dataType: "number",
        summaryType: "avg",
        format: {
          type: "currency",
          precision: "2",
        },
        area: "data",
      },
      {
        caption: "Venda Total",
        dataField: "valorTotal",
        dataType: "number",
        summaryType: "sum",

        format: {
          type: "currency",
          precision: "2",
        },
        area: "data",
      },

      
    ],
    store: data,
  });

  

  return (
    <>
      <PivotGrid
       
        id="pivotgrid"
        dataSource={dataSource}
        allowFiltering={true}
        showBorders={false}
        showColumnTotals={true}
        showColumnGrandTotals={false}
        showRowTotals={true}
        showRowGrandTotals={true}
        ref={pivotGrid}
        rowHeaderLayout='tree'
        dataFieldArea="column"
        wordWrapEnabled={true}
        loadPanel={{ enabled: true }} // Show loading indicator
      >
        <HeaderFilter>
          <Search height={300} width={400} enabled={true} />
          
        </HeaderFilter>
        <FieldChooser enabled={true} allowSearch={true} height={450} />

        <FieldPanel
          showColumnFields={true}
          showDataFields={true}
          showFilterFields={true}
          showRowFields={true}
          allowFieldDragging={true}
          visible={true}
        />
          
      </PivotGrid>
    </>
  );
};

export default DevExpressComponentPivot;
