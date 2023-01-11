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


import 'primeicons/primeicons.css';
import { Button } from "primereact/button";


import "./styless.css";

import ptBR from './ptBR.json'

import { useRef } from "react";

import moment from "moment";

L10n.load(ptBR);

loadCldr(currencies, numbers);

setCulture('pt');
setCurrencyCode('BRL');


const SyncfusionPivot = ({ data, date1, date2 }) => {



    const ref = useRef()



    const trend = () => {
        //  ref.current.grid.autoFitColumns();
        // console.log(data)
    }
    const groupSettings = {

        showFieldsPanel: true,
        showRemoveIcon: false
    }

    const gridSettings = {
        allowReordering: true,
        allowAutoResizing: true,
        allowSelection: true,
        allowTextWrap: true,
        selectionSettings: { mode: 'Row', type: 'Multiple', cellSelectionMode: 'Box' },

        columnWidth: 125,
        rowHeight: 45,
        gridLines: 'Both',
        clipMode: 'EllipsisWithTooltip'
    }



    const dataSourceSettings = {
        allowLabelFilter: true,
        allowValueFilter: true,
        enableSorting: true,
        columns: [],
        dataSource: data,
        excludeFields: ['id', 'codigo', 'promocao', 'dataEmissao', 'codigoFilial'],
        expandAll: false,
        filters: [
            { name: "nomeFilial", caption: "Loja" },
            { name: "promocaoNome", caption: "Nome da promoção" },
            { name: "codigo", caption: "Código do produto" },

        ],


        rows: [
            { name: "grupoPai", caption: 'Seção I', showValueTypeIcon: true },
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

    const excelExportProperties = {
        fileName: `anlise_de_custo_x_venda_de_${moment(date1).format('DD_MM_YY')}_a_${moment(date2).format('DD_MM_YY')}.xlsx`
    }

    const pdfExportProperties = {
        fileName: `anlise_de_custo_x_venda_de_${moment(date1).format('DD_MM_YY')}_a_${moment(date2).format('DD_MM_YY')}.pdf`,
        pageOrientation: 'Landscape',
        pageSize: 'Ledger',
        header: {

            fromTop: 0,
            height: 130,

            contents: [
                {
                    type: 'Text',
                    value: ` Análise custo x venda ${moment(date1).format('DD/MM/YY')} a ${moment(date2).format('DD/MM/YY')} `,
                    position: { x: 0, y: 100 },
                    style: { textBrushColor: '#000000', fontSize: 20, dashStyle: 'Solid', hAlign: 'Center' }
                }
            ]
        },
        footer: {
            fromBottom: 160,
            height: 150,
            contents: [
                {
                    type: 'PageNumber',
                    pageNumberType: 'Arabic',
                    format: 'Pag {$current} de {$total}',
                    position: { x: 0, y: 25 },
                    style: { textBrushColor: '#02007a', fontSize: 15 }
                }
            ]
        }
    };

    return (
        <>
            <div style={{
                backgroundColor: '#f2f2f2',
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                flexWrap: "wrap",
                flexDirection: "column",
                // margin: "2rem",
            }}>

                <div>
                    <Button icon="pi pi-file-excel" className="p-button p-button-rounded p-button-success" style={{ margin: '1em' }} label="Exportar Excel" onClick={() => ref.current.excelExport(excelExportProperties)} />
                    <Button icon="pi pi-file-pdf" className="p-button p-button-rounded p-button-secondary" style={{ margin: '1em' }} label="Exportar PDF" onClick={() => ref.current.pdfExport(pdfExportProperties)} />

                </div>
                <div className="control-section">


                    <PivotViewComponent
                        spinnerTemplate={'<div class="custom-texto "> <h1>Calculando vendas, Aguarde por favor </h1> </div>'}
                        ref={ref}
                        locale='pt'
                        currencyCode="BRL"
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
                        enableVirtualization={false}
                        enableSorting={true}
                        showGroupingBar={true}
                        showTooltip={false}
                        id="PivotView"

                        showFieldList={true}

                        gridSettings={gridSettings}
                        groupingBarSettings={groupSettings}
                        dataSourceSettings={dataSourceSettings}
                        allowCalculatedField={true}

                        dataBound={trend.bind()}

                        width={'100%'}
                        height={'700'}

                    >
                        <Inject services={[CalculatedField, FieldList, GroupingBar, Toolbar, VirtualScroll, ExcelExport, PDFExport]} />
                    </PivotViewComponent>
                </div>
            </div>
        </>
    )
}



export default SyncfusionPivot;
