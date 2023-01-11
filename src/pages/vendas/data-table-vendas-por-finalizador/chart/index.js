
import ReactApexChart from 'react-apexcharts'


export default function AppChart({ vendas, vendasECF, vendasNfce }) {





    const state = {

        series: [vendasECF ? vendasECF.map((m) => m.total).reduce((accumulator, value) => accumulator + value, 0) : 0,
        vendasNfce ? vendasNfce.map((m) => m.total).reduce((accumulator, value) => accumulator + value, 0) : 0
        ],
        options: {
            chart: {
                width: 500,
                type: 'pier',
            },
            labels: ['ECF', 'NFC-e'],
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
            {vendas && vendasECF && vendasNfce ? <>
                <ReactApexChart options={state.options} series={state.series} type="pie" width={380} />

            </> : <></>}

        </div>


    );
}