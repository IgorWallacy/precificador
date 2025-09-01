import React, { useState, useEffect } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import moment from "moment";

const Metabase = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    vendas: { total: 0, variacao: 0, periodo: 'hoje' },
    produtos: { total: 0, variacao: 0, periodo: 'hoje' },
    estoque: { total: 0, variacao: 0, periodo: 'hoje' },
    clientes: { total: 0, variacao: 0, periodo: 'hoje' },
    produtosPendentes: { total: 0, periodo: 'hoje' },
    vendasCanceladas: { total: 0, quantidade: 0, variacao: 0, periodo: 'hoje' },
    ticketMedio: { hoje: 0, ontem: 0, variacao: 0, periodo: 'hoje' },
    notasPrecificacao: { total: 0, produtos: 0, fornecedores: 0, periodo: 'hoje' },
    inventarios: { abertos: 0, fechados: 0, total: 0, periodo: 'hoje' }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGrafico, setLoadingGrafico] = useState(false);
  const [error, setError] = useState(null);
  const [expandedActivities, setExpandedActivities] = useState(false);
  const [nextUpdate, setNextUpdate] = useState(300); // 5 minutos em segundos
  const [vendasSemana, setVendasSemana] = useState({
    labels: [],
    valores: [],
    quantidades: []
  });
  const [periodoGrafico, setPeriodoGrafico] = useState('7D');
  const [dataInicial, setDataInicial] = useState(null);
  const [dataFinal, setDataFinal] = useState(null);

  // Função para buscar dados de vendas do dia
  const fetchVendasDia = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // Buscar vendas de hoje e ontem em paralelo usando a API unificada
      const [responseHoje, responseOntem] = await Promise.all([
        api.get(`/api_vendas/bi/sync/${hoje}/${hoje}/0/0`),
        api.get(`/api_vendas/bi/sync/${ontem}/${ontem}/0/0`)
      ]);

      const vendasHoje = responseHoje.data || [];
      const vendasOntem = responseOntem.data || [];

      // Calcular total de vendas somando o campo valortotal de cada item
      const totalHoje = vendasHoje.reduce((acc, venda) => {
        const valorVenda = parseFloat(venda.valortotal || venda.valorTotal || 0);
        return acc + valorVenda;
      }, 0);

      const totalOntem = vendasOntem.reduce((acc, venda) => {
        const valorVenda = parseFloat(venda.valortotal || venda.valorTotal || 0);
        return acc + valorVenda;
      }, 0);

      // Calcular variação percentual
      const variacao = totalOntem > 0 ? ((totalHoje - totalOntem) / totalOntem) * 100 : 0;

      const resultado = {
        total: totalHoje,
        totalOntem: totalOntem,
        variacao: parseFloat(variacao.toFixed(1)),
        quantidadeVendas: vendasHoje.length,
        quantidadeVendasOntem: vendasOntem.length,
        vendasDetalhadas: vendasHoje // Passar as vendas detalhadas para uso em outras funções
      };

      return resultado;
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return {
        total: 0,
        totalOntem: 0,
        variacao: 0,
        quantidadeVendas: 0,
        quantidadeVendasOntem: 0,
        vendasDetalhadas: []
      };
    }
  };

  // Função para buscar dados de produtos vendidos
  const fetchProdutosVendidos = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // Buscar vendas de hoje e ontem em paralelo
      const [responseHoje, responseOntem] = await Promise.all([
        api.get(`/api_vendas/bi/sync/${hoje}/${hoje}/0/0`),
        api.get(`/api_vendas/bi/sync/${ontem}/${ontem}/0/0`)
      ]);

      const vendasHoje = responseHoje.data || [];
      const vendasOntem = responseOntem.data || [];

      // Calcular quantidade total de itens vendidos hoje
      const quantidadeItensHoje = vendasHoje.reduce((acc, venda) => {
        const quantidade = parseFloat(venda.quantidade || 0);
        return acc + quantidade;
      }, 0);

      // Calcular quantidade total de itens vendidos ontem
      const quantidadeItensOntem = vendasOntem.reduce((acc, venda) => {
        const quantidade = parseFloat(venda.quantidade || 0);
        return acc + quantidade;
      }, 0);

      // Calcular variação percentual
      const variacao = quantidadeItensOntem > 0 ?
        ((quantidadeItensHoje - quantidadeItensOntem) / quantidadeItensOntem) * 100 : 0;

      return {
        total: Math.round(quantidadeItensHoje), // Arredondar para número inteiro
        variacao: parseFloat(variacao.toFixed(1))
      };
    } catch (error) {
      console.error('Erro ao buscar produtos vendidos:', error);
      return { total: 0, variacao: 0 };
    }
  };

  // Função para buscar dados de estoque
  const fetchEstoque = async () => {
    try {
      // Buscar produtos por grupo (usando grupo padrão ou primeiro disponível)
      const response = await api.get('/api/grupos');
      const grupos = response.data || [];

      if (grupos.length > 0) {
        const primeiroGrupo = grupos[0];
        const produtosResponse = await api.get(`/api/produto/grupo/${primeiroGrupo.id}`);
        const produtos = produtosResponse.data || [];

        // Calcular total de itens em estoque
        const totalEstoque = produtos.reduce((acc, produto) => acc + (produto.estoque || 0), 0);

        // Para simplicidade, vamos usar uma variação fixa por enquanto
        // Em uma implementação real, você compararia com dados históricos
        return {
          total: totalEstoque,
          variacao: 5.7 // Placeholder - implementar lógica real posteriormente
        };
      }

      return { total: 0, variacao: 0 };
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      return { total: 0, variacao: 0 };
    }
  };

  // Função para buscar dados de inventários
  const fetchInventarios = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // Buscar todos os inventários
      const response = await api.get('/api/produto/contagem/inventarios');
      const inventarios = response.data || [];

      // Filtrar inventários do dia
      const inventariosHoje = inventarios.filter(inv => {
        const dataInicio = moment(inv.inicio).format('YYYY-MM-DD');
        return dataInicio === hoje;
      });

      const inventariosOntem = inventarios.filter(inv => {
        const dataInicio = moment(inv.inicio).format('YYYY-MM-DD');
        return dataInicio === ontem;
      });

      // Contar inventários abertos e fechados do dia
      const abertosHoje = inventariosHoje.filter(inv => inv.status === 1).length;
      const fechadosHoje = inventariosHoje.filter(inv => inv.status === 0).length;
      const totalHoje = inventariosHoje.length;

      const abertosOntem = inventariosOntem.filter(inv => inv.status === 1).length;
      const fechadosOntem = inventariosOntem.filter(inv => inv.status === 0).length;
      const totalOntem = inventariosOntem.length;

      // Calcular variações
      const variacaoAbertos = abertosOntem > 0 ? ((abertosHoje - abertosOntem) / abertosOntem) * 100 : 0;
      const variacaoFechados = fechadosOntem > 0 ? ((fechadosHoje - fechadosOntem) / fechadosOntem) * 100 : 0;
      const variacaoTotal = totalOntem > 0 ? ((totalHoje - totalOntem) / totalOntem) * 100 : 0;

      return {
        abertos: abertosHoje,
        fechados: fechadosHoje,
        total: totalHoje,
        abertosOntem: abertosOntem,
        fechadosOntem: fechadosOntem,
        totalOntem: totalOntem,
        variacaoAbertos: parseFloat(variacaoAbertos.toFixed(1)),
        variacaoFechados: parseFloat(variacaoFechados.toFixed(1)),
        variacaoTotal: parseFloat(variacaoTotal.toFixed(1)),
        inventariosDetalhados: inventariosHoje
      };
    } catch (error) {
      console.error('Erro ao buscar inventários:', error);
      return {
        abertos: 0,
        fechados: 0,
        total: 0,
        abertosOntem: 0,
        fechadosOntem: 0,
        totalOntem: 0,
        variacaoAbertos: 0,
        variacaoFechados: 0,
        variacaoTotal: 0,
        inventariosDetalhados: []
      };
    }
  };

  // Função para buscar dados de transações
  const fetchClientes = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // Buscar vendas de hoje e ontem em paralelo
      const [responseHoje, responseOntem] = await Promise.all([
        api.get(`/api_vendas/bi/sync/${hoje}/${hoje}/0/0`),
        api.get(`/api_vendas/bi/sync/${ontem}/${ontem}/0/0`)
      ]);

      const vendasHoje = responseHoje.data || [];
      const vendasOntem = responseOntem.data || [];

      // Agrupar vendas por transação (usando o campo documento ou outro identificador único)
      const transacoesHoje = new Set(vendasHoje.map(venda => venda.documento || venda.id)).size;
      const transacoesOntem = new Set(vendasOntem.map(venda => venda.documento || venda.id)).size;

      // Calcular variação percentual
      const variacao = transacoesOntem > 0 ?
        ((transacoesHoje - transacoesOntem) / transacoesOntem) * 100 : 0;

      return {
        total: transacoesHoje,
        variacao: parseFloat(variacao.toFixed(1))
      };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return { total: 0, variacao: 0 };
    }
  };

  // Função para buscar produtos pendentes de precificação
  const fetchProdutosPendentes = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD HH:mm:ss [GMT]Z');
      const response = await api.get(`/api_precificacao/produtos/pendentes/${hoje}/${hoje}/0`);

      if (response.data && response.data.length > 0) {
        return {
          total: response.data.length,
          periodo: 'hoje'
        };
      } else {
        return {
          total: 0,
          periodo: 'hoje'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar produtos pendentes:', error);
      return { total: 0, periodo: 'hoje' };
    }
  };

  // Função para buscar inventários abertos
  const fetchInventariosAbertos = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD HH:mm:ss [GMT]Z');
      const response = await api.get(`/api_inventario/inventarios/abertos/${hoje}/${hoje}/0`);

      if (response.data && response.data.length > 0) {
        return {
          total: response.data.length,
          periodo: 'hoje'
        };
      } else {
        return {
          total: 0,
          periodo: 'hoje'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar inventários abertos:', error);
      return { total: 0, periodo: 'hoje' };
    }
  };

  // Função para buscar notas recebidas
  const fetchNotasRecebidas = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD HH:mm:ss [GMT]Z');
      const response = await api.get(`/api_notasfiscais/notas/recebidas/${hoje}/${hoje}/0`);

      if (response.data && response.data.length > 0) {
        return {
          total: response.data.length,
          periodo: 'hoje'
        };
      } else {
        return {
          total: 0,
          periodo: 'hoje'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar notas recebidas:', error);
      return { total: 0, periodo: 'hoje' };
    }
  };

  // Função para buscar notas disponíveis para precificação
  const fetchNotasPrecificacao = async () => {
    try {
      // Formato correto: data inicial às 00:00:00 e data final às 23:59:59
      const hoje = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss [GMT]Z');
      const hojeFim = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss [GMT]Z');
      const ontem = moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss [GMT]Z');
      const ontemFim = moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss [GMT]Z');



      // Buscar produtos disponíveis para precificação (hoje e ontem para comparação)
      const [responseHoje, responseOntem] = await Promise.all([
        api.get(`/api_precificacao/produtos/precificar/agendar/${hoje}/${hojeFim}/0`),
        api.get(`/api_precificacao/produtos/precificar/agendar/${ontem}/${ontemFim}/0`)
      ]);

      const produtosHoje = responseHoje.data || [];
      const produtosOntem = responseOntem.data || [];

      // Agrupar por fornecedor e contar notas fiscais únicas
      const agrupamentoPorFornecedor = {};
      const notasFiscaisUnicas = new Set();

      produtosHoje.forEach(produto => {
        const fornecedor = produto.razaosocial || 'Fornecedor não informado';
        const idNotaFiscal = produto.idnotafiscal;

        // Adicionar nota fiscal ao conjunto de notas únicas
        if (idNotaFiscal) {
          notasFiscaisUnicas.add(idNotaFiscal);
        }

        if (!agrupamentoPorFornecedor[fornecedor]) {
          agrupamentoPorFornecedor[fornecedor] = {
            fornecedor: fornecedor,
            produtos: [],
            quantidade: 0,
            valorTotal: 0,
            notasFiscais: new Set()
          };
        }

        agrupamentoPorFornecedor[fornecedor].produtos.push(produto);
        agrupamentoPorFornecedor[fornecedor].quantidade += parseFloat(produto.quantidade || 1);
        agrupamentoPorFornecedor[fornecedor].valorTotal += parseFloat(produto.precocusto || 0) * parseFloat(produto.quantidade || 1);

        // Adicionar nota fiscal ao fornecedor
        if (idNotaFiscal) {
          agrupamentoPorFornecedor[fornecedor].notasFiscais.add(idNotaFiscal);
        }
      });

      // Calcular totais
      const totalProdutos = produtosHoje.length;
      const totalNotasFiscais = notasFiscaisUnicas.size;
      const totalFornecedores = Object.keys(agrupamentoPorFornecedor).length;
      const totalValor = Object.values(agrupamentoPorFornecedor).reduce((acc, fornecedor) => acc + fornecedor.valorTotal, 0);

      // Calcular variação em relação a ontem (por notas fiscais)
      const notasFiscaisOntem = new Set(produtosOntem.map(p => p.idnotafiscal).filter(Boolean));
      const variacao = notasFiscaisOntem.size > 0 ? ((totalNotasFiscais - notasFiscaisOntem.size) / notasFiscaisOntem.size) * 100 : 0;



      return {
        total: totalNotasFiscais, // Total de notas fiscais únicas
        produtos: totalProdutos, // Total de produtos
        fornecedores: totalFornecedores,
        valorTotal: totalValor,
        variacao: parseFloat(variacao.toFixed(1)),
        agrupamento: agrupamentoPorFornecedor,
        periodo: 'hoje'
      };
    } catch (error) {
      console.error('Erro ao buscar notas para precificação:', error);
      return {
        total: 0,
        produtos: 0,
        fornecedores: 0,
        valorTotal: 0,
        variacao: 0,
        agrupamento: {},
        periodo: 'hoje'
      };
    }
  };

  // Função para buscar vendas canceladas
  const fetchVendasCanceladas = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');

      const response = await api.post(`/api/vendas/canceladas`, {
        startDate: hoje,
        endDate: hoje
      });

      // Extrair o array de dados da resposta da API
      const vendasCanceladas = response.data?.data || response.data || [];

      // Verificar se os dados são um array válido
      if (!Array.isArray(vendasCanceladas)) {
        console.error('Dashboard: Dados retornados não são um array válido:', {
          tipo: typeof vendasCanceladas,
          dados: vendasCanceladas
        });
        return [];
      }

      return vendasCanceladas;
    } catch (error) {
      console.error('Erro ao buscar vendas canceladas:', error);
      return [];
    }
  };

  // Função para buscar vendas canceladas de períodos para comparação
  const fetchVendasCanceladasComparacao = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');
      const semanaPassada = moment().subtract(7, 'days').format('YYYY-MM-DD');

      // Buscar cancelamentos de hoje, ontem e semana passada em paralelo
      const [responseHoje, responseOntem, responseSemana] = await Promise.all([
        api.post(`/api/vendas/canceladas`, { startDate: hoje, endDate: hoje }),
        api.post(`/api/vendas/canceladas`, { startDate: ontem, endDate: ontem }),
        api.post(`/api/vendas/canceladas`, { startDate: semanaPassada, endDate: hoje })
      ]);

      // Extrair o array de dados da resposta da API
      const cancelamentosHoje = responseHoje.data?.data || responseHoje.data || [];
      const cancelamentosOntem = responseOntem.data?.data || responseOntem.data || [];
      const cancelamentosSemana = responseSemana.data?.data || responseSemana.data || [];

      // Verificar se os dados são arrays válidos
      if (!Array.isArray(cancelamentosHoje) || !Array.isArray(cancelamentosOntem) || !Array.isArray(cancelamentosSemana)) {
        console.error('Dashboard: Dados retornados não são arrays válidos para comparação:', {
          cancelamentosHoje: typeof cancelamentosHoje,
          cancelamentosOntem: typeof cancelamentosOntem,
          cancelamentosSemana: typeof cancelamentosSemana
        });
        return {
          hoje: { vendas: [], total: 0, quantidade: 0 },
          ontem: { vendas: [], total: 0, quantidade: 0 },
          semana: { vendas: [], total: 0, quantidade: 0 }
        };
      }

      // Calcular totais
      const totalHoje = cancelamentosHoje.reduce((acc, venda) => {
        const valor = parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
        return acc + valor;
      }, 0);

      const totalOntem = cancelamentosOntem.reduce((acc, venda) => {
        const valor = parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
        return acc + valor;
      }, 0);

      const totalSemana = cancelamentosSemana.reduce((acc, venda) => {
        const valor = parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
        return acc + valor;
      }, 0);

      return {
        hoje: { vendas: cancelamentosHoje, total: totalHoje, quantidade: cancelamentosHoje.length },
        ontem: { vendas: cancelamentosOntem, total: totalOntem, quantidade: cancelamentosOntem.length },
        semana: { vendas: cancelamentosSemana, total: totalSemana, quantidade: cancelamentosSemana.length }
      };
    } catch (error) {
      console.error('Erro ao buscar vendas canceladas para comparação:', error);
      return {
        hoje: { vendas: [], total: 0, quantidade: 0 },
        ontem: { vendas: [], total: 0, quantidade: 0 },
        semana: { vendas: [], total: 0, quantidade: 0 }
      };
    }
  };

  // Função para buscar estatísticas de vendas canceladas
  const fetchEstatisticasVendasCanceladas = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // Buscar cancelamentos de hoje e ontem em paralelo
      const [responseHoje, responseOntem] = await Promise.all([
        api.post(`/api/vendas/canceladas`, { startDate: hoje, endDate: hoje }),
        api.post(`/api/vendas/canceladas`, { startDate: ontem, endDate: ontem })
      ]);

      // Extrair o array de dados da resposta da API
      const cancelamentosHoje = responseHoje.data?.data || responseHoje.data || [];
      const cancelamentosOntem = responseOntem.data?.data || responseOntem.data || [];

      // Verificar se os dados são arrays válidos
      if (!Array.isArray(cancelamentosHoje) || !Array.isArray(cancelamentosOntem)) {
        console.error('Dashboard: Dados retornados não são arrays válidos:', {
          cancelamentosHoje: typeof cancelamentosHoje,
          cancelamentosOntem: typeof cancelamentosOntem
        });
        return {
          total: 0,
          quantidade: 0,
          variacao: 0,
          totalOntem: 0,
          quantidadeOntem: 0
        };
      }

      // Calcular totais
      const totalHoje = cancelamentosHoje.reduce((acc, venda) => {
        const valor = parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
        return acc + valor;
      }, 0);

      const totalOntem = cancelamentosOntem.reduce((acc, venda) => {
        const valor = parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
        return acc + valor;
      }, 0);

      // Calcular variação percentual
      const variacao = totalOntem > 0 ? ((totalHoje - totalOntem) / totalOntem) * 100 : 0;

      return {
        total: totalHoje,
        quantidade: cancelamentosHoje.length,
        variacao: parseFloat(variacao.toFixed(1)),
        totalOntem: totalOntem,
        quantidadeOntem: cancelamentosOntem.length
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de vendas canceladas:', error);
      return {
        total: 0,
        quantidade: 0,
        variacao: 0,
        totalOntem: 0,
        quantidadeOntem: 0
      };
    }
  };

  // Função para buscar dados de ticket médio
  const fetchTicketMedio = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');
      const semanaPassada = moment().subtract(7, 'days').format('YYYY-MM-DD');

      // Buscar ticket médio de hoje, ontem e semana passada em paralelo
      const [responseHoje, responseOntem, responseSemana] = await Promise.all([
        api.get(`/api/vendas/ticket_medio/${hoje}/${hoje}`),
        api.get(`/api/vendas/ticket_medio/${ontem}/${ontem}`),
        api.get(`/api/vendas/ticket_medio/${semanaPassada}/${hoje}`)
      ]);

      // Extrair dados da resposta - a API retorna arrays por período
      const dadosHoje = responseHoje.data || [];
      const dadosOntem = responseOntem.data || [];
      const dadosSemana = responseSemana.data || [];

      // Calcular ticket médio por período (soma de todas as filiais)
      const calcularTicketMedio = (dados) => {
        if (!Array.isArray(dados) || dados.length === 0) return 0;

        const totalValor = dados.reduce((acc, filial) => acc + parseFloat(filial.valorLiquido || 0), 0);
        const totalVendas = dados.reduce((acc, filial) => acc + parseInt(filial.quantidadeVendas || 0), 0);

        return totalVendas > 0 ? totalValor / totalVendas : 0;
      };

      // Calcular métricas
      const ticketMedioHoje = calcularTicketMedio(dadosHoje);
      const ticketMedioOntem = calcularTicketMedio(dadosOntem);
      const ticketMedioSemana = calcularTicketMedio(dadosSemana);

      // Calcular variação percentual
      const variacao = ticketMedioOntem > 0 ? ((ticketMedioHoje - ticketMedioOntem) / ticketMedioOntem) * 100 : 0;

      // Calcular totais por período para contexto
      const totalHoje = dadosHoje.reduce((acc, filial) => acc + parseFloat(filial.valorLiquido || 0), 0);
      const totalOntem = dadosOntem.reduce((acc, filial) => acc + parseFloat(filial.valorLiquido || 0), 0);
      const totalSemana = dadosSemana.reduce((acc, filial) => acc + parseFloat(filial.valorLiquido || 0), 0);

      // Contar total de vendas por período
      const vendasHoje = dadosHoje.reduce((acc, filial) => acc + parseInt(filial.quantidadeVendas || 0), 0);
      const vendasOntem = dadosOntem.reduce((acc, filial) => acc + parseInt(filial.quantidadeVendas || 0), 0);
      const vendasSemana = dadosSemana.reduce((acc, filial) => acc + parseInt(filial.quantidadeVendas || 0), 0);

      return {
        hoje: ticketMedioHoje,
        ontem: ticketMedioOntem,
        semana: ticketMedioSemana,
        variacao: parseFloat(variacao.toFixed(1)),
        mediaSemanal: ticketMedioSemana,
        dadosCompletos: {
          hoje: dadosHoje,
          ontem: dadosOntem,
          semana: dadosSemana
        },
        totais: {
          hoje: totalHoje,
          ontem: totalOntem,
          semana: totalSemana
        },
        vendas: {
          hoje: vendasHoje,
          ontem: vendasOntem,
          semana: vendasSemana
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados de ticket médio:', error);
      return {
        hoje: 0,
        ontem: 0,
        semana: 0,
        variacao: 0,
        mediaSemanal: 0,
        dadosCompletos: {
          hoje: [],
          ontem: [],
          semana: []
        },
        totais: {
          hoje: 0,
          ontem: 0,
          semana: 0
        },
        vendas: {
          hoje: 0,
          ontem: 0,
          semana: 0
        }
      };
    }
  };

  // Função para buscar atividades recentes
  const fetchAtividadesRecentes = async () => {
    try {
      const hoje = moment().format('YYYY-MM-DD');
      const hojeCompleto = moment().format('YYYY-MM-DD HH:mm:ss [GMT]Z');
      const ontem = moment().subtract(1, 'day').format('YYYY-MM-DD');

      let atividades = [];
      let idCounter = 1;

      // 1. Comparação de vendas (hoje vs ontem)
      try {
        const [responseHoje, responseOntem] = await Promise.all([
          api.get(`/api_vendas/bi/sync/${hoje}/${hoje}/0/0`),
          api.get(`/api_vendas/bi/sync/${ontem}/${ontem}/0/0`)
        ]);

        const vendasHoje = responseHoje.data || [];
        const vendasOntem = responseOntem.data || [];

        // Calcular total de vendas do dia
        const totalHoje = vendasHoje.reduce((acc, venda) => {
          const valor = parseFloat(venda.valorTotal || 0);
          return acc + valor;
        }, 0);

        const totalOntem = vendasOntem.reduce((acc, venda) => {
          const valor = parseFloat(venda.valorTotal || 0);
          return acc + valor;
        }, 0);



        const variacao = totalOntem > 0 ? ((totalHoje - totalOntem) / totalOntem) * 100 : 0;

        atividades.push({
          id: idCounter++,
          tipo: 'venda',
          descricao: `Vendas hoje: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(totalHoje)} (${variacao >= 0 ? '+' : ''}${variacao.toFixed(1)}% vs ontem)`,
          horario: moment().format('HH:mm'),
          status: variacao >= 0 ? 'concluida' : 'pendente'
        });

        // Encontrar a última venda pelo maior ID
        if (vendasHoje.length > 0) {
          const ultimaVenda = vendasHoje.reduce((maior, atual) => {
            const idAtual = parseInt(atual.id) || 0;
            const idMaior = parseInt(maior.id) || 0;
            return idAtual > idMaior ? atual : maior;
          }, vendasHoje[0]);

        }
      } catch (error) {
        console.error('Erro ao buscar comparação de vendas:', error);
      }

      // 2. Notas fiscais recebidas
      try {
        const responseNotas = await api.get(
          `/api_precificacao/produtos/precificar/agendar/${moment(
            hoje
          ).format("YYYY-MM-DD HH:mm:ss [GMT]Z")}/${moment(
            hoje
          ).format("YYYY-MM-DD HH:mm:ss [GMT]Z")}/1`,

        );

        const notasRecebidas = responseNotas.data || [];

        if (notasRecebidas.length > 0) {
          const ultimaNota = notasRecebidas[0];
          atividades.push({
            id: idCounter++,
            tipo: 'nota_recebida',
            descricao: `Nota fiscal ${ultimaNota.numeronotafiscal || 'N/A'} recebida de ${ultimaNota.razaosocial || 'Fornecedor'}`,
            horario: moment(ultimaNota.data || new Date()).format('HH:mm'),
            status: 'concluida'
          });
        }
      } catch (error) {
        console.error('Erro ao buscar notas recebidas:', error);
      }

      // 3. Inventários abertos e fechados
      try {
        const responseInventarios = await api.get('/api/produto/contagem/inventarios');
        const inventarios = responseInventarios.data || [];

        // Filtrar inventários do dia
        const inventariosHoje = inventarios.filter(inv => {
          const dataInicio = moment(inv.inicio).format('YYYY-MM-DD');
          return dataInicio === hoje;
        });

        const inventariosOntem = inventarios.filter(inv => {
          const dataInicio = moment(inv.inicio).format('YYYY-MM-DD');
          return dataInicio === ontem;
        });

        // Contar inventários abertos e fechados do dia
        const abertosHoje = inventariosHoje.filter(inv => inv.status === 1).length;
        const fechadosHoje = inventariosHoje.filter(inv => inv.status === 0).length;
        const totalHoje = inventariosHoje.length;

        const abertosOntem = inventariosOntem.filter(inv => inv.status === 1).length;
        const fechadosOntem = inventariosOntem.filter(inv => inv.status === 0).length;
        const totalOntem = inventariosOntem.length;

        // Calcular variações
        const variacaoAbertos = abertosOntem > 0 ? ((abertosHoje - abertosOntem) / abertosOntem) * 100 : 0;
        const variacaoFechados = fechadosOntem > 0 ? ((fechadosHoje - fechadosOntem) / fechadosOntem) * 100 : 0;
        const variacaoTotal = totalOntem > 0 ? ((totalHoje - totalOntem) / totalOntem) * 100 : 0;

        // Adicionar atividade de resumo geral
        if (totalHoje > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'inventario_aberto',
            descricao: `📋 Resumo de Inventários do Dia:\n` +
              `🔓 Abertos: ${abertosHoje} inventário${abertosHoje > 1 ? 's' : ''}\n` +
              `🔒 Fechados: ${fechadosHoje} inventário${fechadosHoje > 1 ? 's' : ''}\n` +
              `📊 Total: ${totalHoje} inventário${totalHoje > 1 ? 's' : ''}\n` +
              `📈 Variação total: ${variacaoTotal >= 0 ? '+' : ''}${variacaoTotal.toFixed(1)}% vs ontem`,
            horario: moment().format('HH:mm'),
            status: 'pendente'
          });
        }

        // Adicionar atividade de inventários abertos
        if (abertosHoje > 0) {
          const inventariosAbertos = inventariosHoje.filter(inv => inv.status === 1);
          atividades.push({
            id: idCounter++,
            tipo: 'inventario_aberto',
            descricao: `🔓 ${abertosHoje} inventário${abertosHoje > 1 ? 's' : ''} em andamento:\n` +
              inventariosAbertos.map(inv =>
                `• ${inv.nome} - Loja: ${inv.loja} (Início: ${moment(inv.inicio).format('HH:mm')})`
              ).join('\n'),
            horario: moment().format('HH:mm'),
            status: 'pendente'
          });
        } else {
          // Se não há inventários abertos
          atividades.push({
            id: idCounter++,
            tipo: 'inventario_aberto',
            descricao: `✅ Nenhum inventário em andamento hoje\n` +
              `🎉 Todos os inventários foram finalizados ou não foram iniciados`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }

        // Adicionar atividade de inventários fechados
        if (fechadosHoje > 0) {
          const inventariosFechados = inventariosHoje.filter(inv => inv.status === 0);
          atividades.push({
            id: idCounter++,
            tipo: 'inventario_fechado',
            descricao: `🔒 ${fechadosHoje} inventário${fechadosHoje > 1 ? 's' : ''} finalizado${fechadosHoje > 1 ? 's' : ''} hoje`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }

        // Análise comparativa com ontem
        if (totalOntem > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'inventario_comparacao',
            descricao: `📊 Análise Comparativa de Inventários:\n` +
              `📅 Hoje: ${totalHoje} inventário${totalHoje > 1 ? 's' : ''} (${abertosHoje} abertos, ${fechadosHoje} fechados)\n` +
              `📅 Ontem: ${totalOntem} inventário${totalOntem > 1 ? 's' : ''} (${abertosOntem} abertos, ${fechadosOntem} fechados)\n` +
              `📈 Variação abertos: ${variacaoAbertos >= 0 ? '+' : ''}${variacaoAbertos.toFixed(1)}%\n` +
              `📉 Variação fechados: ${variacaoFechados >= 0 ? '+' : ''}${variacaoFechados.toFixed(1)}%`,
            horario: moment().format('HH:mm'),
            status: 'pendente'
          });
        }

        // Alertas baseados em padrões
        if (abertosHoje > 3) {
          atividades.push({
            id: idCounter++,
            tipo: 'inventario_alerta',
            descricao: `⚠️ ALERTA: Alto volume de inventários abertos!\n` +
              `🔓 ${abertosHoje} inventários em andamento simultaneamente\n` +
              `📊 Recomenda-se finalizar inventários pendentes`,
            horario: moment().format('HH:mm'),
            status: 'erro'
          });
        }

        if (abertosHoje === 0 && totalHoje > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'inventario_sucesso',
            descricao: `🎉 EXCELENTE: Todos os inventários foram finalizados!\n` +
              `✅ ${totalHoje} inventário${totalHoje > 1 ? 's' : ''} concluído${totalHoje > 1 ? 's' : ''} com sucesso\n` +
              `📊 Eficiência: 100% de finalização`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }

      } catch (error) {
        console.error('Erro ao buscar inventários:', error);
        atividades.push({
          id: idCounter++,
          tipo: 'inventario_erro',
          descricao: `❌ Erro ao buscar dados de inventários\n` +
            `🔧 Verifique a conexão com a API`,
          horario: moment().format('HH:mm'),
          status: 'erro'
        });
      }

      // 4. Produtos pendentes de precificação e com divergência
      try {
        const [responsePendentes, responseProdutos] = await Promise.all([
          api.get(`/api_precificacao/produtos/pendentes/${hojeCompleto}/${hojeCompleto}/0`),
          api.get('/api/produto')
        ]);

        const produtosPendentes = responsePendentes.data || [];
        const produtos = responseProdutos.data || [];

        // Verificar produtos com divergência entre preço agendado e preço atual
        const produtosComDivergencia = produtos.filter(p => {
          const precoAgendado = parseFloat(p.precoagendado) || 0;
          const precoAtual = parseFloat(p.precoAtual) || 0;
          return precoAgendado > 0 && precoAtual > 0 && Math.abs(precoAgendado - precoAtual) > 0.01;
        });

        // Verificar produtos pendentes e divergências
        const temProdutosPendentes = produtosPendentes.length > 0;
        const temDivergencias = produtosComDivergencia.length > 0;

        if (temProdutosPendentes) {
          atividades.push({
            id: idCounter++,
            tipo: 'produtos_pendentes',
            descricao: `${produtosPendentes.length} produtos com preço agendado divergente do atual`,
            horario: moment().format('HH:mm'),
            status: 'pendente'
          });
        }

        if (temDivergencias) {
          atividades.push({
            id: idCounter++,
            tipo: 'divergencia_preco',
            descricao: `${produtosComDivergencia.length} produtos com preço agendado divergente`,
            horario: moment().format('HH:mm'),
            status: 'pendente'
          });
        }

        // Só mostrar que todos os preços estão atualizados se não houver pendências nem divergências
        if (!temProdutosPendentes && !temDivergencias && produtos.length > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'preco_atualizado',
            descricao: 'Todos os produtos com preços atualizados',
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }
      } catch (error) {
        console.error('Erro ao buscar produtos pendentes e divergências:', error);
      }

      // 5. Vendas canceladas
      try {
        const vendasCanceladas = await fetchVendasCanceladas();

        if (vendasCanceladas.length > 0) {
          // Análise detalhada das vendas canceladas
          const totalCancelado = vendasCanceladas.reduce((acc, venda) => {
            return acc + parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
          }, 0);

          // Agrupar por motivo de cancelamento (usando supervisorNome como motivo)
          const cancelamentosPorMotivo = {};
          vendasCanceladas.forEach(venda => {
            const motivo = venda.supervisorNome || venda.motivoCancelamento || 'Não informado';
            if (!cancelamentosPorMotivo[motivo]) {
              cancelamentosPorMotivo[motivo] = {
                quantidade: 0,
                valorTotal: 0,
                vendas: []
              };
            }
            cancelamentosPorMotivo[motivo].quantidade += 1;
            cancelamentosPorMotivo[motivo].valorTotal += parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
            cancelamentosPorMotivo[motivo].vendas.push(venda);
          });

          // Resumo geral de cancelamentos
          atividades.push({
            id: idCounter++,
            tipo: 'produto_cancelado',
            descricao: `🚨 ${vendasCanceladas.length} produto${vendasCanceladas.length > 1 ? 's' : ''} cancelado${vendasCanceladas.length > 1 ? 's' : ''} hoje\n` +
              `💰 Total cancelado: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(totalCancelado)}\n` +
              `📊 Média por cancelamento: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(totalCancelado / vendasCanceladas.length)}`,
            horario: moment().format('HH:mm'),
            status: 'pendente'
          });

          // Detalhes por motivo de cancelamento
          Object.entries(cancelamentosPorMotivo).forEach(([motivo, dados]) => {
            atividades.push({
              id: idCounter++,
              tipo: 'produto_cancelado',
              descricao: `📋 Cancelado por: ${motivo}\n` +
                `🔢 Quantidade: ${dados.quantidade} produto${dados.quantidade > 1 ? 's' : ''} cancelado${dados.quantidade > 1 ? 's' : ''}\n` +
                `💰 Valor total: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dados.valorTotal)}\n` +
                `📊 Média: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dados.valorTotal / dados.quantidade)}`,
              horario: moment().format('HH:mm'),
              status: 'pendente'
            });
          });

          // Detalhes da venda com maior valor cancelado
          const maiorCancelamento = vendasCanceladas.reduce((maior, atual) => {
            const valorAtual = parseFloat(atual.valorLiquido || atual.valorBruto || atual.valorTotal || 0);
            const valorMaior = parseFloat(maior.valorLiquido || maior.valorBruto || maior.valorTotal || 0);
            return valorAtual > valorMaior ? atual : maior;
          }, vendasCanceladas[0]);

          if (maiorCancelamento) {
            atividades.push({
              id: idCounter++,
              tipo: 'produto_cancelado',
              descricao: `🏆 Maior cancelamento do dia:\n` +
                `💰 Valor: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(maiorCancelamento.valorLiquido || maiorCancelamento.valorBruto || maiorCancelamento.valorTotal || 0))}\n` +
                `📋 Cancelado por: ${maiorCancelamento.supervisorNome || maiorCancelamento.motivoCancelamento || 'Não informado'}\n` +
                `🕒 Data: ${moment(maiorCancelamento.dataOperacao).format('DD/MM/YYYY') || 'Não informado'}\n` +
                `🏪 Filial: ${maiorCancelamento.filialNome || 'Não informado'}\n` +
                `📦 Produto: ${maiorCancelamento.nomeProduto || 'Não informado'}`,
              horario: moment().format('HH:mm'),
              status: 'pendente'
            });
          }

          // Análise por supervisor - identificar supervisor com mais cancelamentos
          const cancelamentosPorSupervisor = {};
          vendasCanceladas.forEach(venda => {
            const supervisor = venda.supervisorNome || 'Não informado';
            if (!cancelamentosPorSupervisor[supervisor]) {
              cancelamentosPorSupervisor[supervisor] = {
                quantidade: 0,
                valorTotal: 0,
                produtos: []
              };
            }
            cancelamentosPorSupervisor[supervisor].quantidade += 1;
            cancelamentosPorSupervisor[supervisor].valorTotal += parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
            cancelamentosPorSupervisor[supervisor].produtos.push({
              nome: venda.nomeProduto || 'Produto não informado',
              valor: parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0),
              filial: venda.filialNome || 'Filial não informada'
            });
          });

          // Encontrar supervisor com mais cancelamentos
          const supervisorMaisCancelamentos = Object.entries(cancelamentosPorSupervisor)
            .sort(([, a], [, b]) => b.quantidade - a.quantidade)[0];

          if (supervisorMaisCancelamentos) {
            const [nomeSupervisor, dados] = supervisorMaisCancelamentos;
            atividades.push({
              id: idCounter++,
              tipo: 'produto_cancelado',
              descricao: `👤 Supervisor com mais cancelamentos: ${nomeSupervisor}\n` +
                `🔢 Quantidade: ${dados.quantidade} produto${dados.quantidade > 1 ? 's' : ''} cancelado${dados.quantidade > 1 ? 's' : ''}\n` +
                `💰 Valor total: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dados.valorTotal)}\n` +
                `📊 Média por cancelamento: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dados.valorTotal / dados.quantidade)}`,
              horario: moment().format('HH:mm'),
              status: 'pendente'
            });

            // Detalhes dos produtos cancelados por este supervisor
            if (dados.produtos.length > 0) {
              const produtosOrdenados = dados.produtos.sort((a, b) => b.valor - a.valor);
              const topProdutos = produtosOrdenados.slice(0, 3); // Top 3 produtos

              atividades.push({
                id: idCounter++,
                tipo: 'produto_cancelado',
                descricao: `📦 Top produtos cancelados por ${nomeSupervisor}:\n` +
                  topProdutos.map((produto, index) =>
                    `${index + 1}. ${produto.nome} - R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(produto.valor)} (${produto.filial})`
                  ).join('\n'),
                horario: moment().format('HH:mm'),
                status: 'pendente'
              });
            }
          }

          // Resumo por filial
          const cancelamentosPorFilial = {};
          vendasCanceladas.forEach(venda => {
            const filial = venda.filialNome || 'Filial não informada';
            if (!cancelamentosPorFilial[filial]) {
              cancelamentosPorFilial[filial] = {
                quantidade: 0,
                valorTotal: 0
              };
            }
            cancelamentosPorFilial[filial].quantidade += 1;
            cancelamentosPorFilial[filial].valorTotal += parseFloat(venda.valorLiquido || venda.valorBruto || venda.valorTotal || 0);
          });

          // Filial com mais cancelamentos
          const filialMaisCancelamentos = Object.entries(cancelamentosPorFilial)
            .sort(([, a], [, b]) => b.quantidade - a.quantidade)[0];

          if (filialMaisCancelamentos) {
            const [nomeFilial, dados] = filialMaisCancelamentos;
            atividades.push({
              id: idCounter++,
              tipo: 'produto_cancelado',
              descricao: `🏪 Filial com mais cancelamentos: ${nomeFilial}\n` +
                `🔢 Quantidade: ${dados.quantidade} produto${dados.quantidade > 1 ? 's' : ''} cancelado${dados.quantidade > 1 ? 's' : ''}\n` +
                `💰 Valor total: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dados.valorTotal)}`,
              horario: moment().format('HH:mm'),
              status: 'pendente'
            });
          }

        } else {
          // Se não há cancelamentos, mostrar informação positiva
          atividades.push({
            id: idCounter++,
            tipo: 'produto_cancelado',
            descricao: `✅ Nenhum produto cancelado hoje\n` +
              `🎉 Todas as transações foram concluídas com sucesso`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }
      } catch (error) {
        console.error('Erro ao processar vendas canceladas:', error);
        // Adicionar atividade de erro
        atividades.push({
          id: idCounter++,
          tipo: 'produto_cancelado',
          descricao: `❌ Erro ao buscar produtos cancelados\n` +
            `🔧 Verifique a conexão com a API`,
          horario: moment().format('HH:mm'),
          status: 'erro'
        });
      }

      // 5.1. Análise comparativa de vendas canceladas
      try {
        const comparacaoCancelamentos = await fetchVendasCanceladasComparacao();

        if (comparacaoCancelamentos.hoje.quantidade > 0 || comparacaoCancelamentos.ontem.quantidade > 0) {
          // Calcular variações
          const variacaoQuantidade = comparacaoCancelamentos.ontem.quantidade > 0 ?
            ((comparacaoCancelamentos.hoje.quantidade - comparacaoCancelamentos.ontem.quantidade) / comparacaoCancelamentos.ontem.quantidade) * 100 : 0;

          const variacaoValor = comparacaoCancelamentos.ontem.total > 0 ?
            ((comparacaoCancelamentos.hoje.total - comparacaoCancelamentos.ontem.total) / comparacaoCancelamentos.ontem.total) * 100 : 0;

          // Resumo comparativo
          atividades.push({
            id: idCounter++,
            tipo: 'produto_cancelado',
            descricao: `📊 Análise comparativa de cancelamentos:\n` +
              `📅 Hoje: ${comparacaoCancelamentos.hoje.quantidade} cancelamentos (R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(comparacaoCancelamentos.hoje.total)})\n` +
              `📅 Ontem: ${comparacaoCancelamentos.ontem.quantidade} cancelamentos (R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(comparacaoCancelamentos.ontem.total)})\n` +
              `📈 Variação quantidade: ${variacaoQuantidade >= 0 ? '+' : ''}${variacaoQuantidade.toFixed(1)}%\n` +
              `💰 Variação valor: ${variacaoValor >= 0 ? '+' : ''}${variacaoValor.toFixed(1)}%`,
            horario: moment().format('HH:mm'),
            status: variacaoQuantidade <= 0 && variacaoValor <= 0 ? 'concluida' : 'pendente'
          });

          // Análise semanal
          if (comparacaoCancelamentos.semana.quantidade > 0) {
            const mediaDiaria = comparacaoCancelamentos.semana.quantidade / 7;
            const mediaValorDiario = comparacaoCancelamentos.semana.total / 7;

            atividades.push({
              id: idCounter++,
              tipo: 'produto_cancelado',
              descricao: `📅 Análise semanal de cancelamentos:\n` +
                `🔢 Total da semana: ${comparacaoCancelamentos.semana.quantidade} cancelamentos\n` +
                `💰 Valor total: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(comparacaoCancelamentos.semana.total)}\n` +
                `📊 Média diária: ${mediaDiaria.toFixed(1)} cancelamentos\n` +
                `💵 Média diária: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(mediaValorDiario)}`,
              horario: moment().format('HH:mm'),
              status: 'pendente'
            });
          }

          // Alertas baseados em padrões
          if (comparacaoCancelamentos.hoje.quantidade > comparacaoCancelamentos.ontem.quantidade * 1.5) {
            atividades.push({
              id: idCounter++,
              tipo: 'produto_cancelado',
              descricao: `🚨 ALERTA: Aumento significativo de cancelamentos!\n` +
                `📈 Hoje: ${comparacaoCancelamentos.hoje.quantidade} vs Ontem: ${comparacaoCancelamentos.ontem.quantidade}\n` +
                `⚠️ Aumento de ${((comparacaoCancelamentos.hoje.quantidade / comparacaoCancelamentos.ontem.quantidade - 1) * 100).toFixed(1)}%`,
              horario: moment().format('HH:mm'),
              status: 'erro'
            });
          }

          if (comparacaoCancelamentos.hoje.total > comparacaoCancelamentos.ontem.total * 2) {
            atividades.push({
              id: idCounter++,
              tipo: 'produto_cancelado',
              descricao: `💰 ALERTA: Valor de cancelamentos dobrou!\n` +
                `📊 Hoje: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(comparacaoCancelamentos.hoje.total)}\n` +
                `📊 Ontem: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(comparacaoCancelamentos.ontem.total)}\n` +
                `⚠️ Aumento de ${((comparacaoCancelamentos.hoje.total / comparacaoCancelamentos.ontem.total - 1) * 100).toFixed(1)}%`,
              horario: moment().format('HH:mm'),
              status: 'erro'
            });
          }
        }
      } catch (error) {
        console.error('Erro ao processar análise comparativa de cancelamentos:', error);
      }

      // 6. Análise de Ticket Médio
      try {
        const dadosTicketMedio = await fetchTicketMedio();

        if (dadosTicketMedio.hoje > 0 || dadosTicketMedio.ontem > 0) {
          // Resumo do ticket médio
          atividades.push({
            id: idCounter++,
            tipo: 'ticket_medio',
            descricao: `💰 Análise de Ticket Médio:\n` +
              `📅 Hoje: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.hoje)}\n` +
              `📅 Ontem: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.ontem)}\n` +
              `📈 Variação: ${dadosTicketMedio.variacao >= 0 ? '+' : ''}${dadosTicketMedio.variacao}%\n` +
              `🛒 Vendas hoje: ${dadosTicketMedio.vendas.hoje} transações`,
            horario: moment().format('HH:mm'),
            status: dadosTicketMedio.variacao >= 0 ? 'concluida' : 'pendente'
          });

          // Análise por filial
          if (dadosTicketMedio.dadosCompletos.hoje.length > 0) {
            const filiaisHoje = dadosTicketMedio.dadosCompletos.hoje;

            // Encontrar filial com maior ticket médio
            const filialMaiorTicket = filiaisHoje.reduce((maior, atual) => {
              const ticketAtual = parseFloat(atual.valorLiquido || 0) / parseInt(atual.quantidadeVendas || 1);
              const ticketMaior = parseFloat(maior.valorLiquido || 0) / parseInt(maior.quantidadeVendas || 1);
              return ticketAtual > ticketMaior ? atual : maior;
            }, filiaisHoje[0]);

            if (filialMaiorTicket) {
              const ticketMedioFilial = parseFloat(filialMaiorTicket.valorLiquido || 0) / parseInt(filialMaiorTicket.quantidadeVendas || 1);
              atividades.push({
                id: idCounter++,
                tipo: 'ticket_medio',
                descricao: `🏪 Filial com maior ticket médio: ${filialMaiorTicket.filial}\n` +
                  `💰 Ticket médio: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(ticketMedioFilial)}\n` +
                  `🛒 Vendas: ${filialMaiorTicket.quantidadeVendas} transações\n` +
                  `📦 Itens: ${filialMaiorTicket.quantidadeItens} produtos\n` +
                  `💵 Total: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(filialMaiorTicket.valorLiquido || 0))}`,
                horario: moment().format('HH:mm'),
                status: 'concluida'
              });
            }

            // Resumo por filial
            filiaisHoje.forEach((filial, index) => {
              if (index < 3) { // Mostrar apenas as 3 primeiras filiais
                const ticketMedio = parseFloat(filial.valorLiquido || 0) / parseInt(filial.quantidadeVendas || 1);
                atividades.push({
                  id: idCounter++,
                  tipo: 'ticket_medio',
                  descricao: `🏪 ${filial.filial}:\n` +
                    `💰 Ticket médio: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(ticketMedio)}\n` +
                    `🛒 Vendas: ${filial.quantidadeVendas} transações\n` +
                    `📦 Itens: ${filial.quantidadeItens} produtos\n` +
                    `💵 Total: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(filial.valorLiquido || 0))}`,
                  horario: moment().format('HH:mm'),
                  status: 'concluida'
                });
              }
            });
          }

          // Análise semanal
          if (dadosTicketMedio.mediaSemanal > 0) {
            atividades.push({
              id: idCounter++,
              tipo: 'ticket_medio',
              descricao: `📅 Ticket Médio Semanal:\n` +
                `📊 Média da semana: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.mediaSemanal)}\n` +
                `📈 Comparação com hoje: ${dadosTicketMedio.hoje > dadosTicketMedio.mediaSemanal ? 'Acima' : 'Abaixo'} da média semanal\n` +
                `🛒 Total de vendas da semana: ${dadosTicketMedio.vendas.semana} transações`,
              horario: moment().format('HH:mm'),
              status: dadosTicketMedio.hoje >= dadosTicketMedio.mediaSemanal ? 'concluida' : 'pendente'
            });
          }

          // Alertas baseados em padrões
          if (dadosTicketMedio.variacao < -20) {
            atividades.push({
              id: idCounter++,
              tipo: 'ticket_medio',
              descricao: `⚠️ ALERTA: Queda significativa no ticket médio!\n` +
                `📉 Variação: ${dadosTicketMedio.variacao}%\n` +
                `📊 Hoje: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.hoje)}\n` +
                `📊 Ontem: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.ontem)}\n` +
                `🛒 Vendas: ${dadosTicketMedio.vendas.hoje} vs ${dadosTicketMedio.vendas.ontem}`,
              horario: moment().format('HH:mm'),
              status: 'erro'
            });
          }

          if (dadosTicketMedio.variacao > 30) {
            atividades.push({
              id: idCounter++,
              tipo: 'ticket_medio',
              descricao: `🚀 BOA NOTÍCIA: Aumento significativo no ticket médio!\n` +
                `📈 Variação: +${dadosTicketMedio.variacao}%\n` +
                `📊 Hoje: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.hoje)}\n` +
                `📊 Ontem: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.ontem)}\n` +
                `🛒 Vendas: ${dadosTicketMedio.vendas.hoje} vs ${dadosTicketMedio.vendas.ontem}`,
              horario: moment().format('HH:mm'),
              status: 'concluida'
            });
          }

          // Comparação com média semanal
          if (dadosTicketMedio.mediaSemanal > 0) {
            const variacaoSemanal = ((dadosTicketMedio.hoje - dadosTicketMedio.mediaSemanal) / dadosTicketMedio.mediaSemanal) * 100;

            if (Math.abs(variacaoSemanal) > 15) {
              atividades.push({
                id: idCounter++,
                tipo: 'ticket_medio',
                descricao: `📊 Ticket médio vs Média semanal:\n` +
                  `📈 Hoje: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.hoje)}\n` +
                  `📊 Média semanal: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(dadosTicketMedio.mediaSemanal)}\n` +
                  `📉 Variação: ${variacaoSemanal >= 0 ? '+' : ''}${variacaoSemanal.toFixed(1)}%`,
                horario: moment().format('HH:mm'),
                status: variacaoSemanal >= 0 ? 'concluida' : 'pendente'
              });
            }
          }
        } else {
          // Se não há dados de ticket médio
          atividades.push({
            id: idCounter++,
            tipo: 'ticket_medio',
            descricao: `📊 Ticket Médio: Sem dados disponíveis\n` +
              `🔍 Verifique se há vendas registradas hoje`,
            horario: moment().format('HH:mm'),
            status: 'pendente'
          });
        }
      } catch (error) {
        console.error('Erro ao processar análise de ticket médio:', error);
        atividades.push({
          id: idCounter++,
          tipo: 'ticket_medio',
          descricao: `❌ Erro ao buscar dados de ticket médio\n` +
            `🔧 Verifique a conexão com a API`,
          horario: moment().format('HH:mm'),
          status: 'erro'
        });
      }

      // 7. Produtos vendidos abaixo do custo
      try {
        const responseVendas = await api.get(`/api_vendas/bi/sync/${hoje}/${hoje}/0/0`);
        const vendas = responseVendas.data || [];

        const produtosAbaixoCusto = [];
        let totalPrejuizo = 0;

        vendas.forEach(venda => {
          const valorUnitario = parseFloat(venda.valorunitario || venda.preco) || 0;
          const custoUnitario = parseFloat(venda.precocusto || venda.custo) || 0;
          const quantidade = parseFloat(venda.quantidade) || 0;

          if (valorUnitario < custoUnitario) {
            const prejuizo = (custoUnitario - valorUnitario) * quantidade;
            produtosAbaixoCusto.push({
              codigo: venda.codigoproduto,
              descricao: venda.descricaoproduto || 'Produto',
              prejuizo
            });
            totalPrejuizo += prejuizo;
          }
        });

        if (produtosAbaixoCusto.length > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'produto_abaixo_custo',
            descricao: `ALERTA: ${produtosAbaixoCusto.length} produtos vendidos abaixo do custo (Prejuízo: R$ ${totalPrejuizo.toFixed(2)})`,
            horario: moment().subtract(2, 'hours').format('HH:mm'),
            status: 'pendente'
          });

          // Adicionar o produto com maior prejuízo
          const maiorPrejuizo = produtosAbaixoCusto.sort((a, b) => b.prejuizo - a.prejuizo)[0];
          atividades.push({
            id: idCounter++,
            tipo: 'produto_abaixo_custo',
            descricao: `Maior prejuízo: ${maiorPrejuizo.descricao} (R$ ${maiorPrejuizo.prejuizo.toFixed(2)})`,
            horario: moment().subtract(2, 'hours').format('HH:mm'),
            status: 'pendente'
          });
        }

        // Análise de vendas, descontos e lucros
        const produtosPorQuantidade = {};
        const produtosPorLoja = {};
        let totalDescontos = 0;
        let produtoMaiorDesconto = null;
        let produtoMaiorLucro = null;

        // Primeira passagem: calcular descontos e lucros
        vendas.forEach(venda => {
          // Calcular desconto
          const desconto = parseFloat(venda.desconto || 0);
          totalDescontos += desconto;

          // Verificar se é o maior desconto
          if (!produtoMaiorDesconto || desconto > produtoMaiorDesconto.desconto) {
            produtoMaiorDesconto = {
              descricao: venda.descricao,
              desconto: desconto,
              precoOriginal: parseFloat(venda.precounitario || 0),
              quantidade: parseFloat(venda.quantidade || 0)
            };
          }

          // Calcular lucro (precounitario - precoultimacompra)
          const precoUnitario = parseFloat(venda.precounitario || 0);
          const precoUltimaCompra = parseFloat(venda.precoultimacompra || 0);
          const quantidade = parseFloat(venda.quantidade || 0);
          const lucroTotal = (precoUnitario - precoUltimaCompra) * quantidade;

          if (!produtoMaiorLucro || lucroTotal > produtoMaiorLucro.lucroTotal) {
            produtoMaiorLucro = {
              descricao: venda.descricao,
              lucroTotal: lucroTotal,
              lucroUnitario: precoUnitario - precoUltimaCompra,
              quantidade: quantidade,
              precoUnitario: precoUnitario,
              precoUltimaCompra: precoUltimaCompra
            };
          }
        });

        // Adicionar atividade de descontos totais
        if (totalDescontos > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'desconto',
            descricao: `Total de descontos hoje: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(totalDescontos)}`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }

        // Adicionar produto com maior desconto
        if (produtoMaiorDesconto && produtoMaiorDesconto.desconto > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'desconto',
            descricao: `Maior desconto: ${produtoMaiorDesconto.descricao}\n` +
              `Desconto: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(produtoMaiorDesconto.desconto)}\n` +
              `Preço original: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(produtoMaiorDesconto.precoOriginal)}\n` +
              `Quantidade: ${new Intl.NumberFormat('pt-BR').format(produtoMaiorDesconto.quantidade)} un`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }

        // Adicionar produto com maior lucro
        if (produtoMaiorLucro && produtoMaiorLucro.lucroTotal > 0) {
          atividades.push({
            id: idCounter++,
            tipo: 'lucro',
            descricao: `Produto com maior lucro: ${produtoMaiorLucro.descricao}\n` +
              `Lucro total: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(produtoMaiorLucro.lucroTotal)}\n` +
              `Lucro unitário: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(produtoMaiorLucro.lucroUnitario)}\n` +
              `Quantidade: ${new Intl.NumberFormat('pt-BR').format(produtoMaiorLucro.quantidade)} un\n` +
              `Preço venda: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(produtoMaiorLucro.precoUnitario)}\n` +
              `Preço compra: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(produtoMaiorLucro.precoUltimaCompra)}`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });
        }
        vendas.forEach(venda => {
          // Campos da API
          const codigo = venda.codigo;
          const descricao = venda.descricao; // nome do produto
          const quantidade = parseFloat(venda.quantidade || 0);
          const valorTotal = parseFloat(venda.valorTotal || 0);
          const precoUnitario = parseFloat(venda.precounitario || 0);
          const desconto = parseFloat(venda.desconto || 0);
          const grupoPai = venda.grupoPai; // seção do produto
          const nomeFilial = venda.nomeFilial; // nome da loja
          const promocaoNome = venda.promocaoNome; // nome da promoção

          // Produtos por código (geral)
          if (!produtosPorQuantidade[codigo]) {
            produtosPorQuantidade[codigo] = {
              codigo,
              descricao,
              grupoPai,
              quantidade: 0,
              valorTotal: 0,
              valorUnitarioTotal: 0,
              vendas: 0,
              promocaoNome: promocaoNome !== 'Sem promoção' ? promocaoNome : null
            };
          }

          // Produtos por loja
          if (!produtosPorLoja[nomeFilial]) {
            produtosPorLoja[nomeFilial] = {};
          }
          if (!produtosPorLoja[nomeFilial][codigo]) {
            produtosPorLoja[nomeFilial][codigo] = {
              codigo,
              descricao,
              grupoPai,
              quantidade: 0,
              valorTotal: 0,
              valorUnitarioTotal: 0,
              vendas: 0,
              promocaoNome: promocaoNome !== 'Sem promoção' ? promocaoNome : null
            };
          }

          // Atualizar totais gerais
          produtosPorQuantidade[codigo].quantidade += quantidade;
          produtosPorQuantidade[codigo].valorTotal += valorTotal;
          produtosPorQuantidade[codigo].valorUnitarioTotal += precoUnitario;
          produtosPorQuantidade[codigo].vendas += 1;

          // Atualizar totais por loja
          produtosPorLoja[nomeFilial][codigo].quantidade += quantidade;
          produtosPorLoja[nomeFilial][codigo].valorTotal += valorTotal;
          produtosPorLoja[nomeFilial][codigo].valorUnitarioTotal += precoUnitario;
          produtosPorLoja[nomeFilial][codigo].vendas += 1;
        });

        // Calcular preço médio e ordenar por quantidade
        const produtosOrdenados = Object.values(produtosPorQuantidade)
          .map(produto => ({
            ...produto,
            precoMedio: produto.valorTotal / produto.quantidade
          }))
          .sort((a, b) => b.quantidade - a.quantidade);

        // Adicionar produto mais vendido geral
        if (produtosOrdenados.length > 0) {
          const maisVendido = produtosOrdenados[0];
          atividades.push({
            id: idCounter++,
            tipo: 'produto_mais_vendido',
            descricao: `${maisVendido.descricao}\n` +
              `Quantidade: ${new Intl.NumberFormat('pt-BR').format(maisVendido.quantidade)} un\n` +
              `Total vendido: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(maisVendido.valorTotal)}\n` +
              `Seção: ${maisVendido.grupoPai}\n` +
              `${maisVendido.promocaoNome ? `Promoção: ${maisVendido.promocaoNome}` : ''}\n` +
              `Preço médio: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(maisVendido.precoMedio)}`,
            horario: moment().format('HH:mm'),
            status: 'concluida'
          });

          // Adicionar produtos mais vendidos por loja
          Object.entries(produtosPorLoja).forEach(([nomeFilial, produtos]) => {
            const produtosLoja = Object.values(produtos)
              .map(produto => ({
                ...produto,
                precoMedio: produto.valorTotal / produto.quantidade
              }))
              .sort((a, b) => b.quantidade - a.quantidade);

            if (produtosLoja.length > 0) {
              const maisVendidoLoja = produtosLoja[0];
              atividades.push({
                id: idCounter++,
                tipo: 'produto_mais_vendido',
                descricao: `Loja: ${nomeFilial}\n` +
                  `${maisVendidoLoja.descricao}\n` +
                  `Quantidade: ${new Intl.NumberFormat('pt-BR').format(maisVendidoLoja.quantidade)} un\n` +
                  `Total vendido: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(maisVendidoLoja.valorTotal)}\n` +
                  `Seção: ${maisVendidoLoja.grupoPai}\n` +
                  `${maisVendidoLoja.promocaoNome ? `Promoção: ${maisVendidoLoja.promocaoNome}` : ''}\n` +
                  `Preço médio: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(maisVendidoLoja.precoMedio)}`,
                horario: moment().format('HH:mm'),
                status: 'concluida'
              });
            }
          });
        }
      } catch (error) {
        console.error('Erro ao analisar produtos abaixo do custo:', error);
      }

      // Ordenar atividades por horário (mais recentes primeiro)
      atividades.sort((a, b) => {
        const horaA = moment(a.horario, 'HH:mm');
        const horaB = moment(b.horario, 'HH:mm');
        return horaB - horaA;
      });

      return atividades;
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      return [];
    }
  };

  // Função para buscar vendas do período selecionado
  const fetchVendasPeriodo = async () => {
    try {
      setLoadingGrafico(true);
      const hoje = moment();
      const datas = [];
      const valores = [];
      const quantidades = [];

      // Definir período baseado no filtro selecionado
      let dataInicio, dataFim;

      if (dataInicial && dataFinal) {
        // Usar período personalizado
        dataInicio = moment(dataInicial);
        dataFim = moment(dataFinal);
      } else {
        // Usar período predefinido
        dataFim = moment(hoje).endOf('day');
        switch (periodoGrafico) {
          case '30D':
            dataInicio = moment(hoje).subtract(29, 'days').startOf('day');
            break;
          case '90D':
            dataInicio = moment(hoje).subtract(89, 'days').startOf('day');
            break;
          default: // 7D
            dataInicio = moment(hoje).subtract(6, 'days').startOf('day');
        }
      }

      // Calcular diferença de dias
      const diffDias = dataFim.diff(dataInicio, 'days');



      // Gerar array com os dias do período
      for (let i = diffDias; i >= 0; i--) {
        const data = moment(dataFim).subtract(i, 'days');
        datas.push(data.format('DD/MM'));

        // Buscar vendas do dia
        const response = await api.get(`/api_vendas/bi/sync/${data.format('YYYY-MM-DD')}/${data.format('YYYY-MM-DD')}/0/0`);
        const vendas = response.data || [];

        // Calcular total de vendas e quantidade
        const totalDia = vendas.reduce((acc, venda) => acc + parseFloat(venda.valorTotal || 0), 0);
        const quantidadeDia = vendas.reduce((acc, venda) => acc + parseFloat(venda.quantidade || 0), 0);

        valores.push(totalDia);
        quantidades.push(quantidadeDia);
      }

      setVendasSemana({
        labels: datas,
        valores,
        quantidades
      });

    } catch (error) {
      console.error('Erro ao buscar vendas do período:', error);
    } finally {
      setLoadingGrafico(false);
    }
  };

  // Função principal para carregar todos os dados
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [vendas, produtos, estoque, clientes, produtosPendentes, vendasCanceladas, ticketMedio, atividades, notasPrecificacao, inventarios] = await Promise.all([
        fetchVendasDia(),
        fetchProdutosVendidos(),
        fetchEstoque(),
        fetchClientes(),
        fetchProdutosPendentes(),
        fetchEstatisticasVendasCanceladas(),
        fetchTicketMedio(),
        fetchAtividadesRecentes(),
        fetchNotasPrecificacao(),
        fetchInventarios()
      ]);

      // Buscar dados do gráfico
      await fetchVendasPeriodo();

      setStats({
        vendas: { ...vendas, periodo: 'hoje' },
        produtos: { ...produtos, periodo: 'hoje' },
        estoque: { ...estoque, periodo: 'hoje' },
        clientes: { ...clientes, periodo: 'hoje' },
        produtosPendentes: { ...produtosPendentes, periodo: 'hoje' },
        vendasCanceladas: { ...vendasCanceladas, periodo: 'hoje' },
        ticketMedio: { ...ticketMedio, periodo: 'hoje' },
        notasPrecificacao: { ...notasPrecificacao, periodo: 'hoje' },
        inventarios: { ...inventarios, periodo: 'hoje' }
      });

      setRecentActivity(atividades);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar o tempo restante
  const formatNextUpdate = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    carregarDados();

    // Atualizar dados a cada 5 minutos
    const updateInterval = setInterval(carregarDados, 5 * 60 * 1000);

    // Contador regressivo
    const countdownInterval = setInterval(() => {
      setNextUpdate(prev => {
        if (prev <= 1) {
          return 300; // Reinicia em 5 minutos
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluida': return 'var(--success-color)';
      case 'pendente': return 'var(--warning-color)';
      case 'erro': return 'var(--error-color)';
      default: return 'var(--neutral-500)';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      // Vendas e Financeiro
      case 'venda': return '💰';
      case 'venda_comparacao': return '📊';
      case 'venda_cancelada': return '❌';
      case 'produto_cancelado': return '❌';
      case 'ticket_medio': return '💰';
      case 'produto_mais_vendido': return '🏆';
      case 'produto_maior_lucro': return '💎';
      case 'produto_abaixo_custo': return '⚠️';
      case 'desconto': return '🏷️';
      case 'lucro': return '📈';

      // Estoque e Inventário
      case 'estoque': return '📦';
      case 'inventario_aberto': return '📋';
      case 'inventario_fechado': return '✅';
      case 'inventario_comparacao': return '📊';
      case 'inventario_alerta': return '⚠️';
      case 'inventario_sucesso': return '🎉';
      case 'inventario_erro': return '❌';
      case 'nota_recebida': return '📥';
      case 'nota_precificada': return '✅';
      case 'nota_pendente': return '⏳';

      // Precificação
      case 'precificacao': return '🏷️';
      case 'produtos_pendentes': return '⏳';
      case 'divergencia_preco': return '❗';
      case 'preco_atualizado': return '✅';

      // Sistema e Outros
      case 'sistema': return '⚙️';
      case 'cliente': return '👤';
      case 'alerta': return '🚨';
      default: return '📋';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      // Vendas e Financeiro - tons de verde e vermelho
      case 'venda':
      case 'produto_mais_vendido':
      case 'lucro':
      case 'ticket_medio':
        return 'var(--success-color)';
      case 'venda_cancelada':
      case 'produto_cancelado':
      case 'produto_abaixo_custo':
      case 'alerta':
        return 'var(--error-color)';
      case 'venda_comparacao':
      case 'produto_maior_lucro':
      case 'desconto':
        return 'var(--accent-color)';

      // Estoque e Inventário - tons de azul
      case 'estoque':
      case 'inventario_aberto':
      case 'inventario_comparacao':
        return 'var(--primary-color)';
      case 'inventario_fechado':
      case 'inventario_sucesso':
        return 'var(--success-color)';
      case 'inventario_alerta':
        return 'var(--warning-color)';
      case 'inventario_erro':
        return 'var(--error-color)';
      case 'nota_recebida':
      case 'nota_precificada':
        return 'var(--info-color)';

      // Precificação - tons de laranja e amarelo
      case 'precificacao':
      case 'produtos_pendentes':
      case 'nota_pendente':
        return 'var(--warning-color)';
      case 'divergencia_preco':
        return 'var(--error-color)';
      case 'preco_atualizado':
        return 'var(--success-color)';

      // Sistema e Outros - tons neutros
      case 'sistema':
        return 'var(--neutral-600)';
      case 'cliente':
        return 'var(--secondary-color)';
      default:
        return 'var(--neutral-500)';
    }
  };

 

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={carregarDados}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header do Dashboard */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 style={{
              color: 'white',
              fontSize: '36px',
              fontWeight: '700',
              margin: '0 0 var(--spacing-sm) 0',
              fontFamily: 'var(--font-family-display)',
            }}>Dashboard</h1>
            <p style={
              {
                color: 'white',
                fontSize: '18px',
                opacity: '0.9',
                margin: '0',
                fontFamily: 'var(--font-family-primary)',
              }
            }>
              Visão geral
            </p>
          </div>
          <div className="header-right">
            <div className="next-update">
              {loading ? (
                <span className="loading-text">Atualizando...</span>
              ) : (
                <span>Próxima atualização em: {formatNextUpdate(nextUpdate)}</span>
              )}
            </div>

            <button
              className="btn btn-secondary"
              onClick={carregarDados}
              disabled={loading}
            >
              {loading ? '⌛ Atualizando...' : '🔄 Atualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-lighter)', color: 'var(--success-color)' }}>
                💰
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.vendas.variacao >= 0 ? 'positive' : 'negative'}`}>
                  {stats.vendas.variacao >= 0 ? '+' : ''}{stats.vendas.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">R$ {stats.vendas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <p className="stat-label">Vendas do Dia</p>
              <small className="stat-detail">
                {stats.vendas.total > 0
                  ? `Total acumulado (Ontem: R$ ${stats.vendas.totalOntem?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'})`
                  : 'Sem vendas hoje'}
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--warning-lighter)', color: 'var(--warning-color)' }}>
                ⏳
              </div>
              <div className="stat-trend">
                <span className="trend-value neutral">
                  Pendentes
                </span>
                <span className="trend-period">precificação</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.produtosPendentes.total}</h3>
              <p className="stat-label">Produtos Pendentes</p>
              <small className="stat-detail">
                {stats.produtosPendentes.total > 0 ? 'com preço divergente do agendado aguardando carga para o PDV' : 'Todos precificados'}
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--info-lighter)', color: 'var(--info-color)' }}>
                📋
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.notasPrecificacao.variacao >= 0 ? 'positive' : 'negative'}`}>
                  {stats.notasPrecificacao.variacao >= 0 ? '+' : ''}{stats.notasPrecificacao.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.notasPrecificacao.total}</h3>
              <p className="stat-label">Notas para Precificação</p>
              <small className="stat-detail">
                {stats.notasPrecificacao.total > 0
                  ? `${stats.notasPrecificacao.produtos} produtos • ${stats.notasPrecificacao.fornecedores} fornecedor${stats.notasPrecificacao.fornecedores > 1 ? 'es' : ''}
                   `
                  : 'Nenhuma nota disponível'}
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--error-lighter)', color: 'var(--error-color)' }}>
                ❌
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.vendasCanceladas.variacao <= 0 ? 'positive' : 'negative'}`}>
                  {stats.vendasCanceladas.variacao >= 0 ? '+' : ''}{stats.vendasCanceladas.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.vendasCanceladas.quantidade}</h3>
              <p className="stat-label">Produtos Cancelados</p>
              <small className="stat-detail">
                {stats.vendasCanceladas.total > 0
                  ? `Total: R$ ${stats.vendasCanceladas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : 'Nenhum cancelamento hoje'}
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-lighter)', color: 'var(--success-color)' }}>
                💰
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.ticketMedio.variacao >= 0 ? 'positive' : 'negative'}`}>
                  {stats.ticketMedio.variacao >= 0 ? '+' : ''}{stats.ticketMedio.variacao}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">R$ {stats.ticketMedio.hoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <p className="stat-label">Ticket Médio</p>
              <small className="stat-detail">
                {stats.ticketMedio.hoje > 0
                  ? `Média semanal: R$ ${stats.ticketMedio.mediaSemanal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`
                  : 'Sem dados hoje'}
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: 'var(--primary-lighter)', color: 'var(--primary-color)' }}>
                📋
              </div>
              <div className="stat-trend">
                <span className={`trend-value ${stats.inventarios.variacaoTotal >= 0 ? 'positive' : 'negative'}`}>
                  {stats.inventarios.variacaoTotal >= 0 ? '+' : ''}{stats.inventarios.variacaoTotal}%
                </span>
                <span className="trend-period">vs ontem</span>
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.inventarios.total}</h3>
              <p className="stat-label">Inventários do Dia</p>
              <small className="stat-detail">
                {stats.inventarios.total > 0
                  ? `${stats.inventarios.abertos} abertos • ${stats.inventarios.fechados} fechados`
                  : 'Nenhum inventário hoje'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
      <div className="main-content-section">
        <div className="content-grid">
          {/* Atividade Recente */}
          <div className="content-card">
            <div className="card-header">
              <h3>
                Atividade Recente
                {loading && <span className="loading-indicator">⌛</span>}
              </h3>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setExpandedActivities(!expandedActivities)}
              >
                {expandedActivities ? 'Ver Menos' : 'Ver Mais'}
              </button>
            </div>
            <div className={`card-body ${expandedActivities ? 'expanded' : ''}`}>
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{ backgroundColor: `${getTipoColor(activity.tipo)}20`, color: getTipoColor(activity.tipo) }}>
                      {getTipoIcon(activity.tipo)}
                    </div>
                    <div className="activity-content">
                      <p className="activity-description" style={{
                        whiteSpace: 'pre-line',
                        lineHeight: '1.4',
                        marginBottom: '8px'
                      }}>
                        {activity.tipo === 'produto_mais_vendido' ? (
                          <strong style={{ fontSize: '1.1em', color: 'var(--primary-color)' }}>
                            Produto mais vendido hoje:
                          </strong>
                        ) : null}
                        {'\n'}
                        {activity.descricao}
                      </p>
                      <div className="activity-meta">
                        <span className="activity-time">{activity.horario}</span>
                        <span
                          className="activity-status"
                          style={{ color: getStatusColor(activity.status) }}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="content-card">
            <div className="card-header">
              <h3>Ações Rápidas</h3>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/precificador/agenda/precificador-dataTable-novo')}>
                  <span className="action-icon">💰</span>
                  <span className="action-text">Agendar Preços</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/precificador/executa/precificador-dataTable')}>
                  <span className="action-icon">🏷️</span>
                  <span className="action-text">Emitir etiquetas de preços / enviar carga para o PDV</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/estoque/lista-inventario')}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Novo Inventário</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/estoque/inventario/incluir-contagem')}>
                  <span className="action-icon">📦</span>
                  <span className="action-text">Lançar produtos no inventário</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/compras/consulta')}>
                  <span className="action-icon">👥</span>
                  <span className="action-text">Gestão de Compras</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/vendas')}>
                  <span className="action-icon">🛒</span>
                  <span className="action-text">Vendas</span>
                </button>
                <button className="quick-action-btn">
                  <span className="action-icon">⚙️</span>
                  <span className="action-text">Configurações</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Vendas */}
        <div className="content-card full-width">
          <div className="card-header">
            <div className="chart-header">
              <h3>Vendas por Período</h3>
              {!loadingGrafico && (
                <div className="period-info">
                  {periodoGrafico === 'custom' ? (
                    `${moment(dataInicial).format('DD/MM/YYYY')} até ${moment(dataFinal).format('DD/MM/YYYY')}`
                  ) : (
                    `${moment().subtract(periodoGrafico === '7D' ? 6 : periodoGrafico === '30D' ? 29 : 89, 'days').format('DD/MM/YYYY')} até ${moment().format('DD/MM/YYYY')}`
                  )}
                </div>
              )}
            </div>
            <div className="chart-controls">
              <div className="period-buttons">
                {['7D', '30D', '90D'].map((periodo) => (
                  <button
                    key={periodo}
                    className={`btn btn-sm ${periodoGrafico === periodo ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {
                      setPeriodoGrafico(periodo);
                      setDataInicial(null);
                      setDataFinal(null);
                      fetchVendasPeriodo();
                    }}
                    disabled={loadingGrafico}
                  >
                    {periodo}
                  </button>
                ))}
                <div className="period-divider">ou</div>
                <div className="date-filters">
                  <input
                    type="date"
                    className="date-input"
                    value={dataInicial || ''}
                    max={dataFinal || moment().format('YYYY-MM-DD')}
                    onChange={(e) => {
                      setDataInicial(e.target.value);
                      setPeriodoGrafico('custom');
                    }}
                    disabled={loadingGrafico}
                  />
                  <span className="date-separator">até</span>
                  <input
                    type="date"
                    className="date-input"
                    value={dataFinal || ''}
                    min={dataInicial}
                    max={moment().format('YYYY-MM-DD')}
                    onChange={(e) => {
                      setDataFinal(e.target.value);
                      setPeriodoGrafico('custom');
                    }}
                    disabled={loadingGrafico}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={!dataInicial || !dataFinal || loadingGrafico}
                    onClick={fetchVendasPeriodo}
                  >
                    {loadingGrafico ? '⌛' : 'Filtrar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {loadingGrafico ? (
                <div className="chart-loading">
                  <div className="loading-spinner"></div>
                  <p>Carregando dados...</p>
                </div>
              ) : vendasSemana.labels.length > 0 ? (
                <>
                  <div className="chart-grid">
                    {/* Linhas de grade */}
                    <div className="chart-grid-lines">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="chart-grid-line" />
                      ))}
                    </div>

                    {/* Gráfico de linha */}
                    <div className="chart-line">
                      <svg className="chart-line-svg" viewBox={`0 0 100 100`} preserveAspectRatio="none">
                        {/* Área sob a linha */}
                        <path
                          className="chart-area-path"
                          d={`
                            M 0,100
                            ${vendasSemana.valores.map((valor, index) => {
                            const x = (index / (vendasSemana.valores.length - 1)) * 100;
                            const y = 100 - ((valor / Math.max(...vendasSemana.valores)) * 100);
                            return `L ${x},${y}`;
                          }).join(' ')}
                            L 100,100
                            Z
                          `}
                        />

                        {/* Linha do gráfico */}
                        <path
                          className="chart-line-path"
                          d={`
                            M ${vendasSemana.valores.map((valor, index) => {
                            const x = (index / (vendasSemana.valores.length - 1)) * 100;
                            const y = 100 - ((valor / Math.max(...vendasSemana.valores)) * 100);
                            return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                          }).join(' ')}
                          `}
                        />
                      </svg>

                      {/* Pontos e labels */}
                      <div className="chart-points">
                        {vendasSemana.valores.map((valor, index) => {
                          const x = (index / (vendasSemana.valores.length - 1)) * 100;
                          const y = 100 - ((valor / Math.max(...vendasSemana.valores)) * 100);
                          return (
                            <div
                              key={index}
                              className="chart-point"
                              style={{
                                left: `${x}%`,
                                top: `${y}%`
                              }}
                            >
                              <span className="chart-value">
                                R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Labels do eixo X */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${vendasSemana.labels.length}, 1fr)`,
                      gap: 'var(--spacing-md)',
                      marginTop: 'var(--spacing-lg)'
                    }}>
                      {vendasSemana.labels.map((label, index) => (
                        <div key={label} className="chart-label">
                          <div className="chart-date">{label}</div>
                          <div className="chart-quantity">
                            {vendasSemana.quantidades[index].toLocaleString('pt-BR')} un
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total do Período:</span>
                      <span className="summary-value">
                        R$ {vendasSemana.valores && vendasSemana.valores.length > 0 ?
                          vendasSemana.valores.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) :
                          '0,00'}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Média Diária:</span>
                      <span className="summary-value">
                        R$ {vendasSemana.valores && vendasSemana.valores.length > 0 ?
                          (vendasSemana.valores.reduce((a, b) => a + b, 0) / vendasSemana.valores.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) :
                          '0,00'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="chart-placeholder">
                  <div className="chart-icon">📈</div>
                  <p>Nenhum dado disponível para o período</p>
                  <small>Tente novamente mais tarde</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metabase;

