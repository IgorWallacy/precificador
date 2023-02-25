import Chart from "react-apexcharts";

const GraficoMeioDePagamento = ({ dados }) => {
  const state = {
    options: {
      labels: [...new Set(dados.map((d) => d.nomefinalizador))],
      title: {
        text: "Vendas por meio de pagamento",
        align: "center",

        style: {
          fontSize: "14px",
        },
      },
    },

    series: [...new Set(dados.map((m) => m.total))],
  };

  return (
    <>
      <div>
        <Chart
          options={state.options}
          series={state.series}
          width={450}
          type="pie"
        />
      </div>
    </>
  );
};

export default GraficoMeioDePagamento;
