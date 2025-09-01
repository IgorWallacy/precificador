import { useEffect, useState, useMemo, useRef } from "react";
import { Dialog } from 'primereact/dialog';

import { MaterialReactTable } from "material-react-table";

// Importações para Excel e PDF
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import api from "../../../../services/axios";
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';
import moment from "moment";

const AuditoriaInventario = ( {id} ) => {

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inventario, setInventario] = useState(null);

  const getProdutos = () => {
    setLoading(true);
    return api
      .get(`/api/produto/contagem/porInventario/mobile/${id}`)
      .then((r) => {
        setProdutos(r.data);
        // console.log(r.data);
      })
      .catch((r) => {})
      .finally((f) => {
        setLoading(false);
      });
  };

  const getInventario = () => {
    return api
      .get(`/api/produto/contagem/inventario/${id}`)
      .then((r) => {
        setInventario(r.data);
      })
      .catch((r) => {});
  };

  // Função para gerar resumo da auditoria
  const gerarResumoAuditoria = () => {
    if (!produtos || produtos.length === 0) return null;

    const totalProdutos = produtos.length;
    const totalQuantidadeLida = produtos.reduce((sum, item) => sum + (item.quantidadeLida || 0), 0);
    
    // Agrupar por produto para contar entradas únicas
    const produtosUnicos = new Map();
    produtos.forEach(item => {
      if (produtosUnicos.has(item.produto)) {
        produtosUnicos.get(item.produto).entradas++;
        produtosUnicos.get(item.produto).quantidadeTotal += item.quantidadeLida || 0;
      } else {
        produtosUnicos.set(item.produto, {
          produto: item.produto,
          entradas: 1,
          quantidadeTotal: item.quantidadeLida || 0
        });
      }
    });

    const totalProdutosUnicos = produtosUnicos.size;
    const produtosComMultiplasEntradas = Array.from(produtosUnicos.values()).filter(p => p.entradas > 1).length;

    return {
      totalProdutos,
      totalProdutosUnicos,
      totalQuantidadeLida,
      produtosComMultiplasEntradas,
      produtosComUmaEntrada: totalProdutosUnicos - produtosComMultiplasEntradas,
      produtosAgrupados: Array.from(produtosUnicos.values())
    };
  };

  // Função para exportar para Excel
  const exportarParaExcel = () => {
    if (!produtos || produtos.length === 0) return;

    const resumo = gerarResumoAuditoria();
    
    // Dados para exportação - detalhados
    const dadosExportacao = produtos.map(item => ({
      'Data/Hora Entrada': moment(item.entrada).format('DD/MM/YYYY HH:mm:ss'),
      'Produto': item.produto,
      'Quantidade Lida': item.quantidadeLida || 0,
      'Coletor': item.nomeUsuario || ''
    }));

    // Dados agrupados por produto
    const dadosAgrupados = resumo.produtosAgrupados.map(item => ({
      'Produto': item.produto,
      'Total de Entradas': item.entradas,
      'Quantidade Total': item.quantidadeTotal
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Planilha principal com dados detalhados
    const ws = XLSX.utils.json_to_sheet(dadosExportacao);
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoria Detalhada');

    // Planilha com dados agrupados por produto
    const wsAgrupado = XLSX.utils.json_to_sheet(dadosAgrupados);
    XLSX.utils.book_append_sheet(wb, wsAgrupado, 'Produtos Agrupados');

    // Planilha de resumo
    const resumoData = [
      ['RESUMO DA AUDITORIA DO INVENTÁRIO'],
      [],
      ['TOTAIS'],
      ['Total de Entradas', resumo.totalProdutos],
      ['Total de Produtos Únicos', resumo.totalProdutosUnicos],
      ['Total de Quantidade Lida', resumo.totalQuantidadeLida],
      [],
      ['DETALHAMENTO'],
      ['Produtos com Uma Entrada', resumo.produtosComUmaEntrada],
      ['Produtos com Múltiplas Entradas', resumo.produtosComMultiplasEntradas],
      [],
      ['INFORMAÇÕES DO INVENTÁRIO'],
      ['ID do Inventário', id],
      ['Data de Geração', moment().format('DD/MM/YYYY HH:mm:ss')]
    ];

    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // Salvar arquivo
    XLSX.writeFile(wb, `Auditoria_Inventario_${id}_${moment().format('DD-MM-YYYY_HH-mm')}.xlsx`);
  };

  // Função para exportar para PDF
  const exportarParaPDF = () => {
    if (!produtos || produtos.length === 0) return;

    const resumo = gerarResumoAuditoria();
    
    // Criar documento PDF
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.text('AUDITORIA DO INVENTÁRIO', 105, 15, { align: 'center' });
    
    if (inventario) {
      doc.setFontSize(10);
      doc.text(`ID: ${inventario.id} - ${inventario.nome} - LOJA: ${inventario.loja}`, 105, 22, { align: 'center' });
      doc.text(`Início: ${moment(inventario.inicio).format('DD/MM/YYYY HH:mm:ss')}`, 105, 27, { align: 'center' });
      if (inventario.fim) {
        doc.text(`Fim: ${moment(inventario.fim).format('DD/MM/YYYY HH:mm:ss')}`, 105, 32, { align: 'center' });
      }
    }

    // Resumo
    doc.setFontSize(12);
    doc.text('RESUMO DA AUDITORIA', 20, 45);
    
    doc.autoTable({
      startY: 50,
      head: [['Item', 'Valor']],
      body: [
        ['Total de Entradas', resumo.totalProdutos],
        ['Total de Produtos Únicos', resumo.totalProdutosUnicos],
        ['Total de Quantidade Lida', resumo.totalQuantidadeLida],
        ['Produtos com Uma Entrada', resumo.produtosComUmaEntrada],
        ['Produtos com Múltiplas Entradas', resumo.produtosComMultiplasEntradas]
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });

    // Tabela agrupada por produto
    doc.setFontSize(12);
    doc.text('RESUMO POR PRODUTO', 20, doc.previousAutoTable.finalY + 15);
    
    const dadosAgrupados = resumo.produtosAgrupados.map(item => [
      item.produto,
      item.entradas,
      item.quantidadeTotal
    ]);

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 20,
      head: [['Produto', 'Total de Entradas', 'Quantidade Total']],
      body: dadosAgrupados,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 80 }, // Produto
        1: { cellWidth: 30, halign: 'center' }, // Total de Entradas
        2: { cellWidth: 30, halign: 'center' }  // Quantidade Total
      },
      didParseCell: (data) => {
        // Linhas listradas
        if (data.section === 'body' && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [245, 245, 245];
        }
      }
    });

    // Tabela principal detalhada
    doc.setFontSize(12);
    doc.text('DETALHAMENTO COMPLETO', 20, doc.previousAutoTable.finalY + 15);
    
    const dadosTabela = produtos.map(item => [
      moment(item.entrada).format('DD/MM/YYYY HH:mm:ss'),
      item.produto,
      item.quantidadeLida || 0,
      item.nomeUsuario || ''
    ]);

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 20,
      head: [['Data/Hora Entrada', 'Produto', 'Quantidade Lida', 'Coletor']],
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
        0: { cellWidth: 35 }, // Data/Hora
        1: { cellWidth: 70 }, // Produto
        2: { cellWidth: 25 }, // Quantidade
        3: { cellWidth: 35 }  // Coletor
      },
      didParseCell: (data) => {
        // Linhas listradas
        if (data.section === 'body' && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [245, 245, 245];
        }
      }
    });

    // Rodapé
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Relatório gerado em ${moment().format('DD/MM/YYYY HH:mm:ss')}`, 105, footerY, { align: 'center' });
    doc.text('Sistema JJ de Gestão de Inventário', 105, footerY + 5, { align: 'center' });

    // Salvar arquivo
    doc.save(`Auditoria_Inventario_${id}_${moment().format('DD-MM-YYYY_HH-mm')}.pdf`);
  };

  // Função para imprimir
  const [printVisible, setPrintVisible] = useState(false);
  const [printUrl, setPrintUrl] = useState(null);

  const imprimirAuditoria = () => {
    if (!produtos || produtos.length === 0) return;

    const resumo = gerarResumoAuditoria();
    
    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Auditoria do Inventário ${id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Roboto', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
            padding: 20px;
          }
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center;
          }
          .header h1 { 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 10px; 
          }
          .header h2 { 
            font-size: 18px; 
            font-weight: 400; 
            opacity: 0.9; 
          }
          .content { padding: 30px; }
          .resumo-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
          }
          .resumo-card { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
            text-align: center;
          }
          .resumo-card h3 { 
            font-size: 14px; 
            color: #666; 
            margin-bottom: 10px; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .resumo-card .valor { 
            font-size: 24px; 
            font-weight: 700; 
            color: #333; 
          }
          .tabela-container { 
            background: white; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
          }
          .tabela-container h3 {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            margin: 0;
            font-size: 16px;
            font-weight: 500;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 12px;
          }
          th { 
            background: #f8f9fa; 
            color: #333; 
            padding: 12px 8px; 
            text-align: left; 
            font-weight: 500;
            border-bottom: 2px solid #667eea;
          }
          td { 
            padding: 10px 8px; 
            border-bottom: 1px solid #eee; 
          }
          tr:nth-child(even) { background: #f8f9fa; }
          tr:hover { background: #e3f2fd; }
          .acoes { 
            text-align: center; 
            margin-top: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 8px;
          }
          .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            margin: 0 10px; 
            background: #667eea; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 500; 
            transition: all 0.3s ease;
          }
          .btn:hover { 
            background: #5a6fd8; 
            transform: translateY(-2px); 
          }
          .btn-print { background: #28a745; }
          .btn-print:hover { background: #218838; }
          .btn-close { background: #6c757d; }
          .btn-close:hover { background: #5a6268; }
          @media print {
            .acoes { display: none; }
            body { background: white; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AUDITORIA DO INVENTÁRIO ${id}</h1>
            <h2>${inventario ? `${inventario.nome} - LOJA: ${inventario.loja}` : ''}</h2>
            ${inventario ? `<p><strong>Início:</strong> ${moment(inventario.inicio).format('DD/MM/YYYY HH:mm:ss')}</p>` : ''}
            ${inventario && inventario.fim ? `<p><strong>Fim:</strong> ${moment(inventario.fim).format('DD/MM/YYYY HH:mm:ss')}</p>` : ''}
          </div>
          
          <div class="content">
            <div class="resumo-grid">
              <div class="resumo-card">
                <h3>Total de Entradas</h3>
                <div class="valor">${resumo.totalProdutos}</div>
              </div>
              <div class="resumo-card">
                <h3>Produtos Únicos</h3>
                <div class="valor">${resumo.totalProdutosUnicos}</div>
              </div>
              <div class="resumo-card">
                <h3>Quantidade Total</h3>
                <div class="valor">${resumo.totalQuantidadeLida.toLocaleString('pt-BR')}</div>
              </div>
              <div class="resumo-card">
                <h3>Múltiplas Entradas</h3>
                <div class="valor">${resumo.produtosComMultiplasEntradas}</div>
              </div>
            </div>
            
            <div class="tabela-container">
              <h3>RESUMO POR PRODUTO</h3>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Total de Entradas</th>
                    <th>Quantidade Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${resumo.produtosAgrupados.map(item => `
                    <tr>
                      <td>${item.produto}</td>
                      <td style="text-align: center;">${item.entradas}</td>
                      <td style="text-align: center;">${item.quantidadeTotal.toLocaleString('pt-BR')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="tabela-container">
              <h3>DETALHAMENTO COMPLETO</h3>
              <table>
                <thead>
                  <tr>
                    <th>Data/Hora Entrada</th>
                    <th>Produto</th>
                    <th>Quantidade Lida</th>
                    <th>Coletor</th>
                  </tr>
                </thead>
                <tbody>
                  ${produtos.map(item => `
                    <tr>
                      <td>${moment(item.entrada).format('DD/MM/YYYY HH:mm:ss')}</td>
                      <td>${item.produto}</td>
                      <td>${(item.quantidadeLida || 0).toLocaleString('pt-BR')}</td>
                      <td>${item.nomeUsuario || ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="acoes">
              <button class="btn btn-print" onclick="window.print()">🖨️ Imprimir</button>
              <button class="btn btn-close" onclick="window.close()">❌ Fechar</button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([conteudoHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPrintUrl(url);
    setPrintVisible(true);
  };

  const columns = useMemo(() => [
    {
      header: "Entrada",
      accessorKey :'entrada',
      enableGrouping: true, //do not let this column be grouped
      size: "200",
      Cell: ({ cell }) => {
        return <div>{ moment(cell?.getValue()).format("DD/MM/YYYY HH:mm:ss")}</div>;
      },
     
    },
    {
      header: "Produto",
      accessorKey: "produto",
      enableGrouping: true, //do not let this column be grouped
      size: "500",
    },
    {
      header: "Quantidade no inventário",
      accessorKey: "quantidadeLida",

      aggregationFn: "sum", //calc total points for each team by adding up all the points for each player on the team

      AggregatedCell: ({ cell }) => (
        <>
        Total : 
          {cell.getValue()?.toLocaleString?.("pt-BR", {
            style: "decimal",

            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
          })}
        </>
      ),
      //customize normal cell render on normal non-aggregated rows
      Cell: ({ cell }) => (
        <>
          {cell.getValue()?.toLocaleString?.("pt-BR", {
            style: "decimal",

            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
          })}
        </>
      ),
    },

    {
      header: "Coletor",
      accessorKey: "nomeUsuario",
    },
  ]);

  useEffect(() => {
    getProdutos();
    getInventario();
  }, []);

  return (
    <>
      <Dialog
        header="Visualizar impressão"
        visible={printVisible}
        style={{ width: "85vw", maxWidth: "1100px" }}
        onHide={() => { setPrintVisible(false); if (printUrl) { URL.revokeObjectURL(printUrl); setPrintUrl(null);} }}
        maximizable
      >
        {printUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="p-button p-component p-button-sm" onClick={() => {
                const iframe = document.getElementById('auditoria-print-iframe');
                if (iframe && iframe.contentWindow) iframe.contentWindow.print();
              }}>
                <span className="p-button-icon p-c pi pi-print"></span>
                <span className="p-button-label">Imprimir</span>
              </button>
            </div>
            <iframe id="auditoria-print-iframe" title="Impressão" src={printUrl} style={{ width: "100%", height: "75vh", border: 0 }} />
          </div>
        ) : null}
      </Dialog>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={imprimirAuditoria}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🖨️ Imprimir
        </button>
        <button 
          onClick={exportarParaExcel}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📊 Exportar Excel
        </button>
        <button 
          onClick={exportarParaPDF}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📄 Exportar PDF
        </button>
      </div>
        
        <MaterialReactTable
        
          columns={columns}
          data={produtos ?? []}
          enableColumnResizing
          enableGrouping
        //  enableStickyHeader
        //  enableStickyFooter
          state={{ showProgressBars: loading, isLoading: loading }} //or showSkeletons
          initialState={{
            density: "compact",
            expanded: true, //expand all rows by default
            grouping: ["produto"], //an array of columns to group by by default (can be multiple)
            pagination: { pageIndex: 0, pageSize: 100 },
            sorting: [{ id: "produto", desc: false }], //sort by state by default
          }}
          localization={MRT_Localization_PT_BR}
        />
      
    </>
  );
};

export default AuditoriaInventario;
