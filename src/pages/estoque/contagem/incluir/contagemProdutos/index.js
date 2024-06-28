import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../../../components/header";
import Footer from "../../../../../components/footer";

import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { FilterMatchMode } from "primereact/api";

import "./styles.css";
import api from "../../../../../services/axios";
import moment from "moment";

const IncluirContagemProdutosInventario = () => {
  let eanUrl = "http://www.eanpictures.com.br:9000/api/gtin";
  const location = useLocation();
  const { inventario } = location.state;

  const toast = useRef(null);
  const produtoEan = useRef(null);
  const produtoQuantidade = useRef(null);
  const inputRef = useRef(null);
  const inputRef2 = useRef(null);
  const inventarioStatus = useRef(null);

  const [pesquisaProdutoOpen, setPesquisaProdutoOpen] = useState(false);

  const [produto, setProduto] = useState(null);
  const [produtos, setProdutos] = useState([]);

  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [produtoList, setProdutoList] = useState([]);
  const [loadingInventario, setloadingInventario] = useState(false);
  const [loadingTodosProdutos, setLoadingTodosProdutos] = useState(false);

  const [filters2, setFilters2] = useState({
    nome: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const getCodigoProduto = (event) => {
    if (event.key === "Enter") {
      if (produtoEan.current) {
        getProduto(produtoEan.current);
      }
    }
  };

  const getProduto = (ean) => {
    return api
      .get(`/api/produto/ean/${ean}`)
      .then((r) => {
        r?.data?.length === 0
          ? toast.current.show({
              severity: "warn",
              summary: "Aviso",
              detail: `Nenhum produto encontrado para o código ${
                ean ? ean : r.data?.ean
              }`,
              life: 3000,
            })
          : setProduto(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const salvar = () => {
    getInventarios();

    if (!inventarioStatus.current) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Solicite a abertura do inventário de código ${inventario?.id} - ${inventario?.nome} para iniciar a contagem `,
      });
    } else {
      if (!produtoQuantidade.current || !produto) {
        toast.current.show({
          severity: "warn",
          summary: "Aviso",
          detail: `Informe a quantidade e/ou produto `,
        });
      } else {
        setLoadingSalvar(true);
        let q = parseFloat(produtoQuantidade.current);
        return api
          .post("/api/produto/contagem/salvar", {
            idproduto: produto?.id,
            idinventario: inventario?.id,
            produto: produto?.nome,
            idfilial: inventario?.idfilial,
            quantidadeLida: q,
            nomeUsuario: nomeUsuario,
            recontar: false,
          })
          .then((r) => {
            setProduto(null);
            produtoQuantidade.current = null;

            setLoadingSalvar(false);
            produtoEan.current = null;
            getListProduto();
          })
          .catch((e) => {
            alert(e?.message);
          })
          .finally((f) => {
            getInventarios();
          });
      }
    }
  };

  const getInventarios = () => {
    setloadingInventario(true);
    return api
      .get(
        `/api/produto/contagem/inventarios/${parseInt(
          JSON.stringify(inventario?.id)
        )}`
      )
      .then((r) => {
        inventarioStatus.current = r.data?.status;
        // console.log(r.data)
      })
      .catch((e) => {
        alert("Erro", "Erro ao buscar dados dos inventário ");
      })
      .finally((f) => {
        setloadingInventario(false);
      });
  };

  const getListProduto = () => {
    setLoading2(true);
    return api
      .get(
        `/api/produto/contagem/porInventario/mobile/${parseInt(
          JSON.stringify(inventario?.id)
        )}/1000`
      )
      .then((r) => {
        setProdutoList(r.data);
        // console.log(r.data)
      })
      .catch((e) => {
        alert(e?.message);
      })
      .finally((f) => {
        setLoading2(false);
      });
  };

  const deletar = (item) => {
    return api
      .delete(`/api/produto/contagem/inventario/item/${item?.id}`)
      .then((r) => {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: `Produto ${item?.produto + " "} excluído`,
        });
        getListProduto();
      })
      .catch((e) => {
        toast.current.show({
          severity: "erro",
          summary: "Erro",
          detail: `Erro ao excluir , ${e?.message}`,
        });
      });
  };

  const getTodosProdutos = () => {
    setLoadingTodosProdutos(true);
    return api
      .get("/api/produto")
      .then((r) => {
        setProdutos(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoadingTodosProdutos(false);
      });
  };

  useEffect(() => {
    let token = localStorage.getItem("access_token");
    let a = JSON.parse(token);

    setNomeUsuario(a.nome);

    getListProduto();
    getInventarios();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }

      if (inputRef2.current) {
        inputRef2.current.focus();
      }
    };

    document.addEventListener("click", handleFocus);

    // Limpar o evento quando o componente for desmontado
    return () => {
      document.removeEventListener("click", handleFocus);
    };
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
          flexDirection: "column",
          marginTop:'50px'
        }}
      >
        {produto ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#000",
                gap: "5px",
                backgroundColor: "#f2f2f2",
                width: "98%",
                //  margin: "10px",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
              }}
            >
              <h4> Código : {produto?.codigo} </h4>
              <h1>{produto?.nome}</h1>
              <h3>{produto?.idUnidadeMedida?.nome}</h3>
              <h2>{produto?.ean}</h2>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f2f2f2",
                width: "98%",
              }}
            >
              <div>
                <img
                  style={{
                    width: "240px",
                    height: "240px",
                    margin: "5px",
                    borderRadius: "25px",
                    padding: "5px",
                  }}
                  src={`${eanUrl}/${produto.ean}`}
                  onError={(e) =>
                    (e.target.src =
                      "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
                  }
                  alt={produto.ean}
                />
              </div>
              <div
                style={{ width: "40%", backgroundColor: "#f1f1f1" }}
                className="field col-12"
              >
                <label htmlFor="produtoQuantidade">
                  Informe a quantidade do produto
                </label>
                {produto?.idUnidadeMedida?.codigo}

                <InputNumber
                  disabled={loadingSalvar}
                  inputRef={inputRef}
                  style={{ width: "40% ", margin: "5px" }}
                  id="produtoQuantidade"
                  value={produtoQuantidade.current}
                  placeholder="Quantidade"
                  mode="decimal"
                  minFractionDigits={2}
                  maxFractionDigits={3}
                  inputClassName="custom-placeholder"
                  useGrouping={true}
                  autoFocus
                  inputStyle={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f4f4f4",
                    color: "#000",
                  }}
                  onValueChange={(e) => (produtoQuantidade.current = e?.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setProduto(null);
                      produtoQuantidade.current = null;
                      produtoEan.current = null;
                    }
                    if (event.key === "Enter") {
                      salvar();
                    }
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                backgroundColor: "#f2f2f2",
                width: "98%",
                padding: "1em",
                position: "fixed",
                bottom: "3%",
              }}
            >
              <Button
                label="(ESC) Cancelar"
                onClick={() => {
                  setProduto(null);
                  produtoQuantidade.current = null;
                  produtoEan.current = null;
                }}
                className="p-button p-button-rounded p-button-danger"
                icon="pi pi-times"
              />
              <Button
                loading={loadingSalvar}
                label="(ENTER) Gravar"
                className="p-button p-button-rounded p-button-success"
                icon="pi pi-save"
                onClick={() => salvar()}
              />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#000",
                gap: "5px",
                backgroundColor: "#f2f2f2",
                width: "98%",
                //  margin: "10px",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
              }}
            >
              <h1>
                Inventário Nº #{inventario?.id} - {inventario?.nome}
              </h1>
              <h2>
                Loja {inventario?.idfilial} - {inventario?.loja}
              </h2>
              <h3
                style={{
                  color: inventarioStatus?.current ? "green" : "red",
                  margin: "5px",
                }}
              >
                <i
                  className={
                    inventarioStatus?.current ? "pi pi-lock-open" : "pi pi-lock"
                  }
                  style={{ fontSize: "1em", margin: "5px" }}
                ></i>
                Inventário {inventarioStatus?.current ? "aberto " + moment(inventario?.inicio).format("DD/MM/YYYY HH:mm",) : "fechado"}
              </h3>
            </div>

            {pesquisaProdutoOpen ? (
              <>
              <div style={{width : '98%'}}>

              
                <DataTable
                  size="large"
                 
                  loading={loadingTodosProdutos}
                  value={produtos}
                  responsiveLayout="scroll"
                  stripedRows
                  filterDisplay="row"
                  dataKey="id"
                  emptyMessage="Sem produtos para exibir no momento"
                  scrollable
                  scrollHeight="75vh"
                  virtualScrollerOptions={{ itemSize: 86 }}
                >
                  <Column field="codigo" header="Código"></Column>
                  <Column field="ean" header="Cód.Barras"></Column>
                  <Column
                    field="nome"
                    autoFocus
                    filter
                    filterPlaceholder="Pesquisar pelo nome"
                    header="Nome"
                  ></Column>
                  <Column
                    body={(row) => {
                      return (
                        <Button
                          label="Selecionar"
                        
                          icon="pi pi-arrow-right"
                          className="pi-button p-button-rounded p-button-secondary"
                          onClick={() => {
                            setProduto(row);
                            setPesquisaProdutoOpen(false);
                          }}
                        />
                      );
                    }}
                    header="Selecionar"
                  ></Column>
                </DataTable>
                </div>
              </>
            ) : (
              <>
                {" "}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                    width: "98%",
                    backgroundColor: "#f1f1f1",
                    padding: "5px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "5px",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <label htmlFor="produtoCodigo">
                        <h3>Informe o código do produto</h3>
                      </label>
                      <InputNumber
                        inputRef={inputRef2}
                        style={{ width: "98%" }}
                        id="produtoCodigo"
                        value={produtoEan.current}
                        placeholder="Pressione ENTER para adicionar"
                        inputClassName="input-retro"
                        useGrouping={false}
                        autoFocus
                        inputStyle={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#f4f4f4",
                          color: "#000",
                        }}
                        onValueChange={(e) => (produtoEan.current = e?.value)}
                        onKeyDown={(e) => getCodigoProduto(e)}
                      />
                    </div>

                    <Button
                      icon="pi pi-bars"
                      onClick={() => {
                        getTodosProdutos();
                        setPesquisaProdutoOpen(true);
                      }}
                      className="p-button p-button-rounded p-button-secondary"
                    />
                  </div>
                </div>
                <div style={{ width: "98%", marginBottom: "1px" }}>
                  <DataTable
                    showGridlines
                    stripedRows
                    scrollable
                    scrollHeight="62vh"
                    value={produtoList}
                    responsiveLayout="scroll"
                    emptyMessage="Nenhum produto para ser exibido"
                  >
                    <Column field="codigo" header="Código"></Column>
                    <Column field="ean" header="Cód.Barras"></Column>
                    <Column field="produto" sortable header="Produto"></Column>
                    <Column
                      field="quantidadeLida"
                      body={(row) => {
                        return Intl.NumberFormat("pt-BR", {
                          maximumFractionDigits: 3,
                          minimumFractionDigits: 2,
                        }).format(row?.quantidadeLida);
                      }}
                      header="Quantidade"
                    ></Column>
                    <Column field="unidadeMedida" header="UN"></Column>
                    <Column
                      body={(row) => {
                        return (
                          <>
                            <Button
                              label="Deletar"
                              icon="pi pi-trash"
                            
                              className="p-button p-button-rounded p-button-danger"
                              onClick={() => deletar(row)}
                            />
                          </>
                        );
                      }}
                      header="Deletar"
                    ></Column>
                  </DataTable>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default IncluirContagemProdutosInventario;
