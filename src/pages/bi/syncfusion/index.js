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


} from "@syncfusion/ej2-react-pivotview";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { L10n, setCulture, setCurrencyCode, loadCldr } from '@syncfusion/ej2-base';

import * as currencies from './currencies.json';
import * as numbers from './numbers.json';


import 'primeicons/primeicons.css';
import { Button } from "primereact/button";
import { TabView, TabPanel } from 'primereact/tabview';



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

    const chartOnLoad = (args) => {

        let selectedTheme = 'Material';
        args.chart.theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark");
    }

    let fields = { text: 'text', value: 'value' };
    let chartTypes = [
        { 'value': 'Column', 'text': 'Coluna' },
        { 'value': 'Bar', 'text': 'Barra' },
        { 'value': 'Line', 'text': 'Linha' },
        { 'value': 'Spline', 'text': 'Spline' },
        { 'value': 'Area', 'text': 'Area' },
        { 'value': 'SplineArea', 'text': 'SplineArea' },
        { 'value': 'StepLine', 'text': 'StepLine' },
        { 'value': 'StepArea', 'text': 'StepArea' },
        { 'value': 'StackingColumn', 'text': 'StackingColumn' },
        { 'value': 'StackingBar', 'text': 'StackingBar' },
        { 'value': 'StackingArea', 'text': 'StackingArea' },
        { 'value': 'StackingColumn100', 'text': 'StackingColumn100' },
        { 'value': 'StackingBar100', 'text': 'StackingBar100' },
        { 'value': 'StackingArea100', 'text': 'StackingArea100' },
        { 'value': 'Scatter', 'text': 'Scatter' },
        { 'value': 'Bubble', 'text': 'Bolha' },
        { 'value': 'Polar', 'text': 'Polar' },
        { 'value': 'Radar', 'text': 'Radar' },
        { 'value': 'Pareto', 'text': 'Pareto' },
        { 'value': 'Pie', 'text': 'Pizza' },
        { 'value': 'Doughnut', 'text': 'Doughnut' },
        { 'value': 'Funnel', 'text': 'Funil' },
        { 'value': 'Pyramid', 'text': 'Pirâmide' },
    ];

    function ddlOnChange(args) {
        ref.current.chartSettings.chartSeries.type = args.value;
    }



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


                <div className="control-section">

                    <TabView className="tabview-header-icon">
                        <TabPanel header="Tabela" leftIcon="pi pi-table">
                            <div>
                                <Button icon="pi pi-file-excel" className="p-button p-button-rounded p-button-success" style={{ margin: '1em' }} label="Exportar Excel" onClick={() => ref.current.excelExport(excelExportProperties)} />
                                <Button icon="pi pi-file-pdf" className="p-button p-button-rounded p-button-secondary" style={{ margin: '1em' }} label="Exportar PDF" onClick={() => ref.current.pdfExport(pdfExportProperties)} />

                            </div>
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

                                width={'100%'} height={700}


                                displayOption={{ view: 'Table' }} chartSettings={{ title: 'Análise de vendas', chartSeries: { type: "Column" }, load: chartOnLoad.bind() }}
                            >
                                <Inject services={[CalculatedField, FieldList, GroupingBar, Toolbar, VirtualScroll, ExcelExport, PDFExport, PivotChart]} />
                            </PivotViewComponent>


                        </TabPanel>
                        <TabPanel header="Gráficos" rightIcon="pi pi-chart-bar">
                            <div className='col-lg-3 property-section'>

                                <table id='property' title='Properties' className='property-panel-table' style={{ width: '100%' }}>
                                    <tbody>
                                        <tr style={{ height: '50px' }}>
                                            <td>
                                                <div>
                                                    <DropDownListComponent placeholder={'Escolha um gráfico'} floatLabelType={'Auto'} fields={fields} change={ddlOnChange.bind()} id="charttypes" index={0} enabled={true} dataSource={chartTypes} />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>

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
                                showTooltip={true}
                                id="PivotView2"

                                showFieldList={true}

                                gridSettings={gridSettings}
                                groupingBarSettings={groupSettings}
                                dataSourceSettings={dataSourceSettings}
                                allowCalculatedField={true}

                                dataBound={trend.bind()}

                                width={1300}
                                height={480}
                                displayOption={{ view: 'Chart' }} chartSettings={{ title: 'Análise de vendas', chartSeries: { type: "Column" }, load: chartOnLoad.bind() }}
                            >
                                <Inject services={[CalculatedField, FieldList, GroupingBar, Toolbar, VirtualScroll, ExcelExport, PDFExport, PivotChart]} />
                            </PivotViewComponent>

                        </TabPanel>

                    </TabView>


                </div>

            </div>
        </>
    )
}



export default SyncfusionPivot;
