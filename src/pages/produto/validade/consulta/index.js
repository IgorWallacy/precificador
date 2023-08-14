import { useState, useMemo, useEffect, useRef } from "react";
import Footer from "../../../../components/footer";
import Header from "../../../../components/header";

import api from "../../../../services/axios";

import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";



import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
        
        

import moment from "moment/moment";
import { Button } from "primereact/button";

const ConsultaLote = () => {
    const toast = useRef(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dataInicial, setDataInicial] = useState();
  const [dataFinal, setDataFinal] = useState();

  const [loja, setLoja] = useState({ id: 1 });
  const [lojas, setLojas] = useState([]);

  const getLoja = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setLojas(r.data);
      })
      .catch((e) => {
         toast.current.show({severity:'error', summary: 'Error', detail: e.message, life: 3000});;
      });
  };

  const getProdutos = () => {
    setLoading(true);
    return api
      .get("/api/lote/todos")
      .then((r) => {
        setProdutos(r.data);
        
      })
      .catch((e) => {
         toast.current.show({severity:'error', summary: 'Error', detail: e.message, life: 3000});;
      })
      .finally((e) => {
        setLoading(false);
      });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "idfilial.nome",
        header: "Loja",
        size: 300,
      },
      {
        accessorKey: "idProduto.codigo",
        header: "Código",
        size: 50,
      },

      {
        accessorKey: "idProduto.ean",
        header: "Ean",
        size: 150,
      },
      {
        accessorKey: "idProduto.nome", //normal accessorKey
        header: "Produto",
        size: 300,
      },
      {
        accessorKey: "codigo", //access nested data with dot notation
        header: "Lote Nº",
        size: 50,
      },
      {
        accessorFn: (row) => moment(row.vencimento).format("DD/MM/YYYY"),
        id : 'vencimento',
        header: "Validade",
        size: 50,
        columnFilterModeOptions: ["between", "lessThan", "greaterThan"],
      },
      {
       
        id : 'isVencido',
        header: "Status",
        size: 50,
        enableColumnFilter: false,
        enableGrouping: false,
        Cell: ({ cell }) => (
            
            cell?.row?.original?.vencimento < moment(new Date()).format("YYYY-MM-DD") ? <><Tag severity="danger" value="VENCIDO"></Tag>
            </> : <><Tag severity="success" value="NA VALIDADE"></Tag></> 
           
            
          ),
      },
    ],
    []
  );

  const getProdutosPorData = () => {
    setProdutos([]);
    setLoading(true);
    if(  dataInicial && dataInicial)  {
    return api
      .get(
        `/api/lote/filial/${loja?.id}/dataInicial/${moment(dataInicial).format(
          "YYYY-MM-DD"
        )}/dataFinal/${moment(dataFinal).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        setProdutos(r.data);
      })
      .catch((e) => {
         toast.current.show({severity:'error', summary: 'Error', detail: e.message, life: 3000});;
      })
      .finally((f) => {
        setLoading(false);
      });
    } else {
        getProdutos()
    }
  };

  useEffect(() => {
    getProdutos();
    getLoja();
  }, []);
  return (
    <>
    <Toast ref={toast} />
      <Header />
      <Footer />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "1rem",
        }}
      >
        <h1 style={{ color: "#FFFF" }}>Consultar validade(s) e lote(s)</h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            color: "#f2f2f2",
            margin: "8px",
          }}
        >
          <div style={{ margin: "8px" }}>
            <h4>Loja</h4>
            <Dropdown
              value={loja}
              onChange={(e) => setLoja(e.value)}
              options={lojas}
              optionLabel="nome"
              placeholder="Selecione uma loja"
              className="w-full md:w-14rem"
              style={{ margin: "8px" }}
            />
          </div>
          <div>
            <h4>Data Inicial</h4>
            <Calendar
              dateFormat="dd/mm/yy"
              style={{ margin: "8px" }}
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              showButtonBar
            />
          </div>
          <div>
            <h4>Data Final</h4>
            <Calendar
              dateFormat="dd/mm/yy"
              style={{ margin: "8px" }}
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              showButtonBar
            />
          </div>

          <Button
            style={{ marginTop: "8px" }}
            label="Pesquisar"
            icon="pi pi-search"
            className="p-button p-button-success p-button-rounded p-button-lg"
            loading={loading}
            onClick={() => getProdutosPorData()}
          />
        </div>

        <div
          style={{
            border: "1px solid #FFF",
            marginTop: "1rem",
            width: "100%",
          }}
        >
          <MaterialReactTable
            state={{ isLoading: loading, showProgressBars: loading }}
            columns={columns}
            data={produtos ?? []}
            localization={MRT_Localization_PT_BR}
            enableGrouping={true}
            enableColumnActions={true}
            enableColumnFilters={true}
            enableColumnFilterModes={true}
            enablePagination={true}
            enableSorting={true}
            enableBottomToolbar={true}
            enableTopToolbar={true}
            muiTableBodyRowProps={{ hover: false }}
            muiTableBodyProps={{
            
              sx: {
                
                
                "& tr:nth-of-type(odd)": {
                  backgroundColor: "#D3D3D3",
                },
              },
            }}
            muiTableHeadCellProps={{
              sx: {
                border: "1px solid rgba(81, 81, 81, 1)",
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                border: "1px solid rgba(81, 81, 81, 1)",
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ConsultaLote;
