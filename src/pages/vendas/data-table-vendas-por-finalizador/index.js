import React, { useState, useEffect, useRef } from "react";

import { faCashRegister, faStore } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ImagemDestaque from "../../../assets/img/vendas.json";
import { Player } from "@lottiefiles/react-lottie-player";

import Footer from "../../../components/footer";

import api from "../../../services/axios";

import { addLocale } from "primereact/api";

import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { DataTable } from "primereact/datatable";

import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";

import { Skeleton } from "primereact/skeleton";

import { useReactToPrint } from "react-to-print";

import AppChart from "./chart";
import EmptyState from "./EmptyState";
import "primeflex/primeflex.css";
function VendasDataTableComponent() {

  const tabelaRef = useRef()

  const [loja, setLoja] = useState(0);
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
  const [topPdvNfce, setTopPdvNfce] = useState(null);
  const [topPdvEcf, setTopPdvEcf] = useState(null);

  const toast = useRef(null);

  const dt = useRef(null);

  function clearFields() {
    setVendas(null);
    setLoja(0);

    setPdv({ pdv: "0" });

    setTotalGeralNfce(0);
    setTotalGeralECF(0);
    setTotalGeral(0);
  }

  const handlePrint = useReactToPrint({
   

    content: () => tabelaRef.current,
  });

  const getVendasTotal = () => {
    setLoading(true);
    setVendas(null);
    setTotalGeralNfce(0);
    setTotalGeralECF(0);
    setTotalGeral(0);

    if (!dataInicial || !dataFinal) {
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

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    await api
      .get(`/api_vga/vendas/pdvs/${codigo}/${dateI}/${dateF}`)
      .then((response) => {
        setPdvSelectItems(response.data);
        
      })
      .catch((err) => {
        setLoading(false);
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
        setLoading(false);
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

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    await api
      .get(`/api_vga/vendas/total/${codigo}/${dateI}/${dateF}/${pdv.pdv}`)
      .then((response) => {
        setVendas(response.data);
        setLoading(false);
        console.log(response.data);
      })
      .catch((err) => {
        setLoading(false);
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

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    await api
      .get(`/api_vga/vendas/nfce/${codigo}/${dateI}/${dateF}/${pdv.pdv}`)
      .then((response) => {
        setVendasNfce(response.data);
      })
      .catch((err) => {
        setLoading(false);
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

    let codigo = loja?.codigo;

    if (!loja) {
      codigo = 0;
    }

    await api
      .get(`/api_vga/vendas/ecf/${codigo}/${dateI}/${dateF}/${pdv.pdv}`)
      .then((r) => {
        setVendasECF(r.data);
      })
      .catch((err) => {
        setLoading(false);
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
                    <strong> {data.nomefinalizador.toUpperCase()} </strong>
                  </div>
                </div>
                <div
                  className="flex align-items-center justify-content-center  border-round"
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
                    NFC-e
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
                  <span className="block text-500 font-medium mb-3">ECF</span>
                  <div className="text-900 font-medium text-xl">
                    {totalecfF}
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
          <div className="col-12 md:col-6 lg:col-3">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-800 font-medium mb-3">
                    <h2>
                      {" "}
                      <strong>
                        {" "}
                        TOTAL {data.nomefinalizador.toUpperCase()}{" "}
                      </strong>{" "}
                    </h2>
                  </span>
                  <div className="text-900 font-medium text-xl">{totalF}</div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-wallet text-green-500 text-xl"></i>
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

  const itemTemplateStore = (option) => {
    return (
      <div className="flex align-items-center">
        <FontAwesomeIcon style={{ margin: "1rem" }} icon={faStore} />

        <div>
          {" "}
          {option.codigo} - {option.nome.substring(0, 15)}
        </div>
      </div>
    );
  };

  const selectedStore = (option) => {
    return (
      <div className="flex align-items-center">
        <FontAwesomeIcon style={{ margin: "1rem" }} icon={faStore} />

        <div>
          {" "}
          {option?.codigo} - {option?.nome.substring(0, 15)}
        </div>
      </div>
    );
  };

  const selectedTemplatePDV = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <FontAwesomeIcon style={{ margin: "1rem" }} icon={faCashRegister} />
          PDV
          <div>{option.pdv}</div>
        </div>
      );
    }
  };

  const itemTemplateCashier = (option) => {
    return (
      <div className="flex align-items-center">
        <FontAwesomeIcon style={{ margin: "1rem" }} icon={faCashRegister} />
        PDV
        <div>{option.pdv}</div>
      </div>
    );
  };
 
  // ----------------------------------------------------------------------------
  // Calcula totais globais somente após todos os carregamentos terminarem
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!loading && vendas && vendasNfce && vendasECF) {
      const soma = (arr) => arr?.reduce((acc, cur) => acc + (cur.total || 0), 0);

      const totalVendas = soma(vendas);
      const totalNfce = soma(vendasNfce);
      const totalEcf = soma(vendasECF);

      setTotalGeral(
        Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
          totalVendas
        )
      );

      setTotalGeralNfce(
        Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
          totalNfce
        )
      );

      setTotalGeralECF(
        Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
          totalEcf
        )
      );
    }
  }, [loading, vendas, vendasNfce, vendasECF]);

  // Efeito para calcular o PDV com mais vendas
  useEffect(() => {
    const findTopPdv = (salesData) => {
      if (!salesData || salesData.length === 0) {
        return null;
      }

      const salesByPdv = salesData.reduce((acc, sale) => {
        acc[sale.pdv] = (acc[sale.pdv] || 0) + sale.total;
        return acc;
      }, {});

      if (Object.keys(salesByPdv).length === 0) {
          return null;
      }

      const topPdv = Object.entries(salesByPdv).reduce((top, current) => {
        return current[1] > top[1] ? current : top;
      });

      return { pdv: topPdv[0], total: topPdv[1] };
    };

    setTopPdvNfce(findTopPdv(vendasNfce));
    setTopPdvEcf(findTopPdv(vendasECF));

  }, [vendasNfce, vendasECF]);


  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <Footer />
    <div ref={tabelaRef} className="page-container">
      <div className="container-venda page-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1em",
            padding: "1rem"
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
            <Player src={ImagemDestaque} loop autoplay style={{ width: "120px" }} />
            <div>
              <h2 style={{margin: 0, color: '#1f2937'}}>Vendas por Finalizador</h2>
              <p style={{margin: 0, color: '#6b7280'}}>Análise detalhada de vendas por tipo de documento e finalizador.</p>
            </div>
          </div>
          <Button
            style={{ margin: "0px 5px" }}
            label="Imprimir"
            className="p-button p-button-rounded p-button-warning"
            onClick={() => handlePrint()}
            icon="pi pi-print"
          />
        </div>

        <div className="grid p-fluid align-items-end" style={{padding: '1rem 0'}}>
          <div className="field col-12 md:col-6 lg:col-3">
              <label htmlFor="dateI" style={{fontWeight: 'bold', marginBottom: '0.5rem', display: 'block'}}>Período inicial</label>
              <Calendar
                locale="pt-BR"
                selectOtherMonths
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

          <div className="field col-12 md:col-6 lg:col-3">
              <label htmlFor="dateF" style={{fontWeight: 'bold', marginBottom: '0.5rem', display: 'block'}}>Período final</label>
              <Calendar
                showIcon
                selectOtherMonths
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

          <div className="field col-12 md:col-6 lg:col-2">
              <label style={{fontWeight: 'bold', marginBottom: '0.5rem', display: 'block'}}>Loja</label>
              <Dropdown
                itemTemplate={itemTemplateStore}
                value={loja}
                valueTemplate={selectedStore}
                options={filiais}
                optionLabel="nome"
                onChange={(e) => setLoja(e.target.value)}
                placeholder="Selecione uma loja "
              />
          </div>
          <div className="field col-12 md:col-6 lg:col-2">
            <label style={{fontWeight: 'bold', marginBottom: '0.5rem', display: 'block'}}>PDV</label>
            <Dropdown
              itemTemplate={itemTemplateCashier}
              valueTemplate={selectedTemplatePDV}
              value={pdv}
              options={pdvSelectItems}
              optionLabel="pdv"
              onChange={(e) => setPdv(e.target.value)}
              placeholder="Selecione um PDV"
            />
          </div>

          <div className="field col-12 md:col-12 lg:col-2">
            <div className="buttons" style={{display: 'flex', gap: '0.5rem'}}>
                <Button
                  icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
                  onClick={() => getVendasTotal()}
                  className="action-button p-button-success"
                  style={{ flex: 1 }}
                  aria-label="Search"
                  label={loading ? "Pesquisando..." : "Pesquisar"}
                  disabled={loading}
                />
                <Button
                  onClick={clearFields}
                  icon="pi pi-times"
                  style={{ flex: 1 }}
                  className="action-button p-button-danger"
                  aria-label="Cancel"
                  label="Limpar"
                />
            </div>
          </div>
        </div>
      </div>

      <div className="page-card" style={{marginTop: '1rem', padding: '1rem'}}>
        <AppChart
          vendas={vendas}
          vendasNfce={vendasNfce}
          vendasECF={vendasECF}
        />
      </div>

      <div className="page-card" style={{marginTop: '1rem'}}>
        <div className="grid">
          <div className="col-12 md:col-6 lg:col-4">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total Geral NFC-e
                  </span>
                  <div className="text-900 font-medium text-xl">
                    <h1> {totalGeralNfce} </h1>
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

          <div className="col-12 md:col-6 lg:col-4">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total Geral ECF
                  </span>
                  <div className="text-900 font-medium text-xl">
                    <h1> {totalGeralECF} </h1>
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

          <div className="col-12 md:col-6 lg:col-4">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">
                    Total Geral
                  </span>
                  <div className="text-900 font-medium text-xl">
                    <h1> {totalGeral} </h1>
                  </div>
                </div>

                <div
                  className="flex align-items-center justify-content-center bg-green-100 border-round"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                >
                  <i className="pi pi-wallet text-green-500 text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-card" style={{marginTop: '1rem'}}>
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">PDV Destaque (NFC-e)</span>
                  <div className="text-900 font-medium text-xl">PDV {topPdvNfce?.pdv || '-'}</div>
                </div>
                <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-star-fill text-purple-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {topPdvNfce ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topPdvNfce.total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
              <div className="flex justify-content-between mb-3">
                <div>
                  <span className="block text-500 font-medium mb-3">PDV Destaque (ECF)</span>
                  <div className="text-900 font-medium text-xl">PDV {topPdvEcf?.pdv || '-'}</div>
                </div>
                <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <i className="pi pi-star-fill text-purple-500 text-xl"></i>
                </div>
              </div>
              <span className="text-green-500 font-medium">
                {topPdvEcf ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topPdvEcf.total) : 'R$ 0,00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '1rem'}}>
        <DataTable
          emptyMessage={<EmptyState />}
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
