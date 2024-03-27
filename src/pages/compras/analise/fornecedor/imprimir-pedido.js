import { formataMoeda } from "../../../../util";
import pdfMake from "pdfmake/build/pdfmake";
import moment from "moment";

const ImprimirPedido = ({ loja, pedido, itens }) => {
  console.log(pedido);
  // Ordenando os itens por descrição em ordem alfabética crescente
  itens.sort((a, b) => a.idproduto.nome.localeCompare(b.idproduto.nome));

  var dd = {
    styles: {
      header: {
        fontSize: 10,
        alignment: "center",
        marginTop: 10,
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: "black",
        alignment: "center",
        fillColor: "#f2f2f2",
      },
      tableRow: {
        fontSize: 10,
        alignment: "center",
        lineHeight: 2.0,
      },
    },
    pageSize: "A4",
    pageMargins: [10, 80, 10, 40],
    fontSize: 14,
    pageOrientation: "landscape",
    footer: function (currentPage, pageCount) {
      return [
        {
          text: "Página " + currentPage.toString() + " de " + pageCount + `
          Total do pedido: ${formataMoeda(pedido?.total)}
          ` , alignment: 'center' , style : 'header',
        },
      ];
    },
    header: function (currentPage, pageCount) {
      return [
        {
          text: ` Pedido da loja ${loja?.codigo} - ${loja?.nome}
          Pedido de compra N° ${pedido?.codigo}  - Fornecedor: ${
            pedido?.fornecedor?.codigo
          } - ${pedido?.fornecedor?.nome} -
            Emissão do pedido em ${moment(pedido?.dataEmissao).format(
              "DD/MM/YYYY"
            )} Comprador: ${
            pedido?.comprador ? pedido?.comprador?.nome : "Não preenchido"
          }
            Condição de pagamento : ${
              pedido?.condicaoPagamento
                ? pedido?.condicaoPagamento?.descricao
                : " Não preenchido "
            } - Prazo para entrega : ${
            pedido?.prazoEntrega
              ? moment(pedido?.prazoEntrega).format("DD/MM/YYYY")
              : "Não preenchido"
          }
          Total do pedido: ${formataMoeda(pedido?.total)}
          Observação ${pedido?.observacao} 
    `,
          style: "header",
          margin: [1, 1],
        },
      ];
    },

    content: [
      {
        style: "tableRow",
        layout: "lightHorizontalLines",
        table: {
          headerRows: 1,
          widths: [20, 80, 180, 50, 30, 40, 40, 40, 40, 40, 40, "*"],
          body: [
            [
              { text: "N°", style: "tableHeader" },
              { text: "EAN ou código", style: "tableHeader" },
              { text: "Descrição", style: "tableHeader" },
              { text: "Quantidade", style: "tableHeader" },
              { text: "Quantidade total", style: "tableHeader" },
              { text: "Custo unitário", style: "tableHeader" },
              { text: "Custo da embalagem", style: "tableHeader" },
              { text: "Markup atual", style: "tableHeader" },
              { text: "Preço atual", style: "tableHeader" },
              { text: "Markup sugestão", style: "tableHeader" },
              { text: "Sugestão de venda", style: "tableHeader" },
              { text: "Total", style: "tableHeader" },
            ],
            ...itens?.map(function (item, i) {
              let row = [
                { text: i + 1, style: "tableRow" },
                {
                  text: item?.idproduto.ean
                    ? item?.idproduto.ean
                    : item?.idproduto.codigo,
                  style: "tableRow",
                },
                {
                  text: item?.idproduto.nome.substring(0, 100),
                  style: "tableRow",
                },
                {
                  text:
                    Intl.NumberFormat("pt-BR", { minimumFractionDigits : 0 , maximumFractionDigits : 3}).format(item.quantidade) +
                    ` ${item.unidadeCompra ? item.unidadeCompra.codigo : ""} (${
                      item?.fatorConversao === 0 ? 1 : item?.fatorConversao
                    })`,
                  style: "tableRow",
                },
                {
                  text: new Intl.NumberFormat("pt-BR", {
                    maximumFractionDigits: 3,
                    minimumFractionDigits: 0,
                    style: "decimal",
                  }).format(item.quantidade * item.fatorConversao),
                  style: "tableRow",
                },
                { text: formataMoeda(item.preco), style: "tableRow" },
                {
                  text: formataMoeda(item?.preco * item?.fatorConversao),
                  style: "tableRow",
                },
                {
                  text:
                    new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(
                      ((item?.precoVenda - item?.preco) / item?.preco) * 100
                    ) + " %",
                  style: "tableRow",
                },
                { text: formataMoeda(item?.precoVenda), style: "tableRow" },
                {
                  text:
                    new Intl.NumberFormat("pt-BR", {
                      style: "decimal",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(item?.percentualmarkupminimo) + " %",
                  style: "tableRow",
                },
                {
                  text: formataMoeda(
                    (item?.percentualmarkupminimo / 100) * item?.preco +
                      item?.preco
                  ),
                  style: "tableRow",
                },
                {
                  text: formataMoeda(item?.preco * item?.quantidade),
                  style: "tableRow",
                },
              ];

              // Adicione uma cor de fundo alternativa para linhas pares
              if (i % 2 === 0) {
                row = row.map((cell) => ({ ...cell, fillColor: "#f0f0f0" }));
              }
              return row;
            }),
          ],
        },
      },
    ],
  };

  pdfMake.createPdf(dd).open();
};

export { ImprimirPedido };
