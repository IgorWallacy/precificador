import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

import Header from "../../../components/header";
import Footer from "../../../components/footer";

import api from "../../../services/axios";
import moment from "moment";

import Logo from "../../../assets/img/undraw_server_status_re_n8ln.svg";

import "./styles.css";

const StatusPdv = () => {
  const [pdvs, setPdvs] = useState([""]);

  const ultimaCarga = (e) => {
    return moment(e.ultimacarga).format("DD/MM/YY - HH:mm:ss");
  };

  const ultimoPing = (e) => {
    return moment(e.currenttimemillis)
      .add(2, "minutes")
      .format("DD/MM/YYYY hh:mm") >=
      moment(new Date()).format("DD/MM/YYYY hh:mm") ? (
      <Tag
        severity="success"
        value={"Online " + moment(e.ultimoping).format("DD/MM/YYYY - HH:mm:ss")}
        rounded
      ></Tag>
    ) : (
      <Tag
        severity="danger"
        value={
          "Offline " + moment(e.ultimoping).format("DD/MM/YYYY - HH:mm:ss")
        }
        rounded
      ></Tag>
    );
  };

  const getStatus = () => {
    api
      .get("/api/pdv/status")
      .then((r) => {
        setPdvs(r.data);
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  useEffect(() => {
    getStatus();
    setInterval(() => {
      getStatus();
    }, 20000);
  }, []);

  return (
    <>
      <Header />
      <Footer />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop:'50px'
        }}
      >
        <img
          src={Logo}
          style={{
            width: "250px",
          }}
        />
      </div>
      <h1
        style={{
          color: "#F2F2F2",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        Total de {pdvs.length} PDV'S
      </h1>
      <div className="status">
        <DataTable
          rowGroupMode="rowspan"
          groupRowsBy="filial"
          style={{ padding: "15px", width: "100%" }}
          emptyMessage="Nenhum pdv encontrado"
          value={pdvs}
          responsiveLayout="stack"
          stripedRows
          header={` Monitorando ... `}
        >
          <Column field="filial" sortable header="Loja"></Column>
          <Column field={ultimoPing} header="Status"></Column>
          <Column field="pdv" sortable header="PDV"></Column>
          <Column field="usuario" header="Operador(a)"></Column>
          <Column field={ultimaCarga} header="Carga base"></Column>
          <Column field="ip" header="IP"></Column>
          <Column field="ipservidor" header="Servidor" />
          <Column field="versao" header="Versão"></Column>
        </DataTable>
      </div>
    </>
  );
};

export default StatusPdv;
