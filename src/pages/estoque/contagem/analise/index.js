import React, { useState, useEffect, useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Footer from "../../../../components/footer";

import { classNames } from "primereact/utils";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";

import { useReactToPrint } from "react-to-print";

import api from "../../../../services/axios";
import AuditoriaInventario from "../auditoria";
import moment from "moment";

// Importações para Excel e PDF
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AnaliseInventario() {
  let { id } = useParams();
  const dt = useRef(null)

  const toast = useRef(null);

  const tabelaRef = useRef();
  const handlePrint = useReactToPrint({
    onBeforeGetContent: () => setLinhas(9999),

    content: () => tabelaRef.current,
  });

  const imprimir = () => {
    if (linhas === 9999) {
      handlePrint();
    } else {
      setLinhas(9999);
      toast.current.show({
        severity: "info",
        summary: "Aviso",
        detail: "Tabela ajustada, Imprima novamente! ",
        life: 3000,
      });
    }
  };

  // Função para imprimir com resumo
  const imprimirComResumo = () => {
    const resumo = gerarResumoInventario();
    
    // Criar uma nova janela para impressão com resumo
    const resumoHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Análise do Inventário ${inventario?.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body { 
              font-family: 'Roboto', sans-serif;
              margin: 20px;
              color: #2c3e50;
              background-color: #f5f6fa;
              line-height: 1.6;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
              background: white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              border-radius: 8px;
            }
            
            .header { 
              text-align: center; 
              margin-bottom: 40px;
              background: linear-gradient(135deg, #2980b9, #2c3e50);
              color: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .header h1 { 
              margin: 0 0 15px 0;
              font-size: 32px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .header h2 {
              margin: 0 0 10px 0;
              font-size: 24px;
              font-weight: 500;
              opacity: 0.9;
            }
            
            .header p { 
              margin: 5px 0;
              font-size: 14px;
              opacity: 0.8;
            }
            
            .resumo { 
              margin: 30px 0; 
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .resumo h2 { 
              background: #2980b9;
              color: white;
              margin: 0;
              padding: 15px 20px;
              font-size: 20px;
              font-weight: 500;
            }
            
            .resumo-content {
              padding: 20px;
            }
            
            .resumo-section {
              background: white;
              border: 1px solid #e1e8ed;
              border-radius: 8px;
              margin-bottom: 20px;
              overflow: hidden;
            }
            
            .resumo-section h3 {
              background: #f8f9fa;
              color: #2c3e50;
              margin: 0;
              padding: 15px 20px;
              font-size: 16px;
              font-weight: 500;
              border-bottom: 1px solid #e1e8ed;
            }
            
            .resumo-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              padding: 20px;
            }
            
            .resumo-item { 
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e1e8ed;
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            
            .resumo-label { 
              font-size: 13px;
              font-weight: 500;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .resumo-value {
              font-size: 24px;
              font-weight: 700;
              color: #2980b9;
            }
            
            .resumo-value.positivo { color: #27ae60; }
            .resumo-value.negativo { color: #e74c3c; }
            .resumo-value.alerta { color: #f39c12; }
            
            table { 
              width: 100%; 
              border-collapse: separate;
              border-spacing: 0;
              margin: 20px 0;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            th, td { 
              padding: 12px 15px;
              text-align: left;
              font-size: 13px;
              border-bottom: 1px solid #e1e8ed;
            }
            
            th { 
              background: #2980b9;
              color: white;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-size: 12px;
              white-space: nowrap;
            }
            
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            
            tr:hover {
              background-color: #f1f4f7;
            }
            
            .status-corrigido { 
              background-color: #dff7e5 !important;
              color: #27ae60;
              font-weight: 500;
            }
            
            .status-sobra { 
              background-color: #fff7dd !important;
              color: #f39c12;
              font-weight: 500;
            }
            
            .status-falta { 
              background-color: #ffe5e5 !important;
              color: #e74c3c;
              font-weight: 500;
            }
            
            .status-recontagem { 
              font-style: italic;
              color: #95a5a6;
            }
            
            .legenda {
              margin: 30px 0;
              padding: 15px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              display: flex;
              gap: 30px;
              justify-content: center;
              align-items: center;
              flex-wrap: wrap;
            }
            
            .legenda-item {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              color: #666;
            }
            
            .legenda-cor {
              width: 24px;
              height: 24px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e1e8ed;
              text-align: center;
              color: #95a5a6;
              font-size: 12px;
            }
            
            .btn {
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .btn-primary {
              background: #2980b9;
              color: white;
            }
            
            .btn-danger {
              background: #e74c3c;
              color: white;
            }
            
            .btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            @media print {
              .no-print { display: none; }
              body { margin: 10px; }
              .resumo, table { page-break-inside: avoid; }
              th { 
                background-color: #2980b9 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .status-corrigido, .status-sobra, .status-falta {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ANÁLISE DO INVENTÁRIO ${inventario?.id}</h1>
              <h2>${inventario?.nome} - LOJA: ${inventario?.loja}</h2>
              <p><strong>Início:</strong> ${moment(inventario?.inicio).format('DD/MM/YYYY HH:mm:ss')}</p>
              <p><strong>Fim:</strong> ${inventario?.fim ? moment(inventario?.fim).format('DD/MM/YYYY HH:mm:ss') : 'Em andamento'}</p>
              <p><strong>Status:</strong> ${inventario?.status ? 'Aberto' : 'Fechado'}</p>
            </div>
            
            <div class="resumo">
              <h2>RESUMO DO INVENTÁRIO</h2>
              <div class="resumo-content">
                <div class="resumo-section">
                  <h3>TOTAIS</h3>
                  <div class="resumo-grid">
                    <div class="resumo-item">
                      <span class="resumo-label">Total de Produtos</span>
                      <span class="resumo-value">${resumo.totalProdutos}</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Produtos Sem Divergência</span>
                      <span class="resumo-value positivo">${resumo.produtosSemDivergencia}</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Produtos Com Divergência</span>
                      <span class="resumo-value negativo">${resumo.produtosComDivergencia}</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Produtos Em Recontagem</span>
                      <span class="resumo-value alerta">${resumo.produtosEmRecontagem}</span>
                    </div>
                  </div>
                </div>

                <div class="resumo-section">
                  <h3>QUANTIDADES</h3>
                  <div class="resumo-grid">
                    <div class="resumo-item">
                      <span class="resumo-label">Quantidade no Sistema</span>
                      <span class="resumo-value">${resumo.totalQuantidadeEstoque}</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Quantidade no Inventário</span>
                      <span class="resumo-value">${resumo.totalQuantidadeLida}</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Quantidade Vendida</span>
                      <span class="resumo-value">${resumo.totalQuantidadeVendida}</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Divergência Total</span>
                      <span class="resumo-value ${resumo.totalDivergencia > 0 ? 'alerta' : resumo.totalDivergencia < 0 ? 'negativo' : 'positivo'}">${resumo.totalDivergencia}</span>
                    </div>
                  </div>
                </div>

                <div class="resumo-section">
                  <h3>PERCENTUAIS</h3>
                  <div class="resumo-grid">
                    <div class="resumo-item">
                      <span class="resumo-label">Acurácia do Inventário</span>
                      <span class="resumo-value positivo">${((resumo.produtosSemDivergencia / resumo.totalProdutos) * 100).toFixed(2)}%</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Produtos com Divergência</span>
                      <span class="resumo-value negativo">${((resumo.produtosComDivergencia / resumo.totalProdutos) * 100).toFixed(2)}%</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Produtos em Recontagem</span>
                      <span class="resumo-value alerta">${((resumo.produtosEmRecontagem / resumo.totalProdutos) * 100).toFixed(2)}%</span>
                    </div>
                    <div class="resumo-item">
                      <span class="resumo-label">Variação do Estoque</span>
                      <span class="resumo-value ${resumo.totalDivergencia > 0 ? 'alerta' : resumo.totalDivergencia < 0 ? 'negativo' : 'positivo'}">${((resumo.totalDivergencia / resumo.totalQuantidadeEstoque) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h2>DETALHAMENTO DOS PRODUTOS</h2>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Qtd. Inventário</th>
                  <th>Qtd. Estoque</th>
                  <th>Qtd. Vendida</th>
                  <th>Levantamento Final</th>
                  <th>Divergência</th>
                  <th>Status</th>
                  <th>Recontagem</th>
                </tr>
              </thead>
              <tbody>
                ${produto.map(p => {
                  const levantamentoFinal = p.quantidadeLida - (p.quantidadeVendidaDurante || 0);
                  const divergencia = calcularDivergencia(levantamentoFinal, p.quantidadeEstoque || 0);
                  let status = '';
                  let statusClass = '';
                  
                  if (divergencia === 0) {
                    status = 'CORRIGIDO';
                    statusClass = 'status-corrigido';
                  } else if (divergencia > 0) {
                    status = `SOBRA: ${divergencia}`;
                    statusClass = 'status-sobra';
                  } else {
                    status = `FALTA: ${Math.abs(divergencia)}`;
                    statusClass = 'status-falta';
                  }
                  
                  const recontagemClass = p.recontar ? 'status-recontagem' : '';
                  
                  return `
                    <tr>
                      <td>${p.ean || ''}</td>
                      <td>${p.produto || ''}</td>
                      <td>${p.quantidadeLida || 0}</td>
                      <td>${p.quantidadeEstoque || 0}</td>
                      <td>${p.quantidadeVendidaDurante || 0}</td>
                      <td>${levantamentoFinal}</td>
                      <td>${divergencia}</td>
                      <td class="${statusClass}">${status}</td>
                      <td class="${recontagemClass}">${p.recontar ? 'Sim' : 'Não'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="legenda">
              <div class="legenda-item">
                <div class="legenda-cor" style="background-color: #dff7e5;"></div>
                <span>OK</span>
              </div>
              <div class="legenda-item">
                <div class="legenda-cor" style="background-color: #fff7dd;"></div>
                <span>Sobra</span>
              </div>
              <div class="legenda-item">
                <div class="legenda-cor" style="background-color: #ffe5e5;"></div>
                <span>Falta</span>
              </div>
              <div class="legenda-item">
                <div class="legenda-cor" style="background-color: #f8f9fa;"></div>
                <span>Em Recontagem</span>
              </div>
            </div>

            <div class="footer">
              <p>Relatório gerado em ${moment().format('DD/MM/YYYY HH:mm:ss')}</p>
              <p>Sistema JJ de Gestão de Inventário</p>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button class="btn btn-primary" onclick="window.print()">Imprimir Relatório</button>
              <button class="btn btn-danger" onclick="window.close()">Fechar</button>
            </div>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([resumoHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPrintUrl(url);
    setPrintDialogVisible(true);
  };

  const calcularDivergencia = (lida, estoque) => {
    if (estoque >= 0) {
      return lida - estoque;
    }
    return estoque + lida; // estoque é negativo
  };

  const [linhas, setLinhas] = useState(5);

  const navigate = useNavigate();

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const [produto, setProduto] = useState([]);
  const [produtoFilter, setProdutoFilter] = useState([]);
  const [produtoSelecionados, setProdutoSelecionados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inventario, setInventario] = useState([]);

  const [dialogAuditoria, setDialogAuditoria] = useState(false);
  const [printDialogVisible, setPrintDialogVisible] = useState(false);
  const [printUrl, setPrintUrl] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    produto: { value: null, matchMode: FilterMatchMode.CONTAINS },

    ean: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    recontagem: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  // Função para gerar resumo do inventário
  const gerarResumoInventario = () => {
    const totalProdutos = produto.length;
    const produtosSemDivergencia = produto.filter(p => {
      const levFinal = p.quantidadeLida - (p.quantidadeVendidaDurante || 0);
      return calcularDivergencia(levFinal, p.quantidadeEstoque || 0) === 0;
    }).length;
    const produtosComDivergencia = totalProdutos - produtosSemDivergencia;
    const produtosEmRecontagem = produto.filter(p => p.recontar).length;

    const totalQuantidadeEstoque = produto.reduce((s, p) => s + (p.quantidadeEstoque || 0), 0);
    const totalQuantidadeLida = produto.reduce((s, p) => s + (p.quantidadeLida || 0), 0);
    const totalQuantidadeVendida = produto.reduce((s, p) => s + (p.quantidadeVendidaDurante || 0), 0);

    const totalDivergencia = produto.reduce((s, p) => {
      const levFinal = p.quantidadeLida - (p.quantidadeVendidaDurante || 0);
      return s + calcularDivergencia(levFinal, p.quantidadeEstoque || 0);
    }, 0);

    return {
      totalProdutos,
      produtosSemDivergencia,
      produtosComDivergencia,
      produtosEmRecontagem,
      totalQuantidadeEstoque,
      totalQuantidadeLida,
      totalQuantidadeVendida,
      totalDivergencia
    };
  };

  // Função para exportar para Excel
  const exportarParaExcel = () => {
    const resumo = gerarResumoInventario();
    
    // Dados para exportação
    const dadosExportacao = produto.map(p => {
      const levantamentoFinal = p.quantidadeLida - (p.quantidadeVendidaDurante || 0);
      const divergencia = calcularDivergencia(levantamentoFinal, p.quantidadeEstoque || 0);
      let status = '';
      if (divergencia === 0) {
        status = 'CORRIGIDO';
      } else if (divergencia > 0) {
        status = `SOBRA: ${divergencia}`;
      } else {
        status = `FALTA: ${Math.abs(divergencia)}`;
      }

      return {
        'Código': p.ean || '',
        'Produto': p.produto || '',
        'Quantidade no Inventário (Físico)': p.quantidadeLida || 0,
        'Quantidade no Estoque (Sistema)': p.quantidadeEstoque || 0,
        'Quantidade Vendida Durante': p.quantidadeVendidaDurante || 0,
        'Levantamento Final': levantamentoFinal,
        'Divergência': divergencia,
        'Status': status,
        'Em Recontagem': p.recontar ? 'Sim' : 'Não'
      };
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Planilha de dados
    const ws = XLSX.utils.json_to_sheet(dadosExportacao, { origin: 'A2' });
    
    // Adicionar cabeçalho com informações do inventário
    XLSX.utils.sheet_add_aoa(ws, [
      [`ANÁLISE DO INVENTÁRIO - ${inventario?.id} - ${inventario?.nome} - LOJA: ${inventario?.loja}`],
      [`Início: ${moment(inventario?.inicio).format('DD/MM/YYYY HH:mm:ss')} - Fim: ${inventario?.fim ? moment(inventario?.fim).format('DD/MM/YYYY HH:mm:ss') : 'Em andamento'}`],
      [] // Linha em branco
    ], { origin: 'A1' });

    // Configurar larguras das colunas
    const wscols = [
      { wch: 15 }, // Código
      { wch: 40 }, // Produto
      { wch: 15 }, // Qtd Inventário
      { wch: 15 }, // Qtd Estoque
      { wch: 15 }, // Qtd Vendida
      { wch: 15 }, // Levantamento
      { wch: 15 }, // Divergência
      { wch: 20 }, // Status
      { wch: 15 }, // Recontagem
    ];
    ws['!cols'] = wscols;

    // Adicionar estilos condicionais
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 3; R <= range.e.r; ++R) {
      const divergenciaCell = ws[XLSX.utils.encode_cell({ r: R, c: 6 })]; // Coluna G (Divergência)
      if (divergenciaCell) {
        const valor = divergenciaCell.v;
        if (valor === 0) {
          ws[XLSX.utils.encode_cell({ r: R, c: 7 })] = { 
            ...ws[XLSX.utils.encode_cell({ r: R, c: 7 })],
            s: { fill: { fgColor: { rgb: "90EE90" } } } // Verde claro
          };
        } else if (valor > 0) {
          ws[XLSX.utils.encode_cell({ r: R, c: 7 })] = {
            ...ws[XLSX.utils.encode_cell({ r: R, c: 7 })],
            s: { fill: { fgColor: { rgb: "FFD700" } } } // Amarelo
          };
        } else {
          ws[XLSX.utils.encode_cell({ r: R, c: 7 })] = {
            ...ws[XLSX.utils.encode_cell({ r: R, c: 7 })],
            s: { fill: { fgColor: { rgb: "FF6B6B" } } } // Vermelho claro
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Análise do Inventário');
    
    // Planilha de resumo
    const resumoData = [
      ['RESUMO DO INVENTÁRIO'],
      [''],
      ['TOTAIS', 'Quantidade'],
      ['Total de Produtos', resumo.totalProdutos],
      ['Produtos Sem Divergência', resumo.produtosSemDivergencia],
      ['Produtos Com Divergência', resumo.produtosComDivergencia],
      ['Produtos Em Recontagem', resumo.produtosEmRecontagem],
      [''],
      ['QUANTIDADES', 'Valor'],
      ['Quantidade no Sistema', resumo.totalQuantidadeEstoque],
      ['Quantidade no Inventário', resumo.totalQuantidadeLida],
      ['Quantidade Vendida', resumo.totalQuantidadeVendida],
      ['Divergência Total', resumo.totalDivergencia],
      [''],
      ['PERCENTUAIS', 'Valor'],
      ['Acurácia do Inventário', `${((resumo.produtosSemDivergencia / resumo.totalProdutos) * 100).toFixed(2)}%`],
      ['Produtos com Divergência', `${((resumo.produtosComDivergencia / resumo.totalProdutos) * 100).toFixed(2)}%`],
      ['Produtos em Recontagem', `${((resumo.produtosEmRecontagem / resumo.totalProdutos) * 100).toFixed(2)}%`],
      ['Variação do Estoque', `${((resumo.totalDivergencia / resumo.totalQuantidadeEstoque) * 100).toFixed(2)}%`],
      [''],
      ['INFORMAÇÕES DO INVENTÁRIO'],
      ['Data/Hora Início', moment(inventario?.inicio).format('DD/MM/YYYY HH:mm:ss')],
      ['Data/Hora Fim', inventario?.fim ? moment(inventario?.fim).format('DD/MM/YYYY HH:mm:ss') : 'Em andamento'],
      ['Status', inventario?.status ? 'Aberto' : 'Fechado'],
      ['Loja', inventario?.loja],
      ['Nome do Inventário', inventario?.nome]
    ];
    
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    
    // Configurar larguras das colunas do resumo
    wsResumo['!cols'] = [
      { wch: 30 }, // Primeira coluna
      { wch: 20 }, // Segunda coluna
      { wch: 20 }, // Terceira coluna
      { wch: 20 }, // Quarta coluna
    ];

    // Adicionar estilos ao resumo
    const resumoRange = XLSX.utils.decode_range(wsResumo['!ref']);
    for (let R = resumoRange.s.r; R <= resumoRange.e.r; ++R) {
      const cell = wsResumo[XLSX.utils.encode_cell({ r: R, c: 0 })];
      if (cell && (cell.v === 'RESUMO DO INVENTÁRIO' || cell.v === 'TOTAIS' || cell.v === 'QUANTIDADES' || cell.v === 'INFORMAÇÕES DO INVENTÁRIO')) {
        wsResumo[XLSX.utils.encode_cell({ r: R, c: 0 })] = {
          ...cell,
          s: { 
            font: { bold: true, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "E0E0E0" } }
          }
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
    
    // Salvar arquivo
    XLSX.writeFile(wb, `Analise_Inventario_${inventario?.id}_${moment().format('DD-MM-YYYY_HH-mm')}.xlsx`);
    
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Arquivo Excel exportado com sucesso!",
      life: 3000,
    });
  };

  // Função para exportar para PDF
  const exportarParaPDF = () => {
    const resumo = gerarResumoInventario();
    
    const doc = new jsPDF();
    
    // Título e cabeçalho
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('ANÁLISE DO INVENTÁRIO', 105, 15, { align: 'center' });
    
    // Informações do inventário
    doc.setFontSize(10);
    doc.text(` ${inventario?.id} - ${inventario?.nome} - LOJA: ${inventario?.loja}`, 105, 22, { align: 'center' });
    doc.text(`Início: ${moment(inventario?.inicio).format('DD/MM/YYYY HH:mm:ss')} - Fim: ${inventario?.fim ? moment(inventario?.fim).format('DD/MM/YYYY HH:mm:ss') : 'Em andamento'}`, 105, 27, { align: 'center' });
    doc.text(`Status: ${inventario?.status ? 'Aberto' : 'Fechado'}`, 105, 32, { align: 'center' });
    
    // Resumo em formato de tabela - TOTAIS
    doc.autoTable({
      startY: 40,
      head: [['TOTAIS', 'Quantidade']],
      body: [
        ['Total de Produtos', resumo.totalProdutos],
        ['Produtos Sem Divergência', resumo.produtosSemDivergencia],
        ['Produtos Com Divergência', resumo.produtosComDivergencia],
        ['Produtos Em Recontagem', resumo.produtosEmRecontagem],
      ],
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });

    // Resumo - QUANTIDADES
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 5,
      head: [['QUANTIDADES', 'Valor']],
      body: [
        ['Quantidade no Sistema', resumo.totalQuantidadeEstoque],
        ['Quantidade no Inventário', resumo.totalQuantidadeLida],
        ['Quantidade Vendida', resumo.totalQuantidadeVendida],
        ['Divergência Total', resumo.totalDivergencia],
      ],
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });

    // Resumo - PERCENTUAIS
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 5,
      head: [['PERCENTUAIS', 'Valor']],
      body: [
        ['Acurácia do Inventário', `${((resumo.produtosSemDivergencia / resumo.totalProdutos) * 100).toFixed(2)}%`],
        ['Produtos com Divergência', `${((resumo.produtosComDivergencia / resumo.totalProdutos) * 100).toFixed(2)}%`],
        ['Produtos em Recontagem', `${((resumo.produtosEmRecontagem / resumo.totalProdutos) * 100).toFixed(2)}%`],
        ['Variação do Estoque', `${((resumo.totalDivergencia / resumo.totalQuantidadeEstoque) * 100).toFixed(2)}%`],
      ],
      theme: 'grid',
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });
    
    // Tabela de dados
    const dadosTabela = produto.map(p => {
      const levantamentoFinal = p.quantidadeLida - (p.quantidadeVendidaDurante || 0);
      const divergencia = calcularDivergencia(levantamentoFinal, p.quantidadeEstoque || 0);
      let status = '';
      if (divergencia === 0) {
        status = 'CORRIGIDO';
      } else if (divergencia > 0) {
        status = `SOBRA: ${divergencia}`;
      } else {
        status = `FALTA: ${Math.abs(divergencia)}`;
      }

      return [
        p.ean || '',
        p.produto || '',
        p.quantidadeLida || 0,
        p.quantidadeEstoque || 0,
        p.quantidadeVendidaDurante || 0,
        levantamentoFinal,
        divergencia,
        status,
        p.recontar ? 'Sim' : 'Não'
      ];
    });
    
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 10,
      head: [['Código', 'Produto', 'Qtd. Inventário', 'Qtd. Estoque', 'Qtd. Vendida', 'Levantamento Final', 'Divergência', 'Status', 'Recontagem']],
      body: dadosTabela,
      theme: 'grid',
      styles: { 
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        1: { cellWidth: 35 }, // Produto
        7: { 
          cellWidth: 28,
          fontStyle: 'bold',
          halign: 'center'
        }
      },
      // Cores condicionais para o status
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
          const divergencia = data.row.cells[6].raw;
          let fillColor;
          let textColor;
          
          if (divergencia === 0) {
            fillColor = [144, 238, 144]; // Verde claro
            textColor = [0, 100, 0]; // Verde escuro
          } else if (divergencia > 0) {
            fillColor = [255, 215, 0]; // Amarelo
            textColor = [139, 69, 19]; // Marrom escuro
          } else {
            fillColor = [255, 107, 107]; // Vermelho claro
            textColor = [139, 0, 0]; // Vermelho escuro
          }
          
          // Aplicar cor de fundo
          doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          // Aplicar cor do texto
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          
          // Verificar se o texto é válido antes de calcular largura
          const cellText = String(data.cell.text || '');
          if (cellText && cellText.length > 0) {
            try {
              // Centralizar o texto na célula
              const textWidth = doc.getTextWidth(cellText);
              const cellCenterX = data.cell.x + (data.cell.width / 2);
              const textX = cellCenterX - (textWidth / 2);
              const textY = data.cell.y + (data.cell.height / 2) + 2;
              
              doc.text(cellText, textX, textY);
            } catch (error) {
              // Fallback: posicionar texto no centro sem calcular largura
              const cellCenterX = data.cell.x + (data.cell.width / 2);
              const textY = data.cell.y + (data.cell.height / 2) + 2;
              doc.text(cellText, cellCenterX, textY, { align: 'center' });
            }
          }
        }
      }
    });
    
    // Adicionar legenda
    const y = doc.previousAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setFillColor(144, 238, 144);
    doc.rect(20, y, 10, 5, 'F');
    doc.text('Corrigido', 35, y + 4);
    
    doc.setFillColor(255, 215, 0);
    doc.rect(70, y, 10, 5, 'F');
    doc.text('Sobra', 85, y + 4);
    
    doc.setFillColor(255, 107, 107);
    doc.rect(120, y, 10, 5, 'F');
    doc.text('Falta', 135, y + 4);
    
    // Rodapé com data/hora de geração
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Relatório gerado em ${moment().format('DD/MM/YYYY HH:mm:ss')}`, 105, footerY, { align: 'center' });
    doc.text('Sistema JJ de Gestão de Inventário', 105, footerY + 5, { align: 'center' });
    
    // Salvar arquivo
    doc.save(`Analise_Inventario_${inventario?.id}_${moment().format('DD-MM-YYYY_HH-mm')}.pdf`);
    
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Arquivo PDF exportado com sucesso!",
      life: 3000,
    });
  };

  const header = () => {
    return (
      <div className="flex justify-content-around flex-row-reverse ">
        <div>
          {`Quantidade vendida durante o inventário de ${moment(
            inventario?.inicio
          ).format("DD/MM/YYYY - HH:mm:ss")} até ${moment(
            inventario?.fim
          ).format("DD/MM/YYYY - HH:mm:ss")}`}
          <h4 style={{ color: "red" }}>
            ** QUANTIDADE VENDIDA NÃO ENTRA NO CÁLCULO DAS DIVERGÊNCIAS **
          </h4>
        </div>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Pesquisar"
          />
        </span>
        <Button
          onClick={() => marcarRecontagem()}
          disabled={produtoSelecionados?.length === 0 }
          icon="pi pi-sync"
          label={`Marcar recontagem de ${
            produtoSelecionados?.length ? produtoSelecionados?.length : 0
          } produto(s) selecionado(s)`}
          className="p-button p-button-rounded p-button-secondary"
        />
      </div>
    );
  };
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const getItens = () => {
    setLoading(true);
    return api
      .get(`/api/produto/contagem/porInventario/${id}`)
      .then((r) => {
        setProduto(r.data);
       
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao carregar os itens " + e?.message,
        });
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const getInventario = () => {
    return api
      .get(`/api/produto/contagem/inventarios/${id}`)
      .then((r) => {
        setInventario(r.data);
        //  console.log(r.data);
      })
      .catch((e) => {
        //console.log(e?.message);
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao recuperar dados do inventário " + e?.message,
        });
      })
      .finally((f) => {});
  };

  const quantidadeEstoqueTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(row?.quantidadeEstoque)}
        </div>
      </>
    );
  };
  const quantidadeLidaTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(row?.quantidadeLida)}
        </div>
      </>
    );
  };

  const quantidadeVendidaDuranteTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(row?.quantidadeVendidaDurante)}
        </div>
      </>
    );
  };

  const levantamentoFinalTemplate = (row) => {
    return (
      <>
        <div>
          {Intl.NumberFormat("pt-BR", {
            style: "decimal",
            maximumFractionDigits: "3",
            minimumFractionDigits: 0,
          }).format(
            row?.quantidadeLida -
              (row?.quantidadeVendidaDurante
                ? row?.quantidadeVendidaDurante
                : 0)
          )}
        </div>

        {row?.quantidadeLida -
          (row?.quantidadeVendidaDurante
            ? row?.quantidadeVendidaDurante
            : 0) ===
        row?.quantidadeEstoque ? (
          <Tag value="Corrigido" severity="success" />
        ) : (
          <Tag value="Precisa recontar" severity="danger" />
          
        )}
        <br/>
        {row?.recontar ? <> <Tag style={{marginTop:'10px'}} value="Em processo de recontagem" severity="warning" /> </> : <></>}
      </>
    );
  };
  const divergenciaEstoqueTemplate = (row) => {
    return (row?.quantidadeEstoque >= 0
      ? row?.quantidadeLida - row?.quantidadeEstoque
      : row?.quantidadeEstoque + row?.quantidadeLida) >= 0 ? (
      <>
        {row?.quantidadeLida - row?.quantidadeEstoque === 0 ? (
          <>
            <div>
              <Tag severity="success" value={"Sem divergências"} />
            </div>
          </>
        ) : (
          <>
            <div>
              <Tag
                severity="warning"
                value={
                  "Sobrando " +
                  Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    maximumFractionDigits: "3",
                    minimumFractionDigits: 0,
                  }).format(
                    row?.quantidadeEstoque >= 0
                      ? row?.quantidadeLida - row?.quantidadeEstoque
                      : row?.quantidadeEstoque + row?.quantidadeLida
                  )
                }
              />
            </div>
          </>
        )}
      </>
    ) : (
      <>
        {row?.quantidadeLida - row?.quantidadeEstoque === 0 ? (
          <>
            <div>
              <Tag severity="success" value={"Sem divergências"} />
            </div>
          </>
        ) : (
          <>
            <div>
              <Tag
                severity="danger"
                value={
                  "Faltando " +
                  Intl.NumberFormat("pt-BR", {
                    style: "decimal",
                    maximumFractionDigits: "3",
                    minimumFractionDigits: 0,
                  }).format(
                    row?.quantidadeEstoque >= 0
                      ? row?.quantidadeLida - row?.quantidadeEstoque
                      : row?.quantidadeEstoque + row?.quantidadeLida
                  )
                }
              />
            </div>
          </>
        )}
      </>
    );
  };
  const verifiedBodyTemplate = (row) => {
    produto.forEach((p) => {
      p.recontagem = p.quantidadeLida !== p.quantidadeEstoque;
    });
    //console.log(produto);
    return (
      <i
        className={classNames("pi", {
          "false-icon pi-times-circle":
            row?.quantidadeLida -
              (row?.quantidadeVendidaDurante
                ? row?.quantidadeVendidaDurante
                : 0) ===
            row?.quantidadeEstoque,
          "true-icon pi-check-circle":
            row?.quantidadeLida -
              (row?.quantidadeVendidaDurante
                ? row?.quantidadeVendidaDurante
                : 0) !==
            row?.quantidadeEstoque,
        })}
      ></i>
    );
  };

  const converterParaCSV = (jsonData) => {
    const separator = ";";
    const keys = Object.keys(jsonData[0]);

    const csvContent = jsonData.map((item) =>
      keys.map((key) => item[key]).join(separator)
    );

    return keys.join(separator) + "\n" + csvContent.join("\n");
  };

  const exportarContagem = () => {
    const csvData = converterParaCSV(
      produto.map((m) => ({
        produto: m?.codigo,
        quantidade: parseFloat(
          m?.quantidadeLida -
            (m?.quantidadeVendidaDurante ? m?.quantidadeVendidaDurante : 0)
        ),
      }))
    );
    
    
    
  
    const blob = new Blob([csvData.slice(18)], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "Contagem do inventario do dia " +
      moment(inventario?.inicio).format("DD-MM-YYYY");
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportarContagemOriginal = () => {
    const csvData = converterParaCSV(
      produto.map((m) => ({
        produto: m?.codigo,
        quantidade: parseFloat(
          m?.quantidadeLida 
        ),
      }))
    );
    
    
    
  
    const blob = new Blob([csvData.slice(18)], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "Contagem lida do inventario do dia " +
      moment(inventario?.inicio).format("DD-MM-YYYY");
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const verifiedRowFilterTemplate = (options) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TriStateCheckbox
          value={options.value}
          onChange={(e) => options.filterApplyCallback(e.value)}
        />
      </div>
    );
  };

  const marcarRecontagem = () => {
    produtoSelecionados.map((m) => {
      api
        .put(`/api/produto/contagem/recontar/item/${m?.idproduto}/inventario/${m?.idinventario}`)
        .then((r) => {
          toast.current.show({
            severity: "success",
            summary: "Sucesso ",
            detail: "Produto remarcado para recontagem"
          });
        })
        .catch((e) => {
          console.log(e);
        })
        .finally((f) => {
          dt.current.reset()
          setProdutoSelecionados([])
          getItens()
          
        });
    });
  };

  useEffect(() => {
    getItens();
    getInventario();
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <Footer />
      <div
        ref={tabelaRef}
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "5px",
          color: "#f2f2f2",
          width: "100%",
          padding: "1rem",
          marginTop:'50px'
        }}
      >
        <h1
          style={{
            backgroundColor: "transparent",
            border: "1px solid #f1f1f1",
            borderRadius: "25px",
            padding: "5px",
            color: "#333",
          }}
        >
          {" "}
          Análise do invetário {inventario?.id} - {inventario?.nome} -{" "}
          {inventario?.loja}
        </h1>
        {inventario?.status ? (
          <Tag
            severity="success"
            value={
              " Aberto em " +
              moment(inventario?.inicio).format("DD/MM/YYYY - HH:mm:ss") +
              " Posição do estoque em " +
              moment().format("DD/MM/YYYY HH:mm:ss")
            }
          />
        ) : (
          <Tag
            severity="danger"
            value={
              "Fechado. Posição do estoque congelado em " +
              moment(inventario?.fim).format("DD/MM/YYYY - HH:mm:ss")
            }
          />
        )}

        <Toolbar
          left={
            <Button
              label="Voltar"
              className="p-button p-button-rounded p-button-danger"
              onClick={() => navigate("/estoque/lista-inventario")}
              icon="pi pi-backward"
            />
          }
          right={
            <>
              <div>
                <Button
                  style={{ margin: "0px 5px" }}
                  label="Recarregar"
                  className="p-button p-button-rounded p-button-secondary"
                  onClick={() => getItens()}
                  icon="pi pi-refresh"
                  loading={loading}
                />
                <Button
                  style={{ margin: "0px 5px" }}
                  label="Auditoria"
                  className="p-button p-button-rounded p-button-info"
                  onClick={() => setDialogAuditoria(true)}
                  icon="pi pi-search"
                />

                <Button
                  style={{ margin: "0px 5px" }}
                  label="Exportar contagem ajustada"
                  className="p-button p-button-rounded p-button-primary"
                  onClick={() => exportarContagem()}
                  icon="pi pi-file-excel"
                />
                 <Button
                  style={{ margin: "0px 5px" }}
                  label="Exportar contagem Lida"
                  className="p-button p-button-rounded p-button-primary"
                  onClick={() => exportarContagemOriginal()}
                  icon="pi pi-file-excel"
                />
                <Button
                  style={{ margin: "0px 5px" }}
                  label="Exportar Excel"
                  className="p-button p-button-rounded p-button-success"
                  onClick={() => exportarParaExcel()}
                  icon="pi pi-file-excel"
                />
                <Button
                  style={{ margin: "0px 5px" }}
                  label="Exportar PDF"
                  className="p-button p-button-rounded p-button-danger"
                  onClick={() => exportarParaPDF()}
                  icon="pi pi-file-pdf"
                />
                <Button
                  style={{ margin: "0px 5px" }}
                  label="Imprimir"
                  className="p-button p-button-rounded p-button-warning"
                  onClick={() => imprimirComResumo()}
                  icon="pi pi-print"
                />
              </div>
            </>
          }
        />

        <DataTable
          ref={dt}
          onValueChange={(filteredData) => setProdutoFilter(filteredData)}
          removableSort
          selection={produtoSelecionados}
          onSelectionChange={(e) => setProdutoSelecionados(e.value)}
          paginator
          rows={linhas}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          onPage={() => {
            try {
              const container = document.querySelector('.tab-content-container') || document.scrollingElement || document.documentElement;
              if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (_) {}
          }}
          loading={loading}
          value={produto}
          stripedRows
          dataKey="id"
          emptyMessage="Nenhum produto encontrado"
          filters={filters}
          filterDisplay="row"
          globalFilterFields={["produto", "ean", "divergencia"]}
          style={{ width: "100%" }}
          header={header}
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Existem {produto.length} produto(s) para análise /{" "}
              {produtoFilter?.length === produto?.length
                ? 0
                : produtoFilter?.length}{" "}
              produto(s) filtrado(s)
            </div>
          }
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3em" }}
          ></Column>
          <Column sortable field="ean" header="Código"></Column>
          <Column sortable field="produto" header="Produto"></Column>
          <Column
            sortable
            field="quantidadeLida"
            header="Quantidade no inventário (Físico)"
            body={quantidadeLidaTemplate}
          ></Column>
          <Column
            sortable
            field="quantidadeEstoque"
            body={quantidadeEstoqueTemplate}
            header="Quantidade no estoque ( Sistema ) "
          ></Column>
          <Column
            sortable
            field="divergencia"
            body={divergenciaEstoqueTemplate}
            header="Divergências"
          ></Column>

          <Column
            sortable
            field="quantidadeVendidaDurante"
            body={quantidadeVendidaDuranteTemplate}
            header="Qtde vendida durante o inventário"
          ></Column>
          <Column
            sortable
            body={levantamentoFinalTemplate}
            header="Levantamento de estoque"
          ></Column>

          <Column
            field="recontagem"
            header="Recontar ?"
            dataType="boolean"
            style={{ minWidth: "6rem" }}
            body={verifiedBodyTemplate}
            filter
            filterElement={verifiedRowFilterTemplate}
          />
        </DataTable>
      </div>

      <Dialog
        modal={false}
        maximizable
        header={`Auditoria do inventário ${id} - ${inventario?.nome}`}
        visible={dialogAuditoria}
        onHide={() => setDialogAuditoria(false)}
      >
        <AuditoriaInventario id={id} />
      </Dialog>
      <Dialog
        header="Visualizar relatório de impressão"
        visible={printDialogVisible}
        style={{ width: "85vw", maxWidth: "1100px" }}
        onHide={() => { setPrintDialogVisible(false); if (printUrl) { URL.revokeObjectURL(printUrl); setPrintUrl(null);} }}
        maximizable
      >
        {printUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button icon="pi pi-print" label="Imprimir" className="p-button-sm" onClick={() => {
                const iframe = document.getElementById('print-iframe');
                if (iframe && iframe.contentWindow) iframe.contentWindow.print();
              }} />
              <Button icon="pi pi-download" label="Baixar HTML" className="p-button-sm p-button-secondary" onClick={() => {
                const a = document.createElement('a');
                a.href = printUrl; a.download = `analise_inventario_${inventario?.id}.html`; a.click();
              }} />
            </div>
            <iframe id="print-iframe" title="Impressão" src={printUrl} style={{ width: "100%", height: "75vh", border: 0 }} />
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
