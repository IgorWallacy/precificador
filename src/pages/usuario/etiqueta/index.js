import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import { useEffect, useState, useRef } from "react";
import api from "../../../services/axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import JsBarcode from "jsbarcode/bin/JsBarcode";
import moment from "moment";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const EtiquetaUsuario = () => {
  const toast = useRef(null);
  const [usuarios, setUsuarios] = useState();
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [senha, setSenha] = useState(null);
  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    codigo: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const getUsuarios = () => {
    return api
      .get("/api/usuarios/sistema/todos")
      .then((r) => {
        setUsuarios(r.data);
        console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const gerar = () => {
    if (senha === null || senha === "" || usuarioSelecionado === null) {
      toast.current.show({
        severity: "info",
        summary: "Aviso",
        detail: "Informe o usuário e a senha para gerar a etiqueta.",
      });

      return;
    } else {
      var dd = {
        pageSize: { width: 1010, height: 310 },
        pageOrientation: "landscape",

        styles: {
          data: {
            fontSize: 30,
            bold: true,
          },
          eanTexto: {
            fontSize: 15,
            bold: true,
            alignment: "center",
          },
          ean: {
            fontSize: 25,
            alignment: "left",
            bold: true,
          },
          descricao: {
            alignment: "left",
            bold: true,
            fontSize: 40,
          },
          preco: {
            alignment: "left",
            bold: true,
            fontSize: 75,
          },
        },

        content: [
          {
            layout: "noBorders",
            lineHeight: 1,

            table: {
              headerRows: 0,
              widths: [500, 600, "*"],

              body: [
                [
                  {
                    text: usuarioSelecionado?.supervisor
                      ? "Supervisor(a), leia o código a seguir com o leitor de código de barras" +
                        "\n" +
                        "Gerado em: " +
                        moment().format("DD/MM/YYYY")
                      : "Operador(a), leia o código a seguir com o leitor de código de barras" +
                        "\n" +
                        "\n" +
                        "Gerado em: " +
                        moment().format("DD/MM/YYYY"),
                    margin: [10, 150],
                    style: "eanTexto",
                  },
                  {
                    image: textToBase64Barcode(
                      usuarioSelecionado?.codigo + "." + senha
                    ),
                    margin: [0, 100],
                    style: "ean",
                  },

                  {
                    text: usuarioSelecionado.nome + "\n",
                    margin: [-950, 0],
                    style: "descricao",
                  },
                ],
              ],
            },
          },
        ],
      };

      pdfMake.createPdf(dd).open();
    }
  };

  const textToBase64Barcode = (text) => {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, text, {
      format: "CODE39",
      displayValue: false,
      //  with: 2,
      // height: 50,
      // fontSize: 15,
    });
    return canvas.toDataURL("image/png");
  };

  const renderHeader2 = () => {
    return (
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue2}
            onChange={onGlobalFilterChange2}
            placeholder="Pesquisar..."
          />
        </span>
      </div>
    );
  };

  const onGlobalFilterChange2 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters2(_filters2);
    setGlobalFilterValue2(value);
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  return (
    <>
      <Header />
      <Footer />
      <Toast ref={toast} position="bottom-center" />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "100px",
          flexDirection: "column",
          padding: "5px",
        }}
      >
        <div style={{ textAlign: "center", color: "#f2f2f2" }}>
          <h1>Gerar etiqueta de senha</h1>
        </div>

        <div
          style={{
            width: "100%",
          }}
          className="card"
        >
          <DataTable
            globalFilterFields={["codigo", "nome"]}
            filters={filters2}
            header={renderHeader2()}
            value={usuarios}
            selectionMode="single"
            selection={usuarioSelecionado}
            onSelectionChange={(e) => setUsuarioSelecionado(e.value)}
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
            rows={5}
            emptyMessage="Nenhum usuário encontrado"
            responsiveLayout="scroll"
          >
            <Column field="codigo" header="Código"></Column>
            <Column field="nome" header="Nome"></Column>
          </DataTable>
        </div>

        <div
          style={{
            color: "#000",
          }}
          className="field"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backgroundColor: "#f4f1f3",
              width: "100%",
            }}
          >
            <label>
              <strong>Usuário selecionado:</strong> {usuarioSelecionado?.codigo}{" "}
              - {usuarioSelecionado?.nome}
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <label htmlFor="senha" className="block">
                Senha
              </label>
              <InputText
                id="senha"
                aria-describedby="senha-help"
                className="block"
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    gerar();
                  
                  }
                }}
              />
              <small id="senha-help" className="block">
                Informe a senha atual do usuário para gerar a etiqueta.
              </small>
            </div>
            <Button
              icon="pi pi-print"
              label="Gerar etiqueta"
              className="p-button p-button-rounded"
              onClick={() => gerar()}
              
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EtiquetaUsuario;
