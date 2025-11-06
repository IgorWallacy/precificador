import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { DatePicker } from "antd";
import locale from "antd/es/date-picker/locale/pt_BR";

import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import toast from 'react-hot-toast';
import api from "../../../services/axios";
import moment from "moment";
import Footer from "../../../components/footer";
import "../../../components/prime-react-styles.css";
import "./styles.css";

const RelatorioLiberacoesSupervisor = () => {
  const tabelaRef = useRef(null);
  const { RangePicker } = DatePicker;

  // Estados principais
  const [periodoData, setPeriodoData] = useState(null);
  const [liberacoes, setLiberacoes] = useState([]);
  const [liberacoesAgrupadas, setLiberacoesAgrupadas] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");

  // Debounce da pesquisa
  useEffect(() => {
    const h = setTimeout(() => setDebouncedFilter(globalFilter), 150);
    return () => clearTimeout(h);
  }, [globalFilter]);

  // Função para remover campos indesejados
  const removerCamposIndesejados = useCallback((item) => {
    const { id, ID, Id, tipo_liberacao, TIPO_LIBERACAO, TipoLiberacao, tipoLiberacao, ...rest } = item;
    return rest;
  }, []);

  // Função para formatar data no formato brasileiro com data e hora
  const formatarDataBrasileira = useCallback((data) => {
    if (!data) return '';
    
    // Se já for uma string formatada, tentar parsear
    const dataMoment = moment(data);
    if (dataMoment.isValid()) {
      return dataMoment.format('DD/MM/YYYY HH:mm:ss');
    }
    
    return String(data);
  }, []);

  // Função para processar e formatar dados
  const processarDados = useCallback((dados) => {
    return dados.map(item => {
      const itemProcessado = removerCamposIndesejados(item);
      
      // Processar campos de data
      const camposData = ['data', 'Data', 'DATA', 'dataLiberacao', 'data_liberacao', 
                          'dataCriacao', 'data_criacao', 'dataHora', 'data_hora',
                          'dtLiberacao', 'dt_liberacao', 'createdAt', 'updatedAt'];
      
      camposData.forEach(campo => {
        if (itemProcessado[campo] !== undefined) {
          itemProcessado[campo] = formatarDataBrasileira(itemProcessado[campo]);
        }
      });
      
      return itemProcessado;
    });
  }, [removerCamposIndesejados, formatarDataBrasileira]);

  // Função para agrupar por NUMERO_DOC
  const agruparPorNumeroDoc = useCallback((dados) => {
    const agrupado = {};
    
    dados.forEach(item => {
      // Tentar diferentes variações do campo NUMERO_DOC
      const numeroDoc = item.NUMERO_DOC || item.numero_doc || item.numeroDoc || 
                       item.NUMERO_DOCUMENTO || item.numero_documento || 
                       item.numeroDocumento || item.numerodocumento || 
                       'Sem número';
      
      if (!agrupado[numeroDoc]) {
        agrupado[numeroDoc] = [];
      }
      
      agrupado[numeroDoc].push(item);
    });
    
    return agrupado;
  }, []);

  // Função para buscar liberações
  const buscarLiberacoes = async () => {
    if (!periodoData || !periodoData[0] || !periodoData[1]) {
      toast("Selecione um período válido", { icon: '⚠️', duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      const dataInicial = moment(periodoData[0].$d).format("YYYY-MM-DD");
      const dataFinal = moment(periodoData[1].$d).format("YYYY-MM-DD");

      const response = await api.post('/api/vendas/supervisor/liberadas', {
        startDate: dataInicial,
        endDate: dataFinal
      });

      // Log dos dados recebidos para ver os campos disponíveis
      console.log('🔍 Debug - Dados de liberações:', response.data);
      console.log('🔍 Debug - Tipo de dados:', typeof response.data);
      console.log('🔍 Debug - É array?', Array.isArray(response.data));
      console.log('🔍 Debug - É objeto?', typeof response.data === 'object' && response.data !== null);
      
      // Log detalhado da estrutura
      if (typeof response.data === 'object' && response.data !== null) {
        console.log('🔍 Debug - Chaves do objeto:', Object.keys(response.data));
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('🔍 Debug - Primeiro item do array:', response.data[0]);
          console.log('🔍 Debug - Campos do primeiro item:', Object.keys(response.data[0]));
        } else if (!Array.isArray(response.data)) {
          const primeiraChave = Object.keys(response.data)[0];
          if (primeiraChave) {
            console.log('🔍 Debug - Primeira chave:', primeiraChave);
            console.log('🔍 Debug - Valor da primeira chave:', response.data[primeiraChave]);
            if (Array.isArray(response.data[primeiraChave]) && response.data[primeiraChave].length > 0) {
              console.log('🔍 Debug - Primeiro item do array da primeira chave:', response.data[primeiraChave][0]);
              console.log('🔍 Debug - Campos do primeiro item:', Object.keys(response.data[primeiraChave][0]));
            }
          }
        }
      }

      // O backend retorna Map<String, List<LiberacaoPorSupervisor>>
      // Precisamos transformar isso em um formato utilizável
      let dados = [];
      let agrupado = {};
      
      if (typeof response.data === 'object' && response.data !== null) {
        // Se for um array, usar diretamente
        if (Array.isArray(response.data)) {
          dados = response.data;
        } else {
          // Se for um objeto (Map do backend), transformar em array
          dados = Object.values(response.data).flat();
        }
      } else {
        dados = [];
      }

      // Processar dados: remover campos indesejados e formatar datas
      dados = processarDados(dados);
      
      // Agrupar por NUMERO_DOC
      agrupado = agruparPorNumeroDoc(dados);

      setLiberacoes(Array.isArray(dados) ? dados : []);
      setLiberacoesAgrupadas(agrupado);

      toast.success(`${dados.length} liberações encontradas`, { duration: 3000 });
    } catch (error) {
      console.error('Erro ao buscar liberações:', error);
      toast.error("Erro ao buscar liberações. Tente novamente.", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };



  // Função para formatar moeda
  const formatCurrency = (v) =>
    Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(v || 0);

  // Função para destacar texto da pesquisa
  const highlightText = useCallback((text) => {
    const source = (text ?? "").toString();
    const term = (debouncedFilter ?? "").toString().toLowerCase();
    if (!term) return source;
    const lower = source.toLowerCase();
    let start = 0;
    const parts = [];
    let idx = lower.indexOf(term, start);
    if (idx === -1) return source;
    while (idx !== -1) {
      if (idx > start) parts.push(source.slice(start, idx));
      parts.push(<span key={`${idx}-${term}`} className="hl">{source.slice(idx, idx + term.length)}</span>);
      start = idx + term.length;
      idx = lower.indexOf(term, start);
    }
    if (start < source.length) parts.push(source.slice(start));
    return <>{parts}</>;
  }, [debouncedFilter]);

  // Dados filtrados e agrupados para exibição
  const dadosExibicao = useMemo(() => {
    let dados = [...liberacoes];
    
    // Aplicar filtro de busca global
    if (debouncedFilter) {
      const term = debouncedFilter.toLowerCase();
      dados = dados.filter(item => {
        return Object.values(item).some(val => 
          String(val || '').toLowerCase().includes(term)
        );
      });
    }
    
    return dados;
  }, [liberacoes, debouncedFilter]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = liberacoes.length;
    const grupos = Object.keys(liberacoesAgrupadas).length;
    
    return {
      totalLiberacoes: total,
      totalDocumentos: grupos,
      totalValor: liberacoes.reduce((acc, item) => {
        const valor = parseFloat(item.valor || item.valorTotal || item.valor_total || 0);
        return acc + valor;
      }, 0)
    };
  }, [liberacoes, liberacoesAgrupadas]);

  // Função para exportar para Excel
  const exportarExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Liberações por Supervisor');

      // Obter colunas dos dados processados (sem ID e TIPO_LIBERACAO)
      if (liberacoes.length === 0) {
        toast.error('Não há dados para exportar', { duration: 3000 });
        return;
      }

      const primeiraLinha = liberacoes[0] || {};
      const colunas = Object.keys(primeiraLinha).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        key: key,
        width: 20
      }));

      worksheet.columns = colunas;

      // Adicionar dados
      liberacoes.forEach(item => {
        worksheet.addRow(item);
      });

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Gerar buffer e download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `liberacoes-supervisor-${moment().format('YYYY-MM-DD')}.xlsx`);
      
      toast.success('Exportação realizada com sucesso!', { duration: 3000 });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar para Excel', { duration: 3000 });
    }
  };

  // Função para exportar para PDF
  const exportarPDF = () => {
    try {
      if (liberacoes.length === 0) {
        toast.error('Não há dados para exportar', { duration: 3000 });
        return;
      }

      const doc = new jsPDF();
      
      doc.text('Relatório de Liberações por Supervisor', 14, 15);
      doc.text(`Período: ${periodoData ? moment(periodoData[0].$d).format('DD/MM/YYYY') : ''} até ${periodoData ? moment(periodoData[1].$d).format('DD/MM/YYYY') : ''}`, 14, 22);
      doc.text(`Total: ${liberacoes.length} liberações`, 14, 29);

      // Preparar dados para a tabela (sem ID e TIPO_LIBERACAO)
      const primeiraLinha = liberacoes[0] || {};
      const headers = Object.keys(primeiraLinha);
      
      const tableData = liberacoes.slice(0, 50).map(item => 
        headers.map(header => String(item[header] || ''))
      );

      doc.autoTable({
        head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1'))],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 }
      });

      doc.save(`liberacoes-supervisor-${moment().format('YYYY-MM-DD')}.pdf`);
      toast.success('Exportação PDF realizada com sucesso!', { duration: 3000 });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar para PDF', { duration: 3000 });
    }
  };

  return (
    <div className="page-container">
      <Footer />
      
      <div className="page-card">
        <div className="page-header">
          <h1>Relatório de Liberações por Supervisor</h1>
          <p className="subtitle">Visualize e analise as liberações agrupadas por supervisor e número de documento</p>
        </div>

        {/* KPI Cards */}
        {liberacoes.length > 0 && (
          <div className="metrics-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 16 }}>
            <Card className="metric-card">
              <div className="metric-content" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                <i className="pi pi-users metric-icon"></i>
                <div className="metric-text">
                  <h3>Total Liberações</h3>
                  <span className="metric-value">{estatisticas.totalLiberacoes}</span>
                </div>
              </div>
            </Card>
            <Card className="metric-card">
              <div className="metric-content" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                <i className="pi pi-file metric-icon"></i>
                <div className="metric-text">
                  <h3>Total Documentos</h3>
                  <span className="metric-value">{estatisticas.totalDocumentos}</span>
                </div>
              </div>
            </Card>
            <Card className="metric-card">
              <div className="metric-content" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                <i className="pi pi-dollar metric-icon"></i>
                <div className="metric-text">
                  <h3>Valor Total</h3>
                  <span className="metric-value">{formatCurrency(estatisticas.totalValor)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filtros e controles */}
        <Card className="filtros-card">
          <div className="filtros-row">
            <div className="filtro-item">
              <label>Período:</label>
              <RangePicker
                format="DD/MM/YYYY"
                locale={locale}
                value={periodoData}
                onChange={setPeriodoData}
                style={{ width: '100%' }}
              />
            </div>

            <div className="filtro-item">
              <label>Buscar:</label>
              <input
                type="text"
                className="p-inputtext p-component"
                placeholder="Digite para pesquisar..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="filtro-actions">
              <Button
                label="Buscar"
                icon="pi pi-search"
                onClick={buscarLiberacoes}
                loading={loading}
                className="p-button-primary"
              />
              <Button
                label="Exportar Excel"
                icon="pi pi-file-excel"
                onClick={exportarExcel}
                disabled={liberacoes.length === 0}
                className="p-button-success"
              />
              <Button
                label="Exportar PDF"
                icon="pi pi-file-pdf"
                onClick={exportarPDF}
                disabled={liberacoes.length === 0}
                className="p-button-danger"
              />
            </div>
          </div>
        </Card>

        {/* Tabela de dados */}
        <Card className="dados-card">
          {loading ? (
            <div className="loading-container">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
              <p>Carregando dados...</p>
            </div>
          ) : liberacoes.length === 0 ? (
            <div className="empty-state">
              <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#ccc' }} />
              <p>Nenhuma liberação encontrada. Selecione um período e clique em "Buscar".</p>
            </div>
          ) : (
            <div className="tabela-container">
              <table ref={tabelaRef} className="data-table">
                <thead>
                  <tr>
                    {liberacoes[0] && Object.keys(liberacoes[0]).map((key, index) => (
                      <th key={index}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dadosExibicao.map((item, index) => (
                    <tr key={index}>
                      {Object.keys(liberacoes[0] || {}).map((key, colIndex) => (
                        <td key={colIndex}>
                          {typeof item[key] === 'number'
                            ? (key.toLowerCase().includes('valor') || key.toLowerCase().includes('preco'))
                              ? formatCurrency(item[key])
                              : item[key].toLocaleString('pt-BR')
                            : highlightText(String(item[key] || ''))
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Agrupamento por número de documento */}
        {Object.keys(liberacoesAgrupadas).length > 0 && (
          <Card className="agrupamento-card">
            <h2>Agrupado por NUMERO_DOC</h2>
            {Object.entries(liberacoesAgrupadas).map(([numeroDoc, items]) => (
              <div key={numeroDoc} className="grupo-documento">
                <h3>Documento: {numeroDoc} ({items.length} item{items.length !== 1 ? 's' : ''})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      {items[0] && Object.keys(items[0]).map((key, index) => (
                        <th key={index}>
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        {Object.keys(items[0] || {}).map((key, colIndex) => (
                          <td key={colIndex}>
                            {typeof item[key] === 'number'
                              ? (key.toLowerCase().includes('valor') || key.toLowerCase().includes('preco'))
                                ? formatCurrency(item[key])
                                : item[key].toLocaleString('pt-BR')
                              : highlightText(String(item[key] || ''))
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default RelatorioLiberacoesSupervisor;
