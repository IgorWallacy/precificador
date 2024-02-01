import ReactApexChart from "react-apexcharts";

import moment from "moment/moment";

const GraficoVendaPorHora = ({ dados }) => {
  const results = {};

  dados.forEach((value) => {
    const filial = value.filial;
    const hora = moment(value.horaInicial).format("HH");
    const total = value.valorliquido;

    if (!results[filial]) {
      results[filial] = {};
    }
    if (!results[filial][hora]) {
      results[filial][hora] = 0;
    }

    results[filial][hora] += total;
  });

  const resultsArray = Object.entries(results).flatMap(([filial, horas]) => {
    return Object.entries(horas)
      .sort()
      .map(([hora, total]) => {
        return {
          filial,
          hora,
          total,
        };
      });
  });
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      type: "line",
      height: 350,
      background: "#FCF6F532",
    },
    xaxis: {
      categories: [...new Set(resultsArray.sort().map((d) => d.hora))],
    },
    title: {
      text: "Vendas por hora",
      align: "center",
    },
    yaxis: {
      title: {
        text: " R$ Total",
      },
    },
  };

  const series = Object.entries(
    resultsArray.reduce((acc, { filial, hora, total }) => {
      acc[filial] = acc[filial] || { name: filial, data: [] };
      acc[filial].data.push(
        Intl.NumberFormat("pt-BR", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          //  currency : 'BRL',
          useGrouping: false,
        }).format(total)
      );
      return acc;
    }, {})
  ).map(([_, { name, data }]) => ({ name, data }));

  return (
    <>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
        width="100%"
        expo
      />
    </>
  );
};

export default GraficoVendaPorHora;
