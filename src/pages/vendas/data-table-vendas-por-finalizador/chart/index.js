import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts'


export default function AppChart({ vendas, vendasECF, vendasNfce }) {
    const [series, setSeries] = useState([])
    const [labels, setLabels] = useState([])



    useEffect(() => {


        if (vendas && vendasECF && vendasNfce) {

            // setSeries(vendas.map((m) => m.total))
            // setLabels(vendas.map((m) => m.nomefinalizador))
            // console.log([series])
            // console.log([labels])
            var ecf = vendasECF.map((m) => m.total).reduce((accumulator, value) => accumulator + value, 0);
            var nfce = vendasNfce.map((m) => m.total).reduce((accumulator, value) => accumulator + value, 0);
            setLabels(['NFC-e', 'ECF'])
            setSeries([nfce, ecf])
        }

    }, [vendas])

    const state = {

        series: series,
        options: {
            chart: {
                width: 500,
                type: 'pier',
            },
            labels: labels,
            colors: ['#00AF54', '#E91E63'],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200,

                    },
                    legend: {
                        position: 'bottom',

                    }
                }
            }]
        },


    };
    return (
        <div>
            {series && labels ? <>
                <ReactApexChart options={state.options} series={state.series} type="pie" width={300} />

            </> : <></>}

        </div>


    );
}