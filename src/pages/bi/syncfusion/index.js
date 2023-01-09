import {
    PivotViewComponent,
    Inject,
    CalculatedField,
    FieldList,
    GroupingBar,
    Toolbar,
    VirtualScroll,
    ExcelExport,
    PDFExport

} from "@syncfusion/ej2-react-pivotview";
import { L10n, setCulture, setCurrencyCode, loadCldr } from '@syncfusion/ej2-base';

import * as currencies from './currencies.json';
import * as numbers from './numbers.json';



import { Button } from "primereact/button";

import "./styless.css";

import ptBR from './ptBR.json'
import { useRef } from "react";



L10n.load(ptBR);

loadCldr(currencies, numbers);

setCulture('pt');
setCurrencyCode('BRL');


const SyncfusionPivot = ({ data }) => {

    const ref = useRef()

    const groupSettings = {

        showFieldsPanel: true,
        showRemoveIcon: false
    }

    const gridSettings = {
        allowAutoResizing: true,
        allowSelection: true,
        selectionSettings: { mode: 'Row', type: 'Multiple', cellSelectionMode: 'Box' },
        columnWidth: 120,
        rowHeight: 60,
    }

    const dataSourceSettings = {
        columns: [],
        dataSource: data,
        excludeFields: ['id', 'codigo', 'promocao', 'dataEmissao', 'codigoFilial'],
        expandAll: false,
        filters: [
            { name: "nomeFilial", caption: "Loja" },
            { name: "promocaoNome", caption: "Nome da promoção" },
        ],

        rows: [
            { name: "grupoPai", caption: 'Seção I', showValueTypeIcon: false },
            { name: "grupoFilho", caption: 'Seção II', showValueTypeIcon: false },
            { name: "grupoNeto", caption: 'Seção III', showValueTypeIcon: false },
            { name: "descricao", caption: 'Produto', showValueTypeIcon: false },
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
            { name: "quantidade", caption: "Quantidade", type: 'Sum' },

            { name: "precounitario", caption: "Preço Médio", type: "Avg" },
            {
                name: "lucrounitario",
                caption: "Lucro Unitário",
                type: "CalculatedField",
            },
            { name: "valorTotal", caption: "Valor Total" },
            { name: "lucrototalrs", caption: "R$ Lucro Total" },
            { name: "lucrototalpercent", caption: "% Lucro Total" },
        ],
        calculatedFieldSettings: [
            {
                name: "lucrounitario",
                formula: '"Avg(precounitario)"-"Avg(precoultimacompra)"',
            },
            {
                name: "lucrototalrs",
                formula: '"Sum(valorTotal)"-"Sum(precoultimacompratotal)"',
            },
            {
                name: "lucrototalpercent",
                formula: ' ("Sum(valorTotal)"-"Sum(precoultimacompratotal)") / "Sum(valorTotal)" ',
            },
        ],
        formatSettings: [
            { name: "quantidade", format: "N2" },
            { name: "lucrounitario", format: "C2" },
            { name: "precounitario", format: "C2" },
            { name: "precoultimacompra", format: "C2" },
            { name: "precoultimacompratotal", format: "C2" },
            { name: 'lucrototalrs', format: 'C2' },
            { name: 'lucrototalpercent', format: 'P2' },
            { name: 'valorTotal', format: 'C2' }
        ],
    };

    return (
        <>
            <div style={{
                backgroundColor: '#f2f2f2'
            }}>

                <div>
                    <Button icon="pi pi-file-excel" className="p-button p-button-rounded p-button-success" style={{ margin: '1em' }} label="Exportar Excel" onClick={() => ref.current.excelExport()} />
                    <Button icon="pi pi-file-pdf" className="p-button p-button-rounded p-button-secondary" style={{ margin: '1em' }} label="Exportar PDF" onClick={() => ref.current.pdfExport()} />

                </div>
                <div>


                    <PivotViewComponent

                        ref={ref}
                        locale='pt'
                        currencyCode="BRL"
                        allowLabelFilter={true}
                        allowValueFilter={true}
                        allowNumberFormatting={true}
                        allowExcelExport={true}
                        allowPdfExport={true}
                        allowDataCompression={false}
                        enableFieldSearching={true}
                        enableValueSorting={true}
                        enableVirtualization={false}
                        showGroupingBar={true}
                        showTooltip={false}
                        id="PivotView"

                        showFieldList={true}
                        height={600}
                        gridSettings={gridSettings}
                        groupingBarSettings={groupSettings}
                        dataSourceSettings={dataSourceSettings}
                        allowCalculatedField={true}


                    >
                        <Inject services={[CalculatedField, FieldList, GroupingBar, Toolbar, VirtualScroll, ExcelExport, PDFExport]} />
                    </PivotViewComponent>
                </div>
            </div>
        </>
    )
}



export default SyncfusionPivot;
