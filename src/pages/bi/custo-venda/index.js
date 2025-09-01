import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { TabView, TabPanel } from 'primereact/tabview';

import { Chart } from 'primereact/chart';
import { addLocale } from 'primereact/api';
import { Player } from '@lottiefiles/react-lottie-player';
import { VirtualScroller } from 'primereact/virtualscroller';
import { Dialog } from 'primereact/dialog';

import api from '../../../services/axios';
import Footer from '../../../components/footer';
import ImagemDestaque from '../../../assets/img/analisando.json';
import moment from 'moment';

import './styles.css';

const CustoVendaBI = () => {
  // Configuração de localização
  addLocale('pt-BR', {
    firstDayOfWeek: 0,
    dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
    dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
    dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ],
    today: 'Hoje',
    clear: 'Limpar'
  });

  // Estados
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date1, setDate1] = useState(null);
  const [date2, setDate2] = useState(null);
  const [modocalculo, setModocalculo] = useState(1);
  const [somenteVendasPdv, setSomenteVendasPdv] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [groupBy, setGroupBy] = useState('none');
  const [expandedRows, setExpandedRows] = useState([]);
  
  // Estados para performance com grandes volumes
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 25,
    page: 0,
    sortField: null,
    sortOrder: null,
    filters: {}
  });
  const [virtualScroll, setVirtualScroll] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const [printDialogVisible, setPrintDialogVisible] = useState(false);
  const [printUrl, setPrintUrl] = useState(null);

  // Estados para impressão por agrupamento
  const [selectedLoja, setSelectedLoja] = useState(null);
  const [selectedSecao1, setSelectedSecao1] = useState(null);
  const [selectedSecao2, setSelectedSecao2] = useState(null);
  const [selectedSecao3, setSelectedSecao3] = useState(null);

  // Refs
  const toast = useRef(null);
  const dt = useRef(null);

  // Opções
  const modocalculoList = [
    { name: 'Preço de compra na venda (Sem impostos)', value: 0 },
    { name: 'Preço de custo na venda (Com impostos)', value: 1 }
  ];

  const opcoesSim = [
    { value: 0, label: 'Não' },
    { value: 1, label: 'Sim' }
  ];

  const opcoesAgrupamento = [
    { name: 'Sem Agrupamento', value: 'none' },
    { name: 'Agrupar por Loja', value: 'loja' },
    { name: 'Agrupar por Seção I', value: 'secao1' },
    { name: 'Agrupar por Seção II', value: 'secao2' },
    { name: 'Agrupar por Seção III', value: 'secao3' }
  ];

  // Dados processados com agrupamento
  const processedData = React.useMemo(() => {
    if (!data.length) return [];

    if (groupBy === 'none') {
      return data;
    }

    // Agrupar dados
    const grouped = data.reduce((acc, item) => {
      let key;
      switch (groupBy) {
        case 'loja':
          key = item.nomeFilial || 'Sem Loja';
          break;
        case 'secao1':
          key = item.grupoPai || 'Sem Seção I';
          break;
        case 'secao2':
          key = item.grupoFilho || 'Sem Seção II';
          break;
        case 'secao3':
          key = item.grupoNeto || 'Sem Seção III';
          break;
        default:
          key = 'Todos';
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    // Converter para array com totalizadores
    return Object.keys(grouped).map(groupKey => {
      const groupItems = grouped[groupKey];
      const totalVendas = groupItems.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
      const totalCusto = groupItems.reduce((sum, item) => sum + (item.precoultimacompratotal || 0), 0);
      const totalQuantidade = groupItems.reduce((sum, item) => sum + (item.quantidade || 0), 0);
      const totalLucro = totalVendas - totalCusto;
      const margemLucro = totalVendas > 0 ? ((totalLucro / totalVendas) * 100) : 0;

      return {
        groupKey,
        groupName: groupKey,
        items: groupItems,
        totals: {
          totalVendas,
          totalCusto,
          totalQuantidade,
          totalLucro,
          margemLucro,
          precoMedio: totalQuantidade > 0 ? totalVendas / totalQuantidade : 0,
          custoMedio: totalQuantidade > 0 ? totalCusto / totalQuantidade : 0
        }
      };
    });
  }, [data, groupBy]);

  // Métricas calculadas
  const metrics = React.useMemo(() => {
    if (!data.length) return {};

    const totalVendas = data.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const totalCusto = data.reduce((sum, item) => sum + (item.precoultimacompratotal || 0), 0);
    const totalLucro = totalVendas - totalCusto;
    const margemLucro = totalVendas > 0 ? ((totalLucro / totalVendas) * 100) : 0;
    const totalQuantidade = data.reduce((sum, item) => sum + (item.quantidade || 0), 0);

    return {
      totalVendas,
      totalCusto,
      totalLucro,
      margemLucro,
      totalQuantidade
    };
  }, [data]);

  // Dados para gráficos
  const chartData = React.useMemo(() => {
    if (!data.length) return null;

    // Agrupar por seção
    const groupedData = data.reduce((acc, item) => {
      const key = item.grupoPai || 'Sem Seção';
      if (!acc[key]) {
        acc[key] = { vendas: 0, custo: 0, quantidade: 0 };
      }
      acc[key].vendas += item.valorTotal || 0;
      acc[key].custo += item.precoultimacompratotal || 0;
      acc[key].quantidade += item.quantidade || 0;
      return acc;
    }, {});

    const labels = Object.keys(groupedData);
    const vendas = labels.map(label => groupedData[label].vendas);
    const custos = labels.map(label => groupedData[label].custo);
    const lucros = labels.map(label => groupedData[label].vendas - groupedData[label].custo);

    return {
      labels,
      datasets: [
        {
          label: 'Vendas',
          data: vendas.map(v => (Number.isFinite(v) ? v : 0)),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Custos',
          data: custos.map(c => (Number.isFinite(c) ? c : 0)),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Lucro',
          data: lucros.map(l => (Number.isFinite(l) ? l : 0)),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  }, [data]);

  const pieChartData = React.useMemo(() => {
    if (!data.length) return null;

    const groupedData = data.reduce((acc, item) => {
      const key = item.grupoPai || 'Sem Seção';
      if (!acc[key]) acc[key] = 0;
      acc[key] += item.valorTotal || 0;
      return acc;
    }, {});

    return {
      labels: Object.keys(groupedData),
      datasets: [{
        data: Object.values(groupedData).map(v => (Number.isFinite(v) ? v : 0)),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
      }]
    };
  }, [data]);

  // Opções dos gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Análise Custo x Venda por Seção'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      },
      title: {
        display: true,
        text: 'Distribuição de Vendas por Seção'
      }
    }
  };

  // Função otimizada para detectar grandes volumes
  const checkDataVolume = useCallback((dataLength) => {
    if (dataLength > 10000) {
      setVirtualScroll(true);
      toast.current.show({
        severity: 'info',
        summary: 'Grande Volume de Dados',
        detail: `${dataLength.toLocaleString('pt-BR')} registros detectados. Ativando modo de alta performance.`,
        life: 5000
      });
    } else {
      setVirtualScroll(false);
    }
  }, []);

  // Buscar dados otimizado
  const getDados = async (lazy = false, params = lazyParams) => {
    if (!date1 || !date2) {
      toast.current.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Por favor, selecione as datas inicial e final.'
      });
      return;
    }

    setLoading(true);
    try {
      let url = `/api_vendas/bi/sync/${moment(date1).format('yyyy-MM-DD')}/${moment(date2).format('yyyy-MM-DD')}/${modocalculo}/${somenteVendasPdv}`;
      
      // Adicionar parâmetros de paginação para lazy loading
      if (lazy && virtualScroll) {
        url += `?page=${params.page}&limit=${params.rows}&offset=${params.first}`;
        if (params.sortField) {
          url += `&sortField=${params.sortField}&sortOrder=${params.sortOrder}`;
        }
      }

      const response = await api.get(url);
      
      if (lazy && virtualScroll) {
        setData(response.data.data || response.data);
        setTotalRecords(response.data.totalRecords || response.data.length);
      } else {
        const fullData = response.data;
        setData(fullData);
        setFilteredData(fullData);
        setTotalRecords(fullData.length);
        checkDataVolume(fullData.length);
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: `Erro ao buscar dados: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Callback para lazy loading
  const onPage = useCallback((event) => {
    const newLazyParams = { ...lazyParams, ...event };
    setLazyParams(newLazyParams);
    if (virtualScroll) {
      getDados(true, newLazyParams);
    }
    // UX: ao trocar de página, rolar para o topo
    try {
      const container = document.querySelector('.table-container') || document.scrollingElement || document.documentElement;
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {}
  }, [lazyParams, virtualScroll]);

  const onSort = useCallback((event) => {
    const newLazyParams = { ...lazyParams, ...event };
    setLazyParams(newLazyParams);
    if (virtualScroll) {
      getDados(true, newLazyParams);
    }
  }, [lazyParams, virtualScroll]);

  const onFilter = useCallback((event) => {
    const newLazyParams = { ...lazyParams, ...event, first: 0 };
    setLazyParams(newLazyParams);
    if (virtualScroll) {
      getDados(true, newLazyParams);
    }
  }, [lazyParams, virtualScroll]);

  // Templates de colunas
  const priceBodyTemplate = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const percentBodyTemplate = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  // Templates para agrupamento
  const rowGroupHeaderTemplate = (data) => {
    // Calcular totais do grupo atual
    const groupValue = groupBy === 'loja' ? data.nomeFilial :
                      groupBy === 'secao1' ? data.grupoPai :
                      groupBy === 'secao2' ? data.grupoFilho :
                      groupBy === 'secao3' ? data.grupoNeto : '';

    // Filtrar dados do grupo atual
    const groupData = processedData.find(group => group.groupKey === groupValue);
    
    if (!groupData) return null;

    return (
      <div className="group-header">
        <span className="group-title">{groupValue}</span>
        <div className="group-totals">
          <span className="group-total-item">
            <strong>Vendas:</strong> {priceBodyTemplate(groupData.totals.totalVendas)}
          </span>
          <span className="group-total-item">
            <strong>Custos:</strong> {priceBodyTemplate(groupData.totals.totalCusto)}
          </span>
          <span className="group-total-item">
            <strong>Lucro:</strong> {priceBodyTemplate(groupData.totals.totalLucro)}
          </span>
          <span className="group-total-item">
            <strong>Margem:</strong> {percentBodyTemplate(groupData.totals.margemLucro)}
          </span>
          <span className="group-total-item">
            <strong>Qtd:</strong> {groupData.totals.totalQuantidade.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    );
  };

  const rowGroupFooterTemplate = (data) => {
    const groupValue = groupBy === 'loja' ? data.nomeFilial :
                      groupBy === 'secao1' ? data.grupoPai :
                      groupBy === 'secao2' ? data.grupoFilho :
                      groupBy === 'secao3' ? data.grupoNeto : '';

    const groupData = processedData.find(group => group.groupKey === groupValue);
    
    if (!groupData) return null;

    return (
      <div className="group-footer">
        <span>Subtotal do Grupo: {priceBodyTemplate(groupData.totals.totalVendas)}</span>
      </div>
    );
  };

  // Template para footer total
  const footerTemplate = () => {
    return (
      <div className="total-footer">
        <div className="footer-content">
          <span><strong>TOTAL GERAL:</strong></span>
          <span><strong>Vendas:</strong> {priceBodyTemplate(metrics.totalVendas)}</span>
          <span><strong>Custos:</strong> {priceBodyTemplate(metrics.totalCusto)}</span>
          <span><strong>Lucro:</strong> {priceBodyTemplate(metrics.totalLucro)}</span>
          <span><strong>Margem:</strong> {percentBodyTemplate(metrics.margemLucro)}</span>
          <span><strong>Quantidade:</strong> {metrics.totalQuantidade?.toLocaleString('pt-BR')}</span>
        </div>
      </div>
    );
  };

  // Exportação Excel formatada com progressão
  const exportFormattedExcel = async () => {
    if (!data || data.length === 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Não há dados para exportar. Execute uma análise primeiro.'
      });
      return;
    }

    setExportLoading(true);
    setExportProgress(0);

    try {
      // Importar ExcelJS dinamicamente
      let ExcelJS;
      try {
        ExcelJS = await import('exceljs');
      } catch (excelError) {
        throw new Error(`Erro ao importar ExcelJS: ${excelError.message}`);
      }
      
      if (!ExcelJS || !ExcelJS.Workbook) {
        throw new Error('ExcelJS não foi carregado corretamente');
      }
      
      const workbook = new ExcelJS.Workbook();
      
      // Configurações do workbook
      workbook.creator = 'Sistema BI';
      workbook.lastModifiedBy = 'Sistema BI';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Análise Custo x Venda');
      
      // Cabeçalho principal
      worksheet.mergeCells('A1:L1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `Análise de Custo x Venda - ${moment(date1).format('DD/MM/YYYY')} a ${moment(date2).format('DD/MM/YYYY')}`;
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '667eea' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Cabeçalhos das colunas
      const headers = ['Loja', 'Seção I', 'Seção II', 'Seção III', 'Produto', 'Qtd', 'Preço Médio', 'Custo Médio', 'Total Vendido', 'Custo Total', 'Lucro Total', 'Margem %'];
      worksheet.addRow(headers);
      
      const headerRow = worksheet.getRow(2);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
      
      // Dados com formatação
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const margem = item.valorTotal > 0 ? (((item.valorTotal - item.precoultimacompratotal) / item.valorTotal) * 100) : 0;
        
        const row = worksheet.addRow([
          item.nomeFilial || '',
          item.grupoPai || '',
          item.grupoFilho || '',
          item.grupoNeto || '',
          item.descricao || '',
          item.quantidade || 0,
          item.precounitario || 0,
          item.precoultimacompra || 0,
          item.valorTotal || 0,
          item.precoultimacompratotal || 0,
          (item.valorTotal || 0) - (item.precoultimacompratotal || 0),
          margem / 100
        ]);

        // Formatação de números
        row.getCell(6).numFmt = '#,##0';
        row.getCell(7).numFmt = 'R$ #,##0.00';
        row.getCell(8).numFmt = 'R$ #,##0.00';
        row.getCell(9).numFmt = 'R$ #,##0.00';
        row.getCell(10).numFmt = 'R$ #,##0.00';
        row.getCell(11).numFmt = 'R$ #,##0.00';
        row.getCell(12).numFmt = '0.00%';

        // Zebra striping
        if (i % 2 === 0) {
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8F9FA' } };
        }

        // Progresso
        if (i % 1000 === 0) {
          setExportProgress((i / data.length) * 90);
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      // Auto-width das colunas
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Gerar arquivo
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `analise_custo_venda_${moment(date1).format('DD_MM_YYYY')}_${moment(date2).format('DD_MM_YYYY')}.xlsx`;
      
      try {
        // Tentar usar file-saver primeiro
        const { saveAs } = await import('file-saver');
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);
      } catch (fileSaverError) {
        // Fallback para método nativo do navegador
        console.warn('FileSaver falhou, usando método nativo:', fileSaverError);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setExportProgress(100);
      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Arquivo Excel exportado com sucesso!'
      });

    } catch (error) {
      console.error('Erro detalhado na exportação:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: `Erro ao exportar Excel: ${error.message}`
      });
    } finally {
      setExportLoading(false);
      setExportProgress(0);
    }
  };

  // Função para impressão PDF usando HTML nativo
  const generatePrintContent = (type = 'all', filterValue = '') => {
    let limitedData = data;

    if (type === 'loja') {
      limitedData = data.filter(item => item.nomeFilial === filterValue);
    } else if (type === 'secao1') {
      limitedData = data.filter(item => item.grupoPai === filterValue);
    } else if (type === 'secao2') {
      limitedData = data.filter(item => item.grupoFilho === filterValue);
    } else if (type === 'secao3') {
      limitedData = data.filter(item => item.grupoNeto === filterValue);
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Análise de Custo x Venda</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; padding: 20px; background: #667eea; color: white; }
            .header h1 { font-size: 18px; margin-bottom: 10px; }
            .metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
            .metric { background: #f8f9fa; padding: 10px; text-align: center; border-radius: 5px; }
            .metric-title { font-weight: bold; color: #6c757d; font-size: 10px; }
            .metric-value { font-size: 14px; font-weight: bold; color: #2c3e50; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            .table th { background: #4472C4; color: white; font-weight: bold; }
            .table tbody tr:nth-child(even) { background: #f8f9fa; }
            @page { margin: 1cm; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Análise de Custo x Venda</h1>
            <p>Período: ${moment(date1).format('DD/MM/YYYY')} a ${moment(date2).format('DD/MM/YYYY')}</p>
            <p>Tipo de Impressão: ${type === 'all' ? 'Todos os Dados' : type === 'loja' ? `Dados da Loja: ${filterValue}` : type === 'secao1' ? `Dados da Seção I: ${filterValue}` : type === 'secao2' ? `Dados da Subseção II: ${filterValue}` : `Dados da Categoria: ${filterValue}`}</p>
          </div>

          <div class="metrics">
            <div class="metric">
              <div class="metric-title">Total Vendas</div>
              <div class="metric-value">${priceBodyTemplate(metrics.totalVendas)}</div>
            </div>
            <div class="metric">
              <div class="metric-title">Total Custos</div>
              <div class="metric-value">${priceBodyTemplate(metrics.totalCusto)}</div>
            </div>
            <div class="metric">
              <div class="metric-title">Lucro Total</div>
              <div class="metric-value">${priceBodyTemplate(metrics.totalLucro)}</div>
            </div>
            <div class="metric">
              <div class="metric-title">Margem</div>
              <div class="metric-value">${percentBodyTemplate(metrics.margemLucro)}</div>
            </div>
            <div class="metric">
              <div class="metric-title">Quantidade</div>
              <div class="metric-value">${metrics.totalQuantidade?.toLocaleString('pt-BR')}</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Seção I</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Total Vendido</th>
                <th>Custo Total</th>
                <th>Lucro</th>
                <th>Margem %</th>
              </tr>
            </thead>
            <tbody>
              ${limitedData.map(item => {
                const lucro = (item.valorTotal || 0) - (item.precoultimacompratotal || 0);
                const margem = item.valorTotal > 0 ? (lucro / item.valorTotal) * 100 : 0;
                return `
                  <tr>
                    <td>${item.nomeFilial || ''}</td>
                    <td>${item.grupoPai || ''}</td>
                    <td>${item.descricao || ''}</td>
                    <td>${(item.quantidade || 0).toLocaleString('pt-BR')}</td>
                    <td>${priceBodyTemplate(item.valorTotal)}</td>
                    <td>${priceBodyTemplate(item.precoultimacompratotal)}</td>
                    <td>${priceBodyTemplate(lucro)}</td>
                    <td>${percentBodyTemplate(margem)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          ${data.length > 500 ? `<p style="text-align: center; color: #6c757d;">Mostrando os primeiros 500 registros de ${data.length.toLocaleString('pt-BR')} total.</p>` : ''}
        </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPrintUrl(url);
    setPrintDialogVisible(true);
  };

  const renderFilters = () => (
    <div className="filters-container">
      <div className="filter-row">
        <div className="filter-group">
          <label>Data Inicial</label>
          <Calendar
            value={date1}
            onChange={(e) => setDate1(e.value)}
            locale="pt-BR"
            dateFormat="dd/mm/yy"
            showButtonBar
            selectOtherMonths
          />
        </div>

        <div className="filter-group">
          <label>Data Final</label>
          <Calendar
            value={date2}
            onChange={(e) => setDate2(e.value)}
            locale="pt-BR"
            dateFormat="dd/mm/yy"
            showButtonBar
            selectOtherMonths
          />
        </div>

        <div className="filter-group">
          <label>Modo de Cálculo de Custo</label>
          <Dropdown
            value={modocalculo}
            onChange={(e) => setModocalculo(e.value)}
            options={modocalculoList}
            optionLabel="name"
            optionValue="value"
            placeholder="Selecione o modo"
          />
        </div>

        <div className="filter-group">
          <label>Somente Vendas PDV?</label>
          <SelectButton
            value={somenteVendasPdv}
            onChange={(e) => setSomenteVendasPdv(e.value)}
            options={opcoesSim}
          />
        </div>

        <div className="filter-group">
          <label>Agrupar Dados</label>
          <Dropdown
            value={groupBy}
            onChange={(e) => setGroupBy(e.value)}
            options={opcoesAgrupamento}
            optionLabel="name"
            optionValue="value"
            placeholder="Selecione o agrupamento"
          />
        </div>

        <div className="filter-group">
          <Button
            label="Analisar"
            icon="pi pi-search"
            onClick={getDados}
            loading={loading}
            className="p-button-success"
          />
        </div>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="metrics-container">
      <Card className="metric-card">
        <div className="metric-content">
          <i className="pi pi-dollar metric-icon"></i>
          <div className="metric-text">
            <h3>Total de Vendas</h3>
            <span className="metric-value">{priceBodyTemplate(metrics.totalVendas)}</span>
          </div>
        </div>
      </Card>

      <Card className="metric-card">
        <div className="metric-content">
          <i className="pi pi-shopping-cart metric-icon"></i>
          <div className="metric-text">
            <h3>Total de Custos</h3>
            <span className="metric-value">{priceBodyTemplate(metrics.totalCusto)}</span>
          </div>
        </div>
      </Card>

      <Card className="metric-card">
        <div className="metric-content">
          <i className="pi pi-chart-line metric-icon"></i>
          <div className="metric-text">
            <h3>Lucro Total</h3>
            <span className="metric-value">{priceBodyTemplate(metrics.totalLucro)}</span>
          </div>
        </div>
      </Card>

      <Card className="metric-card">
        <div className="metric-content">
          <i className="pi pi-percentage metric-icon"></i>
          <div className="metric-text">
            <h3>Margem de Lucro</h3>
            <span className="metric-value">{percentBodyTemplate(metrics.margemLucro)}</span>
          </div>
        </div>
      </Card>

      <Card className="metric-card">
        <div className="metric-content">
          <i className="pi pi-box metric-icon"></i>
          <div className="metric-text">
            <h3>Quantidade Total</h3>
            <span className="metric-value">{metrics.totalQuantidade?.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <>
        <Toast ref={toast} position="top-center" />
        <Footer />
        <div className="loading-container">
          <div className="loading-content">
            <h1>Buscando dados, aguarde por favor</h1>
            <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
            <Player src={ImagemDestaque} loop autoplay style={{ width: '350px' }} />
          </div>
        </div>
      </>
    );
  }

  if (!data.length) {
    return (
      <>
        <Toast ref={toast} position="top-center" />
        <Footer />
        <div className="bi-container">
          <div className="bi-header">
            <h1>Análise de Custo x Venda</h1>
            <p>Business Intelligence - Análise de Rentabilidade</p>
          </div>
          {renderFilters()}
        </div>
      </>
    );
  }

  return (
    <>
      <Toast ref={toast} position="top-center" />
      <Footer />
      
      <div className="bi-container">
        <div className="bi-header">
          <div className="header-content">
            <h1>Análise de Custo x Venda</h1>
            <p>
              Exibindo custo {modocalculo === 0 ? 'pela compra (SEM IMPOSTOS)' : 'pelo preço de aquisição (COM IMPOSTOS)'} 
              {' '}- {somenteVendasPdv ? 'Somente vendas PDV' : 'Todas as vendas'}
              {' '}- Período: {moment(date1).format('DD/MM/YYYY')} a {moment(date2).format('DD/MM/YYYY')}
            </p>
          </div>
          <div className="header-actions">
            <Button
              icon="pi pi-file-excel"
              label="Exportar Excel Formatado"
              className="p-button-success p-button-outlined"
              onClick={exportFormattedExcel}
              loading={exportLoading}
              disabled={!data.length || exportLoading}
            />
            <Button
              icon="pi pi-print"
              label="Imprimir PDF"
              className="p-button-secondary p-button-outlined"
              onClick={() => generatePrintContent('all', '')}
              disabled={!data.length}
            />
            <Button
              icon="pi pi-refresh"
              label="Nova Análise"
              className="p-button-info p-button-outlined"
              onClick={() => setData([])}
            />
          </div>
        </div>

        {renderMetrics()}

        {/* Botões de Impressão por Agrupamento */}
        {data.length > 0 && (
          <Card className="print-options-card">
            <div className="print-options-header">
              <h3><i className="pi pi-print" style={{ marginRight: '8px' }}></i>
                Opções de Impressão por Agrupamento
              </h3>
              <p>Imprima relatórios específicos por seção ou loja</p>
            </div>
            
            <div className="print-options-content">
              {/* Impressão Geral */}
              <div className="print-option-group">
                <h4>Impressão Geral</h4>
                <div className="print-buttons">
                  <Button
                    icon="pi pi-print"
                    label="Imprimir Tudo"
                    className="p-button-primary p-button-sm"
                    onClick={() => generatePrintContent('all', '')}
                    tooltip="Imprimir todos os dados"
                  />
                  {groupBy !== 'none' && (
                    <Button
                      icon="pi pi-print"
                      label="Imprimir Agrupado"
                      className="p-button-info p-button-sm"
                      onClick={() => generatePrintContent('all', 'grouped')}
                      tooltip="Imprimir dados organizados por grupos"
                    />
                  )}
                </div>
              </div>

              {/* Impressão por Loja com Dropdown */}
              {data.some(item => item.nomeFilial) && (
                <div className="print-option-group">
                  <h4>Impressão por Loja</h4>
                  <div className="print-selection-container">
                    <Dropdown
                      value={selectedLoja}
                      onChange={(e) => setSelectedLoja(e.value)}
                      options={Array.from(new Set(data.map(item => item.nomeFilial).filter(Boolean)))
                        .sort()
                        .map(loja => ({ name: loja, value: loja }))}
                      optionLabel="name"
                      optionValue="value"
                      placeholder="Selecione uma loja"
                      className="print-dropdown"
                      showClear
                    />
                    <Button
                      icon="pi pi-print"
                      label="Imprimir Loja Selecionada"
                      className="p-button-secondary p-button-sm"
                      onClick={() => selectedLoja && generatePrintContent('loja', selectedLoja)}
                      disabled={!selectedLoja}
                      tooltip="Imprimir dados da loja selecionada"
                    />
                  </div>
                </div>
              )}

              {/* Impressão por Seção I com Dropdown */}
              {data.some(item => item.grupoPai) && (
                <div className="print-option-group">
                  <h4>Impressão por Seção I</h4>
                  <div className="print-selection-container">
                    <Dropdown
                      value={selectedSecao1}
                      onChange={(e) => setSelectedSecao1(e.value)}
                      options={Array.from(new Set(data.map(item => item.grupoPai).filter(Boolean)))
                        .sort()
                        .map(secao => ({ name: secao, value: secao }))}
                      optionLabel="name"
                      optionValue="value"
                      placeholder="Selecione uma seção"
                      className="print-dropdown"
                      showClear
                      filter
                      filterPlaceholder="Buscar seção..."
                    />
                    <Button
                      icon="pi pi-print"
                      label="Imprimir Seção Selecionada"
                      className="p-button-warning p-button-sm"
                      onClick={() => selectedSecao1 && generatePrintContent('secao1', selectedSecao1)}
                      disabled={!selectedSecao1}
                      tooltip="Imprimir dados da seção selecionada"
                    />
                  </div>
                </div>
              )}

              {/* Impressão por Seção II com Dropdown */}
              {data.some(item => item.grupoFilho) && (
                <div className="print-option-group">
                  <h4>Impressão por Seção II</h4>
                  <div className="print-selection-container">
                    <Dropdown
                      value={selectedSecao2}
                      onChange={(e) => setSelectedSecao2(e.value)}
                      options={Array.from(new Set(data.map(item => item.grupoFilho).filter(Boolean)))
                        .sort()
                        .map(secao => ({ name: secao, value: secao }))}
                      optionLabel="name"
                      optionValue="value"
                      placeholder="Selecione uma subseção"
                      className="print-dropdown"
                      showClear
                      filter
                      filterPlaceholder="Buscar subseção..."
                    />
                    <Button
                      icon="pi pi-print"
                      label="Imprimir Subseção Selecionada"
                      className="p-button-help p-button-sm"
                      onClick={() => selectedSecao2 && generatePrintContent('secao2', selectedSecao2)}
                      disabled={!selectedSecao2}
                      tooltip="Imprimir dados da subseção selecionada"
                    />
                  </div>
                </div>
              )}

              {/* Impressão por Seção III com Dropdown */}
              {data.some(item => item.grupoNeto) && (
                <div className="print-option-group">
                  <h4>Impressão por Seção III</h4>
                  <div className="print-selection-container">
                    <Dropdown
                      value={selectedSecao3}
                      onChange={(e) => setSelectedSecao3(e.value)}
                      options={Array.from(new Set(data.map(item => item.grupoNeto).filter(Boolean)))
                        .sort()
                        .map(secao => ({ name: secao, value: secao }))}
                      optionLabel="name"
                      optionValue="value"
                      placeholder="Selecione uma categoria"
                      className="print-dropdown"
                      showClear
                      filter
                      filterPlaceholder="Buscar categoria..."
                    />
                    <Button
                      icon="pi pi-print"
                      label="Imprimir Categoria Selecionada"
                      className="p-button-success p-button-sm"
                      onClick={() => selectedSecao3 && generatePrintContent('secao3', selectedSecao3)}
                      disabled={!selectedSecao3}
                      tooltip="Imprimir dados da categoria selecionada"
                    />
                  </div>
                </div>
              )}

              {/* Impressão Rápida - Botões para seções mais comuns */}
              <div className="print-option-group">
                <h4>Impressão Rápida - Seções Mais Comuns</h4>
                <div className="print-buttons">
                  {Array.from(new Set(data.map(item => item.grupoPai).filter(Boolean)))
                    .sort()
                    .slice(0, 6)
                    .map(secao => (
                      <Button
                        key={secao}
                        icon="pi pi-print"
                        label={secao}
                        className="p-button-outlined p-button-sm"
                        onClick={() => generatePrintContent('secao1', secao)}
                        tooltip={`Imprimir dados da seção ${secao}`}
                      />
                    ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Indicador de progresso da exportação */}
        {exportLoading && (
          <Card className="export-progress-card">
            <div className="export-progress-content">
              <div className="export-progress-header">
                <i className="pi pi-file-excel" style={{ fontSize: '1.5rem', color: '#28a745' }}></i>
                <span style={{ marginLeft: '10px', fontWeight: '600' }}>
                  Exportando dados para Excel...
                </span>
              </div>
              <ProgressBar 
                value={exportProgress} 
                displayValueTemplate={(value) => `${value}% - Processando ${data.length.toLocaleString('pt-BR')} registros`}
                style={{ marginTop: '10px' }}
              />
            </div>
          </Card>
        )}

        {/* Aviso para grandes volumes */}
        {virtualScroll && (
          <Card className="performance-warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="pi pi-info-circle" style={{ fontSize: '1.2rem', color: '#17a2b8' }}></i>
              <div>
                <strong>Modo de Alta Performance Ativado</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#6c757d' }}>
                  {totalRecords.toLocaleString('pt-BR')} registros detectados. 
                  Usando carregamento lazy e virtualização para melhor performance.
                </p>
              </div>
            </div>
          </Card>
        )}

        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Visão Geral" leftIcon="pi pi-chart-bar">
            <div className="charts-container">
              <div className="chart-wrapper">
                <h3>Comparativo por Seção</h3>
                {chartData && (
                  <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '400px' }} />
                )}
              </div>
              
              <div className="chart-wrapper">
                <h3>Distribuição de Vendas</h3>
                {pieChartData && (
                  <Chart type="pie" data={pieChartData} options={pieOptions} style={{ height: '400px' }} />
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Dados Detalhados" leftIcon="pi pi-table">
            <div className="table-container">
              <div className="table-toolbar">
                <div className="toolbar-left">
                  <Button 
                    icon="pi pi-file-excel" 
                    label="Exportar Formatado"
                    className="p-button-success p-button-sm"
                    onClick={exportFormattedExcel}
                    loading={exportLoading}
                    disabled={exportLoading}
                  />
                  <Button 
                    icon="pi pi-print" 
                    label="Imprimir"
                    className="p-button-secondary p-button-sm"
                    onClick={() => generatePrintContent('all', '')}
                  />
                </div>
                <div className="toolbar-right">
                  {virtualScroll && (
                    <span className="records-info">
                      {totalRecords.toLocaleString('pt-BR')} registros total
                    </span>
                  )}
                  <span className="p-input-icon-left global-search">
                    <i className="pi pi-search" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="p-inputtext p-component"
                    />
                  </span>
                </div>
              </div>

              {/* Renderização condicional baseada no agrupamento */}
              {groupBy === 'none' ? (
                // Tabela sem agrupamento
                <DataTable
                  ref={dt}
                  value={data}
                  selection={selectedRows}
                  onSelectionChange={(e) => setSelectedRows(e.value)}
                  globalFilter={globalFilter}
                  lazy={virtualScroll}
                  paginator
                  rows={virtualScroll ? lazyParams.rows : 25}
                  totalRecords={virtualScroll ? totalRecords : data.length}
                  onPage={virtualScroll ? onPage : undefined}
                  onSort={virtualScroll ? onSort : undefined}
                  onFilter={virtualScroll ? onFilter : undefined}
                  loading={loading}
                  rowsPerPageOptions={virtualScroll ? [25, 50, 100, 250] : [10, 25, 50, 100]}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                  responsiveLayout="scroll"
                  stripedRows
                  className={`bi-datatable ${virtualScroll ? 'virtual-scroll' : ''}`}
                  sortMode="multiple"
                  removableSort
                  scrollable={virtualScroll}
                  scrollHeight={virtualScroll ? "600px" : undefined}
                  virtualScrollerOptions={virtualScroll ? {
                    itemSize: 50,
                    delay: 250,
                    showLoader: true,
                    loading: loading,
                    lazy: true
                  } : undefined}
                  footer={footerTemplate}
                >
                  <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                  <Column field="nomeFilial" header="Loja" sortable filter />
                  <Column field="grupoPai" header="Seção I" sortable filter />
                  <Column field="grupoFilho" header="Seção II" sortable filter />
                  <Column field="grupoNeto" header="Seção III" sortable filter />
                  <Column field="descricao" header="Produto" sortable filter />
                  <Column 
                    field="quantidade" 
                    header="Qtd" 
                    sortable 
                    body={(rowData) => rowData.quantidade?.toLocaleString('pt-BR')}
                  />
                  <Column 
                    field="precounitario" 
                    header="Preço Médio" 
                    sortable 
                    body={(rowData) => priceBodyTemplate(rowData.precounitario)}
                  />
                  <Column 
                    field="precoultimacompra" 
                    header="Custo Médio" 
                    sortable 
                    body={(rowData) => priceBodyTemplate(rowData.precoultimacompra)}
                  />
                  <Column 
                    field="valorTotal" 
                    header="Total Vendido" 
                    sortable 
                    body={(rowData) => priceBodyTemplate(rowData.valorTotal)}
                  />
                  <Column 
                    field="precoultimacompratotal" 
                    header="Custo Total" 
                    sortable 
                    body={(rowData) => priceBodyTemplate(rowData.precoultimacompratotal)}
                  />
                  <Column 
                    header="Lucro Total" 
                    sortable 
                    body={(rowData) => priceBodyTemplate((rowData.valorTotal || 0) - (rowData.precoultimacompratotal || 0))}
                  />
                  <Column 
                    header="Margem %" 
                    sortable 
                    body={(rowData) => {
                      const margem = rowData.valorTotal > 0 ? 
                        (((rowData.valorTotal - rowData.precoultimacompratotal) / rowData.valorTotal) * 100) : 0;
                      return percentBodyTemplate(margem);
                    }}
                  />
                </DataTable>
              ) : (
                // Renderização manual de grupos
                <div className="grouped-data-container">
                  {processedData.map((group, index) => (
                    <div key={index} className="group-section">
                      {/* Cabeçalho do grupo */}
                      <div className="group-header">
                        <span className="group-title">{group.groupName}</span>
                        <div className="group-totals">
                          <span className="group-total-item">
                            <strong>Vendas:</strong> {priceBodyTemplate(group.totals.totalVendas)}
                          </span>
                          <span className="group-total-item">
                            <strong>Custos:</strong> {priceBodyTemplate(group.totals.totalCusto)}
                          </span>
                          <span className="group-total-item">
                            <strong>Lucro:</strong> {priceBodyTemplate(group.totals.totalLucro)}
                          </span>
                          <span className="group-total-item">
                            <strong>Margem:</strong> {percentBodyTemplate(group.totals.margemLucro)}
                          </span>
                          <span className="group-total-item">
                            <strong>Qtd:</strong> {group.totals.totalQuantidade.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Tabela do grupo */}
                      <DataTable
                        value={group.items}
                        responsiveLayout="scroll"
                        stripedRows
                        className="bi-datatable group-table"
                        sortMode="multiple"
                        removableSort
                        globalFilter={globalFilter}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                      >
                        <Column field="nomeFilial" header="Loja" sortable filter />
                        <Column field="grupoPai" header="Seção I" sortable filter />
                        <Column field="grupoFilho" header="Seção II" sortable filter />
                        <Column field="grupoNeto" header="Seção III" sortable filter />
                        <Column field="descricao" header="Produto" sortable filter />
                        <Column 
                          field="quantidade" 
                          header="Qtd" 
                          sortable 
                          body={(rowData) => rowData.quantidade?.toLocaleString('pt-BR')}
                        />
                        <Column 
                          field="precounitario" 
                          header="Preço Médio" 
                          sortable 
                          body={(rowData) => priceBodyTemplate(rowData.precounitario)}
                        />
                        <Column 
                          field="precoultimacompra" 
                          header="Custo Médio" 
                          sortable 
                          body={(rowData) => priceBodyTemplate(rowData.precoultimacompra)}
                        />
                        <Column 
                          field="valorTotal" 
                          header="Total Vendido" 
                          sortable 
                          body={(rowData) => priceBodyTemplate(rowData.valorTotal)}
                        />
                        <Column 
                          field="precoultimacompratotal" 
                          header="Custo Total" 
                          sortable 
                          body={(rowData) => priceBodyTemplate(rowData.precoultimacompratotal)}
                        />
                        <Column 
                          header="Lucro Total" 
                          sortable 
                          body={(rowData) => priceBodyTemplate((rowData.valorTotal || 0) - (rowData.precoultimacompratotal || 0))}
                        />
                        <Column 
                          header="Margem %" 
                          sortable 
                          body={(rowData) => {
                            const margem = rowData.valorTotal > 0 ? 
                              (((rowData.valorTotal - rowData.precoultimacompratotal) / rowData.valorTotal) * 100) : 0;
                            return percentBodyTemplate(margem);
                          }}
                        />
                      </DataTable>

                      {/* Rodapé do grupo */}
                      <div className="group-footer">
                        <span>Subtotal do Grupo: {priceBodyTemplate(group.totals.totalVendas)}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Footer total para grupos */}
                  {footerTemplate()}
                </div>
              )}
            </div>
          </TabPanel>
        </TabView>
      </div>

      <Dialog
        header="Visualizar impressão"
        visible={printDialogVisible}
        style={{ width: "85vw", maxWidth: "1100px" }}
        onHide={() => { setPrintDialogVisible(false); if (printUrl) { URL.revokeObjectURL(printUrl); setPrintUrl(null);} }}
        maximizable
      >
        {printUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button icon="pi pi-print" label="Imprimir" className="p-button-sm" onClick={() => {
                const iframe = document.getElementById('bi-print-iframe');
                if (iframe && iframe.contentWindow) iframe.contentWindow.print();
              }} />
              <Button icon="pi pi-download" label="Baixar HTML" className="p-button-sm p-button-secondary" onClick={() => {
                const a = document.createElement('a');
                a.href = printUrl; a.download = `analise_custo_venda_${moment(date1).format('YYYYMMDD')}_${moment(date2).format('YYYYMMDD')}.html`; a.click();
              }} />
            </div>
            <iframe id="bi-print-iframe" title="Impressão" src={printUrl} style={{ width: "100%", height: "75vh", border: 0 }} />
          </div>
        ) : null}
      </Dialog>
    </>
  );
};

export default CustoVendaBI;
