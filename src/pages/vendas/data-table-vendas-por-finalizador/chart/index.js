
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Player } from '@lottiefiles/react-lottie-player';
import EmptyChartAnimation from '../../../../assets/img/vendas.json';

const NoDataComponent = ({ title, message }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    textAlign: 'center',
    width: '100%',
    minHeight: '380px'
  }}>
    <Player
      src={EmptyChartAnimation}
      loop
      autoplay
      style={{ width: '130px', height: '130px', marginBottom: '1rem' }}
    />
    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '1.1rem' }}>{title || 'Gráfico Indisponível'}</h4>
    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
      {message || 'Não há dados suficientes para exibir.'}
    </p>
  </div>
);

const chartBaseOptions = {
  chart: {
    type: 'donut',
    width: 380,
    fontFamily: 'Inter, sans-serif'
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '14px',
    markers: { radius: 12 },
    itemMargin: { horizontal: 10, vertical: 5 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: (w) => {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
            }
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`,
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: { width: '100%' },
      legend: { position: 'bottom' }
    }
  }],
  tooltip: {
    y: {
      formatter: (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val),
    },
    style: { fontSize: '12px' },
  },
};

// Componente para a legenda detalhada
const DetailedLegend = ({ data }) => (
  <div style={{ padding: '0 1rem', marginTop: '1rem' }}>
    {data.map((item, index) => (
      <div key={index} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: item.color,
            marginRight: '0.75rem'
          }}></span>
          <span style={{ color: '#374151', fontWeight: 500 }}>{item.label}</span>
        </div>
        <div>
          <span style={{ color: '#1f2937', fontWeight: 600 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}</span>
          <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({item.percentage.toFixed(1)}%)</span>
        </div>
      </div>
    ))}
  </div>
);

export default function AppChart({ vendas, vendasNfce, vendasECF }) {
  // Gráfico 1: Vendas por Finalizador
  const hasVendasData = vendas && vendas.length > 0;
  const finalizadorColors = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b'];
  const finalizadorSeries = hasVendasData ? vendas.map(v => v.total) : [];
  const finalizadorLabels = hasVendasData ? vendas.map(v => v.nomefinalizador) : [];
  const finalizadorOptions = {
    ...chartBaseOptions,
    labels: finalizadorLabels,
    series: finalizadorSeries,
    colors: finalizadorColors,
  };
  
  const totalFinalizador = hasVendasData ? vendas.reduce((acc, cur) => acc + (cur.total || 0), 0) : 0;
  const finalizadorLegendData = hasVendasData ? vendas.map((v, i) => ({
    label: v.nomefinalizador,
    value: v.total,
    percentage: totalFinalizador > 0 ? (v.total / totalFinalizador) * 100 : 0,
    color: finalizadorColors[i % finalizadorColors.length]
  })) : [];

  // Gráfico 2: Vendas por Documento
  const totalNfce = vendasNfce?.reduce((acc, cur) => acc + (cur.total || 0), 0) || 0;
  const totalEcf = vendasECF?.reduce((acc, cur) => acc + (cur.total || 0), 0) || 0;
  const hasDocumentoData = totalNfce > 0 || totalEcf > 0;
  const documentoColors = ['#00AF54', '#E91E63'];
  const documentoSeries = hasDocumentoData ? [totalNfce, totalEcf] : [];
  const documentoOptions = {
    ...chartBaseOptions,
    labels: ['NFC-e', 'ECF'],
    series: documentoSeries,
    colors: documentoColors,
  };

  const totalDocumento = totalNfce + totalEcf;
  const documentoLegendData = hasDocumentoData ? [
    { label: 'NFC-e', value: totalNfce, percentage: totalDocumento > 0 ? (totalNfce / totalDocumento) * 100 : 0, color: documentoColors[0] },
    { label: 'ECF', value: totalEcf, percentage: totalDocumento > 0 ? (totalEcf / totalDocumento) * 100 : 0, color: documentoColors[1] }
  ] : [];

  return (
    <div className="grid">
      <div className="col-12 lg:col-6">
        <div className="chart-container" style={{borderRight: '1px solid #eee', padding: '0 1rem'}}>
          <h3 style={{ textAlign: 'center', fontWeight: 600, color: '#374151' }}>Vendas por Finalizador</h3>
          {hasVendasData ? (
            <>
              <ReactApexChart options={finalizadorOptions} series={finalizadorSeries} type="donut" width="100%" />
              <DetailedLegend data={finalizadorLegendData} />
            </>
          ) : (
            <NoDataComponent title="Vendas por Finalizador" />
          )}
        </div>
      </div>
      <div className="col-12 lg:col-6">
        <div className="chart-container" style={{padding: '0 1rem'}}>
          <h3 style={{ textAlign: 'center', fontWeight: 600, color: '#374151' }}>Vendas por Documento</h3>
          {hasDocumentoData ? (
            <>
              <ReactApexChart options={documentoOptions} series={documentoSeries} type="donut" width="100%" />
              <DetailedLegend data={documentoLegendData} />
            </>
          ) : (
            <NoDataComponent title="Vendas por Documento" />
          )}
        </div>
      </div>
    </div>
  );
}
