import { useEffect, useState, useMemo } from "react";

import { MaterialReactTable } from "material-react-table";



import api from "../../../../services/axios";
import { MRT_Localization_PT_BR } from 'material-react-table/locales/pt-BR';
import moment from "moment";

const AuditoriaInventario = ( {id} ) => {


  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  const getProdutos = () => {
    setLoading(true);
    return api
      .get(`/api/produto/contagem/porInventario/mobile/${id}`)
      .then((r) => {
        setProdutos(r.data);
        // console.log(r.data);
      })
      .catch((r) => {})
      .finally((f) => {
        setLoading(false);
      });
  };

  const columns = useMemo(() => [
    {
      header: "Entrada",
      accessorKey :'entrada',
      enableGrouping: true, //do not let this column be grouped
      size: "200",
      Cell: ({ cell }) => {
        return <div>{ moment(cell?.getValue()).format("DD/MM/YYYY HH:mm:ss")}</div>;
      },
     
    },
    {
      header: "Produto",
      accessorKey: "produto",
      enableGrouping: true, //do not let this column be grouped
      size: "500",
    },
    {
      header: "Quantidade no inventário",
      accessorKey: "quantidadeLida",

      aggregationFn: "sum", //calc total points for each team by adding up all the points for each player on the team

      AggregatedCell: ({ cell }) => (
        <>
        Total : 
          {cell.getValue()?.toLocaleString?.("pt-BR", {
            style: "decimal",

            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
          })}
        </>
      ),
      //customize normal cell render on normal non-aggregated rows
      Cell: ({ cell }) => (
        <>
          {cell.getValue()?.toLocaleString?.("pt-BR", {
            style: "decimal",

            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
          })}
        </>
      ),
    },

    {
      header: "Coletor",
      accessorKey: "nomeUsuario",
    },
  ]);

  useEffect(() => {
    getProdutos();
  }, []);

  return (
    <>
     
        
        <MaterialReactTable
        
          columns={columns}
          data={produtos ?? []}
          enableColumnResizing
          enableGrouping
        //  enableStickyHeader
        //  enableStickyFooter
          state={{ showProgressBars: loading, isLoading: loading }} //or showSkeletons
          initialState={{
            density: "compact",
            expanded: true, //expand all groups by default
            grouping: ["produto"], //an array of columns to group by by default (can be multiple)
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: "produto", desc: false }], //sort by state by default
          }}
          localization={MRT_Localization_PT_BR}
        />
      
    </>
  );
};

export default AuditoriaInventario;
