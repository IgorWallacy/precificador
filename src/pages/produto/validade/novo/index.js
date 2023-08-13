import { useState, useEffect, useRef } from "react";
import api from "../../../../services/axios";

import { AutoComplete } from "primereact/autocomplete";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { ProgressBar } from "primereact/progressbar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { addLocale } from "primereact/api";

import * as yup from "yup";
import moment from "moment/moment";

import Header from "../../../../components/header";
import Footer from "../../../../components/footer";

const CadastrarValidade = () => {
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

  const validar = async () => {
    let schema = yup.object().shape({
      loja: yup.string("Informe a loja").required("Campo loja é obrigatório"),
      produto: yup
        .string("Informe o produto")
        .required("Campo produto é obrigatório"),
      vencimento: yup
        .string("Informe a data de vencimento")
        .required("Campo vencimento é obrigatório"),
    });
    try {
      await schema.validate({
        loja: loja?.id,
        produto: produto?.id,
        vencimento: validade,
      });

      if (editando) {
        cadastrar(editando);
      } else {
        cadastrar(true);
      }
      setEditando(null);
      return true;
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: err?.errors,
        life: 3000,
      });
      setEditando(null);
      cadastrar(false);
      return false;
    }
  };

  const toast = useRef(null);

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loja, setLoja] = useState();
  const [lojas, setLojas] = useState([]);

  const [produto, setProduto] = useState();
  const [produtosList, setProdutosList] = useState([]);
  const [validade, setValidade] = useState();
  const [codigoLote, setCodigoLote] = useState();
  const [entrada , setEntrada] = useState()

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState(null);

  const cadastrar = (props) => {
   
    if (props) {
      api
        .post(`/api/lote/salvar/filial/${loja?.id}`, {
          id: props > 1 ? props : "",
          codigo: codigoLote,
          idProduto: produto,
          vencimento: validade,
          entrada: editando ? entrada : new Date(),
        })
        .then((r) => {
          toast.current.show({
            severity: "success",
            summary: "Sucesso!",
            detail: `${produto?.nome} salvo com sucesso !`,
            life: 3000,
          });

          if (validade <= new Date()) {
            toast.current.show({
              severity: "warn",
              summary: "Aviso!",
              detail: `${produto?.nome} salvo, porém está vencido ! Verifique !`,
              life: 3000,
            });
          }

          setLoja(r.data.idfilial);
          setValidade(null);
          setProduto(null);
          setCodigoLote("");
          getProdutosLote();
        })
        .catch((e) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: e?.message,
            life: 3000,
          });
        });
    }
  };

  const getProdutos = () => {
    setLoading(true);
    return api
      .get("/api/produto")
      .then((r) => {
        setItems(r.data);
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: e?.message,
          life: 3000,
        });
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const getLojas = () => {
    return api
      .get("/api/filial")
      .then((r) => {
        setLojas(r.data);
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: e?.message,
          life: 3000,
        });
      });
  };

  const getProdutosLote = () => {
    return api
      .get("/api/lote/todos")
      .then((r) => {
        setLoading(true);
        setProdutosList(r.data);
      })
      .catch((e) => {
        setLoading(false);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const search = (event) => {
    // Timeout to emulate a network connection
    setTimeout(() => {
      let _filteredItems;

      if (!event.query.trim().length) {
        _filteredItems = [...items];
      } else {
        _filteredItems = items.filter((i) => {
          return (
            i.nome.toLowerCase().startsWith(event.query.toLowerCase()) ||
            i.codigo.toLowerCase() === event.query.toLowerCase() ||
            i.ean.toLowerCase().startsWith(event.query.toLowerCase())
          );
        });
      }

      setFilteredItems(_filteredItems);
    }, 250);
  };

  const itemTemplate = (item) => {
    return (
      <div className="flex align-items-center">
        <div>
          {item.ean} - {item.nome}
        </div>
      </div>
    );
  };

  const vencimentoLayout = (data) => {
    return moment(data.vencimento).format("DD/MM/YYYY");
  };

  const deletarLayout = (data) => {
    return (
      <>
        <Button
          icon="pi pi-trash"
          className="p-button p-button-danger p-button-rounded"
          onClick={() => deletar(data)}
        />
      </>
    );
  };

  const editarLayout = (data) => {
    return (
      <>
        {" "}
        <Button
          icon="pi pi-pencil"
          className="p-button p-button-info p-button-rounded"
          onClick={() => editar(data)}
        />
      </>
    );
  };

  const editar = (data) => {
    setEditando(data?.id);
    setCodigoLote(data?.codigo);
    setLoja(data?.idfilial);
    setValidade(data?.vencimento);
    setProduto(data?.idProduto);
    setEntrada(data?.entrada)
  };

  const deletar = (data) => {
    return api
      .delete(`/api/lote/deletar/${data?.id}`)
      .then((r) => {
        toast.current.show({
          severity: "success",
          summary: "Sucesso!",
          detail: "Produto deletado!",
          life: 3000,
        });
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: e?.message,
          life: 3000,
        });
      })
      .finally((f) => {
        getProdutosLote();
      });
  };

  useEffect(() => {
    getLojas();
    getProdutos();
    getProdutosLote()
  }, []);

  return (
    <>
      <Header />
      <Footer />
      <Toast ref={toast} position="bottom-center" />

      {loading ? (
        <>
          <ProgressBar
            mode="indeterminate"
            style={{ height: "6px" }}
          ></ProgressBar>
        </>
      ) : (
        <>
          <h1
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#FFFF",
            }}
          >
            Cadastro de validade(s)
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              color: "#FFFF",
              margin: "1rem",
              padding: "5px",
              border: "1px solid #FFFF",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "1.5rem",
                alignItems: "center",
                padding: "1rem",
                margin: "1rem",
              }}
            >
              <span
                style={{ marginLeft: "1rem", color: "#ffff" }}
                className="p-float-label"
              >
                <Dropdown
                  value={loja}
                  onChange={(e) => setLoja(e.value)}
                  options={lojas}
                  optionLabel="nome"
                  placeholder="Selecione uma loja"
                  className="w-full md:w-14rem"
                />
                <label htmlFor="loja">Selecione a loja</label>
              </span>

              <span
                style={{ marginLeft: "1rem", color: "#ffff" }}
                className="p-float-label"
              >
                <AutoComplete
                  field="nome"
                  value={produto}
                  suggestions={filteredItems}
                  itemTemplate={itemTemplate}
                  completeMethod={search}
                  onChange={(e) => setProduto(e.value)}
                  dropdown
                />

                <label htmlFor="produto">Nome ou Ean</label>
              </span>

              <span
                style={{ marginLeft: "1rem", color: "#ffff" }}
                className="p-float-label"
              >
                <Calendar
                  value={validade}
                  onChange={(e) => setValidade(e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  locale="pt-BR"
                />

                <label htmlFor="validade">Data de vencimento </label>
              </span>

              <InputText
                value={codigoLote}
                onChange={(e) => setCodigoLote(e.target.value.toUpperCase())}
                placeholder="Código do lote"
              />

              <Button
                style={{ marginLeft: "25px" }}
                label={editando ? "Alterar" : "Gravar"}
                className="p-button p-button-rounded p-button-success"
                icon="pi pi-check"
                onClick={validar}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "1.5rem",
              alignItems: "center",
              padding: "1rem",
              margin: "1rem",
            }}
          >
            <DataTable
              size="large"
              responsiveLayout="stack"
              breakpoint="960px"
              header="Últimos lançamentos salvos"
              emptyMessage="Nada a ser exibido"
              value={produtosList}
              style={{ width: "100%" }}
              paginator
              rows={3}
              stripedRows
              filterDisplay="row"
            >
              <Column field="idfilial.nome" header="Loja" sortable></Column>
              <Column field="idProduto.codigo" header="Código" filter></Column>
              <Column field="idProduto.ean" header="Ean" filter></Column>
              <Column field="idProduto.nome" header="Produto" filter></Column>
              <Column field="codigo" header="Lote Nº" filter></Column>
              <Column field={vencimentoLayout} header="Vencimento"></Column>
              <Column field={deletarLayout} header="Deletar" />
              <Column field={editarLayout} header="Editar" />
            </DataTable>
          </div>
        </>
      )}
    </>
  );
};

export default CadastrarValidade;
