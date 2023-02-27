import Chart from "react-apexcharts";

const GraficoMeioDePagamento = ({ dados }) => {
  const state = {
    options: {
      labels: [...new Set(dados.map((d) => d.nomefinalizador))],
      legend: {
        position: "bottom",
      },
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
      <div style={{ width: "100%" }}>
        <Chart
          options={state.options}
          series={state.series}
          height={400}
          width="100%"
          type="pie"
        />
      </div>
    </>
  );
};

export default GraficoMeioDePagamento;
