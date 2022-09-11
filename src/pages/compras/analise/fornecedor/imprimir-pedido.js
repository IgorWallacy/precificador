import { formataMoeda } from "../../../../util";
import pdfMake from "pdfmake/build/pdfmake";

import moment from "moment";

const exibirPedido = ({
  pedidos,
  idPedido,
  fornecedor,
  condicaoPagamento,
  prazoEntrega,
  totalPedido,
}) => {
  ImprimirPedido({
    pedidos,
    idPedido,
    fornecedor,
    condicaoPagamento,
    prazoEntrega,
    totalPedido,
  });
};
const ImprimirPedido = ({
  pedidos,
  idPedido,
  fornecedor,
  condicaoPagamento,
  prazoEntrega,
  totalPedido,
}) => {
  // console.log(pedidos);
  var dd = {
    styles: {
      header: {
        fontSize: 12,
        alignment: "center",
        marginTop: 5,
      },
    },
    //   pageSize: {width : 1001 , height : 200},
    pageSize: "A4",
    pageMargins: [5, 80, 5, 5],
    fontSize: 12,
    // by default we use portrait, you can change it to landscape if you wish
    pageOrientation: "portrait",
    header: [
      {
        text: `Pedido de compra N° ${idPedido} - Fornecedor : ${
          fornecedor?.codigo
        } - ${fornecedor?.nome} -
          Emissão ${moment(pedidos?.dataEmissao).format("DD/MM/YYYY")}
        Condição de pagamento : ${
          condicaoPagamento?.descricao
        }  - Prazo para entrega : ${moment(prazoEntrega).format("DD/MM/YYYY")}
       Total do pedido: ${formataMoeda(totalPedido)}
`,

        style: "header",
        margin: [5, 5],
      },
    ],

    content: pedidos.map(function (item, i) {
      return {
        layout: "lightHorizontalLines", // optional
        lineHeight: 1,
        fontSize: 9,
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 0,
          widths: [20, 66, 140, 40, 40, 40, "*"],

          body: [
            ["", "", "", "", "", "", ""],

            [
              { text: i + 1 },

              {
                text: item.idproduto.ean
                  ? item.idproduto.ean
                  : item.idproduto.codigo,
                style: "ean",
              },
              {
                text: item.idproduto.nome.substring(0, 35),
                style: "descricao",
              },

              {
                text: Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: "2",
                  maximumFractionDigits: "2",
                }).format(item.preco),
                style: "preco",
              },

              {
                text:
                  item.quantidade +
                  ` ${item.unidadeCompra ? item.unidadeCompra.codigo : ""} (${
                    item.fatorConversao === 0 ? 1 : item.fatorConversao
                  })`,
              },

              {
                text: Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.preco * item.quantidade),
              },
              {
                text: item.filial.id + "-" + item.filial.nome,
              },
            ],
          ],
        },
      };
    }),
  };

  pdfMake.createPdf(dd).open();
};
export { ImprimirPedido, exibirPedido };
