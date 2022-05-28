import React, { useState, useEffect, useRef } from "react";

import './index.css'

import Header from '../../../components/header'

import api from '../../../services/axios'

import { addLocale } from "primereact/api";


import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { DataTable } from "primereact/datatable";

import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";

import { Skeleton } from "primereact/skeleton";


function VendasDataTableComponent() {
  const [loja, setLoja] = useState({ codigo: "1" });
  const [filiais, setFiliais] = useState();
  const [pdv, setPdv] = useState({ pdv: "0" });
  const [vendas, setVendas] = useState();
  const [vendasECF, setVendasECF] = useState();
  const [vendasNfce, setVendasNfce] = useState();
  // const [expandedRows, setExpandedRows] = useState([]);
  const [dataInicial, setDataInicial] = useState(new Date());
  const [dataFinal, setDataFinal] = useState(new Date());
  const [pdvSelectItems, setPdvSelectItems] = useState();
  const [loading, setLoading] = useState(true);
  const [totalGeral, setTotalGeral] = useState(0);
  const [totalGeralNfce, setTotalGeralNfce] = useState(0);
  const [totalGeralECF, setTotalGeralECF] = useState(0);




  const toast = useRef(null);

  const dt = useRef(null);

  function clearFields() {
    setVendas(null);

    setPdv({ pdv: "0" });

    setTotalGeralNfce(0);
    setTotalGeralECF(0);
    setTotalGeral(0);
  }



  const getVendasTotal = () => {
    setLoading(true);

    clearFields();

    if (!loja || !dataInicial || !dataFinal) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Preencha os campos de data e loja",
        life: 3000,
      });
      setLoading(false);
    } else {
      getPdvs(loja, dataInicial, dataFinal);
      getVendas(dataInicial, dataFinal, loja, pdv);
      getVendasNfce(dataInicial, dataFinal, loja, pdv);
      getVendasEcf(dataInicial, dataFinal, loja, pdv);
    }
  };

  async function getPdvs(loja, dataInicial, dataFinal) {
    let dateI = new Date(dataInicial).toISOString().split("T")[0];
    let dateF = new Date(dataFinal).toISOString().split("T")[0];

    await api
      .get(`/api_vga/vendas/pdvs/${loja.codigo}/${dateI}/${dateF}`)
      .then((response) => {
        setPdvSelectItems(response.data);
      })
      .catch((err) => {
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  async function getFiliais() {
    await api
      .get(`/api_vga/vendas/filiais`)
      .then((response) => {
        setFiliais(response.data);
      })
      .catch((err) => {
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  async function getVendas(dataInicial, dataFinal, loja, pdv) {
    let dateI = new Date(dataInicial).toISOString().split("T")[0];
    let dateF = new Date(dataFinal).toISOString().split("T")[0];

    if (!pdv) {
      setPdv({ pdv: "0" });
    }

    await api
      .get(
        `/api_vga/vendas/total/${loja.codigo}/${dateI}/${dateF}/${pdv.pdv}`
      )
      .then((response) => {
        setVendas(response.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  async function getVendasNfce(dataInicial, dataFinal, loja, pdv) {
    let dateI = new Date(dataInicial).toISOString().split("T")[0];
    let dateF = new Date(dataFinal).toISOString().split("T")[0];

    if (!pdv) {
      setPdv({ pdv: "0" });
    }

    await api
      .get(
        `/api_vga/vendas/nfce/${loja.codigo}/${dateI}/${dateF}/${pdv.pdv}`
      )
      .then((response) => {
        setVendasNfce(response.data);
      })
      .catch((err) => {
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  async function getVendasEcf(dataInicial, dataFinal, loja, pdv) {
    let dateI = new Date(dataInicial).toISOString().split("T")[0];
    let dateF = new Date(dataFinal).toISOString().split("T")[0];

    if (!pdv) {
      setPdv({ pdv: "0" });
    }

    await api
      .get(
        `/api_vga/vendas/ecf/${loja.codigo}/${dateI}/${dateF}/${pdv.pdv}`
      )
      .then((r) => {
        setVendasECF(r.data);
      })
      .catch((err) => {
        toast.current.show({
          severity: "error",
          summary: "Error Message",
          detail: `${err}`,
          life: 3000,
        });
      });
  }

  const headerTemplate = (data) => {
    let total = 0;
    let totalnfce = 0;
    let totalecf = 0;
    let totalF = 0;
    let totalnfceF = 0;
    let totalecfF = 0;
    let totalGeralF = 0;
    let totalGeral = 0;
    let totalGeralNfce = 0;
    let totalGeralNfceF = 0;
    let totalGeralECF = 0;
    let totalGeralECFF = 0;

    if (vendas) {
      for (let v of vendas) {
        if (v.nomefinalizador === data.nomefinalizador) {
          total += v.total;
        }

        totalGeral += v.total;

        totalF = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(total);

        totalGeralF = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalGeral);
        setTotalGeral(totalGeralF);
      }
    }

    if (vendasNfce) {
      for (let v of vendasNfce) {
        if (v.nomefinalizador === data.nomefinalizador) {
          totalnfce += v.total;
        }

        totalGeralNfce += v.total;

        totalnfceF = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalnfce);

        totalGeralNfceF = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalGeralNfce);
        setTotalGeralNfce(totalGeralNfceF);
       
      }
    }

    if (vendasECF) {
      for (let v of vendasECF) {
        if (v.nomefinalizador === data.nomefinalizador) {
          totalecf += v.total;
        }
        totalGeralECF += v.total;

        totalecfF = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalecf);

        totalGeralECFF = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalGeralECF);

        setTotalGeralECF(totalGeralECFF);
      
      }
    }

    return (
      <React.Fragment>
        <div className="grid ">
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Forma de Pagamento
                  </span>
                  <div className="text-900 font-medium text-xl">
                    {data.nomefinalizador} 
                  </div>
                </div>
                <div
                  className="flex align-items-center justify-content-center bg-blue-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-shopping-cart text-blue-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total Nfc-e
                  </span>
                  <div className="text-900 font-medium text-xl">
                    {totalnfceF}
                  </div>
                </div>
                <div
                  className="flex align-items-center justify-content-center bg-blue-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-cloud-upload text-blue-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total ECF
                  </span>
                  <div className="text-900 font-medium text-xl">
                    {totalecfF}
                  </div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-money-bill text-green-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-800 font-medium mb-3">
                   <h2> Total - {data.nomefinalizador}  </h2>
                  </span>
                  <div className="text-900 font-medium text-xl">{totalF}</div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-dollar text-green-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };



  useEffect(() => {
  
    setLoading(false);
    

    setPdv({ pdv: "0" });

    getPdvs(loja, dataInicial, dataFinal);
    getVendas(dataInicial, dataFinal, loja, pdv);
    getVendasNfce(dataInicial, dataFinal, loja, pdv);
    getVendasEcf(dataInicial, dataFinal, loja, pdv);

    setVendas(null);
    setVendasECF(null);
    getFiliais();
    
   
   
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


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
    today: " Agora ",
    clear: " Limpar ",
  });

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <Header/>
     
      <div className="container">
      <div className=" cards-info">
        <div className="field">
          <Calendar
          locale="pt-BR"
           showIcon
           showButtonBar
            id="dateI"
            dateFormat="dd/mm/yy"
            className="input-calendar"
            placeholder="Informe o período inicial "
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
          ></Calendar>
        </div>

        <div className="field">
          <Calendar
          showIcon
          locale="pt-BR"
          showButtonBar
            id="dateF"
            dateFormat="dd/mm/yy"
            className="input-calendar"
            value={dataFinal}
            placeholder="Informe o período final "
            onChange={(e) => setDataFinal(e.target.value)}
          ></Calendar>
        </div>

        <div className="field">
          <Dropdown
           showClear
         
            style={{ marginRight: "5px" }}
            value={loja}
            options={filiais}
            optionLabel="nome"
            onChange={(e) => setLoja(e.target.value)}
            placeholder="Selecione uma loja "
          />
        </div>
        <div className="field">
          <Dropdown
          showClear
            value={pdv}
            options={pdvSelectItems}
            optionLabel="pdv"
            onChange={(e) => setPdv(e.target.value)}
            placeholder="Selecione um PDV"
          />
        </div>
     
      <div className="buttons">
        <Button
          icon="pi pi-search"
          onClick={() => getVendasTotal()}
          className="p-button-rounded p-button-success"
          style={{ marginLeft: "25px" }}
          aria-label="Search"
          label="Pesquisar"
        />

        <Button
          onClick={clearFields}
          icon="pi pi-times"
          style={{ marginLeft: "15px" }}
          className="p-button-rounded p-button-danger"
          aria-label="Cancel"
          label="Limpar"
        />
      </div>
</div>
      </div>

     
      <div >
       
          <div className=" cards-info">
            <div className="col-12 md:col-6 lg:col-3 justify-content-end">
              <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">
                      Total Geral NFCE-e
                    </span>
                    <div className="text-900 font-medium text-xl">
                  <h1>    {totalGeralNfce ? totalGeralNfce : <Skeleton  />} </h1>
                    </div>
                  </div>

                  <div
                    className="flex align-items-center justify-content-center bg-blue-100 border-round"
                    style={{ width: "2.5rem", height: "2.5rem" }}
                  >
                    <i className="pi pi-cloud text-blue-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3 justify-content-end">
              <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">
                      Total Geral ECF
                    </span>
                    <div className="text-900 font-medium text-xl">
                   <h1> {totalGeralECF ? totalGeralECF : <Skeleton  />} </h1>
                    </div>
                  </div>

                  <div
                    className="flex align-items-center justify-content-center bg-green-100 border-round"
                    style={{ width: "2.5rem", height: "2.5rem" }}
                  >
                    <i className="pi pi-dollar text-green-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-3 justify-content-end">
              <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
                <div className="flex justify-content-between mb-3">
                  <div>
                    <span className="block text-500 font-medium mb-3">
                      Total Geral
                    </span>
                    <div className="text-900 font-medium text-xl">
                   <h1>   {totalGeral  ? totalGeral : <Skeleton  />} </h1>
                    </div>
                  </div>

                  <div
                    className="flex align-items-center justify-content-center bg-green-100 border-round"
                    style={{ width: "2.5rem", height: "2.5rem" }}
                  >
                    <i className="pi pi-dollar text-green-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

        

       
          <div className="card">

        
          <DataTable 
            emptyMessage={<Skeleton   />}
            ref={dt}
            dataKey="id"
            value={vendas}
            responsiveLayout="scroll"
            rowGroupMode="subheader"
            groupRowsBy="finalizador"
            //  expandableRowGroups
            //     expandedRows={expandedRows}
            //    onRowToggle={(e) => setExpandedRows(e.data)}
            sortMode="single"
            sortField="finalizador"
            sortOrder={1}
            rowGroupHeaderTemplate={headerTemplate}
            loading={loading}
          ></DataTable>
         </div>
        
      </div>
    </>
  );
}

export default VendasDataTableComponent;
