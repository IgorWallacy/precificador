import React, { useState, useEffect, useRef } from "react";

import { faCashRegister, faStore } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ImagemDestaque from "../../../assets/img/vendas.json";
import { Player } from "@lottiefiles/react-lottie-player";

import Footer from "../../../components/footer";

import api from "../../../services/axios";

import { addLocale } from "primereact/api";

import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";

import { Skeleton } from "primereact/skeleton";

import { useReactToPrint } from "react-to-print";

// Importações para exportação
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import AppChart from "./chart";
import EmptyState from "./EmptyState";
import "primeflex/primeflex.css";

// CSS para animações
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

function VendasDataTableComponent() {

  const tabelaRef = useRef()

  const [loja, setLoja] = useState(0);
  const [filiais, setFiliais] = useState();
  const [pdv, setPdv] = useState({ pdv: "0" });
  const [vendas, setVendas] = useState();
  const [vendasECF, setVendasECF] = useState();
  const [vendasNfce, setVendasNfce] = useState();
  // const [expandedRows, setExpandedRows] = useState([]);
  const [dataInicial, setDataInicial] = useState(() => {
    const hoje = new Date();
    // Garantir que a data seja válida
    if (isNaN(hoje.getTime())) {
      console.warn("Data inválida detectada, usando data atual");
      return new Date();
    }
    return hoje;
  });
  const [dataFinal, setDataFinal] = useState(() => {
    const hoje = new Date();
    // Garantir que a data seja válida
    if (isNaN(hoje.getTime())) {
      console.warn("Data inválida detectada, usando data atual");
      return new Date();
    }
    return hoje;
  });
  const [pdvSelectItems, setPdvSelectItems] = useState();
  const [loading, setLoading] = useState(true);
  const [totalGeral, setTotalGeral] = useState(0);
  const [totalGeralNfce, setTotalGeralNfce] = useState(0);
  const [totalGeralECF, setTotalGeralECF] = useState(0);
  const [topPdvNfce, setTopPdvNfce] = useState(null);
  const [topPdvEcf, setTopPdvEcf] = useState(null);
  const [dadosProntos, setDadosProntos] = useState(false);

  const toast = useRef(null);

  const dt = useRef(null);

  // Função utilitária para formatar datas de forma segura
  const formatarDataSegura = (data) => {
    try {
      if (!data) return new Date().toISOString().split("T")[0];
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) return new Date().toISOString().split("T")[0];
      return dataObj.toISOString().split("T")[0];
    } catch (error) {
      console.warn("Erro ao formatar data, usando data atual:", error);
      return new Date().toISOString().split("T")[0];
    }
  };

  function clearFields() {
    setVendas(null);
    setVendasNfce(null);
    setVendasECF(null);
    setTotalGeralNfce(0);
    setTotalGeralECF(0);
    setTotalGeral(0);
    setDadosProntos(false);
  }

  const handlePrint = useReactToPrint({
    content: () => tabelaRef.current,
  });

  // Função para exportar para Excel
  const exportToExcel = () => {
    if (!dadosProntos) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Aguarde os dados carregarem antes de exportar",
        life: 3000,
      });
      return;
    }

    try {
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Dados do resumo executivo
      const resumoData = [
        ['RESUMO EXECUTIVO DE VENDAS'],
        [''],
        ['PERÍODO ANALISADO'],
        ['Data Inicial', dataInicial ? new Date(dataInicial).toLocaleDateString('pt-BR') : 'N/A'],
        ['Data Final', dataFinal ? new Date(dataFinal).toLocaleDateString('pt-BR') : 'N/A'],
        ['Período Total', dataInicial && dataFinal ? 
          Math.ceil((new Date(dataFinal) - new Date(dataInicial)) / (1000 * 60 * 60 * 24)) + 1 : 'N/A', 'dias'],
        [''],
        ['RESUMO FINANCEIRO'],
        ['Total NFC-e', totalGeralNfce],
        ['Total ECF', totalGeralECF],
        ['Total Geral', totalGeral],
       
        [''],
        ['RESUMO OPERACIONAL'],
        ['Lojas Ativas', getEstatisticasGerais().quantidadeLojas],
        ['PDVs Ativos', getEstatisticasGerais().quantidadePdvs],
        ['Formas de Pagamento', getEstatisticasGerais().quantidadeFormasPagamento],
      
        ['TOP PERFORMERS'],
        ['Loja Campeã', dadosProntos ? (getTopLoja()?.filial || 'N/A') : 'N/A'],
        ['Valor Loja Campeã', dadosProntos && getTopLoja() ? 
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopLoja().total) : 'R$ 0,00'],
        ['PDV Estrela', dadosProntos ? `PDV ${getTopPdvGeral()?.pdv || 'N/A'}` : 'N/A'],
        ['Loja PDV Estrela', dadosProntos ? (getTopPdvGeral()?.filial || 'N/A') : 'N/A'],
        ['Valor PDV Estrela', dadosProntos && getTopPdvGeral() ? 
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopPdvGeral().total) : 'R$ 0,00'],
        ['Forma Mais Utilizada', dadosProntos ? 
          (Object.entries(getTotaisPorFormaPagamento()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A') : 'N/A'],
        ['Valor Forma Mais Utilizada', dadosProntos ? 
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            Object.entries(getTotaisPorFormaPagamento()).sort((a, b) => b[1] - a[1])[0]?.[1] || 0
          ) : 'R$ 0,00'],
        [''],
        ['ANÁLISE ECF vs NFC-e'],
        ['Total ECF', totalGeralECF],
        ['Percentual ECF', dadosProntos && getEstatisticasGerais().totalVendas > 0 ? 
          ((getEstatisticasGerais().totalEcf / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0, '%'],
        ['Total NFC-e', totalGeralNfce],
        ['Percentual NFC-e', dadosProntos && getEstatisticasGerais().totalVendas > 0 ? 
          ((getEstatisticasGerais().totalNfce / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0, '%']
      ];

      // Dados das formas de pagamento
      const formasPagamentoData = [
        ['FORMAS DE PAGAMENTO'],
        ['Forma', 'Valor', 'Percentual do Total']
      ];
      
      if (dadosProntos) {
        Object.entries(getTotaisPorFormaPagamento())
          .sort((a, b) => b[1] - a[1])
          .forEach(([forma, total]) => {
            const percentual = getEstatisticasGerais().totalVendas > 0 ? 
              ((total / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0;
            formasPagamentoData.push([
              forma,
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
              `${percentual}%`
            ]);
          });
      }

      // Dados dos top 10 PDVs
      const topPdvsData = [
        ['TOP 10 PDVs POR VENDAS'],
        ['Posição', 'PDV', 'Loja', 'Total', 'NFC-e', 'ECF']
      ];
      
      if (dadosProntos) {
        getVendasPorPdv()
          .sort((a, b) => b.total - a.total)
          .slice(0, 10)
          .forEach((pdv, index) => {
            topPdvsData.push([
              index + 1,
              `PDV ${pdv.pdv}`,
              pdv.filial,
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.total),
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.nfce),
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.ecf)
            ]);
          });
      }

      // Dados dos top 10 lojas
      const topLojasData = [
        ['TOP 10 LOJAS POR VENDAS'],
        ['Posição', 'Loja', 'Total', 'NFC-e', 'ECF']
      ];
      
      if (dadosProntos) {
        getVendasPorLoja()
          .sort((a, b) => b.total - a.total)
          .slice(0, 10)
          .forEach((loja, index) => {
            topLojasData.push([
              index + 1,
              loja.nome,
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.total),
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.nfce),
              new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.ecf)
            ]);
          });
      }

      // Criar worksheets
      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      const wsFormasPagamento = XLSX.utils.aoa_to_sheet(formasPagamentoData);
      const wsTopPdvs = XLSX.utils.aoa_to_sheet(topPdvsData);
      const wsTopLojas = XLSX.utils.aoa_to_sheet(topLojasData);

      // Configurar larguras das colunas
      wsResumo['!cols'] = [{ width: 30 }, { width: 25 }];
      wsFormasPagamento['!cols'] = [{ width: 30 }, { width: 20 }, { width: 20 }];
      wsTopPdvs['!cols'] = [{ width: 10 }, { width: 15 }, { width: 30 }, { width: 20 }, { width: 20 }, { width: 20 }];
      wsTopLojas['!cols'] = [{ width: 10 }, { width: 30 }, { width: 20 }, { width: 20 }, { width: 20 }];

      // Adicionar worksheets ao workbook
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Executivo');
      XLSX.utils.book_append_sheet(wb, wsFormasPagamento, 'Formas de Pagamento');
      XLSX.utils.book_append_sheet(wb, wsTopPdvs, 'Top 10 PDVs');
      XLSX.utils.book_append_sheet(wb, wsTopLojas, 'Top 10 Lojas');

      // Gerar nome do arquivo
      const fileName = `Relatorio_Vendas_${dataInicial ? new Date(dataInicial).toISOString().split('T')[0] : 'inicio'}_${dataFinal ? new Date(dataFinal).toISOString().split('T')[0] : 'fim'}.xlsx`;

      // Salvar arquivo
      XLSX.writeFile(wb, fileName);

      toast.current.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Relatório exportado para Excel com sucesso!",
        life: 3000,
      });
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao exportar para Excel. Tente novamente.",
        life: 3000,
      });
    }
  };

  // Função para exportar para PDF
  const exportToPDF = () => {
    if (!dadosProntos) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Aguarde os dados carregarem antes de exportar",
        life: 3000,
      });
      return;
    }

    try {
      // Criar documento PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Configurações de estilo
      const titleFontSize = 16;
      const subtitleFontSize = 14;
      const normalFontSize = 12;
      const smallFontSize = 10;
      
      let yPosition = 20;
      const marginLeft = 20;
      const marginRight = 190;
      const lineHeight = 8;

      // Função para adicionar texto com quebra de linha
      const addText = (text, fontSize = normalFontSize, isBold = false, x = marginLeft) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(fontSize);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        doc.text(text, x, yPosition);
        yPosition += lineHeight;
      };

      // Função para adicionar linha separadora
      const addSeparator = () => {
        yPosition += 5;
        doc.line(marginLeft, yPosition, marginRight, yPosition);
        yPosition += 10;
      };

      // Cabeçalho
      addText('RELATÓRIO EXECUTIVO DE VENDAS', titleFontSize, true);
      addText('Análise Completa por PDV, Loja e Forma de Pagamento', subtitleFontSize);
      addSeparator();

      // Informações do período
      addText('INFORMAÇÕES DO PERÍODO ANALISADO', subtitleFontSize, true);
      addText(`Data Inicial: ${dataInicial ? new Date(dataInicial).toLocaleDateString('pt-BR') : 'N/A'}`);
      addText(`Data Final: ${dataFinal ? new Date(dataFinal).toLocaleDateString('pt-BR') : 'N/A'}`);
      addText(`Período Total: ${dataInicial && dataFinal ? 
        Math.ceil((new Date(dataFinal) - new Date(dataInicial)) / (1000 * 60 * 60 * 24)) + 1 : 'N/A'} dias`);
      addSeparator();

      // Resumo financeiro
      addText('RESUMO FINANCEIRO', subtitleFontSize, true);
      addText(`Total NFC-e: ${totalGeralNfce}`);
      addText(`Total ECF: ${totalGeralECF}`);
      addText(`Total Geral: ${totalGeral}`);
    
      addSeparator();

      // Resumo operacional
      addText('RESUMO OPERACIONAL', subtitleFontSize, true);
      addText(`Lojas Ativas: ${getEstatisticasGerais().quantidadeLojas}`);
      addText(`PDVs Ativos: ${getEstatisticasGerais().quantidadePdvs}`);
      addText(`Formas de Pagamento: ${getEstatisticasGerais().quantidadeFormasPagamento}`);
     
      addSeparator();

      // Top performers
      addText('TOP PERFORMERS', subtitleFontSize, true);
      addText(`Loja Campeã: ${dadosProntos ? (getTopLoja()?.filial || 'N/A') : 'N/A'}`);
      addText(`Valor: ${dadosProntos && getTopLoja() ? 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopLoja().total) : 'R$ 0,00'}`);
      addText(`PDV Estrela: PDV ${dadosProntos ? (getTopPdvGeral()?.pdv || 'N/A') : 'N/A'}`);
      addText(`Loja: ${dadosProntos ? (getTopPdvGeral()?.filial || 'N/A') : 'N/A'}`);
      addText(`Valor: ${dadosProntos && getTopPdvGeral() ? 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopPdvGeral().total) : 'R$ 0,00'}`);
      addSeparator();

      // Análise ECF vs NFC-e
      addText('ANÁLISE ECF vs NFC-e', subtitleFontSize, true);
      addText(`Total ECF: ${totalGeralECF} (${dadosProntos && getEstatisticasGerais().totalVendas > 0 ? 
        ((getEstatisticasGerais().totalEcf / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0}%)`);
      addText(`Total NFC-e: ${totalGeralNfce} (${dadosProntos && getEstatisticasGerais().totalVendas > 0 ? 
        ((getEstatisticasGerais().totalNfce / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0}%)`);
      addSeparator();

      // Top 10 PDVs
      addText('TOP 10 PDVs POR VENDAS', subtitleFontSize, true);
      if (dadosProntos) {
        getVendasPorPdv()
          .sort((a, b) => b.total - a.total)
          .slice(0, 10)
          .forEach((pdv, index) => {
            addText(`${index + 1}. PDV ${pdv.pdv} - ${pdv.filial}`);
            addText(`   Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.total)}`, smallFontSize, false, marginLeft + 10);
            addText(`   NFC-e: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.nfce)} | ECF: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.ecf)}`, smallFontSize, false, marginLeft + 10);
          });
      }
      addSeparator();

      // Top 10 Lojas
      addText('TOP 10 LOJAS POR VENDAS', subtitleFontSize, true);
      if (dadosProntos) {
        getVendasPorLoja()
          .sort((a, b) => b.total - a.total)
          .slice(0, 10)
          .forEach((loja, index) => {
            addText(`${index + 1}. ${loja.nome}`);
            addText(`   Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.total)}`, smallFontSize, false, marginLeft + 10);
            addText(`   NFC-e: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.nfce)} | ECF: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.ecf)}`, smallFontSize, false, marginLeft + 10);
          });
      }
      addSeparator();

      // Formas de pagamento
      addText('FORMAS DE PAGAMENTO', subtitleFontSize, true);
      if (dadosProntos) {
        Object.entries(getTotaisPorFormaPagamento())
          .sort((a, b) => b[1] - a[1])
          .forEach(([forma, total]) => {
            const percentual = getEstatisticasGerais().totalVendas > 0 ? 
              ((total / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0;
            addText(`${forma}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)} (${percentual}%)`);
          });
      }

      // Rodapé
      yPosition += 10;
      addText('Relatório gerado automaticamente pelo sistema de análise de vendas', smallFontSize, false, marginLeft);
      addText(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, smallFontSize, false, marginLeft);

      // Gerar nome do arquivo
      const fileName = `Relatorio_Vendas_${dataInicial ? new Date(dataInicial).toISOString().split('T')[0] : 'inicio'}_${dataFinal ? new Date(dataFinal).toISOString().split('T')[0] : 'fim'}.pdf`;

      // Salvar arquivo
      doc.save(fileName);

      toast.current.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Relatório exportado para PDF com sucesso!",
        life: 3000,
      });
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao exportar para PDF. Tente novamente.",
        life: 3000,
      });
    }
  };

 

  

  const getVendasTotal = () => {
    setLoading(true);
    setDadosProntos(false);
    setVendas(null);
    setTotalGeralNfce(0);
    setTotalGeralECF(0);
    setTotalGeral(0);

    if (!dataInicial || !dataFinal) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Preencha os campos de data para continuar",
        life: 3000,
      });
      setLoading(false);
    } else {
     
      getVendas(dataInicial, dataFinal, null, null);
      getVendasNfce(dataInicial, dataFinal, null, null);
      getVendasEcf(dataInicial, dataFinal, null, null);
    }
  };

  

  

  async function getVendas(dataInicial, dataFinal, loja, pdv) {
    // Usar função utilitária para formatar datas de forma segura
    let dateI = formatarDataSegura(dataInicial);
    let dateF = formatarDataSegura(dataFinal);
    
    // Log para debug - remover em produção se necessário
    console.log("getVendas - Iniciando chamada para API:", { dateI, dateF, dataInicial, dataFinal });
    console.log("getVendas - URL da API:", `/api_vga/vendas/total/0/${dateI}/${dateF}/0`);

    let pdvValue = "0";
    if (pdv && pdv.pdv) {
      pdvValue = pdv.pdv;
    }

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    await api
      .get(`/api_vga/vendas/total/${codigo}/${dateI}/${dateF}/${pdvValue}`)
      .then((response) => {
        console.log("getVendas - Resposta da API recebida:", response.data);
        setVendas(response.data);
        setLoading(false);
        console.log("getVendas - Estado vendas atualizado:", response.data);
      })
      .catch((err) => {
        setLoading(false);
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  async function getVendasNfce(dataInicial, dataFinal, loja, pdv) {
    // Usar função utilitária para formatar datas de forma segura
    let dateI = formatarDataSegura(dataInicial);
    let dateF = formatarDataSegura(dataFinal);

    let pdvValue = "0";
    if (pdv && pdv.pdv) {
      pdvValue = pdv.pdv;
    }

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    await api
      .get(`/api_vga/vendas/nfce/${codigo}/${dateI}/${dateF}/${pdvValue}`)
      .then((response) => {
        setVendasNfce(response.data);
      })
      .catch((err) => {
        setLoading(false);
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  async function getVendasEcf(dataInicial, dataFinal, loja, pdv) {
    // Usar função utilitária para formatar datas de forma segura
    let dateI = formatarDataSegura(dataInicial);
    let dateF = formatarDataSegura(dataFinal);

    let pdvValue = "0";
    if (pdv && pdv.pdv) {
      pdvValue = pdv.pdv;
    }

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    await api
      .get(`/api_vga/vendas/ecf/${codigo}/${dateI}/${dateF}/${pdvValue}`)
      .then((r) => {
        setVendasECF(r.data);
      })
      .catch((err) => {
        setLoading(false);
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  const headerTemplate = (data) => {
    let total = 0;
    let totalnfce = 0;
    let totalecf = 0;

    if (vendas) {
      for (let v of vendas) {
        if (v.nomefinalizador === data.nomefinalizador) {
          total += v.total;
        }
      }
    }

    if (vendasNfce) {
      for (let v of vendasNfce) {
        if (v.nomefinalizador === data.nomefinalizador) {
          totalnfce += v.total;
        }
      }
    }

    if (vendasECF) {
      for (let v of vendasECF) {
        if (v.nomefinalizador === data.nomefinalizador) {
          totalecf += v.total;
        }
      }
    }

    // Format totals after all calculations are complete
    const totalF = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);

    const totalnfceF = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(totalnfce);

    const totalecfF = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(totalecf);

    return (
      <React.Fragment>
        <div className="grid ">
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Forma de Pagamento
                  </span>
                  <div className="text-900 font-medium text-xl">
                    <strong> {data.nomefinalizador.toUpperCase()} </strong>
                  </div>
                </div>
                <div
                  className="flex align-items-center justify-content-center  border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-shopping-cart text-blue-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    NFC-e
                  </span>
                  <div className="text-900 font-medium text-xl">
                    {totalnfceF}
                  </div>
                </div>
                <div
                  className="flex align-items-center justify-content-center bg-blue-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-cloud-upload text-blue-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">ECF</span>
                  <div className="text-900 font-medium text-xl">
                    {totalecfF}
                  </div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-dollar text-green-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-800 font-medium mb-3">
                    <h2>
                      {" "}
                      <strong>
                        {" "}
                        TOTAL {data.nomefinalizador.toUpperCase()}{" "}
                      </strong>{" "}
                    </h2>
                  </span>
                  <div className="text-900 font-medium text-xl">{totalF}</div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-wallet text-green-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  useEffect(() => {
    console.log("useEffect - Iniciando carregamento automático das vendas");
    setLoading(true);
    setDadosProntos(false);
    
    // Carregar vendas automaticamente no primeiro carregamento
    // Usar datas padrão (hoje) para garantir que sempre funcione
    const hoje = new Date();
    console.log("useEffect - Carregando vendas do dia atual:", hoje);
    console.log("useEffect - Data formatada:", hoje.toISOString().split("T")[0]);
    
    // Atualizar os estados de data para refletir a data atual
    setDataInicial(hoje);
    setDataFinal(hoje);
    
    // Verificar se o token está disponível
    const token = localStorage.getItem("access_token");
    console.log("useEffect - Token disponível:", !!token);
    
    // Teste: verificar se a API está acessível
    console.log("useEffect - Testando API com URL:", `/api_vga/vendas/total/0/${hoje.toISOString().split("T")[0]}/${hoje.toISOString().split("T")[0]}/0`);
    
    // Teste de conectividade com a API
    const testarAPI = async () => {
      try {
        console.log("useEffect - Testando conectividade com a API...");
        const response = await api.get(`/api_vga/vendas/total/0/${hoje.toISOString().split("T")[0]}/${hoje.toISOString().split("T")[0]}/0`);
        console.log("useEffect - API respondendo:", response.status);
        
        // Se a API estiver funcionando, carregar os dados
        getVendas(hoje, hoje, null, null);
        getVendasNfce(hoje, hoje, null, null);
        getVendasEcf(hoje, hoje, null, null);
      } catch (error) {
        console.error("useEffect - Erro ao conectar com a API:", error);
        setLoading(false);
        toast.current?.show({
          severity: "error",
          summary: "Erro de Conexão",
          detail: "Não foi possível conectar com a API. Verifique sua conexão.",
          life: 5000,
        });
      }
    };
    
    testarAPI();
  
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  addLocale("pt-BR", {
    firstDayOfWeek: 0,
    dayNames: [
      "domingo",
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sábado",
    ],
    dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
    dayNamesMin: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    monthNamesShort: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Maio",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    today: " Agora ",
    clear: " Limpar ",
  });

  const itemTemplateStore = (option) => {
    return (
      <div className="flex align-items-center">
        <FontAwesomeIcon style={{ margin: "1rem" }} icon={faStore} />

        <div>
          {" "}
          {option.codigo} - {option.nome.substring(0, 15)}
        </div>
      </div>
    );
  };

  const selectedStore = (option) => {
    return (
      <div className="flex align-items-center">
        <FontAwesomeIcon style={{ margin: "1rem" }} icon={faStore} />

        <div>
          {" "}
          {option?.codigo} - {option?.nome.substring(0, 15)}
        </div>
      </div>
    );
  };

  const selectedTemplatePDV = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <FontAwesomeIcon style={{ margin: "1rem" }} icon={faCashRegister} />
          PDV
          <div>{option.pdv}</div>
        </div>
      );
    }
  };

  const itemTemplateCashier = (option) => {
    return (
      <div className="flex align-items-center">
        <FontAwesomeIcon style={{ margin: "1rem" }} icon={faCashRegister} />
        PDV
        <div>{option.pdv}</div>
      </div>
    );
  };
 
  // ----------------------------------------------------------------------------
  // Calcula totais globais somente após todos os carregamentos terminarem
  // ----------------------------------------------------------------------------
  useEffect(() => {
    // Verifica se todos os dados estão disponíveis e se não há loading
    if (!loading && vendas && vendasNfce && vendasECF && 
        vendas.length > 0 && vendasNfce.length > 0 && vendasECF.length > 0) {
      
      // Aguarda um pequeno delay para garantir que todos os dados estão processados
      const timeoutId = setTimeout(() => {
        try {
          // Valida se os dados são válidos antes de calcular
          if (Array.isArray(vendas) && Array.isArray(vendasNfce) && Array.isArray(vendasECF)) {
            const totalNfce = vendasNfce.reduce((acc, cur) => acc + (cur.total || 0), 0);
            const totalEcf = vendasECF.reduce((acc, cur) => acc + (cur.total || 0), 0);
            const totalGeralValue = totalNfce + totalEcf;

            setTotalGeralNfce(
              Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalNfce)
            );

            setTotalGeralECF(
              Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalEcf)
            );

            setTotalGeral(
              Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalGeralValue)
            );
            
            // Marca que todos os dados estão prontos para exibição
            setDadosProntos(true);
          }
        } catch (error) {
          console.error('Erro ao calcular totais:', error);
        }
      }, 100); // Delay de 100ms para garantir processamento

      return () => clearTimeout(timeoutId);
    }
  }, [loading, vendas, vendasNfce, vendasECF]);

  // Efeito para calcular o PDV com mais vendas
  useEffect(() => {
    // Só executa se não há loading e todos os dados estão disponíveis
    if (!loading && vendasNfce && vendasECF && 
        Array.isArray(vendasNfce) && Array.isArray(vendasECF) &&
        vendasNfce.length > 0 && vendasECF.length > 0) {
      
      const timeoutId = setTimeout(() => {
        try {
          const findTopPdv = (salesData) => {
            if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
              return null;
            }

            const salesByPdv = salesData.reduce((acc, sale) => {
              if (sale && sale.pdv && typeof sale.total === 'number') {
                acc[sale.pdv] = (acc[sale.pdv] || 0) + sale.total;
              }
              return acc;
            }, {});

            if (Object.keys(salesByPdv).length === 0) {
                return null;
            }

            const pdvsArray = Object.entries(salesByPdv);
            if (pdvsArray.length === 0) return null;

            const topPdv = pdvsArray.reduce((top, current) => {
              return current[1] > top[1] ? current : top;
            });

            return { pdv: topPdv[0], total: topPdv[1] };
          };

          setTopPdvNfce(findTopPdv(vendasNfce));
          setTopPdvEcf(findTopPdv(vendasECF));
        } catch (error) {
          console.error('Erro ao calcular top PDVs:', error);
        }
      }, 150); // Delay de 150ms para garantir processamento

      return () => clearTimeout(timeoutId);
    }
  }, [loading, vendasNfce, vendasECF]);

  // Função para calcular estatísticas gerais (todas as lojas e PDVs)
  const getEstatisticasGerais = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !vendasNfce || !vendasECF || 
        !Array.isArray(vendas) || !Array.isArray(vendasNfce) || !Array.isArray(vendasECF) ||
        vendas.length === 0 || vendasNfce.length === 0 || vendasECF.length === 0 ||
        loading || !dadosProntos) {
      return {
        totalVendas: 0,
        totalNfce: 0,
        totalEcf: 0,
        quantidadeLojas: 0,
        quantidadePdvs: 0,
        quantidadeFormasPagamento: 0,
       
      };
    }
    
    try {
      const totalVendas = vendas.reduce((sum, venda) => {
        if (venda && typeof venda.total === 'number') {
          return sum + venda.total;
        }
        return sum;
      }, 0);
      
      const totalNfce = vendasNfce.reduce((sum, venda) => {
        if (venda && typeof venda.total === 'number') {
          return sum + venda.total;
        }
        return sum;
      }, 0);
      
      const totalEcf = vendasECF.reduce((sum, venda) => {
        if (venda && typeof venda.total === 'number') {
          return sum + venda.total;
        }
        return sum;
      }, 0);
      
      // Todas as lojas e PDVs disponíveis
      const todasLojas = [...new Set(vendas.filter(v => v && v.filial).map(v => v.filial))];
      const todosPdvs = [...new Set(vendas.filter(v => v && v.pdv).map(v => v.pdv))];
      const formasPagamento = [...new Set(vendas.filter(v => v && v.nomefinalizador).map(v => v.nomefinalizador))];
      
      return {
        totalVendas,
        totalNfce,
        totalEcf,
        quantidadeLojas: todasLojas.length,
        quantidadePdvs: todosPdvs.length,
        quantidadeFormasPagamento: formasPagamento.length,
       
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas gerais:', error);
      return {
        totalVendas: 0,
        totalNfce: 0,
        totalEcf: 0,
        quantidadeLojas: 0,
        quantidadePdvs: 0,
        quantidadeFormasPagamento: 0,
       
      };
    }
  };

  // Função para calcular vendas por PDV (todas as lojas e PDVs)
  const getVendasPorPdv = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !vendasNfce || !vendasECF || 
        !Array.isArray(vendas) || !Array.isArray(vendasNfce) || !Array.isArray(vendasECF) ||
        vendas.length === 0 || vendasNfce.length === 0 || vendasECF.length === 0 ||
        loading || !dadosProntos) {
      return [];
    }
    
    try {
      const vendasPorPdv = {};
      
      // Processar vendas NFC-e
      vendasNfce.forEach(venda => {
        if (venda && venda.pdv && typeof venda.total === 'number') {
          if (!vendasPorPdv[venda.pdv]) {
            vendasPorPdv[venda.pdv] = { 
              pdv: venda.pdv, 
              filial: venda.filial || 'Loja não identificada', 
              nfce: 0, 
              ecf: 0, 
              total: 0 
            };
          }
          vendasPorPdv[venda.pdv].nfce += venda.total;
          vendasPorPdv[venda.pdv].total += venda.total;
        }
      });
      
      // Processar vendas ECF
      vendasECF.forEach(venda => {
        if (venda && venda.pdv && typeof venda.total === 'number') {
          if (!vendasPorPdv[venda.pdv]) {
            vendasPorPdv[venda.pdv] = { 
              pdv: venda.pdv, 
              filial: venda.filial || 'Loja não identificada', 
              nfce: 0, 
              ecf: 0, 
              total: 0 
            };
          }
          vendasPorPdv[venda.pdv].ecf += venda.total;
          vendasPorPdv[venda.pdv].total += venda.total;
        }
      });
      
      return Object.values(vendasPorPdv).sort((a, b) => b.total - a.total);
    } catch (error) {
      console.error('Erro ao calcular vendas por PDV:', error);
      return [];
    }
  };

  // Função para calcular vendas por loja (todas as lojas e PDVs)
  const getVendasPorLoja = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !vendasNfce || !vendasECF || 
        !Array.isArray(vendas) || !Array.isArray(vendasNfce) || !Array.isArray(vendasECF) ||
        vendas.length === 0 || vendasNfce.length === 0 || vendasECF.length === 0 ||
        loading || !dadosProntos) {
      return [];
    }
    
    try {
      const vendasPorLoja = {};
      
      // Processar vendas NFC-e por loja
      vendasNfce.forEach(venda => {
        if (venda && venda.filial && typeof venda.total === 'number') {
          const lojaNome = venda.filial;
          if (!vendasPorLoja[lojaNome]) {
            vendasPorLoja[lojaNome] = { 
              nome: lojaNome, 
              nfce: 0, 
              ecf: 0, 
              total: 0 
            };
          }
          vendasPorLoja[lojaNome].nfce += venda.total;
          vendasPorLoja[lojaNome].total += venda.total;
        }
      });
      
      // Processar vendas ECF por loja
      vendasECF.forEach(venda => {
        if (venda && venda.filial && typeof venda.total === 'number') {
          const lojaNome = venda.filial;
          if (!vendasPorLoja[lojaNome]) {
            vendasPorLoja[lojaNome] = { 
              nome: lojaNome, 
              nfce: 0, 
              ecf: 0, 
              total: 0 
            };
          }
          vendasPorLoja[lojaNome].ecf += venda.total;
          vendasPorLoja[lojaNome].total += venda.total;
        }
      });
      
      return Object.values(vendasPorLoja).sort((a, b) => b.total - a.total);
    } catch (error) {
      console.error('Erro ao calcular vendas por loja:', error);
      return [];
    }
  };

  // Função para calcular vendas detalhadas por PDV e Loja (todas as lojas e PDVs)
  const getVendasDetalhadasPorPdvLoja = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !Array.isArray(vendas) || vendas.length === 0 || loading || !dadosProntos) {
      return [];
    }
    
    try {
      const vendasDetalhadas = {};
      
      vendas.forEach(venda => {
        if (venda && venda.filial && venda.pdv && typeof venda.total === 'number' && venda.nomefinalizador) {
          const chave = `${venda.filial}_${venda.pdv}`;
          if (!vendasDetalhadas[chave]) {
            vendasDetalhadas[chave] = {
              chave: chave,
              filial: venda.filial,
              pdv: venda.pdv,
              total: 0,
              vendasPorForma: {},
              quantidadeVendas: 0
            };
          }
          
          vendasDetalhadas[chave].total += venda.total;
          vendasDetalhadas[chave].quantidadeVendas += 1;
          
          if (!vendasDetalhadas[chave].vendasPorForma[venda.nomefinalizador]) {
            vendasDetalhadas[chave].vendasPorForma[venda.nomefinalizador] = 0;
          }
          vendasDetalhadas[chave].vendasPorForma[venda.nomefinalizador] += venda.total;
        }
      });
      
      return Object.values(vendasDetalhadas).sort((a, b) => b.total - a.total);
    } catch (error) {
      console.error('Erro ao calcular vendas detalhadas por PDV e Loja:', error);
      return [];
    }
  };

  // Função para calcular totais por forma de pagamento (todas as lojas e PDVs)
  const getTotaisPorFormaPagamento = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !Array.isArray(vendas) || vendas.length === 0 || loading || !dadosProntos) {
      return {};
    }
    
    try {
      const totais = {};
      
      vendas.forEach(venda => {
        if (venda && venda.nomefinalizador && typeof venda.total === 'number') {
          if (!totais[venda.nomefinalizador]) {
            totais[venda.nomefinalizador] = 0;
          }
          totais[venda.nomefinalizador] += venda.total;
        }
      });
      
      return totais;
    } catch (error) {
      console.error('Erro ao calcular totais por forma de pagamento:', error);
      return {};
    }
  };

  // Função para encontrar a loja que mais vende (todas as lojas e PDVs)
  const getTopLoja = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !Array.isArray(vendas) || vendas.length === 0 || loading || !dadosProntos) {
      return null;
    }
    
    try {
      const vendasPorLoja = {};
      
      vendas.forEach(venda => {
        if (venda && venda.filial && typeof venda.total === 'number') {
          if (!vendasPorLoja[venda.filial]) {
            vendasPorLoja[venda.filial] = 0;
          }
          vendasPorLoja[venda.filial] += venda.total;
        }
      });
      
      const lojasArray = Object.entries(vendasPorLoja);
      if (lojasArray.length === 0) return null;
      
      const topLoja = lojasArray.reduce((max, current) => 
        current[1] > max[1] ? current : max
      );
      
      return {
        filial: topLoja[0],
        total: topLoja[1]
      };
    } catch (error) {
      console.error('Erro ao calcular top loja:', error);
      return null;
    }
  };

  // Função para encontrar o PDV que mais vende geral (todas as lojas e PDVs)
  const getTopPdvGeral = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !Array.isArray(vendas) || vendas.length === 0 || loading || !dadosProntos) {
      return null;
    }
    
    try {
      const vendasPorPdv = {};
      
      vendas.forEach(venda => {
        if (venda && venda.pdv && venda.filial && typeof venda.total === 'number') {
          if (!vendasPorPdv[venda.pdv]) {
            vendasPorPdv[venda.pdv] = {
              pdv: venda.pdv,
              filial: venda.filial,
              total: 0
            };
          }
          vendasPorPdv[venda.pdv].total += venda.total;
        }
      });
      
      const pdvsArray = Object.values(vendasPorPdv);
      if (pdvsArray.length === 0) return null;
      
      const topPdv = pdvsArray.reduce((max, current) => 
        current.total > max.total ? current : max
      );
      
      return topPdv;
    } catch (error) {
      console.error('Erro ao calcular top PDV geral:', error);
      return null;
    }
  };

  // Função para calcular ranking de PDVs por loja (todas as lojas e PDVs)
  const getRankingPdvPorLoja = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendas || !Array.isArray(vendas) || vendas.length === 0 || loading || !dadosProntos) {
      return {};
    }
    
    try {
      const rankingPorLoja = {};
      
      vendas.forEach(venda => {
        if (venda && venda.filial && venda.pdv && typeof venda.total === 'number') {
          if (!rankingPorLoja[venda.filial]) {
            rankingPorLoja[venda.filial] = {};
          }
          
          if (!rankingPorLoja[venda.filial][venda.pdv]) {
            rankingPorLoja[venda.filial][venda.pdv] = 0;
          }
          
          rankingPorLoja[venda.filial][venda.pdv] += venda.total;
        }
      });
      
      // Encontrar o PDV com mais vendas em cada loja
      const topPdvPorLoja = {};
      Object.keys(rankingPorLoja).forEach(loja => {
        const pdvs = Object.entries(rankingPorLoja[loja]);
        if (pdvs.length > 0) {
          const topPdv = pdvs.reduce((max, current) => 
            current[1] > max[1] ? current : max
          );
          topPdvPorLoja[loja] = {
            pdv: topPdv[0],
            total: topPdv[1]
          };
        }
      });
      
      return topPdvPorLoja;
    } catch (error) {
      console.error('Erro ao calcular ranking de PDVs por loja:', error);
      return {};
    }
  };

  // Função para formatar as formas de pagamento na tabela de forma mais elegante
  const formatarFormasPagamento = (vendasPorForma) => {
    if (!vendasPorForma || Object.keys(vendasPorForma).length === 0) {
      return (
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          color: '#9CA3AF',
          fontStyle: 'italic',
          backgroundColor: '#F9FAFB',
          borderRadius: '0.5rem',
          border: '1px dashed #D1D5DB'
        }}>
          Nenhuma forma de pagamento registrada
        </div>
      );
    }
    
    const formasArray = Object.entries(vendasPorForma).sort((a, b) => b[1] - a[1]);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {formasArray.map(([forma, valor], index) => {
          const percentual = getEstatisticasGerais().totalVendas > 0 ? 
            ((valor / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0;
          
          const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
          const cor = cores[index % cores.length];
          
          return (
            <div key={forma} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: `${cor}08`,
              borderRadius: '0.5rem',
              border: `1px solid ${cor}20`,
              transition: 'all 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: cor
                }} />
                <span style={{ 
                  fontWeight: '600', 
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  {forma}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontWeight: '700', 
                  color: cor,
                  fontSize: '0.875rem'
                }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6B7280',
                  marginTop: '0.125rem'
                }}>
                  {percentual}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Função para criar um card elegante para cada PDV
  const renderPdvCard = (pdvData) => {
    const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
    const cor = cores[Math.floor(Math.random() * cores.length)];
    
    return (
      <div key={pdvData.chave} style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        border: `1px solid #E5E7EB`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        marginBottom: '1.5rem'
      }}>
        {/* Header do Card */}
        <div style={{
          background: `linear-gradient(135deg, ${cor}15 0%, ${cor}05 100%)`,
          padding: '1.5rem',
          borderBottom: `1px solid ${cor}20`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1F2937'
              }}>
                🏪 {pdvData.filial}
              </h3>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '1rem',
                color: '#6B7280',
                fontWeight: '500'
              }}>
                PDV {pdvData.pdv}
              </p>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              border: `2px solid ${cor}30`,
              minWidth: '100px'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                Total Geral
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: '800', 
                color: cor 
              }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdvData.total)}
              </div>
            </div>
          </div>
          
          {/* Estatísticas rápidas */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              flex: 1,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                💳 Formas de Pagamento
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#3B82F6' }}>
                {Object.keys(pdvData.vendasPorForma).length}
              </div>
            </div>
          </div>
        </div>
        
        {/* Conteúdo do Card */}
        <div style={{ padding: '1.5rem' }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            💳 Formas de Pagamento Utilizadas
          </h4>
          {formatarFormasPagamento(pdvData.vendasPorForma)}
        </div>
      </div>
    );
  };

  // Função para formatar estatísticas
  const formatarEstatistica = (key, value) => {
    const labels = {
      totalVendas: 'Total Geral de Vendas',
      totalNfce: 'Total NFC-e',
      totalEcf: 'Total ECF',
      quantidadeLojas: 'Quantidade de Lojas',
      quantidadePdvs: 'Quantidade de PDVs',
      quantidadeFormasPagamento: 'Formas de Pagamento',
     
    };

    const formatarValor = (key, value) => {
      if (key.includes('total')) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      }
      return value.toString();
    };

    return {
      label: labels[key] || key,
      valor: formatarValor(key, value),
      icone: key.includes('total') ? '💰' : 
             key.includes('quantidade') ? '📊' : '📋'
    };
  };



  // Função para encontrar o PDV que mais vende em ECF
  const getTopPdvEcf = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendasECF || !Array.isArray(vendasECF) || vendasECF.length === 0 || loading || !dadosProntos) {
      return null;
    }
    
    try {
      const vendasPorPdv = {};
      vendasECF.forEach(venda => {
        if (venda && venda.pdv && venda.filial && typeof venda.total === 'number') {
          if (!vendasPorPdv[venda.pdv]) {
            vendasPorPdv[venda.pdv] = {
              pdv: venda.pdv,
              filial: venda.filial,
              total: 0
            };
          }
          vendasPorPdv[venda.pdv].total += venda.total;
        }
      });
      
      const pdvsArray = Object.values(vendasPorPdv);
      if (pdvsArray.length === 0) return null;
      
      const topPdv = pdvsArray.reduce((max, current) => 
        current.total > max.total ? current : max
      );
      
      return topPdv;
    } catch (error) {
      console.error('Erro ao calcular top PDV ECF:', error);
      return null;
    }
  };

  // Função para encontrar o PDV que mais vende em NFC-e
  const getTopPdvNfce = () => {
    // Verifica se todos os dados estão disponíveis antes de calcular
    if (!vendasNfce || !Array.isArray(vendasNfce) || vendasNfce.length === 0 || loading || !dadosProntos) {
      return null;
    }
    
    try {
      const vendasPorPdv = {};
      vendasNfce.forEach(venda => {
        if (venda && venda.pdv && venda.filial && typeof venda.total === 'number') {
          if (!vendasPorPdv[venda.pdv]) {
            vendasPorPdv[venda.pdv] = {
              pdv: venda.pdv,
              filial: venda.filial,
              total: 0
            };
          }
          vendasPorPdv[venda.pdv].total += venda.total;
        }
      });
      
      const pdvsArray = Object.values(vendasPorPdv);
      if (pdvsArray.length === 0) return null;
      
      const topPdv = pdvsArray.reduce((max, current) => 
        current.total > max.total ? current : max
      );
      
      return topPdv;
    } catch (error) {
      console.error('Erro ao calcular top PDV NFC-e:', error);
      return null;
    }
  };

  // Templates para formatação das células das tabelas
  const cellTemplateNfce = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.nfce || 0);
  };

  const cellTemplateEcf = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.ecf || 0);
  };

  const cellTemplateTotal = (rowData) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.total || 0);
  };

  // ============================================================================
  // ANÁLISES DETALHADAS POR PDV E LOJA
  // ============================================================================

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      
      {/* Injetar CSS para animações */}
      <style>{pulseAnimation}</style>

      <Footer />
    <div ref={tabelaRef} className="page-container">
      <div className="container-venda page-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1em",
            padding: "1rem"
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
            <Player src={ImagemDestaque} loop autoplay style={{ width: "120px" }} />
            <div>
              <h2 style={{margin: 0, color: '#1f2937'}}>Vendas por Finalizador</h2>
              <p style={{margin: 0, color: '#6b7280'}}>Análise detalhada de vendas por tipo de documento e finalizador.</p>
            </div>
          </div>
          <Button
            style={{ margin: "0px 5px" }}
            label="Imprimir"
            className="p-button p-button-rounded p-button-warning"
            onClick={() => handlePrint()}
            icon="pi pi-print"
          />
        </div>

        {/* FILTROS MELHORADOS - APENAS DATAS */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '2rem',
          backgroundColor: '#F8FAFC',
          borderRadius: '1rem',
          border: '1px solid #E2E8F0',
          margin: '1rem 0'
        }}>
          {/* Status dos Dados */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: loading ? '#FEF3C7' : dadosProntos ? '#D1FAE5' : '#FEE2E2',
            borderRadius: '0.75rem',
            border: `2px solid ${loading ? '#F59E0B' : dadosProntos ? '#10B981' : '#EF4444'}`
          }}>
            <div style={{
              width: '1rem',
              height: '1rem',
              borderRadius: '50%',
              backgroundColor: loading ? '#F59E0B' : dadosProntos ? '#10B981' : '#EF4444',
              animation: loading ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: loading ? '#92400E' : dadosProntos ? '#065F46' : '#991B1B'
            }}>
              {loading ? '🔄 Carregando dados da API...' : 
               dadosProntos ? '✅ Dados carregados e prontos para análise' : 
               '❌ Aguardando dados da API'}
            </span>
          </div>
          
          <div style={{
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937'
            }}>
              📅 Selecione o Período de Análise
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#6B7280'
            }}>
              Escolha o intervalo de datas para analisar as vendas
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            alignItems: 'end'
          }}>
            {/* Filtro de Data Inicial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="dateI" style={{
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.5rem',
                  height: '1.5rem',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  1
                </span>
                Data Inicial
              </label>
              <Calendar
                locale="pt-BR"
                selectOtherMonths
                showIcon
                showButtonBar
                id="dateI"
                dateFormat="dd/mm/yy"
                className="input-calendar"
                placeholder="Selecione a data inicial"
                value={dataInicial}
                onChange={(e) => {
                  const novaData = e.target.value;
                  if (novaData && !isNaN(new Date(novaData).getTime())) {
                    setDataInicial(novaData);
                  } else {
                    console.warn("Data inicial inválida:", novaData);
                    toast.current.show({
                      severity: "warn",
                      summary: "Aviso",
                      detail: "Data inicial inválida. Selecione uma data válida.",
                      life: 3000,
                    });
                  }
                }}
                style={{
                  width: '100%',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  padding: '0.75rem'
                }}
              />
            </div>

            {/* Filtro de Data Final */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="dateF" style={{
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.5rem',
                  height: '1.5rem',
                  backgroundColor: '#10B981',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  2
                </span>
                Data Final
              </label>
              <Calendar
                showIcon
                selectOtherMonths
                locale="pt-BR"
                showButtonBar
                id="dateF"
                dateFormat="dd/mm/yy"
                className="input-calendar"
                placeholder="Selecione a data final"
                value={dataFinal}
                onChange={(e) => {
                  const novaData = e.target.value;
                  if (novaData && !isNaN(new Date(novaData).getTime())) {
                    setDataFinal(novaData);
                  } else {
                    console.warn("Data final inválida:", novaData);
                    toast.current.show({
                      severity: "warn",
                      summary: "Aviso",
                      detail: "Data final inválida. Selecione uma data válida.",
                      life: 3000,
                    });
                  }
                }}
                style={{
                  width: '100%',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  padding: '0.75rem'
                }}
              />
            </div>

            {/* Botões de Ação */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <Button
                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
                onClick={() => getVendasTotal()}
                className="p-button-success"
                style={{
                  height: '3.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease-in-out'
                }}
                aria-label="Search"
                label={loading ? "Pesquisando..." : "🔍 Pesquisar Vendas"}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px -1px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)';
                  }
                }}
              />
              
              
            </div>
          </div>
          
          {/* Informações Adicionais */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                📊 Período Selecionado
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1F2937' }}>
                {dataInicial ? new Date(dataInicial).toLocaleDateString('pt-BR') : 'Não definido'} 
                {' → '} 
                {dataFinal ? new Date(dataFinal).toLocaleDateString('pt-BR') : 'Não definido'}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                🏪 Cobertura
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1F2937' }}>
                Todas as Lojas e PDVs
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                📈 Análise
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1F2937' }}>
                Completa e Detalhada
              </div>
            </div>
          </div>
        </div>
      </div>

{/* DASHBOARD MODERNO E DETALHADO */}
<div className="page-card" style={{marginTop: '2rem'}}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700'}}>
            📊 DASHBOARD DE ANÁLISE DE VENDAS
          </h2>
          <p style={{margin: 0, fontSize: '1.1rem', opacity: 0.9}}>
            Análise completa e detalhada das vendas por PDV, loja e forma de pagamento
          </p>
        </div>

        {/* CARDS DE RESUMO EXECUTIVO */}
        <div className="grid mb-4">
          <div className="col-12 md:col-3">
            <div style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>💰</div>
              <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                {!dadosProntos ? (
                  <Skeleton width="100%" height="2rem" />
                ) : (
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getEstatisticasGerais().totalVendas)
                )}
              </div>
              <div style={{fontSize: '0.875rem', opacity: 0.9}}>Total de Vendas</div>
            </div>
          </div>
          <div className="col-12 md:col-3">
            <div style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🏪</div>
              <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                {!dadosProntos ? (
                  <Skeleton width="100%" height="2rem" />
                ) : (
                  getEstatisticasGerais().quantidadeLojas
                )}
              </div>
              <div style={{fontSize: '0.875rem', opacity: 0.9}}>Lojas Ativas</div>
            </div>
          </div>
          <div className="col-12 md:col-3">
            <div style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🖥️</div>
              <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                {!dadosProntos ? (
                  <Skeleton width="100%" height="2rem" />
                ) : (
                  getEstatisticasGerais().quantidadePdvs
                )}
              </div>
              <div style={{fontSize: '0.875rem', opacity: 0.9}}>PDVs Ativos</div>
            </div>
          </div>
          <div className="col-12 md:col-3">
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>💳</div>
              <div style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem'}}>
                {!dadosProntos ? (
                  <Skeleton width="100%" height="2rem" />
                ) : (
                  getEstatisticasGerais().quantidadeFormasPagamento
                )}
              </div>
              <div style={{fontSize: '0.875rem', opacity: 0.9}}>Formas de Pagamento</div>
            </div>
          </div>
        </div>

        {/* GRÁFICOS E VISUALIZAÇÕES MODERNAS */}
        <div className="grid">
          <div className="col-12 md:col-6">
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <h4 style={{
                color: '#1f2937',
                marginBottom: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 Distribuição por Forma de Pagamento
              </h4>
              <div style={{height: '350px', overflowY: 'auto'}}>
                {Object.entries(getTotaisPorFormaPagamento())
                  .sort((a, b) => b[1] - a[1])
                  .map(([forma, total], index) => {
                  const percentual = ((total / getEstatisticasGerais().totalVendas) * 100).toFixed(1);
                  const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
                  return (
                    <div key={forma} style={{
                      background: '#F9FAFB',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      border: '1px solid #E5E7EB'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span style={{fontSize: '1rem', fontWeight: '600', color: '#374151'}}>{forma}</span>
                        <span style={{fontSize: '1rem', fontWeight: 'bold', color: '#059669'}}>{percentual}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '12px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          width: `${percentual}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${cores[index % cores.length]} 0%, ${cores[index % cores.length]}dd 100%)`,
                          borderRadius: '6px',
                          transition: 'width 0.8s ease-in-out'
                        }}></div>
                      </div>
                      <div style={{fontSize: '0.875rem', color: '#6B7280', fontWeight: '500'}}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB'
            }}>
              <h4 style={{
                color: '#1f2937',
                marginBottom: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🏆 Top 10 PDVs por Vendas
              </h4>
              <div style={{height: '350px', overflowY: 'auto'}}>
                {getVendasDetalhadasPorPdvLoja()
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 10)
                  .map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #E5E7EB',
                    backgroundColor: index === 0 ? '#FEF3C7' : index === 1 ? '#F3F4F6' : index === 2 ? '#FEF2F2' : '#F9FAFB',
                    transition: 'all 0.2s ease-in-out'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: index === 0 ? '#F59E0B' : index === 1 ? '#6B7280' : index === 2 ? '#EF4444' : '#3B82F6'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{fontWeight: 'bold', fontSize: '1rem', color: '#374151'}}>
                          PDV {item.pdv}
                        </div>
                        <div style={{fontSize: '0.875rem', color: '#6B7280'}}>{item.filial}</div>
                        <div style={{fontSize: '0.875rem', color: '#6B7280'}}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}</div>
                      </div>
                    </div>
                   
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      

      <div className="page-card" style={{marginTop: '1rem'}}>
        <div className="grid">
          <div className="col-12 md:col-6 lg:col-4">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total Geral NFC-e
                  </span>
                  <div className="text-900 font-medium text-xl">
                    <h1> {totalGeralNfce} </h1>
                  </div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-blue-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-cloud text-blue-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6 lg:col-4">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total Geral ECF
                  </span>
                  <div className="text-900 font-medium text-xl">
                    <h1> {totalGeralECF} </h1>
                  </div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-dollar text-green-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 md:col-6 lg:col-4">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total Geral
                  </span>
                  <div className="text-900 font-medium text-xl">
                    <h1> 
                      {totalGeral || 'R$ 0,00'}
                    </h1>
                  </div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-wallet text-green-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-card" style={{marginTop: '1rem'}}>
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">PDV Destaque (NFC-e)</span>
                  <div className="text-900 font-medium text-xl">PDV {topPdvNfce?.pdv || '-'}</div>
                </div>
                <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-star-fill text-purple-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {topPdvNfce ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topPdvNfce.total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">PDV Destaque (ECF)</span>
                  <div className="text-900 font-medium text-xl">PDV {topPdvEcf?.pdv || '-'}</div>
                </div>
                <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-star-fill text-purple-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {topPdvEcf ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topPdvEcf.total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-card" style={{marginTop: '1rem'}}>
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">Vendas por PDV</span>
                </div>
              </div>
              <DataTable
                value={getVendasPorPdv()}
                responsiveLayout="scroll"
                stripedRows
                showGridlines
                dataKey="pdv"
                sortMode="single"
                sortField="total"
                sortOrder={-1}
                paginator
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} vendas"
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Nenhuma venda por PDV encontrada."
              >
                <Column field="filial" header="Loja" /> 
                <Column field="pdv" header="PDV" />
                <Column field="nfce" header="NFC-e" body={cellTemplateNfce} />
                <Column field="ecf" header="ECF" body={cellTemplateEcf} />
                <Column field="total" header="Total" body={cellTemplateTotal} />
              </DataTable>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">Vendas por Loja</span>
                </div>
              </div>
                             <DataTable
                 value={getVendasPorLoja()}
                 responsiveLayout="scroll"
                 stripedRows
                 showGridlines
                 dataKey="nome"
                 sortMode="single"
                 sortField="total"
                 sortOrder={-1}
                 paginator
                 rows={10}
                 paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                 currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} vendas"
                 rowsPerPageOptions={[5, 10, 25, 50]}
                 emptyMessage="Nenhuma venda por loja encontrada."
               >
                 <Column field="nome" header="Loja" />
                 <Column field="nfce" header="NFC-e" body={cellTemplateNfce} />
                 <Column field="ecf" header="ECF" body={cellTemplateEcf} />
                 <Column field="total" header="Total" body={cellTemplateTotal} />
               </DataTable>
            </div>
          </div>
        </div>
      </div>

             {/* NOVA VISUALIZAÇÃO ELEGANTE - VENDAS DETALHADAS POR PDV E LOJA */}
       <div className="page-card" style={{marginTop: '1rem'}}>
         <div className="surface-0 shadow-2 p-4 border-1 border-50 border-round">
           <div className="text-center mb-4">
             <h2 style={{
               margin: '0 0 0.5rem 0',
               fontSize: '1.75rem',
               fontWeight: '700',
               color: '#1F2937',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '0.75rem'
             }}>
               📊 Vendas Detalhadas por PDV e Loja
             </h2>
             <p style={{
               margin: 0,
               fontSize: '1rem',
               color: '#6B7280',
               maxWidth: '600px',
               marginLeft: 'auto',
               marginRight: 'auto'
             }}>
               Análise completa e visual de cada PDV com suas vendas por forma de pagamento
             </p>
           </div>
           
           {/* Filtros e Controles */}
           <div style={{
             display: 'flex',
             justifyContent: 'center',
             gap: '1rem',
             marginBottom: '2rem',
             flexWrap: 'wrap'
           }}>
             <div style={{
               padding: '0.5rem 1rem',
               backgroundColor: '#F3F4F6',
               borderRadius: '2rem',
               fontSize: '0.875rem',
               color: '#374151',
               fontWeight: '500'
             }}>
               📍 Total de PDVs: <strong>{getVendasDetalhadasPorPdvLoja().length}</strong>
             </div>
             <div style={{
               padding: '0.5rem 1rem',
               backgroundColor: '#F3F4F6',
               borderRadius: '2rem',
               fontSize: '0.875rem',
               color: '#374151',
               fontWeight: '500'
             }}>
               💰 Valor Total: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getVendasDetalhadasPorPdvLoja().reduce((sum, pdv) => sum + pdv.total, 0))}</strong>
             </div>
             <div style={{
               padding: '0.5rem 1rem',
               backgroundColor: '#F3F4F6',
               borderRadius: '2rem',
               fontSize: '0.875rem',
               color: '#374151',
               fontWeight: '500'
             }}>
               🏪 Lojas Ativas: <strong>{[...new Set(getVendasDetalhadasPorPdvLoja().map(pdv => pdv.filial))].length}</strong>
             </div>
           </div>
           
           {/* Grid de Cards */}
           <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
             gap: '1.5rem',
             marginTop: '2rem'
           }}>
             {getVendasDetalhadasPorPdvLoja().map((pdvData) => renderPdvCard(pdvData))}
           </div>
           
           {/* Mensagem quando não há dados */}
           {getVendasDetalhadasPorPdvLoja().length === 0 && (
             <div style={{
               textAlign: 'center',
               padding: '3rem',
               color: '#9CA3AF'
             }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
               <h3 style={{ margin: '0 0 0.5rem 0', color: '#6B7280' }}>
                 Nenhum PDV encontrado
               </h3>
               <p style={{ margin: 0, color: '#9CA3AF' }}>
                 Selecione um período e filtre os dados para visualizar as vendas detalhadas
               </p>
             </div>
           )}
         </div>
       </div>

      <div className="page-card" style={{marginTop: '1rem'}}>
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">🏆 Ranking de PDVs por Loja</span>
                  <p className="text-600 text-sm m-0">PDV com mais vendas em cada loja</p>
                </div>
              </div>
              <DataTable
                value={Object.entries(getRankingPdvPorLoja()).map(([loja, data]) => ({ loja, ...data }))}
                responsiveLayout="scroll"
                stripedRows
                showGridlines
                dataKey="loja"
                sortMode="single"
                sortField="total"
                sortOrder={-1}
                paginator
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} lojas"
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Nenhum ranking de PDV por loja encontrado."
              >
                <Column field="loja" header="🏪 Loja" style={{minWidth: '200px'}} />
                <Column field="pdv" header="🖥️ PDV Destaque" style={{minWidth: '120px', textAlign: 'center'}} />
                <Column field="total" header="💰 Total" body={cellTemplateTotal} style={{minWidth: '150px'}} />
              </DataTable>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">📊 Estatísticas Gerais</span>
                  <p className="text-600 text-sm m-0">Métricas completas do período analisado</p>
                </div>
              </div>
              <div className="grid">
                {Object.entries(getEstatisticasGerais()).map(([key, value]) => {
                  const estatistica = formatarEstatistica(key, value);
                  return (
                    <div key={key} className="col-12 md:col-6">
                      <div style={{
                        padding: '1rem',
                        margin: '0.5rem 0',
                        backgroundColor: '#f8fafc',
                        borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                      }}>
                        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{estatistica.icone}</div>
                        <div style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                          {estatistica.label}
                        </div>
                        <div style={{fontSize: '1.125rem', fontWeight: '600', color: '#059669'}}>
                          {estatistica.valor}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE RANKINGS E DESTAQUES */}
      <div className="page-card" style={{marginTop: '1rem'}}>
        <h3 style={{marginBottom: '1rem', color: '#1f2937', textAlign: 'center'}}>🏆 RANKINGS E DESTAQUES</h3>
        <div className="grid">
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">🥇 Loja que Mais Vende</span>
                  <div className="text-900 font-medium text-xl">
                    {getTopLoja()?.filial || 'N/A'}
                  </div>
                </div>
                <div className="flex align-items-center justify-content-center bg-yellow-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-trophy text-yellow-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {getTopLoja() ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopLoja().total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">🥇 PDV que Mais Vende</span>
                  <div className="text-900 font-medium text-xl">
                    PDV {getTopPdvGeral()?.pdv || 'N/A'}
                  </div>
                  <div className="text-500 text-sm">
                    {getTopPdvGeral()?.filial || 'N/A'}
                  </div>
                </div>
                <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-star-fill text-blue-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {getTopPdvGeral() ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopPdvGeral().total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">🥇 PDV Destaque ECF</span>
                  <div className="text-900 font-medium text-xl">
                    PDV {getTopPdvEcf()?.pdv || 'N/A'}
                  </div>
                  <div className="text-500 text-sm">
                    {getTopPdvEcf()?.filial || 'N/A'}
                  </div>
                </div>
                <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-dollar text-green-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {getTopPdvEcf() ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopPdvEcf().total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">🥇 PDV Destaque NFC-e</span>
                  <div className="text-900 font-medium text-xl">
                    PDV {getTopPdvNfce()?.pdv || 'N/A'}
                  </div>
                  <div className="text-500 text-sm">
                    {getTopPdvNfce()?.filial || 'N/A'}
                  </div>
                </div>
                <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-cloud text-purple-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {getTopPdvNfce() ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopPdvNfce().total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
        </div>
      </div>

             {/* SEÇÃO DE ANÁLISE DETALHADA POR FORMA DE PAGAMENTO - DESIGN MELHORADO */}
       <div className="page-card" style={{marginTop: '1rem'}}>
         <div className="surface-0 shadow-2 p-4 border-1 border-50 border-round">
           <div className="text-center mb-4">
             <h2 style={{
               margin: '0 0 0.5rem 0',
               fontSize: '1.75rem',
               fontWeight: '700',
               color: '#1F2937',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '0.75rem'
             }}>
               💳 ANÁLISE POR FORMA DE PAGAMENTO
             </h2>
             <p style={{
               margin: 0,
               fontSize: '1rem',
               color: '#6B7280',
               maxWidth: '600px',
               marginLeft: 'auto',
               marginRight: 'auto'
             }}>
               Distribuição detalhada das vendas por cada forma de pagamento disponível
             </p>
           </div>
           
           <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
             gap: '1.5rem',
             marginTop: '2rem'
           }}>
             {Object.entries(getTotaisPorFormaPagamento()).map(([forma, total], index) => {
               const percentual = getEstatisticasGerais().totalVendas > 0 ? 
                 ((total / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0;
               const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
               const cor = cores[index % cores.length];
               
               return (
                 <div key={forma} style={{
                   backgroundColor: 'white',
                   borderRadius: '1rem',
                   border: `1px solid #E5E7EB`,
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                   overflow: 'hidden',
                   transition: 'all 0.3s ease-in-out',
                   position: 'relative'
                 }}>
                   {/* Indicador de cor lateral */}
                   <div style={{
                     position: 'absolute',
                     left: 0,
                     top: 0,
                     bottom: 0,
                     width: '6px',
                     backgroundColor: cor
                   }} />
                   
                   <div style={{ padding: '1.5rem' }}>
                     {/* Header do Card */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                       <div style={{ flex: 1 }}>
                         <h3 style={{
                           margin: '0 0 0.5rem 0',
                           fontSize: '1.125rem',
                           fontWeight: '700',
                           color: '#1F2937'
                         }}>
                           {forma}
                         </h3>
                         <div style={{
                           fontSize: '0.875rem',
                           color: '#6B7280',
                           marginBottom: '0.5rem'
                         }}>
                           Forma de Pagamento
                         </div>
                       </div>
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         width: '3rem',
                         height: '3rem',
                         backgroundColor: `${cor}15`,
                         borderRadius: '0.75rem',
                         border: `2px solid ${cor}30`
                       }}>
                         <i className="pi pi-credit-card text-xl" style={{color: cor}}></i>
                       </div>
                     </div>
                     
                     {/* Valor Principal */}
                     <div style={{
                       fontSize: '1.75rem',
                       fontWeight: '800',
                       color: cor,
                       marginBottom: '1rem',
                       textAlign: 'center'
                     }}>
                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                     </div>
                     
                     {/* Percentual e Barra de Progresso */}
                     <div style={{ marginBottom: '1rem' }}>
                       <div style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         marginBottom: '0.5rem'
                       }}>
                         <span style={{
                           fontSize: '0.875rem',
                           color: '#6B7280',
                           fontWeight: '500'
                         }}>
                           Participação no Total
                         </span>
                         <span style={{
                           fontSize: '1rem',
                           fontWeight: '700',
                           color: cor
                         }}>
                           {percentual}%
                         </span>
                       </div>
                       
                       {/* Barra de Progresso Melhorada */}
                       <div style={{
                         width: '100%',
                         height: '12px',
                         backgroundColor: '#F3F4F6',
                         borderRadius: '6px',
                         overflow: 'hidden',
                         border: '1px solid #E5E7EB'
                       }}>
                         <div style={{
                           width: `${percentual}%`,
                           height: '100%',
                           background: `linear-gradient(90deg, ${cor} 0%, ${cor}CC 100%)`,
                           borderRadius: '6px',
                           transition: 'width 1s ease-in-out',
                           boxShadow: `0 0 8px ${cor}40`
                         }} />
                       </div>
                     </div>
                     
                                          {/* Estatísticas Adicionais */}
                     <div style={{
                       display: 'flex',
                       justifyContent: 'center',
                       padding: '1rem',
                       backgroundColor: '#F9FAFB',
                       borderRadius: '0.5rem',
                       border: '1px solid #E5E7EB'
                     }}>
                       <div style={{ textAlign: 'center' }}>
                         <div style={{
                           fontSize: '0.75rem',
                           color: '#6B7280',
                           marginBottom: '0.25rem'
                         }}>
                           Ranking
                         </div>
                         <div style={{
                           fontSize: '1.125rem',
                           fontWeight: '700',
                           color: cor
                         }}>
                           #{index + 1}
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
           
           {/* Resumo Geral */}
           <div style={{
             marginTop: '2rem',
             padding: '1.5rem',
             backgroundColor: '#F8FAFC',
             borderRadius: '0.75rem',
             border: '1px solid #E2E8F0'
           }}>
             <h4 style={{
               margin: '0 0 1rem 0',
               fontSize: '1.125rem',
               fontWeight: '600',
               color: '#1F2937',
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem'
             }}>
               📊 Resumo das Formas de Pagamento
             </h4>
             <div style={{
               display: 'grid',
               gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
               gap: '1rem'
             }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                   Total de Formas
                 </div>
                 <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3B82F6' }}>
                   {Object.keys(getTotaisPorFormaPagamento()).length}
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                   Forma Mais Utilizada
                 </div>
                 <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669' }}>
                   {Object.entries(getTotaisPorFormaPagamento()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                   Maior Percentual
                 </div>
                 <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F59E0B' }}>
                   {Object.entries(getTotaisPorFormaPagamento()).map(([forma, total]) => ({
                     forma,
                     percentual: getEstatisticasGerais().totalVendas > 0 ? 
                       ((total / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0
                   })).sort((a, b) => parseFloat(b.percentual) - parseFloat(a.percentual))[0]?.percentual || 0}%
                 </div>
               </div>
             </div>
           </div>
           
           {/* ANÁLISE DETALHADA ECF vs NFC-e */}
           <div style={{
             marginTop: '2rem',
             padding: '2rem',
             backgroundColor: '#F8FAFC',
             borderRadius: '1rem',
             border: '1px solid #E2E8F0'
           }}>
             <div style={{
               textAlign: 'center',
               marginBottom: '2rem'
             }}>
               <h3 style={{
                 margin: '0 0 0.5rem 0',
                 fontSize: '1.5rem',
                 fontWeight: '700',
                 color: '#1F2937',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '0.75rem'
               }}>
                 📊 ANÁLISE DETALHADA ECF vs NFC-e
               </h3>
               <p style={{
                 margin: 0,
                 fontSize: '1rem',
                 color: '#6B7280',
                 maxWidth: '700px',
                 marginLeft: 'auto',
                 marginRight: 'auto'
               }}>
                 Percentuais de vendas ECF e NFC-e por PDV, por loja e do total geral
               </p>
             </div>

             

             {/* Gráfico de Barras - Percentuais por PDV */}
             <div className="grid mb-4">
               <div className="col-12">
                 <div className="surface-0 shadow-1 p-3 border-1 border-50 border-round">
                   <h4 style={{color: '#1f2937', marginBottom: '1rem', textAlign: 'center'}}>
                     📊 Percentuais ECF vs NFC-e por PDV (Top 10)
                   </h4>
                   <div style={{height: '400px', overflowY: 'auto'}}>
                     {getVendasPorPdv()
                       .sort((a, b) => b.total - a.total)
                       .slice(0, 10)
                       .map((pdv, index) => {
                       const totalPdv = pdv.total;
                       const percentualEcf = totalPdv > 0 ? ((pdv.ecf / totalPdv) * 100).toFixed(1) : 0;
                       const percentualNfce = totalPdv > 0 ? ((pdv.nfce / totalPdv) * 100).toFixed(1) : 0;
                       
                       return (
                         <div key={pdv.pdv} style={{marginBottom: '1rem'}}>
                           <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                             <span style={{fontWeight: '600', minWidth: '80px'}}>PDV {pdv.pdv}</span>
                             <span style={{fontSize: '0.875rem', color: '#6B7280', marginLeft: '1rem'}}>
                               {pdv.filial || 'Loja não identificada'}
                             </span>
                             <span style={{fontSize: '0.875rem', color: '#6B7280', marginLeft: '1rem'}}>
                               Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPdv)}
                             </span>
                           </div>
                           <div style={{
                             width: '100%',
                             height: '25px',
                             backgroundColor: '#F3F4F6',
                             borderRadius: '12px',
                             overflow: 'hidden',
                             position: 'relative'
                           }}>
                             <div style={{
                               width: `${percentualEcf}%`,
                               height: '100%',
                               backgroundColor: '#10B981',
                               borderRadius: '12px 0 0 12px',
                               transition: 'width 1s ease-in-out'
                             }} />
                             <div style={{
                               width: `${percentualNfce}%`,
                               height: '100%',
                               backgroundColor: '#EF4444',
                               borderRadius: '0 12px 12px 0',
                               transition: 'width 1s ease-in-out',
                               position: 'absolute',
                               left: `${percentualEcf}%`
                             }} />
                           </div>
                           <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem'}}>
                             <span style={{color: '#10B981', fontWeight: '600'}}>🟢 ECF: {percentualEcf}%</span>
                             <span style={{color: '#EF4444', fontWeight: '600'}}>🔴 NFC-e: {percentualNfce}%</span>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
             </div>

             {/* Gráfico de Barras - Percentuais por Loja */}
             <div className="grid mb-4">
               <div className="col-12">
                 <div className="surface-0 shadow-1 p-3 border-1 border-50 border-round">
                   <h4 style={{color: '#1f2937', marginBottom: '1rem', textAlign: 'center'}}>
                     🏪 Percentuais ECF vs NFC-e por Loja
                   </h4>
                   <div style={{height: '400px', overflowY: 'auto'}}>
                     {getVendasPorLoja()
                       .sort((a, b) => b.total - a.total)
                       .map((loja, index) => {
                       const totalLoja = loja.total;
                       const percentualEcf = totalLoja > 0 ? ((loja.ecf / totalLoja) * 100).toFixed(1) : 0;
                       const percentualNfce = totalLoja > 0 ? ((loja.nfce / totalLoja) * 100).toFixed(1) : 0;
                       
                       return (
                         <div key={loja.nome} style={{marginBottom: '1rem'}}>
                           <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                             <span style={{fontWeight: '600', minWidth: '120px'}}>{loja.nome}</span>
                             <span style={{fontSize: '0.875rem', color: '#6B7280', marginLeft: '1rem'}}>
                               Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoja)}
                             </span>
                           </div>
                           <div style={{
                             width: '100%',
                             height: '25px',
                             backgroundColor: '#F3F4F6',
                             borderRadius: '12px',
                             overflow: 'hidden',
                             position: 'relative'
                           }}>
                             <div style={{
                               width: `${percentualEcf}%`,
                               height: '100%',
                               backgroundColor: '#10B981',
                               borderRadius: '12px 0 0 12px',
                               transition: 'width 1s ease-in-out'
                             }} />
                             <div style={{
                               width: `${percentualNfce}%`,
                               height: '100%',
                               backgroundColor: '#EF4444',
                               borderRadius: '0 12px 12px 0',
                               transition: 'width 1s ease-in-out',
                               position: 'absolute',
                               left: `${percentualEcf}%`
                             }} />
                           </div>
                           <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem'}}>
                             <span style={{color: '#10B981', fontWeight: '600'}}>🟢 ECF: {percentualEcf}%</span>
                             <span style={{color: '#EF4444', fontWeight: '600'}}>🔴 NFC-e: {percentualNfce}%</span>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
             </div>

             {/* Resumo Estatístico dos Percentuais */}
             <div className="grid">
               <div className="col-12">
                 <div className="surface-0 shadow-1 p-3 border-1 border-50 border-round">
                   <h4 style={{color: '#1f2937', marginBottom: '1rem', textAlign: 'center'}}>
                     📋 Resumo Estatístico dos Percentuais
                   </h4>
                   <div className="grid">
                     {(() => {
                       const totalEcf = getEstatisticasGerais().totalEcf;
                       const totalNfce = getEstatisticasGerais().totalNfce;
                       const totalGeral = totalEcf + totalNfce;
                       const percentualEcf = totalGeral > 0 ? ((totalEcf / totalGeral) * 100).toFixed(1) : 0;
                       const percentualNfce = totalGeral > 0 ? ((totalNfce / totalGeral) * 100).toFixed(1) : 0;
                       
                       // Calcular médias por PDV
                       const pdvs = getVendasPorPdv();
                       const mediaPercentualEcf = pdvs.length > 0 ? 
                         pdvs.reduce((sum, pdv) => {
                           const percentual = pdv.total > 0 ? (pdv.ecf / pdv.total) * 100 : 0;
                           return sum + percentual;
                         }, 0) / pdvs.length : 0;
                       
                       const mediaPercentualNfce = pdvs.length > 0 ? 
                         pdvs.reduce((sum, pdv) => {
                           const percentual = pdv.total > 0 ? (pdv.nfce / pdv.total) * 100 : 0;
                           return sum + percentual;
                         }, 0) / pdvs.length : 0;
                       
                       // Calcular médias por Loja
                       const lojas = getVendasPorLoja();
                       const mediaPercentualEcfLoja = lojas.length > 0 ? 
                         lojas.reduce((sum, loja) => {
                           const percentual = loja.total > 0 ? (loja.ecf / loja.total) * 100 : 0;
                           return sum + percentual;
                         }, 0) / lojas.length : 0;
                       
                       const mediaPercentualNfceLoja = lojas.length > 0 ? 
                         lojas.reduce((sum, loja) => {
                           const percentual = loja.total > 0 ? (loja.nfce / loja.total) * 100 : 0;
                           return sum + percentual;
                         }, 0) / lojas.length : 0;
                       
                       return [
                         {
                           titulo: 'Total Geral',
                           ecf: `${percentualEcf}%`,
                           nfce: `${percentualNfce}%`,
                           cor: '#8B5CF6'
                         },
                         {
                           titulo: 'Média por PDV',
                           ecf: `${mediaPercentualEcf.toFixed(1)}%`,
                           nfce: `${mediaPercentualNfce.toFixed(1)}%`,
                           cor: '#F59E0B'
                         },
                         {
                           titulo: 'Média por Loja',
                           ecf: `${mediaPercentualEcfLoja.toFixed(1)}%`,
                           nfce: `${mediaPercentualNfceLoja.toFixed(1)}%`,
                           cor: '#EF4444'
                         }
                       ];
                     })().map((item, index) => (
                       <div key={index} className="col-12 md:col-4">
                         <div style={{
                           padding: '1rem',
                           margin: '0.5rem 0',
                           backgroundColor: `${item.cor}08`,
                           borderRadius: '0.5rem',
                           border: `1px solid ${item.cor}20`,
                           textAlign: 'center'
                         }}>
                           <div style={{fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '0.5rem'}}>
                             {item.titulo}
                           </div>
                           <div style={{display: 'flex', justifyContent: 'space-around'}}>
                             <div>
                               <div style={{fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem'}}>ECF</div>
                               <div style={{fontSize: '1rem', fontWeight: '700', color: '#10B981'}}>{item.ecf}</div>
                             </div>
                             <div>
                               <div style={{fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem'}}>NFC-e</div>
                               <div style={{fontSize: '1rem', fontWeight: '700', color: '#EF4444'}}>{item.nfce}</div>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

      {/* RESUMO EXECUTIVO MELHORADO */}
      <div className="page-card" style={{marginTop: '1rem'}}>
        <h3 style={{marginBottom: '1rem', color: '#1f2937', textAlign: 'center'}}>📊 RESUMO EXECUTIVO</h3>
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <h4 style={{color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                🎯 Principais Destaques
              </h4>
              <div style={{lineHeight: '1.8'}}>
                <div style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  backgroundColor: '#fef3c7',
                  borderRadius: '0.5rem',
                  border: '1px solid #f59e0b'
                }}>
                  <p style={{margin: 0}}><strong>🏆 Loja Campeã:</strong> {getTopLoja()?.filial || 'N/A'}</p>
                  <p style={{margin: '0.25rem 0 0 0', color: '#059669', fontWeight: '600'}}>
                    {getTopLoja() ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopLoja().total) : 'R$ 0,00'}
                  </p>
                </div>
                
                <div style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  backgroundColor: '#dbeafe',
                  borderRadius: '0.5rem',
                  border: '1px solid #3b82f6'
                }}>
                  <p style={{margin: 0}}><strong>⭐ PDV Estrela:</strong> PDV {getTopPdvGeral()?.pdv || 'N/A'}</p>
                  <p style={{margin: '0.25rem 0 0 0', color: '#6b7280'}}>{getTopPdvGeral()?.filial || 'N/A'}</p>
                  <p style={{margin: '0.25rem 0 0 0', color: '#059669', fontWeight: '600'}}>
                    {getTopPdvGeral() ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopPdvGeral().total) : 'R$ 0,00'}
                  </p>
                </div>
                
                <div style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  backgroundColor: '#dcfce7',
                  borderRadius: '0.5rem',
                                      border: '1px solid #10b981'
                }}>
                  <p style={{margin: 0}}><strong>💳 Forma de Pagamento Preferida:</strong></p>
                  <p style={{margin: '0.25rem 0 0 0', color: '#059669', fontWeight: '600'}}>
                    {Object.entries(getTotaisPorFormaPagamento()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </p>
                </div>
                
                
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <h4 style={{color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                📋 Resumo Operacional
              </h4>
              <div style={{lineHeight: '1.8'}}>
                <div style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '0.5rem',
                                     border: '1px solid #0ea5e9'
                }}>
                  <p style={{margin: 0}}><strong>📊 Período Analisado:</strong></p>
                  <p style={{margin: '0.25rem 0 0 0', color: '#059669', fontWeight: '600'}}>
                    {dataInicial ? new Date(dataInicial).toLocaleDateString('pt-BR') : 'N/A'} a {dataFinal ? new Date(dataFinal).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                
                <div style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  backgroundColor: '#fefce8',
                  borderRadius: '0.5rem',
                                     border: '1px solid #eab308'
                }}>
                  <p style={{margin: 0}}><strong>🏪 Cobertura:</strong></p>
                  <p style={{margin: '0.25rem 0 0 0', color: '#059669', fontWeight: '600'}}>
                    {getEstatisticasGerais().quantidadeLojas} lojas • {getEstatisticasGerais().quantidadePdvs} PDVs
                  </p>
                </div>
                
                <div style={{
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '0.5rem',
                                     border: '1px solid #22c55e'
                }}>
                  <p style={{margin: 0}}><strong>💳 Diversidade de Pagamento:</strong></p>
                  <p style={{margin: '0.25rem 0 0 0', color: '#059669', fontWeight: '600'}}>
                    {getEstatisticasGerais().quantidadeFormasPagamento} formas diferentes
                  </p>
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </div>

      



          


      {/* GRÁFICOS DE PIZZA ECF vs NFC-e */}
      <div className="grid mt-4" style={{marginBottom: '2rem'}}>
        <div className="col-12 md:col-6">
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <h4 style={{
              color: '#1f2937',
              marginBottom: '1.5rem',
              fontSize: '1.25rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🥧 Distribuição Total ECF vs NFC-e
            </h4>
            <div style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
              {(() => {
                const totalEcf = getEstatisticasGerais().totalEcf;
                const totalNfce = getEstatisticasGerais().totalNfce;
                const totalGeral = totalEcf + totalNfce;
                const percentualEcf = totalGeral > 0 ? ((totalEcf / totalGeral) * 100).toFixed(1) : 0;
                const percentualNfce = totalGeral > 0 ? ((totalNfce / totalGeral) * 100).toFixed(1) : 0;
                
                return (
                  <div style={{textAlign: 'center'}}>
                    <div style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      background: `conic-gradient(#10B981 0deg ${percentualEcf * 3.6}deg, #EF4444 ${percentualEcf * 3.6}deg 360deg)`,
                      margin: '0 auto 1rem auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#1F2937'
                      }}>
                        {totalGeral > 0 ? ((totalEcf / totalGeral) * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '2rem'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981'}}></div>
                        <span style={{fontSize: '0.875rem', fontWeight: '600'}}>ECF: {percentualEcf}%</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444'}}></div>
                        <span style={{fontSize: '0.875rem', fontWeight: '600'}}>NFC-e: {percentualNfce}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6">
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <h4 style={{
              color: '#1f2937',
              marginBottom: '1.5rem',
              fontSize: '1.25rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              📊 Valores Absolutos ECF vs NFC-e
            </h4>
            <div style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
              {(() => {
                const totalEcf = getEstatisticasGerais().totalEcf;
                const totalNfce = getEstatisticasGerais().totalNfce;
                const maxValue = Math.max(totalEcf, totalNfce);
                const heightEcf = maxValue > 0 ? (totalEcf / maxValue) * 200 : 0;
                const heightNfce = maxValue > 0 ? (totalNfce / maxValue) * 200 : 0;
                
                return (
                  <div style={{display: 'flex', alignItems: 'end', gap: '2rem', height: '250px'}}>
                    <div style={{textAlign: 'center'}}>
                      <div style={{
                        width: '80px',
                        height: `${heightEcf}px`,
                        backgroundColor: '#10B981',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '0.5rem',
                        transition: 'height 1s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEcf)}
                      </div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#10B981'}}>ECF</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                      <div style={{
                        width: '80px',
                        height: `${heightNfce}px`,
                        backgroundColor: '#EF4444',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '0.5rem',
                        transition: 'height 1s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalNfce)}
                      </div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600', color: '#EF4444'}}>NFC-e</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '1rem'}}>
        <DataTable
          emptyMessage={<EmptyState />}
          ref={dt}
          dataKey="id"
          value={vendas}
          responsiveLayout="scroll"
          rowGroupMode="subheader"
          groupRowsBy="finalizador"
          //  expandableRowGroups
          //     expandedRows={expandedRows}
          //    onRowToggle={(e) => setExpandedRows(e.data)}
          sortMode="single"
          sortField="finalizador"
          sortOrder={1}
          rowGroupHeaderTemplate={headerTemplate}
          loading={loading}
        ></DataTable>
      </div>

      {/* RESUMO EXECUTIVO COMPLETO PARA EXPORTAÇÃO */}
      <div className="page-card" style={{marginTop: '2rem'}}>
        <div className="surface-0 shadow-2 p-4 border-1 border-50 border-round">
          <div className="text-center mb-4">
            <h2 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              📊 RESUMO EXECUTIVO COMPLETO
            </h2>
            <p style={{
              margin: 0,
              fontSize: '1rem',
              color: '#6B7280',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Relatório consolidado com todas as informações para exportação em Excel ou PDF
            </p>
          </div>

          {/* Informações do Período */}
          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              📅 INFORMAÇÕES DO PERÍODO ANALISADO
            </h3>
            <div className="grid">
              <div className="col-12 md:col-4">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Data Inicial
                  </div>
                  <div style={{fontSize: '1.125rem', fontWeight: '600', color: '#1F2937'}}>
                    {dataInicial ? new Date(dataInicial).toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Data Final
                  </div>
                  <div style={{fontSize: '1.125rem', fontWeight: '600', color: '#1F2937'}}>
                    {dataFinal ? new Date(dataFinal).toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Período Total
                  </div>
                  <div style={{fontSize: '1.125rem', fontWeight: '600', color: '#1F2937'}}>
                    {dataInicial && dataFinal ? 
                      Math.ceil((new Date(dataFinal) - new Date(dataInicial)) / (1000 * 60 * 60 * 24)) + 1 : 'N/A'} dias
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div style={{
            backgroundColor: '#F0FDF4',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #22C55E',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              💰 RESUMO FINANCEIRO
            </h3>
            <div className="grid">
              <div className="col-12 md:col-3">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Total NFC-e
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#059669'}}>
                    {dadosProntos ? totalGeralNfce : 'R$ 0,00'}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Total ECF
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#059669'}}>
                    {dadosProntos ? totalGeralECF : 'R$ 0,00'}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Total Geral
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#059669'}}>
                    {dadosProntos ? totalGeral : 'R$ 0,00'}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Transações
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#059669'}}>
                    {dadosProntos ? getEstatisticasGerais().quantidadeTransacoes : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Operacional */}
          <div style={{
            backgroundColor: '#F0F9FF',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #0EA5E9',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              🏪 RESUMO OPERACIONAL
            </h3>
            <div className="grid">
              <div className="col-12 md:col-3">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Lojas Ativas
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#0EA5E9'}}>
                    {dadosProntos ? getEstatisticasGerais().quantidadeLojas : 0}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    PDVs Ativos
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#0EA5E9'}}>
                    {dadosProntos ? getEstatisticasGerais().quantidadePdvs : 0}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-3">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    Formas de Pagamento
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#0EA5E9'}}>
                    {dadosProntos ? getEstatisticasGerais().quantidadeFormasPagamento : 0}
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Top Performers */}
          <div style={{
            backgroundColor: '#FEF3C7',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #F59E0B',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              🏆 TOP PERFORMERS
            </h3>
            <div className="grid">
              <div className="col-12 md:col-4">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    🥇 Loja Campeã
                  </div>
                  <div style={{fontSize: '1rem', fontWeight: '600', color: '#1F2937', marginBottom: '0.25rem'}}>
                    {dadosProntos ? (getTopLoja()?.filial || 'N/A') : 'N/A'}
                  </div>
                  <div style={{fontSize: '0.875rem', fontWeight: '700', color: '#059669'}}>
                    {dadosProntos && getTopLoja() ? 
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopLoja().total) : 'R$ 0,00'}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    🥇 PDV Estrela
                  </div>
                  <div style={{fontSize: '1rem', fontWeight: '600', color: '#1F2937', marginBottom: '0.25rem'}}>
                    PDV {dadosProntos ? (getTopPdvGeral()?.pdv || 'N/A') : 'N/A'}
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem'}}>
                    {dadosProntos ? (getTopPdvGeral()?.filial || 'N/A') : 'N/A'}
                  </div>
                  <div style={{fontSize: '0.875rem', fontWeight: '700', color: '#059669'}}>
                    {dadosProntos && getTopPdvGeral() ? 
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTopPdvGeral().total) : 'R$ 0,00'}
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    💳 Forma Mais Utilizada
                  </div>
                  <div style={{fontSize: '1rem', fontWeight: '600', color: '#1F2937', marginBottom: '0.25rem'}}>
                    {dadosProntos ? 
                      (Object.entries(getTotaisPorFormaPagamento()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A') : 'N/A'}
                  </div>
                  <div style={{fontSize: '0.875rem', fontWeight: '700', color: '#059669'}}>
                    {dadosProntos ? 
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        Object.entries(getTotaisPorFormaPagamento()).sort((a, b) => b[1] - a[1])[0]?.[1] || 0
                      ) : 'R$ 0,00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Análise por Forma de Pagamento */}
          <div style={{
            backgroundColor: '#F3F4F6',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #D1D5DB',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              💳 ANÁLISE POR FORMA DE PAGAMENTO
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {dadosProntos ? Object.entries(getTotaisPorFormaPagamento())
                .sort((a, b) => b[1] - a[1])
                .map(([forma, total], index) => {
                  const percentual = getEstatisticasGerais().totalVendas > 0 ? 
                    ((total / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={forma} style={{
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #E5E7EB',
                      textAlign: 'center'
                    }}>
                      <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                        {forma}
                      </div>
                      <div style={{fontSize: '1.125rem', fontWeight: '700', color: '#059669', marginBottom: '0.25rem'}}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6B7280'}}>
                        {percentual}% do total
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{textAlign: 'center', padding: '2rem', color: '#9CA3AF'}}>
                    Carregando formas de pagamento...
                  </div>
                )}
            </div>
          </div>

          {/* Top 10 PDVs */}
          <div style={{
            backgroundColor: '#FEF2F2',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #FECACA',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              🖥️ TOP 10 PDVs POR VENDAS
            </h3>
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {dadosProntos ? getVendasPorPdv()
                .sort((a, b) => b.total - a.total)
                .slice(0, 10)
                .map((pdv, index) => (
                  <div key={pdv.pdv} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: index === 0 ? '#F59E0B' : index === 1 ? '#6B7280' : index === 2 ? '#EF4444' : '#3B82F6'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{fontWeight: 'bold', fontSize: '1rem', color: '#374151'}}>
                          PDV {pdv.pdv}
                        </div>
                        <div style={{fontSize: '0.875rem', color: '#6B7280'}}>{pdv.filial}</div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '1rem', fontWeight: '700', color: '#059669'}}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.total)}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6B7280'}}>
                        NFC-e: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.nfce)}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6B7280'}}>
                        ECF: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pdv.ecf)}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{textAlign: 'center', padding: '2rem', color: '#9CA3AF'}}>
                    Carregando ranking de PDVs...
                  </div>
                )}
            </div>
          </div>

          {/* Top 10 Lojas */}
          <div style={{
            backgroundColor: '#F0FDF4',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #BBF7D0',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              🏪 TOP 10 LOJAS POR VENDAS
            </h3>
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {dadosProntos ? getVendasPorLoja()
                .sort((a, b) => b.total - a.total)
                .slice(0, 10)
                .map((loja, index) => (
                  <div key={loja.nome} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: index === 0 ? '#F59E0B' : index === 1 ? '#6B7280' : index === 2 ? '#EF4444' : '#3B82F6'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{fontWeight: 'bold', fontSize: '1rem', color: '#374151'}}>
                          {loja.nome}
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '1rem', fontWeight: '700', color: '#059669'}}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.total)}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6B7280'}}>
                        NFC-e: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.nfce)}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#6B7280'}}>
                        ECF: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loja.ecf)}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{textAlign: 'center', padding: '2rem', color: '#9CA3AF'}}>
                    Carregando ranking de lojas...
                  </div>
                )}
            </div>
          </div>

          {/* Análise ECF vs NFC-e */}
          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #E2E8F0',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center'
            }}>
              📊 ANÁLISE ECF vs NFC-e
            </h3>
            <div className="grid">
              <div className="col-12 md:col-6">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    🟢 Total ECF
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#10B981'}}>
                    {dadosProntos ? totalGeralECF : 'R$ 0,00'}
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#6B7280'}}>
                    {dadosProntos && getEstatisticasGerais().totalVendas > 0 ? 
                      ((getEstatisticasGerais().totalEcf / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0}% do total
                  </div>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div style={{textAlign: 'center', padding: '1rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem'}}>
                    🔴 Total NFC-e
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#EF4444'}}>
                    {dadosProntos ? totalGeralNfce : 'R$ 0,00'}
                  </div>
                  <div style={{fontSize: '0.75rem', color: '#6B7280'}}>
                    {dadosProntos && getEstatisticasGerais().totalVendas > 0 ? 
                      ((getEstatisticasGerais().totalNfce / getEstatisticasGerais().totalVendas) * 100).toFixed(1) : 0}% do total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Exportação */}
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#F9FAFB',
            borderRadius: '0.75rem',
            border: '1px solid #E5E7EB'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1F2937'
            }}>
              📥 EXPORTAR RELATÓRIO
            </h3>
            <p style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1rem',
              color: '#6B7280',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Exporte o relatório completo em Excel com múltiplas planilhas ou em PDF 
            </p>
                         <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap'}}>
               <Button
                 icon="pi pi-file-excel"
                 label="Exportar Excel"
                 className="p-button-success"
                 onClick={() => exportToExcel()}
                 style={{
                   padding: '1rem 2rem',
                   fontSize: '1rem',
                   fontWeight: '600'
                 }}
               />
               <Button
                 icon="pi pi-file-pdf"
                 label="Exportar PDF"
                 className="p-button-danger"
                 onClick={() => exportToPDF()}
                 style={{
                   padding: '1rem 2rem',
                   fontSize: '1rem',
                   fontWeight: '600'
                 }}
               />
               <Button
                 icon="pi pi-copy"
                 label="Copiar Dados"
                 className="p-button-info"
                 onClick={() => {
                   const resumo = {
                     periodo: {
                       dataInicial: dataInicial ? new Date(dataInicial).toLocaleDateString('pt-BR') : 'N/A',
                       dataFinal: dataFinal ? new Date(dataFinal).toLocaleDateString('pt-BR') : 'N/A'
                     },
                     resumoFinanceiro: {
                       totalNfce: dadosProntos ? totalGeralNfce : 'R$ 0,00',
                       totalEcf: dadosProntos ? totalGeralECF : 'R$ 0,00',
                       totalGeral: dadosProntos ? totalGeral : 'R$ 0,00',
                       transacoes: dadosProntos ? getEstatisticasGerais().quantidadeTransacoes : 0
                     },
                     resumoOperacional: {
                       lojas: dadosProntos ? getEstatisticasGerais().quantidadeLojas : 0,
                       pdvs: dadosProntos ? getEstatisticasGerais().quantidadePdvs : 0,
                       formasPagamento: dadosProntos ? getEstatisticasGerais().quantidadeFormasPagamento : 0,
                       ticketMedio: dadosProntos && getEstatisticasGerais().quantidadeTransacoes > 0 ? 
                         new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                           getEstatisticasGerais().totalVendas / getEstatisticasGerais().quantidadeTransacoes
                         ) : 'R$ 0,00'
                     },
                     topPerformers: {
                       lojaCampea: dadosProntos ? getTopLoja()?.filial || 'N/A' : 'N/A',
                       pdvEstrela: dadosProntos ? getTopPdvGeral()?.pdv || 'N/A' : 'N/A',
                       formaMaisUtilizada: dadosProntos ? 
                         Object.entries(getTotaisPorFormaPagamento()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'
                     },
                     topPdvs: dadosProntos ? getVendasPorPdv().slice(0, 10) : [],
                     topLojas: dadosProntos ? getVendasPorLoja().slice(0, 10) : [],
                     formasPagamento: dadosProntos ? getTotaisPorFormaPagamento() : {}
                   };
                   
                   navigator.clipboard.writeText(JSON.stringify(resumo, null, 2)).then(() => {
                     toast.current.show({
                       severity: "success",
                       summary: "Sucesso",
                       detail: "Dados copiados para a área de transferência!",
                       life: 3000,
                     });
                   });
                 }}
                 style={{
                   padding: '1rem 2rem',
                   fontSize: '1rem',
                   fontWeight: '600'
                 }}
               />
             </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default VendasDataTableComponent;

