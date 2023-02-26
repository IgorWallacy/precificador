import Chart from "react-apexcharts";

const GraficoMeioDePagamento = ({ dados }) => {
  const state = {
    options: {
      labels: [...new Set(dados.map((d) => d.nomefinalizador))],
      title: {
        text: "Vendas por meio de pagamento no PDV",
        align: "center",
        style: {
          color: "#fff",
        },
      },
    },

    series: [...new Set(dados.map((m) => m.total))],
  };

  return (
    <>
      <Chart
        options={state.options}
        series={state.series}
        height={350}
        width={500}
        type="pie"
      />
    </>
  );
};

export default GraficoMeioDePagamento;
