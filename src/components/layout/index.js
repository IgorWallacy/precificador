import React, { useState, useEffect } from "react";
import "./styles.css";
import SmartMenu from "../smart-menu";
import Sidebar from "../sidebar";
import Logo from "../../assets/img/logo_jj.png";
import api from "../../services/axios";
import moment from "moment";
import NewsMetricsDialog from "../NewsMetricsDialog";
import TabBar from "../tab-bar";
import TabContent from "../tab-content";
import TabSync from "../tab-sync";
import TabShortcutsInfo from "../tab-shortcuts-info";


const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [displayModeStandalone, setDisplayModeStandalone] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    // iOS detection via standalone
    const mm = window.matchMedia && window.matchMedia('(display-mode: standalone)');
    const applyDM = () => setDisplayModeStandalone(!!(mm && mm.matches) || !!window.navigator.standalone);
    applyDM();
    mm && mm.addEventListener && mm.addEventListener('change', applyDM);
    if (applyDM()) setIsInstalled(true);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mm && mm.removeEventListener && mm.removeEventListener('change', applyDM);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      alert('Para instalar no desktop: clique no ícone de instalar da barra do navegador (Chrome/Edge) ou use o menu do navegador. Em iOS, use "Adicionar à Tela de Início". Em produção, este botão ficará ativo automaticamente.');
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (_) {}
  };

  if (isInstalled || displayModeStandalone) return null;

  return (
    <button
      className="p-button p-button-rounded p-button-text"
      onClick={install}
      disabled={false}
      title="Instalar aplicativo"
      style={{ marginRight: '8px' }}
    >
      <i className="pi pi-download" style={{ marginRight: 6 }} /> Instalar app
    </button>
  );
};

const Layout = ({ children }) => {
  const [newsMetrics, setNewsMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [globalCtxMenu, setGlobalCtxMenu] = useState({ visible: false, x: 0, y: 0 });

  // Função para formatar números no padrão brasileiro
  const formatarNumeroBR = (numero, casasDecimais = 2) => {
    if (typeof numero !== 'number' || isNaN(numero)) return '0,00';
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: casasDecimais,
      maximumFractionDigits: casasDecimais
    });
  };

  // Função para formatar porcentagem no padrão brasileiro
  const formatarPorcentagemBR = (numero) => {
    if (typeof numero !== 'number' || isNaN(numero)) return '0,00%';
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  };

  // Função para determinar tendência baseada no tipo de métrica
  const determinarTendencia = (valor, tipo, variacao) => {
    if (tipo === 'cancelamento' || tipo === 'cancelamentos') {
      return valor > 0 ? 'down' : 'neutral';
    }

    if (typeof variacao === 'number') {
      return variacao > 0 ? 'up' : variacao < 0 ? 'down' : 'neutral';
    }

    return valor > 0 ? 'up' : 'neutral';
  };

  // Função para gerenciar cache de dados históricos
  const gerenciarCache = async () => {
    const hoje = moment().format('YYYY-MM-DD');
    const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const semanaPassada = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const mesPassado = moment().subtract(1, 'month').format('YYYY-MM-DD');

    // Verificar se já temos dados históricos no localStorage
    const dadosCacheados = {
      ontem: JSON.parse(localStorage.getItem('dashboard_ontem') || 'null'),
      semana: JSON.parse(localStorage.getItem('dashboard_semana') || 'null'),
      mes: JSON.parse(localStorage.getItem('dashboard_mes') || 'null'),
      ultimaAtualizacao: localStorage.getItem('dashboard_ultima_atualizacao')
    };

    // Verificar se os dados históricos ainda são válidos (menos de 24h)
    const dadosValidos = dadosCacheados.ultimaAtualizacao && 
      moment().diff(moment(dadosCacheados.ultimaAtualizacao), 'hours') < 24;

    if (dadosValidos && dadosCacheados.ontem && dadosCacheados.semana && dadosCacheados.mes) {
      // Usar dados do cache
      console.log('📦 Usando dados históricos do cache');
      return dadosCacheados;
    } else {
      // Buscar dados históricos da API (apenas uma vez por dia)
      console.log('🔄 Cache expirado, buscando dados históricos da API...');
      
      try {
        // Buscar dados históricos da API
        const [vendasOntem, vendasSemana, vendasMes, ticketMedioOntem, ticketMedioSemana, ticketMedioMes, cancelamentosOntem, cancelamentosSemana, cancelamentosMes] = await Promise.all([
          api.get(`/api_vendas/bi/sync/${ontem}/${ontem}/0/0`).catch(() => ({ data: [] })),
          api.get(`/api_vendas/bi/sync/${semanaPassada}/${ontem}/0/0`).catch(() => ({ data: [] })),
          api.get(`/api_vendas/bi/sync/${mesPassado}/${ontem}/0/0`).catch(() => ({ data: [] })),
          api.get(`/api/vendas/ticket_medio/${ontem}/${ontem}`).catch(() => ({ data: [] })),
          api.get(`/api/vendas/ticket_medio/${semanaPassada}/${ontem}`).catch(() => ({ data: [] })),
          api.get(`/api/vendas/ticket_medio/${mesPassado}/${ontem}`).catch(() => ({ data: [] })),
          api.post(`/api/vendas/canceladas`, { startDate: ontem, endDate: ontem }).catch(() => ({ data: { data: [] } })),
          api.post(`/api/vendas/canceladas`, { startDate: semanaPassada, endDate: ontem }).catch(() => ({ data: { data: [] } })),
          api.post(`/api/vendas/canceladas`, { startDate: mesPassado, endDate: ontem }).catch(() => ({ data: { data: [] } }))
        ]);

        // Salvar no cache
        const dadosCache = {
          ontem: {
            vendas: vendasOntem.data || [],
            ticketMedio: ticketMedioOntem.data || [],
            cancelamentos: cancelamentosOntem.data?.data || cancelamentosOntem.data || []
          },
          semana: {
            vendas: vendasSemana.data || [],
            ticketMedio: ticketMedioSemana.data || [],
            cancelamentos: cancelamentosSemana.data?.data || cancelamentosSemana.data || []
          },
          mes: {
            vendas: vendasMes.data || [],
            ticketMedio: ticketMedioMes.data || [],
            cancelamentos: cancelamentosMes.data?.data || cancelamentosMes.data || []
          }
        };

        localStorage.setItem('dashboard_ontem', JSON.stringify(dadosCache.ontem));
        localStorage.setItem('dashboard_semana', JSON.stringify(dadosCache.semana));
        localStorage.setItem('dashboard_mes', JSON.stringify(dadosCache.mes));
        localStorage.setItem('dashboard_ultima_atualizacao', moment().toISOString());

        console.log('💾 Dados históricos salvos no cache');
        
        return {
          ontem: dadosCache.ontem,
          semana: dadosCache.semana,
          mes: dadosCache.mes,
          ultimaAtualizacao: moment().toISOString()
        };
      } catch (error) {
        console.error('❌ Erro ao buscar dados históricos:', error);
        return null;
      }
    }
  };

  // Função para gerenciar cache de dados de BI
  const gerenciarCacheBI = async () => {
    const hoje = moment().format('YYYY-MM-DD');
    const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const semanaPassada = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const mesPassado = moment().subtract(1, 'month').format('YYYY-MM-DD');

    // Helper para calcular métricas resumidas (mesmo cálculo usado depois)
    const calcularMetricasBIInterno = (dados) => {
      if (!Array.isArray(dados) || dados.length === 0) return {
        totalVendas: 0,
        totalCusto: 0,
        totalLucro: 0,
        margemLucro: 0,
        quantidade: 0,
        precoMedio: 0,
        custoMedio: 0
      };
      const totalVendas = dados.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
      const totalCusto = dados.reduce((acc, item) => acc + (item.precoultimacompratotal || 0), 0);
      const totalLucro = totalVendas - totalCusto;
      const margemLucro = totalVendas > 0 ? ((totalLucro / totalVendas) * 100) : 0;
      const quantidade = dados.reduce((acc, item) => acc + (item.quantidade || 0), 0);
      const precoMedio = quantidade > 0 ? totalVendas / quantidade : 0;
      const custoMedio = quantidade > 0 ? totalCusto / quantidade : 0;
      return {
        totalVendas,
        totalCusto,
        totalLucro,
        margemLucro,
        quantidade,
        precoMedio,
        custoMedio
      };
    };

    const dadosBICacheados = {
      ontem: JSON.parse(localStorage.getItem('bi_ontem') || 'null'),
      semana: JSON.parse(localStorage.getItem('bi_semana') || 'null'),
      mes: JSON.parse(localStorage.getItem('bi_mes') || 'null'),
      ultimaAtualizacao: localStorage.getItem('bi_ultima_atualizacao')
    };

    const dadosBIValidos = dadosBICacheados.ultimaAtualizacao &&
      moment().diff(moment(dadosBICacheados.ultimaAtualizacao), 'hours') < 12;

    if (dadosBIValidos && dadosBICacheados.ontem && dadosBICacheados.semana && dadosBICacheados.mes) {
      console.log('📦 Usando dados de BI do cache');
      return dadosBICacheados;
    }

    try {
      console.log('🔄 Cache de BI expirado, buscando dados da API...');
      const [biOntem, biSemana, biMes] = await Promise.all([
        api.get(`/api_vendas/bi/sync/${ontem}/${ontem}/1/0`).catch(() => ({ data: [] })),
        api.get(`/api_vendas/bi/sync/${semanaPassada}/${ontem}/1/0`).catch(() => ({ data: [] })),
        api.get(`/api_vendas/bi/sync/${mesPassado}/${ontem}/1/0`).catch(() => ({ data: [] }))
      ]);

      const dadosBICache = {
        ontem: { metricas: calcularMetricasBIInterno(biOntem.data || []), periodo: `${ontem} (Ontem)` },
        semana: { metricas: calcularMetricasBIInterno(biSemana.data || []), periodo: `${semanaPassada} a ${ontem} (Semana anterior)` },
        mes: { metricas: calcularMetricasBIInterno(biMes.data || []), periodo: `${mesPassado} a ${ontem} (Mês anterior)` }
      };

      // Salvar apenas o resumo (não as listas) para evitar exceder quota do localStorage
      localStorage.setItem('bi_ontem', JSON.stringify(dadosBICache.ontem));
      localStorage.setItem('bi_semana', JSON.stringify(dadosBICache.semana));
      localStorage.setItem('bi_mes', JSON.stringify(dadosBICache.mes));
      localStorage.setItem('bi_ultima_atualizacao', moment().toISOString());

      console.log('💾 Dados de BI (resumidos) salvos no cache');
      return { ...dadosBICache, ultimaAtualizacao: moment().toISOString() };
    } catch (error) {
      console.error('❌ Erro ao buscar dados de BI:', error);
      return null;
    }
  };

  // Função para buscar dados reais da API usando as funções do dashboard
  const fetchRealMetrics = async () => {
    try {
      setLoading(true);
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');
      const semanaPassada = moment().subtract(7, 'days').format('YYYY-MM-DD');
      const mesPassado = moment().subtract(1, 'month').format('YYYY-MM-DD');

      // Primeiro, buscar dados históricos do cache ou da API
      const dadosHistoricos = await gerenciarCache();
      console.log('📦 Dados históricos obtidos:', dadosHistoricos);

      // Obter dados de BI com cache
      const dadosBI = await gerenciarCacheBI();
      console.log('📊 Dados de BI obtidos:', dadosBI);

      console.log('📦 Dados de ontem:', dadosHistoricos?.ontem);
      console.log('📦 Dados da semana:', dadosHistoricos?.semana);
      console.log('📦 Dados do mês:', dadosHistoricos?.mes);

      // Buscar apenas dados de HOJE da API (a cada 5 minutos)
      const [vendasHoje, ticketMedio, vendasNfce, vendasEcf, vendasCanceladas, inventarios] = await Promise.all([
        api.get(`/api_vendas/bi/sync/${hoje}/${hoje}/0/0`).catch(() => ({ data: [] })),
        api.get(`/api/vendas/ticket_medio/${hoje}/${hoje}`).catch(() => ({ data: [] })),
        api.get(`/api_vga/vendas/nfce/0/${hoje}/${hoje}/0`).catch(() => ({ data: [] })),
        api.get(`/api_vga/vendas/ecf/0/${hoje}/${hoje}/0`).catch(() => ({ data: [] })),
        api.post(`/api/vendas/canceladas`, { startDate: hoje, endDate: hoje }).catch(() => ({ data: { data: [] } })),
        api.get('/api/produto/contagem/inventarios').catch(() => ({ data: [] }))
      ]);

      // Processar dados de vendas
      const vendasHojeData = vendasHoje.data || [];
      const vendasOntemData = dadosHistoricos?.ontem?.vendas || [];
      const vendasSemanaData = dadosHistoricos?.semana?.vendas || [];
      const vendasMesData = dadosHistoricos?.mes?.vendas || [];
      
      console.log('📊 Dados de vendas processados:');
      console.log('Hoje:', vendasHojeData.length, 'registros');
      console.log('Ontem (cache):', vendasOntemData.length, 'registros');
      console.log('Semana (cache):', vendasSemanaData.length, 'registros');
      console.log('Mês (cache):', vendasMesData.length, 'registros');
      
      // Debug para ver estrutura dos dados de vendas
      if (vendasHojeData.length > 0) {
        console.log('Exemplo de venda - campos disponíveis:', Object.keys(vendasHojeData[0]));
        console.log('Primeira venda completa:', vendasHojeData[0]);
      }

      const totalHoje = vendasHojeData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valortotal || venda.valorTotal || 0);
      }, 0);

      const totalOntem = vendasOntemData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valortotal || venda.valorTotal || 0);
      }, 0);

      const totalSemana = vendasSemanaData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valortotal || venda.valorTotal || 0);
      }, 0);

      const totalMes = vendasMesData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valortotal || venda.valorTotal || 0);
      }, 0);

      const variacaoVendas = totalOntem > 0 ? ((totalHoje - totalOntem) / totalOntem) * 100 : 0;
      
      // Para comparações corretas: totalSemana já é da semana passada, totalMes já é do mês passado
      // Vamos comparar hoje vs média diária dos períodos anteriores
      const mediaDiariaSemana = totalSemana > 0 ? totalSemana / 7 : 0; // Média diária da semana passada
      const mediaDiariaMes = totalMes > 0 ? totalMes / 30 : 0; // Média diária do mês passado
      
      const variacaoVendasSemana = mediaDiariaSemana > 0 ? ((totalHoje - mediaDiariaSemana) / mediaDiariaSemana) * 100 : 0;
      const variacaoVendasMes = mediaDiariaMes > 0 ? ((totalHoje - mediaDiariaMes) / mediaDiariaMes) * 100 : 0;

      // Processar PRODUTOS cancelados (não vendas canceladas) - MOVIDO PARA CIMA
      const vendasCanceladasData = vendasCanceladas.data?.data || vendasCanceladas.data || [];
      const cancelamentosOntemData = dadosHistoricos?.ontem?.cancelamentos || [];
      const cancelamentosSemanaData = dadosHistoricos?.semana?.cancelamentos || [];
      const cancelamentosMesData = dadosHistoricos?.mes?.cancelamentos || [];
      
      // Calcular totais de produtos cancelados por período
      const totalCancelado = vendasCanceladasData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
      }, 0);
      
      const totalCanceladoOntem = cancelamentosOntemData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
      }, 0);
      
      const totalCanceladoSemana = cancelamentosSemanaData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
      }, 0);
      
      const totalCanceladoMes = cancelamentosMesData.reduce((acc, venda) => {
        return acc + parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
      }, 0);
      
      // Calcular quantidade de produtos cancelados por período
      const quantidadeCancelamentos = vendasCanceladasData.length;
      const quantidadeCancelamentosOntem = cancelamentosOntemData.length;
      const quantidadeCancelamentosSemana = cancelamentosSemanaData.length;
      const quantidadeCancelamentosMes = cancelamentosMesData.length;

      // Processar dados de BI (custo x venda)
      // (as declarações serão feitas mais abaixo após obter dadosBI resumidos)

      // Calcular métricas de BI
      const calcularMetricasBI = (dados) => {
        if (!Array.isArray(dados) || dados.length === 0) return {
          totalVendas: 0,
          totalCusto: 0,
          totalLucro: 0,
          margemLucro: 0,
          quantidade: 0,
          precoMedio: 0,
          custoMedio: 0
        };

        const totalVendas = dados.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
        const totalCusto = dados.reduce((acc, item) => acc + (item.precoultimacompratotal || 0), 0);
        const totalLucro = totalVendas - totalCusto;
        const margemLucro = totalVendas > 0 ? ((totalLucro / totalVendas) * 100) : 0;
        const quantidade = dados.reduce((acc, item) => acc + (item.quantidade || 0), 0);
        const precoMedio = quantidade > 0 ? totalVendas / quantidade : 0;
        const custoMedio = quantidade > 0 ? totalCusto / quantidade : 0;

        return {
          totalVendas,
          totalCusto,
          totalLucro,
          margemLucro,
          quantidade,
          precoMedio,
          custoMedio
        };
      };

      // Ajustar fontes de dados BI usando cache resumido
      const biOntemMetricas = dadosBI?.ontem?.metricas || { totalVendas:0,totalCusto:0,totalLucro:0,margemLucro:0,quantidade:0,precoMedio:0,custoMedio:0 };
      const biSemanaMetricas = dadosBI?.semana?.metricas || biOntemMetricas;
      const biMesMetricas = dadosBI?.mes?.metricas || biOntemMetricas;

      // biHojeMetricas já calculado abaixo mas precisamos dados brutos somente para hoje
      const biHoje = await api.get(`/api_vendas/bi/sync/${hoje}/${hoje}/1/0`).catch(() => ({ data: [] }));
      const biHojeMetricas = calcularMetricasBI(biHoje.data || []);

      // Calcular variações
      const variacaoBIVendas = biOntemMetricas.totalVendas>0?((biHojeMetricas.totalVendas-biOntemMetricas.totalVendas)/biOntemMetricas.totalVendas)*100:0;
      const variacaoBILucro = biOntemMetricas.totalLucro>0?((biHojeMetricas.totalLucro-biOntemMetricas.totalLucro)/biOntemMetricas.totalLucro)*100:0;
      const variacaoBIMargem = biOntemMetricas.margemLucro>0?((biHojeMetricas.margemLucro-biOntemMetricas.margemLucro)/biOntemMetricas.margemLucro)*100:0;

      // Processar ticket médio CORRETAMENTE (mesma lógica do dashboard)
      const ticketData = ticketMedio.data || [];
      const ticketDataOntem = dadosHistoricos?.ontem?.ticketMedio || [];
      const ticketDataSemana = dadosHistoricos?.semana?.ticketMedio || [];
      const ticketDataMes = dadosHistoricos?.mes?.ticketMedio || [];

      const calcularTicketMedio = (dados) => {
        if (!Array.isArray(dados) || dados.length === 0) return 0;

        const totalValor = dados.reduce((acc, filial) => acc + parseFloat(filial.valorLiquido || 0), 0);
        const totalVendas = dados.reduce((acc, filial) => acc + parseInt(filial.quantidadeVendas || 0), 0);

        return totalVendas > 0 ? totalValor / totalVendas : 0;
      };

      const ticketHoje = calcularTicketMedio(ticketData);
      const ticketOntem = calcularTicketMedio(ticketDataOntem);
      const ticketSemana = calcularTicketMedio(ticketDataSemana);
      const ticketMes = calcularTicketMedio(ticketDataMes);

      const variacaoTicket = ticketOntem > 0 ? ((ticketHoje - ticketOntem) / ticketOntem) * 100 : 0;
      const variacaoTicketSemana = ticketSemana > 0 ? ((ticketHoje - ticketSemana) / ticketSemana) * 100 : 0;
      const variacaoTicketMes = ticketMes > 0 ? ((ticketHoje - ticketMes) / ticketMes) * 100 : 0;

      // Calcular quantidade de transações únicas
      const transacoesHoje = new Set(vendasHojeData.map(venda => venda.documento || venda.id)).size;
      const transacoesOntem = new Set(vendasOntemData.map(venda => venda.documento || venda.id)).size;
      const transacoesSemana = new Set(vendasSemanaData.map(venda => venda.documento || venda.id)).size;
      const transacoesMes = new Set(vendasMesData.map(venda => venda.documento || venda.id)).size;

      const variacaoTransacoes = transacoesOntem > 0 ? ((transacoesHoje - transacoesOntem) / transacoesOntem) * 100 : 0;
      const variacaoTransacoesSemana = transacoesSemana > 0 ? ((transacoesHoje - transacoesSemana) / transacoesSemana) * 100 : 0;
      const variacaoTransacoesMes = transacoesMes > 0 ? ((transacoesHoje - transacoesMes) / transacoesMes) * 100 : 0;

      // Calcular quantidade de itens vendidos
      const itensHoje = vendasHojeData.reduce((acc, venda) => acc + parseFloat(venda.quantidade || 0), 0);
      const itensOntem = vendasOntemData.reduce((acc, venda) => acc + parseFloat(venda.quantidade || 0), 0);
      const itensSemana = vendasSemanaData.reduce((acc, venda) => acc + parseFloat(venda.quantidade || 0), 0);
      const itensMes = vendasMesData.reduce((acc, venda) => acc + parseFloat(venda.quantidade || 0), 0);

      const variacaoItens = itensOntem > 0 ? ((itensHoje - itensOntem) / itensOntem) * 100 : 0;
      const variacaoItensSemana = itensSemana > 0 ? ((itensHoje - itensSemana) / itensSemana) * 100 : 0;
      const variacaoItensMes = itensMes > 0 ? ((itensHoje - itensMes) / itensMes) * 100 : 0;

      // Calcular métricas de performance avançadas
      const ticketMedioCalculadoHoje = totalHoje > 0 && transacoesHoje > 0 ? totalHoje / transacoesHoje : 0;
      const ticketMedioCalculadoOntem = totalOntem > 0 && transacoesOntem > 0 ? totalOntem / transacoesOntem : 0;
      const ticketMedioCalculadoSemana = totalSemana > 0 && transacoesSemana > 0 ? totalSemana / transacoesSemana : 0;
      const ticketMedioCalculadoMes = totalMes > 0 && transacoesMes > 0 ? totalMes / transacoesMes : 0;

      const variacaoTicketMedio = ticketMedioCalculadoOntem > 0 ? ((ticketMedioCalculadoHoje - ticketMedioCalculadoOntem) / ticketMedioCalculadoOntem) * 100 : 0;
      const variacaoTicketMedioSemana = ticketMedioCalculadoSemana > 0 ? ((ticketMedioCalculadoHoje - ticketMedioCalculadoSemana) / ticketMedioCalculadoSemana) * 100 : 0;
      const variacaoTicketMedioMes = ticketMedioCalculadoMes > 0 ? ((ticketMedioCalculadoHoje - ticketMedioCalculadoMes) / ticketMedioCalculadoMes) * 100 : 0;

      // Definir total de produtos pendentes antes de usar em taxas de conversão
      const totalProdutosPendentes = 0; // valor padrão devido a CORS

      // Calcular eficiência de vendas (vendas vs cancelamentos)
      const eficienciaHoje = totalHoje > 0 ? ((totalHoje / (totalHoje + totalCancelado)) * 100) : 100;
      const eficienciaOntem = totalOntem > 0 ? ((totalOntem / (totalOntem + totalCanceladoOntem)) * 100) : 100;
      const eficienciaSemana = totalSemana > 0 ? ((totalSemana / (totalSemana + totalCanceladoSemana)) * 100) : 100;
      const eficienciaMes = totalMes > 0 ? ((totalMes / (totalMes + totalCanceladoMes)) * 100) : 100;

      const variacaoEficiencia = eficienciaOntem > 0 ? ((eficienciaHoje - eficienciaOntem) / eficienciaOntem) * 100 : 0;
      const variacaoEficienciaSemana = eficienciaSemana > 0 ? ((eficienciaHoje - eficienciaSemana) / eficienciaSemana) * 100 : 0;
      const variacaoEficienciaMes = eficienciaMes > 0 ? ((eficienciaHoje - eficienciaMes) / eficienciaMes) * 100 : 0;

      // Calcular produtividade por transação
      const produtividadeHoje = transacoesHoje > 0 ? itensHoje / transacoesHoje : 0;
      const produtividadeOntem = transacoesOntem > 0 ? itensOntem / transacoesOntem : 0;
      const produtividadeSemana = transacoesSemana > 0 ? itensSemana / transacoesSemana : 0;
      const produtividadeMes = transacoesMes > 0 ? itensMes / transacoesMes : 0;

      const variacaoProdutividade = produtividadeOntem > 0 ? ((produtividadeHoje - produtividadeOntem) / produtividadeOntem) * 100 : 0;
      const variacaoProdutividadeSemana = produtividadeSemana > 0 ? ((produtividadeHoje - produtividadeSemana) / produtividadeSemana) * 100 : 0;
      const variacaoProdutividadeMes = produtividadeMes > 0 ? ((produtividadeHoje - produtividadeMes) / produtividadeMes) * 100 : 0;

      // Calcular taxa de conversão (vendas vs produtos pendentes)
      const taxaConversao = totalProdutosPendentes > 0 ? ((totalHoje / (totalHoje + totalProdutosPendentes)) * 100) : 100;
      const taxaConversaoOntem = totalProdutosPendentes > 0 ? ((totalOntem / (totalOntem + totalProdutosPendentes)) * 100) : 100;
      const taxaConversaoSemana = totalProdutosPendentes > 0 ? ((totalSemana / (totalSemana + totalProdutosPendentes)) * 100) : 100;
      const taxaConversaoMes = totalProdutosPendentes > 0 ? ((totalMes / (totalMes + totalProdutosPendentes)) * 100) : 100;
      const variacaoTaxaConversao = taxaConversaoOntem > 0 ? ((taxaConversao - taxaConversaoOntem) / taxaConversaoOntem) * 100 : 0;

      // Processar dados de PDV (NFC-e e ECF)
      const vendasNfceData = vendasNfce.data || [];
      const vendasEcfData = vendasEcf.data || [];

      // Calcular totais por tipo de documento
      const totalNfce = vendasNfceData.reduce((acc, venda) => acc + parseFloat(venda.total || 0), 0);
      const totalEcf = vendasEcfData.reduce((acc, venda) => acc + parseFloat(venda.total || 0), 0);

      // Encontrar PDV com mais vendas
      const pdvsNfce = {};
      const pdvsEcf = {};

      vendasNfceData.forEach(venda => {
        if (venda.pdv && venda.total) {
          if (!pdvsNfce[venda.pdv]) {
            pdvsNfce[venda.pdv] = { pdv: venda.pdv, total: 0, filial: venda.filial || 'N/A' };
          }
          pdvsNfce[venda.pdv].total += parseFloat(venda.total);
        }
      });

      vendasEcfData.forEach(venda => {
        if (venda.pdv && venda.total) {
          if (!pdvsEcf[venda.pdv]) {
            pdvsEcf[venda.pdv] = { pdv: venda.pdv, total: 0, filial: venda.filial || 'N/A' };
          }
          pdvsEcf[venda.pdv].total += parseFloat(venda.total);
        }
      });

      // Encontrar top PDVs
      const topPdvNfce = Object.values(pdvsNfce).sort((a, b) => b.total - a.total)[0];
      const topPdvEcf = Object.values(pdvsEcf).sort((a, b) => b.total - a.total)[0];

      // Encontrar PDV destaque geral (compara NFC-e vs ECF)
      const pdvDestaqueGeral = topPdvNfce && topPdvEcf ? 
        (topPdvNfce.total > topPdvEcf.total ? topPdvNfce : topPdvEcf) : 
        (topPdvNfce || topPdvEcf);

      // Calcular percentuais ECF vs NFC-e
      const totalDocumentos = totalNfce + totalEcf;
      const percentualEcf = totalDocumentos > 0 ? ((totalEcf / totalDocumentos) * 100).toFixed(1) : 0;
      const percentualNfce = totalDocumentos > 0 ? ((totalNfce / totalDocumentos) * 100).toFixed(1) : 0;
      
      // Calcular variações de cancelamentos
      const variacaoCancelamentos = quantidadeCancelamentosOntem > 0 ? 
        ((quantidadeCancelamentos - quantidadeCancelamentosOntem) / quantidadeCancelamentosOntem) * 100 : 0;
      const variacaoCancelamentosSemana = quantidadeCancelamentosSemana > 0 ? 
        ((quantidadeCancelamentos - quantidadeCancelamentosSemana) / quantidadeCancelamentosSemana) * 100 : 0;
      const variacaoCancelamentosMes = quantidadeCancelamentosMes > 0 ? 
        ((quantidadeCancelamentos - quantidadeCancelamentosMes) / quantidadeCancelamentosMes) * 100 : 0;

      // Processar cancelamentos por loja/filial
      const cancelamentosPorLoja = {};
      vendasCanceladasData.forEach(venda => {
        // Capturar diferentes tipos de identificação de loja/filial
        let loja = venda.filial || venda.loja || venda.nomeFilial || venda.empresa || venda.codFilial || venda.pdv || venda.numeroPdv || venda.pdvDocumento || `Filial ${venda.filialId || venda.id_filial || '1'}`;
        
       
        
        // Capturar valor do cancelamento (tentar diferentes campos)
        const valor = parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || venda.valorCanc || venda.valorCancelado || venda.valorLiquidoCanc || venda.valorLiquidoCanc || 0);
        
        if (!cancelamentosPorLoja[loja]) {
          cancelamentosPorLoja[loja] = {
            nome: loja,
            valorTotal: 0,
            quantidadeCancelamentos: 0,
            pdvs: new Set(),
            itensCancelados: []
          };
        }
        
        cancelamentosPorLoja[loja].valorTotal += valor;
        cancelamentosPorLoja[loja].quantidadeCancelamentos += 1;
        
        // Adicionar PDV à lista de PDVs da loja
        if (venda.pdv) {
          cancelamentosPorLoja[loja].pdvs.add(venda.pdv);
        }
        
        // Adicionar item cancelado
        if (venda.descricao || venda.item) {
          cancelamentosPorLoja[loja].itensCancelados.push({
            descricao: venda.descricao || venda.item,
            quantidade: venda.quantidade || 1,
            valor: valor,
            pdv: venda.pdv || 'N/A',
            data: venda.dataEmissao || venda.emissao || venda.data
          });
        }
      });

      // Encontrar loja com mais cancelamentos
      const lojaMaisCancelamentos = Object.values(cancelamentosPorLoja).length > 0 ? 
        Object.values(cancelamentosPorLoja).sort((a, b) => b.valorTotal - a.valorTotal)[0] : null;

      // Debug para verificar dados de cancelamentos
      console.log('🔍 Debug - Cancelamentos capturados:');
      console.log('Total de registros de cancelamentos:', vendasCanceladasData.length);
      console.log('Cancelamentos hoje:', quantidadeCancelamentos, 'registros, R$', totalCancelado);
      console.log('Cancelamentos ontem:', quantidadeCancelamentosOntem, 'registros, R$', totalCanceladoOntem);
      console.log('Cancelamentos semana:', quantidadeCancelamentosSemana, 'registros, R$', totalCanceladoSemana);
      console.log('Cancelamentos mês:', quantidadeCancelamentosMes, 'registros, R$', totalCanceladoMes);
      console.log('Exemplo de cancelamento:', vendasCanceladasData[0]);
      console.log('Campos disponíveis:', vendasCanceladasData[0] ? Object.keys(vendasCanceladasData[0]) : 'Nenhum dado');
      console.log('Cancelamentos por loja:', cancelamentosPorLoja);

      // Processar produtos pendentes de precificação (valor padrão devido ao CORS)
      // totalProdutosPendentes já definido anteriormente

      // Processar inventários
      const inventariosData = inventarios.data || [];
      const inventariosHoje = inventariosData.filter(inv => {
        const dataInicio = moment(inv.inicio).format('YYYY-MM-DD');
        return dataInicio === hoje;
      });
      const inventariosAbertos = inventariosHoje.filter(inv => inv.status === 1).length;
      const inventariosFechados = inventariosHoje.filter(inv => inv.status === 0).length;
      const totalInventarios = inventariosHoje.length;

      // Calcular descontos totais
      const totalDescontos = vendasHojeData.reduce((acc, venda) => {
        return acc + parseFloat(venda.desconto || 0);
      }, 0);

      // Processar produtos mais vendidos por valor
      const produtosVendidos = {};
      vendasHojeData.forEach(venda => {
        const produto = venda.produto || venda.descricao || 'Produto';
        const valor = parseFloat(venda.valortotal || venda.valorTotal || 0);
        const quantidade = parseFloat(venda.quantidade || 0);

        if (!produtosVendidos[produto]) {
          produtosVendidos[produto] = {
            nome: produto,
            valorTotal: 0,
            quantidadeTotal: 0
          };
        }

        produtosVendidos[produto].valorTotal += valor;
        produtosVendidos[produto].quantidadeTotal += quantidade;
      });

      // Encontrar produto mais vendido em valor
      const produtoMaisVendidoValor = Object.values(produtosVendidos).length > 0 ?
        Object.values(produtosVendidos).sort((a, b) => b.valorTotal - a.valorTotal)[0] : null;

      // Encontrar produto mais vendido em quantidade
      const produtoMaisVendidoQuantidade = Object.values(produtosVendidos).length > 0 ?
        Object.values(produtosVendidos).sort((a, b) => b.quantidadeTotal - a.quantidadeTotal)[0] : null;

            // Processar vendas por lojas/filiais
      const vendasPorLoja = {};
      vendasHojeData.forEach(venda => {
        // Tentar diferentes campos para identificar a loja/filial
        const loja = venda.filial || venda.loja || venda.nomeFilial || venda.empresa || venda.codFilial || `Filial ${venda.filialId || venda.id_filial || '1'}`;
        const valor = parseFloat(venda.valortotal || venda.valorTotal || 0);
        
        if (!vendasPorLoja[loja]) {
          vendasPorLoja[loja] = {
            nome: loja,
            valorTotal: 0,
            quantidadeVendas: 0
          };
        }
        
        vendasPorLoja[loja].valorTotal += valor;
        vendasPorLoja[loja].quantidadeVendas += 1;
      });

      // Encontrar loja com mais vendas
      const lojaMaisVendas = Object.values(vendasPorLoja).length > 0 ? 
        Object.values(vendasPorLoja).sort((a, b) => b.valorTotal - a.valorTotal)[0] : null;
      
      // Debug para ver os dados das lojas
      console.log('Vendas por loja:', vendasPorLoja);
      console.log('Loja com mais vendas:', lojaMaisVendas);

      // Debug para verificar os valores das variáveis
      console.log('🔍 Debug - Valores das variáveis:');
      console.log('totalHoje:', totalHoje);
      console.log('ticketHoje:', ticketHoje);
      console.log('transacoesHoje:', transacoesHoje);
      console.log('totalOntem:', totalOntem);
      console.log('totalSemana:', totalSemana);
      console.log('totalMes:', totalMes);
      console.log('totalNfce:', totalNfce);
      console.log('totalEcf:', totalEcf);
      console.log('totalCancelado:', totalCancelado);
      console.log('quantidadeCancelamentos:', quantidadeCancelamentos);

      // Verificar se temos dados válidos - Condição mais flexível
      console.log('🔍 Debug - Valores para condição:');
      console.log('totalHoje >= 0:', totalHoje >= 0, 'totalHoje:', totalHoje);
      console.log('ticketHoje >= 0:', ticketHoje >= 0, 'ticketHoje:', ticketHoje);
      console.log('transacoesHoje >= 0:', transacoesHoje >= 0, 'transacoesHoje:', transacoesHoje);
      console.log('totalOntem >= 0:', totalOntem >= 0, 'totalOntem:', totalOntem);
      console.log('totalSemana >= 0:', totalSemana >= 0, 'totalSemana:', totalSemana);
      console.log('totalMes >= 0:', totalMes >= 0, 'totalMes:', totalMes);
      
      if (totalHoje >= 0 || ticketHoje >= 0 || transacoesHoje >= 0 || totalOntem >= 0 || totalSemana >= 0 || totalMes >= 0) {
        console.log('✅ Condição de dados válidos atendida - Criando métricas reais');
        
        // Criar métricas reais baseadas nos dados disponíveis com linguagem humanizada
        const realMetrics = [
          {
            id: 1,
            code: "💰 VENDAS HOJE",
            value: `R$ ${formatarNumeroBR(totalHoje)}`,
            change: `vs ontem: ${variacaoVendas >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoVendas)} (R$ ${formatarNumeroBR(totalHoje)} vs R$ ${formatarNumeroBR(totalOntem)})`,
            trend: variacaoVendas >= 0 ? "up" : "down"
          },
          {
            id: 2,
            code: "🎫 TICKET MÉDIO",
            value: `R$ ${formatarNumeroBR(ticketHoje)}`,
            change: `vs ontem: ${variacaoTicket >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTicket)} (R$ ${formatarNumeroBR(ticketHoje)} vs R$ ${formatarNumeroBR(ticketOntem)})`,
            trend: variacaoTicket >= 0 ? "up" : "down"
          },
          {
            id: 3,
            code: "🛒 TRANSAÇÕES HOJE",
            value: `${transacoesHoje} transações`,
            change: `vs ontem: ${variacaoTransacoes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTransacoes)} (${transacoesHoje} vs ${transacoesOntem})`,
            trend: variacaoTransacoes >= 0 ? "up" : "down"
          },
          {
            id: 4,
            code: "📦 ITENS VENDIDOS HOJE",
            value: `${formatarNumeroBR(itensHoje, 0)} itens`,
            change: `vs ontem: ${variacaoItens >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoItens)} (${formatarNumeroBR(itensHoje, 0)} vs ${formatarNumeroBR(itensOntem, 0)})`,
            trend: variacaoItens >= 0 ? "up" : "down"
          },
          {
            id: 5,
            code: "📱 VENDAS NFC-e",
            value: `R$ ${formatarNumeroBR(totalNfce)}`,
            change: `📊 ${formatarPorcentagemBR(parseFloat(percentualNfce))} do total (R$ ${formatarNumeroBR(totalNfce)} de R$ ${formatarNumeroBR(totalDocumentos)})`,
            trend: totalNfce > 0 ? "up" : "neutral"
          },
          {
            id: 6,
            code: "💳 VENDAS ECF",
            value: `R$ ${formatarNumeroBR(totalEcf)}`,
            change: `📊 ${formatarPorcentagemBR(parseFloat(percentualEcf))} do total (R$ ${formatarNumeroBR(totalEcf)} de R$ ${formatarNumeroBR(totalDocumentos)})`,
            trend: totalEcf > 0 ? "up" : "neutral"
          },
          {
            id: 7,
            code: "🏆 PDV DESTAQUE NFC-e",
            value: topPdvNfce ? `PDV ${topPdvNfce.pdv}` : "N/A",
            change: topPdvNfce ?
              `🏪 ${topPdvNfce.filial} • R$ ${formatarNumeroBR(topPdvNfce.total)}` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 8,
            code: "🖥️ PDV DESTAQUE ECF",
            value: topPdvEcf ? `PDV ${topPdvEcf.pdv}` : "N/A",
            change: topPdvEcf ?
              `🏪 ${topPdvEcf.filial} • R$ ${formatarNumeroBR(topPdvEcf.total)}` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 9,
            code: "🌟 PDV DESTAQUE GERAL",
            value: pdvDestaqueGeral ? `PDV ${pdvDestaqueGeral.pdv}` : "N/A",
            change: pdvDestaqueGeral ?
              `🏪 ${pdvDestaqueGeral.filial} • R$ ${formatarNumeroBR(pdvDestaqueGeral.total)}` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 10,
            code: "❌ PRODUTOS CANCELADOS",
            value: `${quantidadeCancelamentos} produtos cancelados`,
            change: totalCancelado > 0 ?
              `💰 R$ ${formatarNumeroBR(totalCancelado)} perdidos vs ontem: R$ ${formatarNumeroBR(totalCanceladoOntem)}` :
              "✅ Nenhum cancelamento",
            trend: determinarTendencia(quantidadeCancelamentos, 'cancelamentos', -1)
          },
          {
            id: 11,
            code: "📊 DISTRIBUIÇÃO DOCUMENTOS",
            value: `${formatarPorcentagemBR(parseFloat(percentualNfce))} NFC-e • ${formatarPorcentagemBR(parseFloat(percentualEcf))} ECF`,
            change: totalDocumentos > 0 ?
              `📈 Total: R$ ${formatarNumeroBR(totalDocumentos)}` :
              "Sem documentos",
            trend: "up"
          },
          {
            id: 12,
            code: "🎯 EFICIÊNCIA",
            value: totalCancelado > 0 ?
              `${formatarPorcentagemBR((totalHoje / (totalHoje + totalCancelado)) * 100)}` :
              "100,00%",
            change: totalCancelado > 0 ?
              `📉 R$ ${formatarNumeroBR(totalCancelado)} em cancelamentos` :
              "✅ Perfeita",
            trend: totalCancelado > 0 ? "down" : "up"
          },
          {
            id: 13,
            code: "🏷️ PRODUTOS PENDENTES",
            value: `${totalProdutosPendentes} produtos`,
            change: totalProdutosPendentes > 0 ?
              `⏳ Aguardando precificação` :
              "✅ Todos precificados",
            trend: totalProdutosPendentes > 0 ? "down" : "up"
          },
          {
            id: 14,
            code: "📋 INVENTÁRIOS",
            value: `${totalInventarios} inventários hoje`,
            change: `${inventariosAbertos} abertos • ${inventariosFechados} fechados`,
            trend: inventariosAbertos > 0 ? "down" : "up"
          },
          {
            id: 15,
            code: "🏷️ DESCONTOS",
            value: `R$ ${formatarNumeroBR(totalDescontos)}`,
            change: totalDescontos > 0 ?
              `📉 Total de descontos aplicados hoje` :
              "✅ Sem descontos",
            trend: totalDescontos > 0 ? "down" : "up"
          },
          {
            id: 16,
            code: "📈 COMPARATIVO SEMANA",
            value: `R$ ${formatarNumeroBR(totalHoje)}`,
            change: `vs média diária semana anterior: ${variacaoVendasSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoVendasSemana)} (R$ ${formatarNumeroBR(totalHoje)} vs R$ ${formatarNumeroBR(mediaDiariaSemana)})`,
            trend: variacaoVendasSemana >= 0 ? "up" : "down"
          },
          {
            id: 17,
            code: "📊 COMPARATIVO MÊS",
            value: `R$ ${formatarNumeroBR(totalHoje)}`,
            change: `vs média diária mês anterior: ${variacaoVendasMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoVendasMes)} (R$ ${formatarNumeroBR(totalHoje)} vs R$ ${formatarNumeroBR(mediaDiariaMes)})`,
            trend: variacaoVendasMes >= 0 ? "up" : "down"
          },
          {
            id: 18,
            code: "❌ CANCELAMENTOS COMPARATIVO",
            value: `${quantidadeCancelamentos} produtos cancelados`,
            change: `Ontem: ${quantidadeCancelamentosOntem} • Semana: ${quantidadeCancelamentosSemana} • Mês: ${quantidadeCancelamentosMes}`,
            trend: variacaoCancelamentos <= 0 ? "up" : "down"
          },
          {
            id: 19,
            code: "🏆 PRODUTO + VENDIDO VALOR",
            value: produtoMaisVendidoValor ? produtoMaisVendidoValor.nome.substring(0, 20) : "N/A",
            change: produtoMaisVendidoValor ?
              `💰 R$ ${formatarNumeroBR(produtoMaisVendidoValor.valorTotal)}` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 20,
            code: "📦 PRODUTO + VENDIDO QTD",
            value: produtoMaisVendidoQuantidade ? produtoMaisVendidoQuantidade.nome.substring(0, 20) : "N/A",
            change: produtoMaisVendidoQuantidade ?
              `📊 ${formatarNumeroBR(produtoMaisVendidoQuantidade.quantidadeTotal, 0)} unidades` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 21,
            code: "🏪 LOJA C/ MAIS VENDAS",
            value: lojaMaisVendas ? lojaMaisVendas.nome.substring(0, 20) : "N/A",
            change: lojaMaisVendas ?
              `💰 R$ ${formatarNumeroBR(lojaMaisVendas.valorTotal)}` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 22,
            code: "🏪 LOJA C/ MAIS CANCELAMENTOS",
            value: lojaMaisCancelamentos ? lojaMaisCancelamentos.nome : "N/A",
            change: lojaMaisCancelamentos ? 
              `📉 ${formatarNumeroBR(lojaMaisCancelamentos.quantidadeCancelamentos, 0)} produtos • R$ ${formatarNumeroBR(lojaMaisCancelamentos.valorTotal)}` : 
              "✅ Sem cancelamentos",
            trend: lojaMaisCancelamentos ? "down" : "up"
          },
          {
            id: 23,
            code: "🚀 PERFORMANCE GERAL",
            value: variacaoVendas >= 0 ? "📈 Crescendo" : "📉 Em queda",
            change: `Vendas: ${variacaoVendas >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoVendas)} • Ticket: ${variacaoTicket >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTicket)}`,
            trend: variacaoVendas >= 0 ? "up" : "down"
          },
          {
            id: 24,
            code: "⚡ PRODUTIVIDADE HOJE",
            value: `${formatarNumeroBR(produtividadeHoje)} itens/transação`,
            change: `vs ontem: ${variacaoProdutividade >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoProdutividade)} (${formatarNumeroBR(produtividadeHoje)} vs ${formatarNumeroBR(produtividadeOntem)})`,
            trend: variacaoProdutividade >= 0 ? "up" : "down"
          },
          {
            id: 25,
            code: "🎯 EFICIÊNCIA VENDAS",
            value: `${formatarPorcentagemBR(eficienciaHoje)}`,
            change: `vs ontem: ${variacaoEficiencia >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoEficiencia)} (${formatarPorcentagemBR(eficienciaHoje)} vs ${formatarPorcentagemBR(eficienciaOntem)})`,
            trend: variacaoEficiencia >= 0 ? "up" : "down"
          },
          {
            id: 26,
            code: "📊 TICKET MÉDIO CALCULADO",
            value: `R$ ${formatarNumeroBR(ticketMedioCalculadoHoje)}`,
            change: `vs ontem: ${variacaoTicketMedio >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTicketMedio)} (R$ ${formatarNumeroBR(ticketMedioCalculadoHoje)} vs R$ ${formatarNumeroBR(ticketMedioCalculadoOntem)})`,
            trend: variacaoTicketMedio >= 0 ? "up" : "down"
          },
          {
            id: 27,
            code: "🔄 TAXA CONVERSÃO",
            value: `${formatarPorcentagemBR(taxaConversao)}`,
            change: `vs ontem: ${variacaoTaxaConversao >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTaxaConversao)} (${formatarPorcentagemBR(taxaConversao)} vs ${formatarPorcentagemBR(taxaConversaoOntem)})`,
            trend: variacaoTaxaConversao >= 0 ? "up" : "down"
          },
          {
            id: 28,
            code: "📈 TICKET MÉDIO SEMANA",
            value: `R$ ${formatarNumeroBR(ticketSemana)}`,
            change: `vs semana anterior: ${variacaoTicketSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTicketSemana)} (R$ ${formatarNumeroBR(ticketSemana)} vs R$ ${formatarNumeroBR(ticketSemana / (1 + variacaoTicketSemana/100))})`,
            trend: variacaoTicketSemana >= 0 ? "up" : "down"
          },
          {
            id: 29,
            code: "📊 TICKET MÉDIO MÊS",
            value: `R$ ${formatarNumeroBR(ticketMes)}`,
            change: `vs mês anterior: ${variacaoTicketMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTicketMes)} (R$ ${formatarNumeroBR(ticketMes)} vs R$ ${formatarNumeroBR(ticketMes / (1 + variacaoTicketMes/100))})`,
            trend: variacaoTicketMes >= 0 ? "up" : "down"
          },
          {
            id: 30,
            code: "🛒 TRANSAÇÕES SEMANA",
            value: `${transacoesSemana} transações`,
            change: `vs semana anterior: ${variacaoTransacoesSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTransacoesSemana)} (${transacoesSemana} vs ${Math.round(transacoesSemana / (1 + variacaoTransacoesSemana/100))})`,
            trend: variacaoTransacoesSemana >= 0 ? "up" : "down"
          },
          {
            id: 31,
            code: "📊 TRANSAÇÕES MÊS",
            value: `${transacoesMes} transações`,
            change: `vs mês anterior: ${variacaoTransacoesMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTransacoesMes)} (${transacoesMes} vs ${Math.round(transacoesMes / (1 + variacaoTransacoesMes/100))})`,
            trend: variacaoTransacoesMes >= 0 ? "up" : "down"
          },
          {
            id: 32,
            code: "📦 ITENS VENDIDOS SEMANA",
            value: `${formatarNumeroBR(itensSemana, 0)} itens`,
            change: `vs semana anterior: ${variacaoItensSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoItensSemana)} (${formatarNumeroBR(itensSemana, 0)} vs ${formatarNumeroBR(itensSemana / (1 + variacaoItensSemana/100), 0)})`,
            trend: variacaoItensSemana >= 0 ? "up" : "down"
          },
          {
            id: 33,
            code: "📊 ITENS VENDIDOS MÊS",
            value: `${formatarNumeroBR(itensMes, 0)} itens`,
            change: `vs mês anterior: ${variacaoItensMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoItensMes)} (${formatarNumeroBR(itensMes, 0)} vs ${formatarNumeroBR(itensMes / (1 + variacaoItensMes/100), 0)})`,
            trend: variacaoItensMes >= 0 ? "up" : "down"
          },
          {
            id: 34,
            code: "⚡ PRODUTIVIDADE SEMANA",
            value: `${formatarNumeroBR(produtividadeSemana)} itens/transação`,
            change: `vs semana anterior: ${variacaoProdutividadeSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoProdutividadeSemana)} (${formatarNumeroBR(produtividadeSemana)} vs ${formatarNumeroBR(produtividadeSemana / (1 + variacaoProdutividadeSemana/100))})`,
            trend: variacaoProdutividadeSemana >= 0 ? "up" : "down"
          },
          {
            id: 35,
            code: "📊 PRODUTIVIDADE MÊS",
            value: `${formatarNumeroBR(produtividadeMes)} itens/transação`,
            change: `vs mês anterior: ${variacaoProdutividadeMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoProdutividadeMes)} (${formatarNumeroBR(produtividadeMes)} vs ${formatarNumeroBR(produtividadeMes / (1 + variacaoProdutividadeMes/100))})`,
            trend: variacaoProdutividadeMes >= 0 ? "up" : "down"
          },
          {
            id: 36,
            code: "🎯 EFICIÊNCIA SEMANA",
            value: `${formatarPorcentagemBR(eficienciaSemana)}`,
            change: `vs semana anterior: ${variacaoEficienciaSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoEficienciaSemana)} (${formatarPorcentagemBR(eficienciaSemana)} vs ${formatarPorcentagemBR(eficienciaSemana / (1 + variacaoEficienciaSemana/100))})`,
            trend: variacaoEficienciaSemana >= 0 ? "up" : "down"
          },
          {
            id: 37,
            code: "📊 EFICIÊNCIA MÊS",
            value: `${formatarPorcentagemBR(eficienciaMes)}`,
            change: `vs mês anterior: ${variacaoEficienciaMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoEficienciaMes)} (${formatarPorcentagemBR(eficienciaMes)} vs ${formatarPorcentagemBR(eficienciaMes / (1 + variacaoEficienciaMes/100))})`,
            trend: variacaoEficienciaMes >= 0 ? "up" : "down"
          },
          {
            id: 38,
            code: "📊 TICKET MÉDIO CALCULADO SEMANA",
            value: `R$ ${formatarNumeroBR(ticketMedioCalculadoSemana)}`,
            change: `vs semana anterior: ${variacaoTicketMedioSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTicketMedioSemana)} (R$ ${formatarNumeroBR(ticketMedioCalculadoSemana)} vs R$ ${formatarNumeroBR(ticketMedioCalculadoSemana / (1 + variacaoTicketMedioSemana/100))})`,
            trend: variacaoTicketMedioSemana >= 0 ? "up" : "down"
          },
          {
            id: 39,
            code: "📈 TICKET MÉDIO CALCULADO MÊS",
            value: `R$ ${formatarNumeroBR(ticketMedioCalculadoMes)}`,
            change: `vs mês anterior: ${variacaoTicketMedioMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTicketMedioMes)} (R$ ${formatarNumeroBR(ticketMedioCalculadoMes)} vs R$ ${formatarNumeroBR(ticketMedioCalculadoMes / (1 + variacaoTicketMedioMes/100))})`,
            trend: variacaoTicketMedioMes >= 0 ? "up" : "down"
          },
          {
            id: 40,
            code: "🔄 TAXA CONVERSÃO SEMANA",
            value: `${formatarPorcentagemBR(taxaConversaoSemana)}`,
            change: `vs semana anterior: ${variacaoTaxaConversao >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTaxaConversao)} (${formatarPorcentagemBR(taxaConversaoSemana)} vs ${formatarPorcentagemBR(taxaConversaoSemana / (1 + variacaoTaxaConversao/100))})`,
            trend: variacaoTaxaConversao >= 0 ? "up" : "down"
          },
          {
            id: 41,
            code: "📊 TAXA CONVERSÃO MÊS",
            value: `${formatarPorcentagemBR(taxaConversaoMes)}`,
            change: `vs mês anterior: ${variacaoTaxaConversao >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoTaxaConversao)} (${formatarPorcentagemBR(taxaConversaoMes)} vs ${formatarPorcentagemBR(taxaConversaoMes / (1 + variacaoTaxaConversao/100))})`,
            trend: variacaoTaxaConversao >= 0 ? "up" : "down"
          },
          {
            id: 42,
            code: "❌ CANCELAMENTOS SEMANA",
            value: `${quantidadeCancelamentosSemana} produtos`,
            change: `vs semana anterior: ${variacaoCancelamentosSemana >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoCancelamentosSemana)} (${quantidadeCancelamentosSemana} vs ${Math.round(quantidadeCancelamentosSemana / (1 + variacaoCancelamentosSemana/100))})`,
            trend: variacaoCancelamentosSemana >= 0 ? "up" : "down"
          },
          {
            id: 43,
            code: "📊 CANCELAMENTOS MÊS",
            value: `${quantidadeCancelamentosMes} produtos`,
            change: `vs mês anterior: ${variacaoCancelamentosMes >= 0 ? '+' : ''}${formatarPorcentagemBR(variacaoCancelamentosMes)} (${quantidadeCancelamentosMes} vs ${Math.round(quantidadeCancelamentosMes / (1 + variacaoCancelamentosMes/100))})`,
            trend: variacaoCancelamentosMes >= 0 ? "up" : "down"
          },
          {
            id: 44,
            code: "📈 RESUMO COMPARATIVO DIA",
            value: `Hoje vs Ontem`,
            change: `Vendas: ${variacaoVendas >= 0 ? '+' : ''}${variacaoVendas.toFixed(1)}% (R$ ${totalHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${totalOntem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Ticket: ${variacaoTicket >= 0 ? '+' : ''}${variacaoTicket.toFixed(1)}% (R$ ${ticketHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${ticketOntem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
            trend: variacaoVendas >= 0 ? "up" : "down"
          },
          {
            id: 45,
            code: "📊 RESUMO COMPARATIVO SEMANA",
            value: `Esta semana vs Semana anterior`,
            change: `Vendas: ${variacaoVendasSemana >= 0 ? '+' : ''}${variacaoVendasSemana.toFixed(1)}% (R$ ${totalSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(totalSemana / (1 + variacaoVendasSemana/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Ticket: ${variacaoTicketSemana >= 0 ? '+' : ''}${variacaoTicketSemana.toFixed(1)}% (R$ ${ticketSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(ticketSemana / (1 + variacaoTicketSemana/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
            trend: variacaoVendasSemana >= 0 ? "up" : "down"
          },
          {
            id: 46,
            code: "📈 RESUMO COMPARATIVO MÊS",
            value: `Este mês vs Mês anterior`,
            change: `Vendas: ${variacaoVendasMes >= 0 ? '+' : ''}${variacaoVendasMes.toFixed(1)}% (R$ ${totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(totalMes / (1 + variacaoVendasMes/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Ticket: ${variacaoTicketMes >= 0 ? '+' : ''}${variacaoTicketMes.toFixed(1)}% (R$ ${ticketMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(ticketMes / (1 + variacaoTicketMes/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
            trend: variacaoVendasMes >= 0 ? "up" : "down"
          },
          {
            id: 47,
            code: "🎯 PERFORMANCE POR PERÍODO",
            value: "Análise temporal",
            change: `Dia: ${variacaoVendas >= 0 ? '+' : ''}${variacaoVendas.toFixed(1)}% (R$ ${totalHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Semana: ${variacaoVendasSemana >= 0 ? '+' : ''}${variacaoVendasSemana.toFixed(1)}% (R$ ${totalSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Mês: ${variacaoVendasMes >= 0 ? '+' : ''}${variacaoVendasMes.toFixed(1)}% (R$ ${totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
            trend: "neutral"
          },
          {
            id: 48,
            code: "🏪 PERFORMANCE LOJA C/ MAIS VENDAS",
            value: lojaMaisVendas ? lojaMaisVendas.nome.substring(0, 20) : "N/A",
            change: lojaMaisVendas ? 
              `💰 R$ ${lojaMaisVendas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • ${lojaMaisVendas.quantidadeVendas} vendas` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 49,
            code: "�� PERFORMANCE LOJA C/ MAIS VENDAS DIA",
            value: lojaMaisVendas ? lojaMaisVendas.nome.substring(0, 20) : "N/A",
            change: lojaMaisVendas ? 
              `💰 R$ ${lojaMaisVendas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs ontem` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 50,
            code: "📈 PERFORMANCE LOJA C/ MAIS VENDAS SEMANA",
            value: lojaMaisVendas ? lojaMaisVendas.nome.substring(0, 20) : "N/A",
            change: lojaMaisVendas ? 
              `💰 R$ ${lojaMaisVendas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs semana anterior` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 51,
            code: "📊 PERFORMANCE LOJA C/ MAIS VENDAS MÊS",
            value: lojaMaisVendas ? lojaMaisVendas.nome.substring(0, 20) : "N/A",
            change: lojaMaisVendas ? 
              `💰 R$ ${lojaMaisVendas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs mês anterior` :
              "Sem vendas",
            trend: "up"
          },
          {
            id: 52,
            code: "❌ PERFORMANCE LOJA C/ MAIS CANCELAMENTOS",
            value: lojaMaisCancelamentos ? lojaMaisCancelamentos.nome : "N/A",
            change: lojaMaisCancelamentos ? 
              `📉 ${lojaMaisCancelamentos.quantidadeCancelamentos} produtos • R$ ${lojaMaisCancelamentos.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
              "✅ Sem cancelamentos",
            trend: lojaMaisCancelamentos ? "down" : "up"
          },
          {
            id: 53,
            code: "📉 PERFORMANCE LOJA C/ MAIS CANCELAMENTOS DIA",
            value: lojaMaisCancelamentos ? lojaMaisCancelamentos.nome : "N/A",
            change: lojaMaisCancelamentos ? 
              `📉 ${lojaMaisCancelamentos.quantidadeCancelamentos} produtos vs ontem` : 
              "✅ Sem cancelamentos",
            trend: lojaMaisCancelamentos ? "down" : "up"
          },
          {
            id: 54,
            code: "📊 PERFORMANCE LOJA C/ MAIS CANCELAMENTOS SEMANA",
            value: lojaMaisCancelamentos ? lojaMaisCancelamentos.nome : "N/A",
            change: lojaMaisCancelamentos ? 
              `📉 ${lojaMaisCancelamentos.quantidadeCancelamentos} produtos vs semana anterior` : 
              "✅ Sem cancelamentos",
            trend: lojaMaisCancelamentos ? "down" : "up"
          },
          {
            id: 55,
            code: "📈 PERFORMANCE LOJA C/ MAIS CANCELAMENTOS MÊS",
            value: lojaMaisCancelamentos ? lojaMaisCancelamentos.nome : "N/A",
            change: lojaMaisCancelamentos ? 
              `📉 ${lojaMaisCancelamentos.quantidadeCancelamentos} produtos vs mês anterior` : 
              "✅ Sem cancelamentos",
            trend: lojaMaisCancelamentos ? "down" : "up"
          },
          {
            id: 56,
            code: "🎯 PERFORMANCE GERAL DIA",
            value: "Hoje vs Ontem",
            change: `Vendas: ${variacaoVendas >= 0 ? '+' : ''}${variacaoVendas.toFixed(1)}% (R$ ${totalHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${totalOntem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Ticket: ${variacaoTicket >= 0 ? '+' : ''}${variacaoTicket.toFixed(1)}% (R$ ${ticketHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${ticketOntem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Transações: ${variacaoTransacoes >= 0 ? '+' : ''}${variacaoTransacoes.toFixed(1)}% (${transacoesHoje} vs ${transacoesOntem})`,
            trend: variacaoVendas >= 0 ? "up" : "down"
          },
          {
            id: 57,
            code: "📊 PERFORMANCE GERAL SEMANA",
            value: "Esta semana vs Semana anterior",
            change: `Vendas: ${variacaoVendasSemana >= 0 ? '+' : ''}${variacaoVendasSemana.toFixed(1)}% (R$ ${totalSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(totalSemana / (1 + variacaoVendasSemana/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Ticket: ${variacaoTicketSemana >= 0 ? '+' : ''}${variacaoTicketSemana.toFixed(1)}% (R$ ${ticketSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(ticketSemana / (1 + variacaoTicketSemana/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Transações: ${variacaoTransacoesSemana >= 0 ? '+' : ''}${variacaoTransacoesSemana.toFixed(1)}% (${transacoesSemana} vs ${(transacoesSemana / (1 + variacaoTransacoesSemana/100)).toFixed(0)})`,
            trend: variacaoVendasSemana >= 0 ? "up" : "down"
          },
          {
            id: 58,
            code: "📈 PERFORMANCE GERAL MÊS",
            value: "Este mês vs Mês anterior",
            change: `Vendas: ${variacaoVendasMes >= 0 ? '+' : ''}${variacaoVendasMes.toFixed(1)}% (R$ ${totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(totalMes / (1 + variacaoVendasMes/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Ticket: ${variacaoTicketMes >= 0 ? '+' : ''}${variacaoTicketMes.toFixed(1)}% (R$ ${ticketMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs R$ ${(ticketMes / (1 + variacaoTicketMes/100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) • Transações: ${variacaoTransacoesMes >= 0 ? '+' : ''}${variacaoTransacoesMes.toFixed(1)}% (${transacoesMes} vs ${(transacoesMes / (1 + variacaoTransacoesMes/100)).toFixed(0)})`,
            trend: variacaoVendasMes >= 0 ? "up" : "down"
          },
          {
            id: 59,
            code: "❌ CANCELAMENTOS HOJE",
            value: `${quantidadeCancelamentos} produtos cancelados`,
            change: totalCancelado > 0 ?
              `💰 R$ ${totalCancelado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} perdidos • ${((totalCancelado / (totalHoje + totalCancelado)) * 100).toFixed(1)}% do total` :
              "✅ Nenhum cancelamento",
            trend: quantidadeCancelamentos > 0 ? "down" : "up"
          },
          {
            id: 60,
            code: "📉 CANCELAMENTOS ONTEM",
            value: `${quantidadeCancelamentosOntem} produtos cancelados`,
            change: totalCanceladoOntem > 0 ?
              `💰 R$ ${totalCanceladoOntem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} perdidos • ${((totalCanceladoOntem / (totalOntem + totalCanceladoOntem)) * 100).toFixed(1)}% do total` :
              "✅ Nenhum cancelamento",
            trend: totalCanceladoOntem > 0 ? "down" : "up"
          },
          {
            id: 61,
            code: "📊 CANCELAMENTOS SEMANA",
            value: `${quantidadeCancelamentosSemana} produtos cancelados`,
            change: totalCanceladoSemana > 0 ?
              `💰 R$ ${totalCanceladoSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} perdidos • ${((totalCanceladoSemana / (totalSemana + totalCanceladoSemana)) * 100).toFixed(1)}% do total` :
              "✅ Nenhum cancelamento",
            trend: totalCanceladoSemana > 0 ? "down" : "up"
          },
          {
            id: 62,
            code: "📈 CANCELAMENTOS MÊS",
            value: `${quantidadeCancelamentosMes} produtos cancelados`,
            change: totalCanceladoMes > 0 ?
              `💰 R$ ${totalCanceladoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} perdidos • ${((totalCanceladoMes / (totalMes + totalCanceladoMes)) * 100).toFixed(1)}% do total` :
              "✅ Nenhum cancelamento",
            trend: totalCanceladoMes > 0 ? "down" : "up"
          },
          {
            id: 63,
            code: "🔄 TAXA CANCELAMENTOS HOJE",
            value: totalCancelado > 0 ? `${((totalCancelado / (totalHoje + totalCancelado)) * 100).toFixed(2)}%` : "0%",
            change: variacaoCancelamentos >= 0 ?
              `📈 +${variacaoCancelamentos.toFixed(1)}% vs ontem` :
              `📉 ${variacaoCancelamentos.toFixed(1)}% vs ontem`,
            trend: variacaoCancelamentos <= 0 ? "up" : "down"
          },
          {
            id: 64,
            code: "📊 TAXA CANCELAMENTOS SEMANA",
            value: totalCanceladoSemana > 0 ? `${((totalCanceladoSemana / (totalSemana + totalCanceladoSemana)) * 100).toFixed(2)}%` : "0%",
            change: variacaoCancelamentosSemana >= 0 ?
              `📈 +${variacaoCancelamentosSemana.toFixed(1)}% vs semana anterior` :
              `📉 ${variacaoCancelamentosSemana.toFixed(1)}% vs semana anterior`,
            trend: variacaoCancelamentosSemana <= 0 ? "up" : "down"
          },
          {
            id: 65,
            code: "📈 TAXA CANCELAMENTOS MÊS",
            value: totalCanceladoMes > 0 ? `${((totalCanceladoMes / (totalMes + totalCanceladoMes)) * 100).toFixed(2)}%` : "0%",
            change: variacaoCancelamentosMes >= 0 ?
              `📈 +${variacaoCancelamentosMes.toFixed(1)}% vs mês anterior` :
              `📉 ${variacaoCancelamentosMes.toFixed(1)}% vs mês anterior`,
            trend: variacaoCancelamentosMes <= 0 ? "up" : "down"
          }
        ];

        // Duplicar as métricas 3 vezes para criar um loop suave (sem efeito de refresh)
        const metricsLoop = [...realMetrics, ...realMetrics, ...realMetrics];
        console.log('🔍 Debug - Métricas criadas:', realMetrics.length);
        console.log('🔍 Debug - Primeira métrica:', realMetrics[0]);
        console.log('🔍 Debug - Última métrica:', realMetrics[realMetrics.length - 1]);
        console.log('🔍 Debug - Todas as métricas:', realMetrics);
        console.log('🔍 Debug - Métricas duplicadas (3x):', metricsLoop.length);
        
        try {
        setNewsMetrics(metricsLoop);
          console.log('✅ Métricas definidas com sucesso no estado');
        } catch (error) {
          console.error('❌ Erro ao definir métricas:', error);
        }
      } else {
        // Se não há dados válidos, mostrar mensagens inspiracionais
        throw new Error('Sem dados disponíveis');
      }

    } catch (error) {
      console.warn('🔴 Caiu no CATCH – erro original:', error);
      console.log('Exibindo mensagens inspiracionais na barra de notícias');

      // Gerar frases motivacionais, saudações e versículos bíblicos
      const frasesMotivacionais = [
        "Bom dia! Que Deus abençoe seu trabalho hoje",
        "Que cada desafio seja uma oportunidade de crescimento",
        "Confie no Senhor e Ele guiará seus passos",
        "O sucesso vem da dedicação e da fé",
        "Que a paz de Cristo esteja em seu coração",
        "Cada dia é uma nova chance de fazer a diferença",
        "Deus está no controle de todas as coisas",
        "Que sua fé seja maior que seus medos",
        "O trabalho bem feito honra a Deus",
        "Que a graça de Deus seja suficiente para você"
      ];

      const saudoes = [
        "Bom dia! Que seja um dia abençoado",
        "Boa tarde! Que Deus continue te abençoando",
        "Boa noite! Que o Senhor guarde seu sono",
        "Feliz dia! Que a alegria do Senhor seja sua força",
        "Que Deus te abençoe ricamente hoje",
        "Que a paz de Cristo reine em seu coração",
        "Que o amor de Deus encha sua vida",
        "Que a misericórdia de Deus seja renovada a cada manhã",
        "Que a bondade de Deus te acompanhe sempre",
        "Que a presença de Deus seja real em sua vida"
      ];

      const versiculos = [
        "Filipenses 4:13 - Tudo posso naquele que me fortalece",
        "Jeremias 29:11 - Eu sei os planos que tenho para vocês",
        "Salmo 23:1 - O Senhor é meu pastor, nada me faltará",
        "Isaías 40:31 - Os que esperam no Senhor renovam suas forças",
        "Romanos 8:28 - Todas as coisas cooperam para o bem",
        "Josué 1:9 - Seja forte e corajoso, não temas",
        "Salmo 46:1 - Deus é nosso refúgio e fortaleza",
        "2 Timóteo 1:7 - Deus não nos deu espírito de medo",
        "1 Pedro 5:7 - Lançai sobre Ele toda a vossa ansiedade",
        "Mateus 11:28 - Vinde a mim todos os que estais cansados"
      ];

      // Selecionar frases aleatórias
      const fraseMotivacional = frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];
      const saudacao = saudoes[Math.floor(Math.random() * saudoes.length)];
      const versiculo = versiculos[Math.floor(Math.random() * versiculos.length)];

      // Criar métricas inspiracionais
      const metricsInspiracionais = [
        {
          id: 1,
          code: "BOM DIA",
          value: "Que Deus te abençoe",
          change: "Hoje",
          trend: "up"
        },
        {
          id: 2,
          code: "FÉ",
          value: "Confie no Senhor",
          change: "Sempre",
          trend: "up"
        },
        {
          id: 3,
          code: "ESPERANÇA",
          value: "Novos tempos",
          change: "Virão",
          trend: "up"
        },
        {
          id: 4,
          code: "AMOR",
          value: "Deus te ama",
          change: "Infinitamente",
          trend: "up"
        },
        {
          id: 5,
          code: "PAZ",
          value: "Cristo te dá",
          change: "Sua paz",
          trend: "up"
        },
        {
          id: 6,
          code: "FORÇA",
          value: "Em Cristo",
          change: "Tudo posso",
          trend: "up"
        },
        {
          id: 7,
          code: "GRAÇA",
          value: "Suficiente",
          change: "Para ti",
          trend: "up"
        },
        { id: 8, code: "CORAGEM", value: "Vai dar certo", change: "Hoje", trend: "up" },
        { id: 9, code: "GRATIDÃO", value: "Agradeça o hoje", change: "Agora", trend: "up" },
        { id: 10, code: "RESILIÊNCIA", value: "Continue firme", change: "Sempre", trend: "up" },
        { id: 11, code: "ALEGRIA", value: "Sorria, faz bem", change: "Diário", trend: "up" },
        { id: 12, code: "CALMA", value: "Respire fundo", change: "Agora", trend: "up" },
        { id: 13, code: "FOCO", value: "Um passo de cada vez", change: "Constante", trend: "up" },
        { id: 14, code: "LUZ", value: "Você ilumina", change: "Onde for", trend: "up" },
        { id: 15, code: "SUPERAÇÃO", value: "Você consegue", change: "Sempre", trend: "up" },
        { id: 16, code: "PROPÓSITO", value: "Você tem valor", change: "Desde já", trend: "up" },
        { id: 17, code: "VITÓRIA", value: "Sua hora chega", change: "No tempo certo", trend: "up" },

        { id: 18, code: "BOM DIA", value: "Que Deus te abençoe", change: "Hoje", trend: "up" },
        { id: 19, code: "FÉ", value: "Confie no Senhor", change: "Sempre", trend: "up" },
        { id: 20, code: "ESPERANÇA", value: "Novos tempos", change: "Virão", trend: "up" },
        { id: 21, code: "AMOR", value: "Deus te ama", change: "Infinitamente", trend: "up" },
        { id: 22, code: "PAZ", value: "Cristo te dá", change: "Sua paz", trend: "up" },
        { id: 23, code: "FORÇA", value: "Em Cristo", change: "Tudo posso", trend: "up" },
        { id: 24, code: "GRAÇA", value: "Suficiente", change: "Para ti", trend: "up" },
        { id: 25, code: "ORAÇÃO", value: "Fale com Deus", change: "Agora", trend: "up" },
        { id: 26, code: "SABEDORIA", value: "Peça e receba", change: "Do Alto", trend: "up" },
        { id: 27, code: "PROPÓSITO", value: "Deus tem planos", change: "Para você", trend: "up" },
        { id: 28, code: "LUZ", value: "Cristo é tua luz", change: "Caminho", trend: "up" },
        { id: 29, code: "PROTEÇÃO", value: "Anjos ao redor", change: "Sempre", trend: "up" },

        { id: 30, code: "DISCIPLINA", value: "Consistência vence", change: "Diário", trend: "up" },
        { id: 31, code: "METAS", value: "Próximo passo claro", change: "Hoje", trend: "up" },
        { id: 32, code: "EXECUÇÃO", value: "Feito > perfeito", change: "Agora", trend: "up" },
        { id: 33, code: "APRENDIZADO", value: "1% melhor ao dia", change: "Sempre", trend: "up" },
        { id: 34, code: "LIDERANÇA", value: "Sirva e inspire", change: "No time", trend: "up" },
        { id: 35, code: "PARCERIA", value: "Peça ajuda", change: "Quando precisar", trend: "up" },
        { id: 36, code: "FOCO", value: "Priorize o essencial", change: "Nesta semana", trend: "up" },
        { id: 37, code: "QUALIDADE", value: "Detalhe importa", change: "Em tudo", trend: "up" },
        { id: 38, code: "TEMPO", value: "Proteja a agenda", change: "Todos os dias", trend: "up" },
        { id: 39, code: "RESULTADO", value: "Entregue valor", change: "Cada entrega", trend: "up" },
        { id: 40, code: "SAÚDE", value: "Pausa também produz", change: "Na rotina", trend: "up" },
        { id: 41, code: "NETWORKING", value: "Conecte e compartilhe", change: "Com pessoas", trend: "up" }

      ];

      // Duplicar 3 vezes para criar loop suave e garantir visibilidade
      const metricsInspiracionaisLoop = [...metricsInspiracionais, ...metricsInspiracionais, ...metricsInspiracionais];
      setNewsMetrics(metricsInspiracionaisLoop);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados a cada 5 minutos
  useEffect(() => {
    fetchRealMetrics();

    const interval = setInterval(() => {
      fetchRealMetrics();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Menu de contexto global mínimo: desabilita botão direito e mostra apenas "Atualizar interface"
  useEffect(() => {
    const onContextMenu = (e) => {
      e.preventDefault();
      setGlobalCtxMenu({ visible: true, x: e.clientX, y: e.clientY });
    };
    const onClick = () => setGlobalCtxMenu({ visible: false, x: 0, y: 0 });
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const reloadUI = () => {
    // Recarregar a interface sem sair do app
    window.location.reload();
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Header fixo */}
      <header className="header" style={{ paddingRight: 'var(--overlay-inset-left, 16px)', paddingLeft: 'var(--overlay-inset-right, 16px)' }}>
        <div className="header-left">
          <div className="logo">
            <div className="logo-container">
              <img src={Logo} alt="Logo JJ" className="logo-image" />
              <div className="logo-glow"></div>
            </div>
            <div className="logo-text">
              <span className="logo-title">JJ Sistemas</span>
              <span className="logo-subtitle">Consultoria em Informática</span>
            </div>
          </div>
        </div>

        {/* Menu Inteligente integrado ao header */}
        <div className="header-center">
          <SmartMenu />
        </div>
        {/* Botão Instalar PWA */}
        <div className="header-right">
          <InstallPWAButton />
        </div>
      </header>

      <TabBar />

      {/* Barra de Notícias - Estilo CNN Money */}
      <div className="news-ticker">
        <div className="ticker-container">
          <div className="ticker-content">
            {newsMetrics.map((metric, index) => (
              <div key={`${metric.id}-${index}`} className="ticker-item">
                <span className={`trend-arrow ${metric.trend}`}>
                  {metric.trend === 'up' ? '▲' : '▼'}
                </span>
                <span className={`change-value ${metric.trend}`}>
                  {metric.change}
                </span>
                <span className="metric-code">{metric.code}:</span>
                <span className="metric-value">{metric.value}</span>
                {index < newsMetrics.length - 1 && <div className="separator"></div>}
              </div>
            ))}
          </div>
        </div>
        
        <div className="ticker-brand">
          <span className="brand-text">Tempo real 🟢</span>
          <button className="details-btn" onClick={()=>setDialogVisible(true)}>Detalhes</button>
        </div>
      </div>

      {/* Dialog detalhado */}
      <NewsMetricsDialog visible={dialogVisible} metrics={newsMetrics.slice(0, newsMetrics.length/3)} onHide={()=>setDialogVisible(false)}/>

      {/* Sincronização de abas com rotas */}
      <TabSync />

      {/* Informações de atalhos de teclado */}
      <TabShortcutsInfo />

      {/* Barra de Abas */}
     

      {/* Conteúdo principal */}
      <main className="main-content">
        <TabContent />
      </main>

      {globalCtxMenu.visible && (
        <div
          style={{
            position: 'fixed',
            left: globalCtxMenu.x,
            top: globalCtxMenu.y,
            background: '#1f1f1f',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: 6,
            padding: 8,
            zIndex: 99999,
            minWidth: 180,
            boxShadow: '0 6px 18px rgba(0,0,0,0.4)'
          }}
        >
          <button
            onClick={reloadUI}
            className="p-button p-button-text"
            style={{ width: '100%', textAlign: 'left', color: '#fff' }}
          >
            <i className="pi pi-refresh" style={{ marginRight: 8 }} /> Atualizar interface
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;