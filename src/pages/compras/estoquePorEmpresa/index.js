import  { useEffect, useState, useMemo, useRef } from "react";

import api from "../../../services/axios";

import MaterialReactTable from "material-react-table";
import { Box } from "@mui/material";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import { exportToExcel } from "react-json-to-excel";

import { Toast } from 'primereact/toast';
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Steps } from "primereact/steps";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { addLocale } from "primereact/api";


import moment from "moment/moment";

import Header from "../../../components/header";
import { BadgeRounded, PointOfSaleSharp, ShoppingCart } from "@mui/icons-material";

const EstoquePorEmpresa = () => {
  const toast = useRef(null);
  
  const [produto, setProduto] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dataIncialCompra, setDataInicialCompra] = useState(new Date());
  const [dataFinalCompra, setDataFinalCompra] = useState(new Date());

  const [dataIncialVenda, setDataInicialVenda] = useState(new Date());
  const [dataFinalVenda, setDataFinalVenda] = useState(new Date());

  const [fornecedor, setFornecedor] = useState([]);
  const [fornecedorList, setFornecedorList] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);

  addLocale("pt-BR", {
    firstDayOfWeek: 0,
    dayNames: [
      "domingo",
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sábado",
    ],
    dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
    dayNamesMin: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    monthNamesShort: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Maio",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    today: " Hoje ",
    clear: " Limpar ",
  });
  const items = [
    {
      label: "Compra",
      
    },
    {
      label: "Venda",
    },
    {
      label: "Fornecedor",
    },
    
  ];

  const optionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>
          {option?.codigo} - {option?.nome}
        </div>
      </div>
    );
  };

  const getFornecedores = () => {
    api
      .get("/api/entidade/fornecedores")
      .then((r) => {
        setFornecedorList(r.data);
        // console.log(r.data);
      })
      .catch((e) => {});
  };

  const getProdutos = () => {
    setLoading(true);
    
    const data = {
      fornecedor : fornecedor?.id,
      
      dataInicialVenda : moment(dataIncialVenda).format("YYYY-MM-DD"),
      dataFinalVenda : moment(dataFinalVenda).format("YYYY-MM-DD"),
      dataInicialCompra : moment(dataIncialCompra).format("YYYY-MM-DD"),
      dataFinalCompra : moment(dataFinalCompra).format("YYYY-MM-DD")
    }
    
    api
      .post("/api/estoque/compras/empresa", data)
      .then((r) => {
       // console.log(r.data);
        setProduto(r.data)
        if(r.data.length === 0 && loading === false) {
          toast.current.show({ severity: 'info', summary: 'Aviso', detail: 'Nenhum produto encontrado para análise !' }) 
        }
      })
      .catch((e) => {
        console.log(e);
        toast.current.show({ severity: 'error', summary: 'Erro', detail: `${e?.message}` }) 
      })
      .finally((f) => {
        setLoading(false);
       
      });
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row?.nomefilial,
        header: "Loja",
      },
      {
        accessorFn: (row) => row?.codigoproduto, //access nested data with dot notation
        accessorKey: "codigoproduto",
        header: "Código",
      },
      {
        accessorFn: (row) => row?.nomeproduto,
        header: "Produto",
      },

      {
        accessorFn: (row) => row?.nomefornecedor,
        header: "Último Fornecedor",
      },

      {
        header: "Preço de custo médio ",
        accessorKey: "precocusto",

        aggregationFn: "mean",
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <h4 style={{ fontWeight: "bold" }}>Custo médio</h4>
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                {cell.getValue()?.toLocaleString?.("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Box>
            </div>
          </>
        ),
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ),
      },

      {
        accessorFn: (row) => row?.numeronfultcompra,
        accessorKey: "numeronfultcompra",
        header: "Nota fiscal última compra",
      },
      {
        accessorFn: (row) =>
          `${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(row?.precoultimacompra)}`,

        header: "Preço de custo da última compra ",
      },
      
      {
        accessorFn: (row) => row?.condicaopagamento,

        header: "Condição de pagamento ",
      },
     

      {
        accessorFn: (row) => row?.codigounidademedida,

        header: "UN compra",
      },

      {
        header: "Qtde comprada",
        accessorKey: "quantidadecompra",
        aggregationFn: "sum",
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell }) => (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                {cell.getValue()?.toLocaleString?.("pt-BR", {
                  style: "decimal",

                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Box>
            </div>
          </>
        ),
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "decimal",

              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ),
      },
      {
        header: "Total comprado R$ ",
        accessorKey: "total",

        aggregationFn: "sum",
        //required to render an aggregated cell, show the average salary in the group
        AggregatedCell: ({ cell, table }) => (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <h4 style={{ fontWeight: "bold" }}></h4>
              <Box sx={{ color: "error.main", fontWeight: "bold" }}>
                {cell.getValue()?.toLocaleString?.("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Box>
            </div>
          </>
        ),
        Cell: ({ cell }) => (
          <>
            {cell.getValue()?.toLocaleString?.("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </>
        ),
      },
      {
        header: "Qtde vendida",
        
         accessorFn: (row) => 
        `${new Intl.NumberFormat("pt-BR", {
            style: "decimal",
        
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(row?.quantidadevendida)}`,
        
      },
      {
        accessorFn: (row) => row?.unvenda,

        header: "UN venda",
      },
      {
        accessorFn: (row) => 
        `${new Intl.NumberFormat("pt-BR", {
            style: "decimal",
        
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(row?.quantidadesaldoestoque)}`,

        header : "Estoque"
      }
    ],

    []
  );

  const handleExportExcelRows = (rows) => {
    let dados = rows.map((row) => row);
    if (dados?.length > 0) {
      let dados2 = dados.map((d) => {
        return {
         // Emissao: moment(d.dataEmissao).format("DD/MM/YYYY"),
         // NF: d.numeronf,
          Loja: d.nomefilial,
          Codigo: d.codigoproduto,
          Produto: d.nomeproduto,
          Custo_Ultima_compra: d.precoultimacompra,
          Custo_Medio: d.precocusto,
          // Embalagem: d.quantidadeembalagem,
          UN_COMPRA: d.codigounidademedida,
          quantidade_comprada: d.quantidadecompra,
          Condicao_pagamento: d.condicaopagamento,
          Fornecedor: d.nomefornecedor,
          Total_comprado: Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.total),
          UN_VENDA: d.unvenda,
          quantidade_vendida:  Intl.NumberFormat("pt-BR", {
            style: "decimal",
            
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.quantidadevendida),
          quantidadesaldoestoque : Intl.NumberFormat("pt-BR", {
            style: "decimal",
            
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(d.quantidadesaldoestoque),
          
        };
      });

      exportToExcel(dados2.sort(), "CompraXVendaPorFornecedor");
    }
  };

  const voltar = () => {
    return (
      <>
        <Button
          style={{ margin: "5px" }}
          className="p-button p-button-rounded p-button-danger"
          icon="pi pi-backward"
          label="Voltar"
          onClick={() => {
            setProduto([])
            setActiveIndex(0)
          }}
        />

        <Button
          className="p-button p-button-rounded p-button-success"
          icon="pi pi-file-excel"
          label="Exportar em excel"
          disabled={produto.length === 0}
          onClick={() => handleExportExcelRows(produto)}
        />
      </>
    );
  };


  useEffect( () => {

    getFornecedores()
  },[])

  return (
    <>
    <Toast ref={toast} position="bottom-center" />

    <Header/>

    {loading ? (
        <>
          {" "}
          <ProgressBar mode="indeterminate" />
        </>
      ) : (
        <>
       <Toolbar start={voltar} />
        {produto.length === 0 ?  <>
      <div style={{padding: '1rem'}}>
        <div
          style={{
            display: "flex",
            padding: "1px",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          
        </div>
        <Steps
          model={items}
          activeIndex={activeIndex}
          onSelect={(e) => setActiveIndex(e.index)}
          readOnly={false}
          style={{backgroundColor: '#FFF' , padding :' 5px'}}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap:'5px',
          padding:'1rem'
        }}
      >
        {(() => {
          switch (activeIndex) {
            case 0:
              return (
                <>
                <ShoppingCart fontSize="large" style={{color : "#f2f2f2"}} />
                <h1 style={{ color: "#FFFF"}}>Informe o período de <i><u>compra</u></i> desejado</h1>
                <p  style={{ color: "#FFFF"}}>O sistema consultará o total e quantidade comprada de cada produto no período escolhido</p>
                
                  <div style={{ display: 'flex', gap: '1rem', margin: "1rem", flexWrap : 'wrap' }}>
                   
                    <Calendar
                  value={dataIncialCompra}
                  onChange={(e) => setDataInicialCompra(e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  showButtonBar
                  locale="pt-BR"
                />{" "}
                <Calendar
                  value={dataFinalCompra}
                  onChange={(e) => setDataFinalCompra(e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  showButtonBar
                  locale="pt-BR"
                />
                <Button 
                      label="Próximo passo"
                      className="p-button p-button-rounded p-button-primary"
                      onClick={() => setActiveIndex(activeIndex + 1)}
                    />
                  </div>

                 
                </>
              );

            case 1:
              return (
                <>
                <PointOfSaleSharp fontSize="large" style={{color : "#f2f2f2" , margin : '2px'}} />

                 <h1 style={{ color: "#FFFF"}}>Informe o período de <u><i>venda</i> </u> desejado</h1>
                 <p style={{ color: "#FFFF"}}>O sistema consultará o total vendido e quantidade de cada produto no período escolhido</p>
                 
                  <div style={{ display: 'flex', gap: '1rem', margin: "1rem", flexWrap : 'wrap'  }}>
                    
                    <Calendar
                  value={dataIncialVenda}
                  onChange={(e) => setDataInicialVenda(e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  showButtonBar
                  locale="pt-BR"
                />{" "}
                <Calendar
                  value={dataFinalVenda}
                  onChange={(e) => setDataFinalVenda(e.value)}
                  showIcon
                  dateFormat="dd/mm/yy"
                  showButtonBar
                  locale="pt-BR"
                />
                <Button 
                      label="Próximo passo"
                      className="p-button p-button-rounded p-button-primary"
                      onClick={() => setActiveIndex(activeIndex + 1)}
                    />
                  </div>

                 
                </>
              );

            case 2:
              return (
                <>
                 <BadgeRounded fontSize="large" style={{color : "#f2f2f2"}} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px',  flexWrap : 'wrap'  }}>
               
                  <div style={{ display : 'flex' , flexDirection:'column', color: "#FFFF", margin: "1rem" , alignItems: 'center'}}>
                    <h1>Informe o fornecedor desejado</h1>
                    <p>O sistema consultará todos os produtos que já foram comprados deste fornecedor</p>
                  </div>

                  <Dropdown 
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.value)}
                  options={fornecedorList}
                  optionLabel="nome"
                  placeholder="Selecione um fornecedor"
                  filter
                  filterBy="codigo,nome"
                  //valueTemplate={selectedCountryTemplate}
                  itemTemplate={optionTemplate}
                 // className="w-full md:w-14rem"
                />

                  
                </div>
                <div>
                  <Button
                  style={{margin: '10px'}}
                    icon="pi pi-search"
                    className="p-button p-button-rounded p-button-success"
                    loading={loading}
                    label="Analisar"
                    onClick={() => getProdutos()}
                  />
                  </div>
                 
                </>
              );

           

            default:
              return <></>;
          }
        })()}
      </div>
      </> : <>

      <div style={{padding : '2px'}}>
      <MaterialReactTable
              columns={columns}
              data={produto}
              enableColumnResizing
              enableGrouping
              enableStickyHeader
              enableStickyFooter
              enableColumnFilterModes
              enableColumnOrdering
              enablePinning
              enableSelectAll={false}
              enablePagination={true}
              // enableRowVirtualization
              initialState={{
                columnVisibility: {
                  numeronfultcompra: true,
                  codigoproduto: false,
                  fornecedor : false,
                 
                  
                },
                columnPinning: { left: ['Loja'] },
                density: "spacious",
                expanded: true,
                grouping: ["Produto",],
                pagination: { pageIndex: 0, pageSize: 100 },
                sorting: [{ id: "Qtde vendida", desc: false }],
              }}
              localization={MRT_Localization_PT_BR}
            />
      </div>
      
      
      </>}
      </>
      )}
    </>
  );
};

export default EstoquePorEmpresa;
