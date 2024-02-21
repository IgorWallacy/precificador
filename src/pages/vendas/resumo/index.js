import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card, DatePicker, Statistic, Select } from "antd";
import { Button } from "primereact/button";
import locale from "antd/es/date-picker/locale/pt_BR";

import api from "../../../services/axios";

import moment from "moment";

const ResumoVendas = () => {
  const [resumo, setResumoVendas] = useState([]);
  const [ResumoData, setResumoData] = useState([]);
  const { RangePicker } = DatePicker;
  const { Option } = Select;
  const [loja, setLoja] = useState(0);
  const [lojaList, setLojaList] = useState([]);
  const [loadingResumoVendas, setLoadingResumoVendas] = useState(false);
  const [lojaResumoSelecionada, setLojaResumoSelecionada] = useState(null);

  const geTResumoVendas = () => {
    setResumoVendas([])
    setLoadingResumoVendas(true);
    return api
      .get(
        `/api/vendas/resumo/${moment(ResumoData?.[0]?.$d).format(
          "YYYY-MM-DD"
        )}/${moment(ResumoData?.[1]?.$d).format("YYYY-MM-DD")}/${
          lojaResumoSelecionada ? lojaResumoSelecionada : 0
        }`
      )
      .then((r) => {
        //console.table(r.data)
        setResumoVendas(r.data);
        console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoadingResumoVendas(false);
      });
  };
  const getFilial = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setLojaList(r.data);
        // console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getFilial();
  }, []);

  return (
    <>
      <Header />
      <Footer />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap:'10px',
          flexWrap: "wrap",
          alignItems: "center",
          padding: "10px",
          margin: "1rem",
        }}
      >
        <h1 style={{ color: "#ffff" }}>Resumo de vendas</h1>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
         
          <RangePicker
            disabled={loadingResumoVendas}
            format={"DD/MM/YYYY"}
            locale={locale}
            showToday
            onChange={(e) => setResumoData(e)}
          />
          <Select
            disabled={loadingResumoVendas}
            placeholder="Selecione uma loja"
            allowClear
            defaultActiveFirstOption={false}
            style={{ width: 240 }}
            onChange={(e) => setLojaResumoSelecionada(e)}
          >
            {lojaList.map((option) => (
              <Option key={option.id} value={option.codigo}>
                {option.nome}
              </Option>
            ))}
          </Select>
          <Button
            style={{ margin: "5px" }}
            icon="pi pi-search"
            onClick={() => geTResumoVendas()}
            label={loadingResumoVendas ? "Gerando..." : "Gerar"}
            loading={loadingResumoVendas}
            className="p-button p-button-rounded p-button-success"
          />
          <Button
            style={{ margin: "0px 5px" }}
            label="Imprimir"
            className="p-button p-button-rounded p-button-warning"
            icon="pi pi-print"
          />

          <h4 style={{ color: "#f2f2f2" }}>
            {" "}
            Exibindo os dados de{" "}
            {moment(ResumoData?.[0]?.$d).format("DD/MM/YYYY")} até{" "}
            {moment(ResumoData?.[1]?.$d).format("DD/MM/YYYY")}{" "}
          </h4>
        </div>
        <div style={{width : '65%'}}>

       
        <DataTable
            loading={loadingResumoVendas}
          value={resumo}
          style={{ width: "100%" }}
          responsiveLayout="stack"
             breakpoint="2048px"
          emptyMessage="Nada para ser exibido"
          stripedRows
          showGridlines
        >
          <Column
            field="venda_bruta"
            bodyStyle={{ backgroundColor:'#f2f2f2'}}
            body={(row) => {
              return Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                style: "currency",
                currency: "BRL",
              }).format(row?.venda_bruta + row?.descontos );
            }}
            header="Venda bruta"
          ></Column>
          <Column
            field="venda_cancelada_cupom"
            body={(row) => {
              return Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                style: "currency",
                currency: "BRL",
              }).format(row?.venda_cancelada_cupom);
            }}
            header="Cancelamentos"
          ></Column>
          <Column
            field="valor_devolucao"
            bodyStyle={{ backgroundColor:'#f2f2f2'}}
            body={(row) => {
              return Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                style: "currency",
                currency: "BRL",
              }).format(row?.valor_devolucao);
            }}
            header="Devoluções"
          ></Column>
          <Column
            field="descontos"
            body={(row) => {
              return Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                style: "currency",
                currency: "BRL",
              }).format(row?.descontos);
            }}
            header="Descontos"
          ></Column>
          <Column
           bodyStyle={{ backgroundColor:'#f2f2f2'}}
            body={(row) => {
              return Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                style: "currency",
                currency: "BRL",
              }).format(row?.venda_bruta );
            }}
            header="Venda liquída"
          ></Column>
          <Column
            field="quantidade_cupom"
            body={(row) => {
                return Intl.NumberFormat("pt-BR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  style: "decimal"
                
                }).format(row?.quantidade_cupom);
              }}
            header="Quantidade de cupons"
          ></Column>
          <Column
            field="quantidade_cupom_cancelado"
            header="Quantidade de cupons cancelados"
            bodyStyle={{ backgroundColor:'#f2f2f2'}}
          ></Column>
          
          <Column
            field="quantidade_itens_vendidos"
            header="Quantidade de itens vendidos"
           
            body={(row) => {
                return Intl.NumberFormat("pt-BR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  style: "decimal"
                
                }).format(row?.quantidade_itens_vendidos);
              }}
          ></Column>
          <Column
           bodyStyle={{ backgroundColor:'#f2f2f2'}}
            field="quantidade_item_cancelado"
            header="Quantidade de itens cancelados"
          ></Column>
        
        </DataTable>
        </div>
      </div>
    </>
  );
};

export default ResumoVendas;
