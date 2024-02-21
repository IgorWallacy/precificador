import ReactApexChart from "react-apexcharts";
import moment from "moment";
import { Statistic } from 'antd';


const TicketMedioGrafico = ({ dados }) => {
  const results = {};

  dados.forEach((value) => {
    const filial = value.filial;
    const hora = moment(value.data).format("DD/MM/YY");
    const total = value.valorLiquido / value.quantidadeVendas;

    if (!results[filial]) {
      results[filial] = {};
    }
    if (!results[filial][hora]) {
      results[filial][hora] = 0;
    }

    results[filial][hora] += total;
  });

  const resultsArray = Object.entries(results).flatMap(([filial, horas]) => {
    return Object.entries(horas).map(([hora, total]) => {
      return {
        filial,
        hora,
        total,
      };
    });
  });
  const options = {
    chart: {
      type: "line",
      height: 350,
      background: "#FCF6F532",
    },
    xaxis: {
      categories: [...new Set(resultsArray.map((d) => d.hora))],
    },
    title: {
      text: "Ticket médio",
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

          useGrouping: false,
        }).format(total)
      );
      return acc;
    }, {})
  ).map(([_, { name, data }]) => ({ name, data }));

  const ticketMedio = () => {
    let quantidade = 0;
    let valor = 0;
    let total = 0;

    if (dados) {
      for (let r of dados) {
        quantidade += r?.quantidadeVendas;
        valor += r?.valorLiquido;
        total = valor / quantidade;
      }
    }

    return total;
  };

  return (
    <>
    <div style={{display:'flex', justifyContent: 'center' ,backgroundColor:'#f1f1f1' ,margin:'1px'}}>
    <Statistic
        title="Ticket Médio"
        value={Intl.NumberFormat("pt-BR", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
          style: "currency",
          currency: "BRL",
        }).format(ticketMedio())}
        
      />
    </div>
     
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
        width="100%"
      />
    </>
  );
};

export default TicketMedioGrafico;
