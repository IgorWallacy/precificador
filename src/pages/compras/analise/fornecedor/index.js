import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import ImagemDestque from "../../../../assets/img/compras-fornecedor.svg";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
//import { Tooltip } from "primereact/tooltip";
import { Rating } from "primereact/rating";
import { Sidebar } from "primereact/sidebar";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";
import { FilterMatchMode } from "primereact/api";
import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";
import { Badge } from "primereact/badge";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

import { FaGift } from "react-icons/fa";

import moment from "moment";

import api from "../../../../services/axios";

export default function AnaliseFornecedor() {
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
  const [globalFilterValue2, setGlobalFilterValue2] = useState("");
  const [globalFilterValue3, setGlobalFilterValue3] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataInicialCompra, setDataInicialCompra] = useState();
  const [dataFinalCompra, setDataFinalCompra] = useState();
  // const [dataInicialVenda, setDataInicialVenda] = useState(new Date());
  const [diasVenda, setDiasVenda] = useState(90);
  const [dataFinalVenda, setDataFinalVenda] = useState();
  const [fornecedor, setFornecedor] = useState(null);
  const [fornecedores, setFornecedores] = useState([""]);
  const [filial, setFilial] = useState(null);
  const [lojas, setLojas] = useState([""]);

  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const [visibleLeft, setVisibleLeft] = useState(false);
  const [displayDialog, setDisplayDialog] = useState(false);

  const [produto, setProduto] = useState([""]);
  const [quantidade1, setQuantidade1] = useState(null);
  const [quantidade2, setQuantidade2] = useState(null);
  const [preco, setPreco] = useState(null);

  const [condicaoPagamento, setCondicaoPagamento] = useState();
  const [condicoesPagamento, setCondicoesPagamento] = useState([]);
  const [prazoEntrega, setPrazoEntrega] = useState();

  const toast = useRef(null);
  const toast2 = useRef(null);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);

  const [produtoDeleteSelecionado, setProdutoDeleteSelecionado] = useState("");

  const [dialogDuplicatas, setDialogDuplicatas] = useState(false);
  const [duplicatas, setDuplicatas] = useState([]);

  const [tempoDiasPedido, setTempoDiasPedido] = useState(0);
  const [tempoDiasEntrega, settempoDiasEntrega] = useState(0);
  const [margemErroDiasEntrega, setMargemErroDiasEntrega] = useState(0);

  const [pedido, setPedido] = useState(false);

  const [idPedido, setIdPedido] = useState(null);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ean: { value: null, matchMode: FilterMatchMode.CONTAINS },
    produto: { value: null, matchMode: FilterMatchMode.CONTAINS },
    codigo: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numeronfultcompra: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [filters3, setFilters3] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    idfilial: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  let eanUrl = "https://cdn-cosmos.bluesoft.com.br/products";

  const getDuplicatas = () => {
    api
      .get(`/api/documentos/apagar/hoje/${filial ? filial.codigo : 0}`)
      .then((r) => {
        setDuplicatas(r.data);
        // console.log(r.data)
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error}`,
        });
      })
      .finally(() => {});
  };

  const getFornecedores = () => {
    setLoading(true);

    api
      .get(`/api/entidade/fornecedores/`)
      .then((r) => {
        setFornecedores(r.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error}`,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCondficaoPagamento = () => {
    setLoading(true);

    api
      .get("/api/condicaopagamento/todas")
      .then((r) => {
        setCondicoesPagamento(r.data);
      })
      .catch((error) => {
        toast.show({ severity: "error", summary: "Erro", detail: `${error}` });
      })
      .finally(setLoading(false));
  };

  const getLojas = () => {
    setLoading(true);
    api
      .get("/api/filial")
      .then((r) => {
        setLojas(r.data);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error}`,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const analisar = () => {
    setLoading(true);

    setDataFinalVenda(new Date());

    if (
      !dataInicialCompra ||
      !dataFinalCompra ||
      //  !dataInicialVenda ||
      //  !dataFinalVenda ||
      !diasVenda ||
      !filial
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Preencha todos os campos",
      });
      setLoading(false);
    } else {
      api
        .get(
          `/api_react/compras/produtos/${moment(dataInicialCompra).format(
            "YYYY-MM-DD"
          )}/${moment(dataFinalCompra).format("YYYY-MM-DD")}/${fornecedor.id}/${
            filial.codigo
          }/${moment(moment.now())
            .subtract(diasVenda, "days")
            .format("YYYY-MM-DD")}/${moment(dataFinalVenda).format(
            "YYYY-MM-DD"
          )}`
        )
        .then((r) => {
          setProdutos(r.data);
          // console.log(r.data);
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${error}`,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const venda_diaria_template = (rowData) => {
    let total = rowData.quantidade_vendida * rowData.preco_medio_venda;
    let venda_diaria = total / diasVenda;
    let totalF = Intl.NumberFormat("pt-BR", {
      style: "decimal",
    }).format(venda_diaria);

    return (
      <>
        <h4 style={{ color: "green" }}>Venda diária</h4> <br />{" "}
        <h4 style={{ color: "green" }}> {totalF} </h4>
      </>
    );
  };

  const sugestao_quantidade_compra = (rowData) => {
    let total = rowData.quantidade_vendida * rowData.preco_medio_venda;
    let venda_diaria = total / diasVenda;

    let qtdeAComprar =
      venda_diaria *
      (tempoDiasPedido + tempoDiasEntrega + margemErroDiasEntrega);

    let totalF = Intl.NumberFormat("pt-BR", {
      style: "decimal",
    }).format(qtdeAComprar);

    return (
      <>
        <h4 style={{ color: "red" }}>
          Quantidade média sugerida para compra (UN)
        </h4>
        <br /> <h4 style={{ color: "red" }}> {totalF} </h4>
      </>
    );
  };

  const total_comprado_template = (rowData) => {
    let total_comprado =
      rowData.ultimoprecocompra * rowData.quantidade_comprada;
    let total = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total_comprado);
    return (
      <>
        <font color="red">
          Total comprado <br />
        </font>
        <font style={{ fontSize: "1rem", color: "red", fontWeight: "800" }}>
          {total}
        </font>
      </>
    );
  };
  const preco_media_venda_template = (rowData) => {
    let preco_medio_venda = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco_medio_venda);
    return (
      <>
        <font color="green">Preço médio de venda</font> <br />
        <font color="green" style={{ fontSize: "1rem", fontWeight: "800" }}>
          {preco_medio_venda}{" "}
        </font>{" "}
      </>
    );
  };
  const valor_unitario_template = (rowData) => {
    let valor_unitario = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.ultimoprecocompra);
    return (
      <>
        {" "}
        <font color="red">
          {" "}
          Custo última compra <br />
        </font>
        <font style={{ fontSize: "1rem", color: "red", fontWeight: "800" }}>
          <h4>{valor_unitario}</h4>
        </font>{" "}
      </>
    );
  };

  const quantidade_comprada_template = (rowData) => {
    let embalagem = Intl.NumberFormat("pt-BR", {
      style: "decimal",
    }).format(rowData.embalagem);
    return (
      <>
        {" "}
        <font color="red">
          {" "}
          Comprou <br />
        </font>
        <font color="red" style={{ fontWeight: "800" }}>
          {rowData.quantidade_comprada ? rowData.quantidade_comprada : 0}{" "}
          {rowData.unidade_venda} <br />
          Embalagem <br />{" "}
          {Intl.NumberFormat("pt-BR", {
            maximumFractionDigits: 1,
            maximumSignificantDigits: 1,
          }).format(rowData.quantidade_comprada / rowData.embalagem)}{" "}
          {rowData.unidade_compra} ( {embalagem} )
        </font>
      </>
    );
  };
  const quantidade_vendida_template = (rowData) => {
    let quantidade_vendida = Intl.NumberFormat("pt-BR", {
      style: "decimal",
    }).format(rowData.quantidade_vendida);
    return (
      <>
        {" "}
        <font color="green">
          {" "}
          Vendeu <br />
        </font>
        <font color="green" style={{ fontSize: "1rem", fontWeight: "800" }}>
          {rowData.quantidade_vendida ? quantidade_vendida : 0}{" "}
          {rowData.unidade_venda}
        </font>
      </>
    );
  };

  const total_template = (rowData) => {
    let total = rowData.quantidade_vendida * rowData.preco_medio_venda;
    let totalF = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
    return (
      <>
        <font color="green">
          Total vendido <br />
        </font>
        <font color="green" style={{ fontSize: "1rem", fontWeight: "800" }}>
          {" "}
          {totalF}{" "}
        </font>
      </>
    );
  };
  const data_inclusao_template = (rowData) => {
    return (
      <>
        <div>
          <h4>Nota fiscal última compra </h4>
          Nº {rowData.numeronfultcompra}
          <br />
          Chegou dia{" "}
          {moment(rowData.data_inclusao).format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </>
    );
  };

  const giroTemplate = (rowData) => {
    let totalEstrelas =
      (rowData.quantidade_vendida /
        (rowData.quantidade_comprada
          ? rowData.quantidade_comprada
          : 0 * rowData.embalagem
          ? rowData.embalagem
          : 0)) *
      5;

    return (
      <>
        {totalEstrelas.toFixed(2)}
        <Rating value={totalEstrelas} stars={5} readOnly cancel={false} />
      </>
    );
  };

  const EanOrCodigo = (rowData) => {
    if (rowData?.idproduto?.ean) {
      return (
        <>
          <div>{rowData?.idproduto?.ean} </div>
          <div>
            <img
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${rowData?.idproduto?.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={rowData?.idproduto?.ean}
            />
          </div>
        </>
      );
    } else {
      return rowData?.idproduto?.codigo;
    }
  };

  const cfop_template = (rowData) => {
    return (
      <>
        {rowData.cfop === "5910" ||
        rowData.cfop === "2910" ||
        rowData.cfop === "1910" ? (
          <>
            <span
              className="cfop-button"
              data-pr-tooltip={rowData.cfop_descricao}
            >
              {rowData.cfop} <br />
              <FaGift />
            </span>
          </>
        ) : (
          <>
            <span
              className="cfop-button"
              data-pr-tooltip={rowData.cfop_descricao}
            >
              {rowData.cfop}
            </span>
          </>
        )}
      </>
    );
  };

  const confirmDeleteProduct = (product) => {
    setProduto(product);
    setDeleteProductDialog(true);
  };

  const openNew = (produto) => {
    setQuantidade1(null);
    setQuantidade2(null);
    setPreco(produto.ultimoprecocompra);
    setDisplayDialog(true);
    setProduto({ ...produto });
  };

  const botaoAddTemplate = (rowdata) => {
    //  setProduto({...rowdata})

    return (
      <>
        {idPedido ? (
          <>
            <Button
              disabled={idPedido ? false : true}
              style={{ margin: "5px" }}
              label={idPedido ? "" : "Crie um pedido para habilitar"}
              className="p-button-rounded p-button-sm"
              icon="pi pi-shopping-bag"
              //  onClick={() => adicionarProduto(rowdata)}
              onClick={() => openNew(rowdata)}
            />
          </>
        ) : (
          <>
            <Button
              style={{ margin: "5px" }}
              label={"Novo pedido"}
              className="p-button-rounded p-button-sm"
              icon="pi pi-shopping-bag"
              //  onClick={() => adicionarProduto(rowdata)}
              onClick={() => setVisibleLeft(true)}
            />
          </>
        )}
      </>
    );
  };

  const hideDialog = () => {
    // setSubmitted(false);
    setDisplayDialog(false);
  };

  const adicionarProduto = (rowData) => {
    if (!quantidade1 || !preco) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Infome o preço e quantidade para compra",
      });
    } else {
      // console.log(rowData.id);
      api
        .post(`/api/pedido/compra/salvar/${idPedido}`, {
          idpedido: { id: idPedido },
          idproduto: { id: rowData.id },
          quantidadeVenda: rowData.quantidade_vendida,
          unidadeCompra: rowData.unidade_compra,
          embalagem: Intl.NumberFormat("pt-BR", {}).format(rowData.embalagem),
          quantidade1: quantidade1,
          quantidade2: quantidade2,
          preco: preco,
        })
        .then((r) => {
          getItensPedido();
          //    console.log(r.data);
          /*  setPedidos((oldArray) => [
            ...oldArray,
            {
              idproduto: rowData.id,
              produto: rowData.produto,
              codigo: rowData.codigo,
              ean: rowData.ean,
              quantidade_venda: rowData.quantidade_vendida,

              unidade_compra: rowData.unidade_compra,
              embalagem: Intl.NumberFormat("pt-BR", {}).format(
                rowData.embalagem
              ),
              quantidade1: quantidade1,
              quantidade2: quantidade2,
              preco: Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                mode: "decimal",
              }).format(preco),
            },
          ]);
          //   console.log(produto);
*/
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Produto ${rowData.produto} adicionado a lista `,
            life: 3000,
          });
        })
        .catch((error) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${error.data}`,
            life: 3000,
          });
        })
        .finally((f) => {
          hideDialog();
        });

      //  console.log(rowData);
    }
  };

  const deletarProduto = (rowData) => {
    let _products = pedidos.filter(
      (val) => val.idproduto !== rowData.idproduto
    );

    setPedidos(_products);
    setDeleteProductDialog(false);

    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Produto deletado",
      life: 3000,
    });
  };

  const criarNovoPedido = () => {
    setIdPedido(null);
    setVisibleLeft(false);
    setPedidos([]);
    setCondicaoPagamento(null);
    setFornecedor(null);
    setFilial(null);
    setProdutos([]);
    setPrazoEntrega(null);
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Pedido finalizado",
      life: 3000,
    });
  };

  const leftContents = () => {
    return (
      <>
        <Button
          disabled={idPedido ? false : true}
          style={{ margin: "5px" }}
          icon="pi pi-cloud-upload"
          className="p-button p-button-success p-button-rounded"
          label="Finalizar"
          onClick={() => criarNovoPedido()}
        />
      </>
    );
  };

  const rightContents = () => {
    return (
      <>
        {/*  <Button
          style={{ margin: "5px" }}
          icon="pi pi-trash"
          className="p-button p-button-danger p-button-rounded"
          label="Esvaziar lista"
          onClick={() => setPedidos([])}
        />
    */}

        {idPedido ? (
          <>
            <Button
              style={{ margin: "5px" }}
              icon="pi pi-arrow-left"
              className="p-button p-button-info p-button-rounded"
              label={
                `Pedido número ` +
                idPedido +
                ` salvo com sucesso! Clique aqui para voltar a análise de compra `
              }
              onClick={() => setVisibleLeft(false)}
            />
          </>
        ) : (
          <>
            <Button
              disabled={idPedido ? true : false}
              style={{ margin: "5px" }}
              icon="pi pi-save"
              className="p-button p-button-success p-button-rounded"
              label={
                idPedido
                  ? `Pedido número ` +
                    idPedido +
                    ` criado, adicione os itens a lista do pedido`
                  : "Gravar pedido"
              }
              onClick={() => gravarPedido()}
            />
          </>
        )}
      </>
    );
  };

  const getItensPedido = () => {
    api
      .get(`/api/pedido/compra/itens/pedidoId/${idPedido}`)
      .then((r) => {
        // console.log(r.data);
        setPedidos(r.data);
      })
      .catch((error) => {
        // console.log(error.data);

        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${error.data}`,
          life: 3000,
        });
      })
      .finally((f) => {});
  };

  const gravarPedido = () => {
    //  let pedido = JSON.stringify(fornecedorPedido);
    if (
      fornecedor === null ||
      condicaoPagamento === null ||
      prazoEntrega === null
    ) {
      toast2.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: `Informe o fornecedor, condição de pagamento e prazo para entrega `,
        life: 3000,
      });
    } else {
      api
        .post(`/api/pedido/compra/salvar`, {
          id: "",
          fornecedor: fornecedor,
          condicaoPagamento: condicaoPagamento,
          prazoEntrega: prazoEntrega,
        })
        .then((r) => {
          //   console.log(r.data);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Pedido ${r.data.id} criado, adicione os itens ao seu pedido `,
            life: 3000,
          });
          setIdPedido(r.data.id);
          setVisibleLeft(false);
        })
        .catch((error) => {
          toast2.current.show({
            severity: "error",
            summary: "Erro",
            detail: `Erro ao criar o pedido ${error} `,
            life: 3000,
          });
        });
    }
  };

  const saldo_estoque_template = (rowdata) => {
    let saldo = Intl.NumberFormat("pt-BR", {}).format(rowdata.saldo_estoque);
    return saldo > 0 ? (
      <>
        {" "}
        <div style={{ color: "green", fontWeight: "800" }}>
          {" "}
          Estoque <br />
          {saldo}
        </div>
      </>
    ) : (
      <>
        {" "}
        <div style={{ color: "red", fontWeight: "800" }}>
          {" "}
          Estoque <br />
          {saldo}
        </div>
      </>
    );
  };

  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button
        label="Não"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => hideDeleteProductDialog()}
      />
      <Button
        label="Sim"
        icon="pi pi-check"
        className="p-button-text"
        onClick={() => deletarProduto()}
      />
    </React.Fragment>
  );

  const headerDataTable = () => renderHeader();

  const onGlobalFilterChange2 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters2(_filters2);
    setGlobalFilterValue2(value);
  };

  const onGlobalFilterChange3 = (e) => {
    const value = e.target.value;
    let _filters2 = { ...filters2 };
    _filters2["global"].value = value;

    setFilters3(_filters2);
    setGlobalFilterValue3(value);
  };

  const renderHeader = () => {
    return (
      <>
        <Dialog
          header="Pesquisa global"
          //    visible={exibirDialogPesquisa}
          position="bottom"
          modal={false}
          //    onHide={() => setExibirDialogPesquisa(false)}
        >
          <div className="pesquisa-rapida">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                autoFocus
                value={globalFilterValue2}
                onChange={onGlobalFilterChange2}
                placeholder="Produtos, Fornecedores, Notas"
              />
            </span>
          </div>
        </Dialog>

        <div className="pesquisa-rapida">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue2}
              onChange={onGlobalFilterChange2}
              placeholder="Pesquisa "
            />
          </span>
        </div>
      </>
    );
  };

  const renderHeader2 = () => {
    return (
      <>
        <div className="pesquisa-rapida">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue3}
              onChange={onGlobalFilterChange3}
              placeholder="Pesquisa "
            />
          </span>
        </div>
      </>
    );
  };

  const novoPedido = () => {
    setVisibleLeft(true);
    setPedido(true);
  };

  const hideDeleteProductDialog = () => {
    setDeleteProductDialog(false);
  };

  const itemTemplate = (option) => {
    return (
      <>
        <div>
          {" "}
          <i className="pi pi-users"></i> {option.codigo} - {option.nome}{" "}
        </div>
      </>
    );
  };

  const template1 = {
    layout:
      "PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport",
    PrevPageLink: (options) => {
      return (
        <button
          type="button"
          className={options.className}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <span className="p-3">Anterior</span>
          <Ripple />
        </button>
      );
    },
    NextPageLink: (options) => {
      return (
        <button
          type="button"
          className={options.className}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <span className="p-3">Próximo</span>
          <Ripple />
        </button>
      );
    },
    PageLinks: (options) => {
      if (
        (options.view.startPage === options.page &&
          options.view.startPage !== 0) ||
        (options.view.endPage === options.page &&
          options.page + 1 !== options.totalPages)
      ) {
        const className = classNames(options.className, { "p-disabled": true });

        return (
          <span className={className} style={{ userSelect: "none" }}>
            ...
          </span>
        );
      }

      return (
        <button
          type="button"
          className={options.className}
          onClick={options.onClick}
        >
          {options.page + 1}
          <Ripple />
        </button>
      );
    },
    RowsPerPageDropdown: (options) => {
      const dropdownOptions = [
        { label: 3, value: 3 },
        { label: 5, value: 5 },
        { label: 10, value: 10 },
        { label: 15, value: 15 },
        { label: 20, value: 20 },
        { label: 50, value: 50 },
        { label: "Todos", value: options.totalRecords },
      ];

      return (
        <Dropdown
          value={options.value}
          options={dropdownOptions}
          onChange={options.onChange}
        />
      );
    },
  };

  let footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total:"
          colSpan={5}
          footerStyle={{ textAlign: "right" }}
        />
        <Column colSpan={2} footer={() => totalizarDuplicata()} />
      </Row>
    </ColumnGroup>
  );

  let footerGroupAnalise = (
    <ColumnGroup>
      <Row>
        <Column
          style={{ color: "red" }}
          footer="Total comprado "
          colSpan={9}
          footerStyle={{ textAlign: "right" }}
        />
        <Column
          style={{ color: "red" }}
          footer={() => totalizarAnaliseTotalComprado()}
        />

        <Column
          style={{ color: "green" }}
          footer="Total vendido "
          footerStyle={{ textAlign: "right" }}
        />
        <Column
          style={{ color: "green" }}
          colSpan={6}
          footer={() => totalizarAnaliseTotalVendido()}
        />
      </Row>
      <Row></Row>
    </ColumnGroup>
  );

  const totalizarAnaliseTotalComprado = () => {
    let tc = 0;

    for (let p of produtos) {
      tc += p.quantidade_comprada * p.ultimoprecocompra;
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(tc);
  };

  const precoPedido = (rowData) => {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.preco);
  };

  const totalizarAnaliseTotalVendido = () => {
    let tv = 0;

    for (let p of produtos) {
      tv += p.quantidade_vendida * p.preco_medio_venda;
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(tv);
  };

  const totalizarDuplicata = () => {
    let t = 0;
    for (let d of duplicatas) {
      t += d.valor;
    }

    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(t);
  };

  const valor_duplicata_template = (rowData) => {
    return Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.valor);
  };

  const status_duplicate_template = (rowData) => {
    return (
      <>
        {rowData.status === "A" ? (
          <Badge value="Aberto" severity="warning"></Badge>
        ) : (
          <Badge value="Pago" severity="success"></Badge>
        )}
      </>
    );
  };

  useEffect(() => {
    getFornecedores();
    getLojas();
    getCondficaoPagamento();
    getDuplicatas();
  }, []);

  return (
    <>
      <Header />
      <Footer />
      <Button
        icon="pi pi-shopping-cart"
        className="botao-add-colado"
        onClick={() => setVisibleLeft(true)}
      />
      <div className="img-fornecedor">
        <img src={ImagemDestque} style={{ width: "400px" }} />
      </div>
      <Dialog
        header="Adicionar produto a lista de compras"
        modal={false}
        visible={displayDialog}
        onHide={hideDialog}
        style={{ width: "100%", height: "60%" }}
        maximizable
        resizable
        position="top-right"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "space-around",
          }}
        >
          <div>
            {produto?.ean ? produto.ean : produto.codigo}
            <br />
            <img
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${produto.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={produto?.ean}
            />
          </div>

          <div>
            <label style={{ fontWeight: "800", width: "100%" }} htmlFor="nome">
              Produto
            </label>
            <h1 style={{ fontSize: "14px", width: "100%" }}>
              {produto.produto}
            </h1>
          </div>
          <br />
          <div
            style={{
              margin: "5px",
              borderRadius: "25px",
              padding: "5px",
            }}
          >
            <div>
              Quantidade para {lojas[0]?.nome}
              <InputNumber
                style={{ width: "100%", margin: "10px" }}
                id="quantidade1"
                autoFocus
                value={quantidade1}
                onChange={(e) => setQuantidade1(e.value)}
                required
              />
            </div>

            <div>
              Quantidade para {lojas[1]?.nome}
              <InputNumber
                style={{ width: "100%", margin: "10px" }}
                id="quantidade2"
                value={quantidade2}
                onChange={(e) => setQuantidade2(e.value)}
              />
            </div>
          </div>

          <div
            style={{
              margin: "5px",
              borderRadius: "25px",
              padding: "5px",
            }}
          >
            <label style={{ fontWeight: "800" }} htmlFor="embalagem">
              Embalagem
            </label>
            <h4>
              {produto.unidade_compra}
              {Intl.NumberFormat("pt-BR", {}).format(produto.embalagem)} )
            </h4>
          </div>

          <div>
            <label
              style={{ fontWeight: "800", margin: "10px" }}
              htmlFor="preco"
            >
              Preço para compra
            </label>
            <InputNumber
              style={{ width: "100%", margin: "10px" }}
              mode="decimal"
              prefix="R$ "
              locale="pt-BR"
              minFractionDigits={2}
              maxFractionDigits={2}
              id="preco"
              value={preco}
              onChange={(e) => setPreco(e.value)}
              required
            />
          </div>

          <div>
            <h4>Quantidade vendida</h4>
            {Intl.NumberFormat("pt-BR", {
              style: "decimal",
            }).format(produto.quantidade_vendida)}{" "}
            {produto.unidade_venda}
          </div>

          <div>
            <h4>Preço de venda médio</h4>
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(produto.preco_medio_venda)}
          </div>

          <div>
            <h4>Total da venda</h4>
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(produto.preco_medio_venda * produto.quantidade_vendida)}
          </div>

          <div>
            <Button
              style={{ marginTop: "20px" }}
              className="p-button p-button-success p-button-rounded p-button-sm"
              label="Adicionar"
              icon="pi pi-plus"
              onClick={() => adicionarProduto(produto)}
            />
          </div>
        </div>
      </Dialog>

      <Sidebar
        style={{ width: "100%" }}
        visible={visibleLeft}
        onHide={() => setVisibleLeft(false)}
      >
        <Toast ref={toast2} position="bottom-center" />
        <div className="lista-itens">
          <h4 style={{ color: "#FFF", margin: "1rem" }}>Pedido de compra</h4>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              justifyContent: "center",
              color: "#FFF",
            }}
          >
            <h4> Pedido para a(s) loja(s) </h4>
            <h1>
              {lojas[0]?.nome} <br /> {lojas[1]?.nome}
            </h1>
            <h4> Fornecedor </h4>
            <h1> {fornecedor?.nome} </h1>
            Prazo de entrega
            <Calendar
              showIcon
              showButtonBar
              locale="pt-BR"
              dateFormat="dd/mm/yy"
              style={{ width: "100%", margin: "10px 0px" }}
              value={prazoEntrega}
              onChange={(e) => setPrazoEntrega(e.value)}
              required
            />
            Condição de Pagamento (dias)
            <Dropdown
              filter
              value={condicaoPagamento}
              optionValue="prazos"
              options={condicoesPagamento}
              optionLabel="descricao"
              onChange={(e) => setCondicaoPagamento(e.value)}
              placeholder="Selecione uma condição de pagamento"
            />
          </div>

          <Toolbar
            style={{ margin: "20px" }}
            right={leftContents}
            left={rightContents}
          />

          <div style={{ width: "100%" }}>
            <DataTable
              style={{
                padding: "10px",
                backgroundColor: "#FFF",
                borderRadius: "25px",
                border: "1px solid #FFF",
              }}
              value={pedidos}
            >
              <Column field="idpedido.id" header="N° do pedido"></Column>
              <Column field={EanOrCodigo} header="Código/Ean"></Column>
              <Column field="idproduto.nome" header="Produto"></Column>
              <Column
                field="quantidade1"
                header={`Quantidade para ${lojas[0]?.nome}`}
              ></Column>
              <Column
                field="quantidade2"
                header={`Quantidade para ${lojas[1]?.nome}`}
              ></Column>
              <Column field="unidadeCompra" header="Embalagem"></Column>
              <Column
                field="embalagem"
                header="Quantidade (dentro da embalagem)"
              ></Column>

              <Column field={precoPedido} header="Preço"></Column>

              <Column
              //  body={() => abrirDialogDeleteProduto()}
              ></Column>
            </DataTable>
          </div>
        </div>
      </Sidebar>

      <div>
        <Button
          icon="pi pi-box"
          onClick={() => novoPedido()}
          style={{ marginTop: "30px", marginLeft: "30px" }}
          className="p-button p-button-secondary p-button-rounded "
          label={
            idPedido
              ? `Visualizar lista de pedido n°   ${idPedido} `
              : "Criar novo pedido"
          }
        />
      </div>

      <div className="container-fornecedor">
        <h1
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Análise de compras
        </h1>

        <div>
          <div className="fornecedor-input">
            <h4>Selecione um fornecedor para análise</h4>
            <Dropdown
              disabled={idPedido ? true : false}
              required
              style={{ marginTop: "10px" }}
              placeholder="Selecione um fornecedor"
              value={fornecedor}
              options={fornecedores}
              optionLabel="nome"
              itemTemplate={itemTemplate}
              filter
              showClear
              filterBy="nome,codigo"
              onChange={(e) => setFornecedor(e.target.value)}
            />
          </div>

          <div className="fornecedor-input">
            <h4>Selecione uma loja para análise</h4>
            <Dropdown
              style={{ marginTop: "10px" }}
              placeholder="Selecione uma loja"
              value={filial}
              onChange={(e) => setFilial(e.target.value)}
              options={lojas}
              optionLabel="nome"
              showClear
            />
          </div>
        </div>
        <div>
          <div className="fornecedor-input">
            <h4 style={{ color: "red" }}>
              Informe o período inicial para análise de compra
            </h4>

            <Calendar
              showOnFocus={false}
              showButtonBar
              showIcon
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataInicialCompra(e.target.value)}
              value={dataInicialCompra}
            ></Calendar>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "red" }}>
              Informe o período final para análise de compra
            </h4>

            <Calendar
              showButtonBar
              showOnFocus={false}
              showIcon
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataFinalCompra(e.target.value)}
              value={dataFinalCompra}
            ></Calendar>
          </div>
        </div>
        <div>
          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>
              Informe a quantidade de dias para análise de vendas
            </h4>

            <InputNumber
              showButtons
              style={{ marginTop: "10px", width: "40%" }}
              onChange={(e) => setDiasVenda(e.value)}
              value={diasVenda}
              placeholder="Informe a quantidade de dias para análise"
            ></InputNumber>
          </div>
        </div>

        <div>
          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>Informe o tempo do pedido (Dias)</h4>

            <InputNumber
              showButtons
              style={{ marginTop: "10px", width: "40%" }}
              onChange={(e) => setTempoDiasPedido(e.value)}
              value={tempoDiasPedido}
            ></InputNumber>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>
              Informe o tempo de entrega (Dias)
            </h4>

            <InputNumber
              showButtons
              style={{ marginTop: "10px", width: "40%" }}
              onChange={(e) => settempoDiasEntrega(e.value)}
              value={tempoDiasEntrega}
            ></InputNumber>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>
              Informe a margem de erro para tempo de entrega (Dias)
            </h4>

            <InputNumber
              showButtons
              style={{ marginTop: "10px", width: "40%" }}
              onChange={(e) => setMargemErroDiasEntrega(e.value)}
              value={margemErroDiasEntrega}
            ></InputNumber>
          </div>
        </div>

        <div>
          <Button
            loading={loading}
            style={{ marginTop: "30px" }}
            icon="pi pi-search"
            label={loading ? "Analisando..." : "Pesquisar"}
            className="p-button-lg p-button-success p-button-rounded"
            onClick={analisar}
          />
        </div>
        <div>
          <Button
            icon="pi pi-chart-line"
            onClick={() => setDialogDuplicatas(true)}
            style={{ marginTop: "30px", marginLeft: "30px" }}
            className="p-button p-button-info p-button-rounded "
            label="Duplicatas hoje"
          />
        </div>
      </div>
      <Toast ref={toast} position="bottom-center" />

      <DataTable
        style={{
          width: "100%",
        }}
        rows={3}
        paginator
        footerColumnGroup={footerGroupAnalise}
        paginatorTemplate={template1}
        footer={"Existem " + produtos.length + " produto(s) para análise"}
        breakpoint="968px"
        loading={loading}
        //     stripedRows
        value={produtos}
        selectionMode="single"
        //   reorderableColumns
        editMode="row"
        dataKey="idproduto"
        //   scrollDirection="vertical"
        //   scrollable
        //   scrollHeight="flex"

        filters={filters2}
        size="small"
        responsiveLayout="stack"
        emptyMessage="Nenhum produto encontrado para análise"
        showGridlines
        header={headerDataTable}
        rowGroupMode="subheader"
        sortOrder={1}
        // resizableColumns
        columnResizeMode="fit"
        globalFilterFields={["codigo", "ean", "numeronfultcompra", "produto"]}
      >
        <Column
          field={data_inclusao_template}
          header="Data de entrada"
        ></Column>

        <Column field={EanOrCodigo} header="Código"></Column>

        <Column field="produto" sortable header="Produto"></Column>

        <Column field={cfop_template} header="CFOP"></Column>

        <Column field={botaoAddTemplate} header="Adicionar a lista "></Column>

        <Column
          field="saldo_estoque"
          sortable
          header="Saldo em Estoque"
          body={saldo_estoque_template}
        ></Column>

        <Column
          field="rating"
          header="Classificação"
          body={giroTemplate}
        ></Column>

        <Column
          field={sugestao_quantidade_compra}
          header="Sugestão qtde compra"
        ></Column>

        <Column
          field={valor_unitario_template}
          header="Custo unitário"
        ></Column>

        <Column field={quantidade_comprada_template} header="Compra"></Column>

        <Column
          field={total_comprado_template}
          header="Total comprado"
        ></Column>

        <Column field={preco_media_venda_template}></Column>

        <Column
          field={quantidade_vendida_template}
          header="Qtde venda"
        ></Column>

        <Column
          field={venda_diaria_template}
          header="Qtde venda diária"
        ></Column>

        <Column field={total_template} header="Total vendido"></Column>
      </DataTable>

      <Dialog
        visible={deleteProductDialog}
        style={{ width: "450px" }}
        header="Confirmação"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteProductDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "14px" }}
          />
          {produto && (
            <span>
              Deseja deletar <b>{produtoDeleteSelecionado.produto}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={dialogDuplicatas}
        header="Documentos vencendo hoje"
        modal={false}
        position="top"
        onHide={() => setDialogDuplicatas(false)}
      >
        <div className="fornecedor-input">
          <h4>Selecione uma loja</h4>
          <Dropdown
            style={{ marginTop: "10px" }}
            placeholder="Selecione uma loja"
            value={filial}
            onChange={(e) => setFilial(e.target.value)}
            options={lojas}
            optionLabel="nome"
            showClear
          />
        </div>

        <div
          style={{
            width: "15%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="card"
        >
          <Button
            className="p-button p-button-info p-button-rounded "
            icon="pi pi-search"
            label="Filtrar"
            onClick={() => getDuplicatas()}
          />
        </div>

        <DataTable
          breakpoint="968px"
          emptyMessage="Nenhum documento encontrado! 🥳"
          filterDisplay="row"
          filters={filters3}
          dataKey="id"
          header={renderHeader2}
          //  loading={loading}
          stripedRows
          value={duplicatas}
          footerColumnGroup={footerGroup}
          responsiveLayout="stack"
        >
          <Column field="idfilial" sortable header="Loja"></Column>
          <Column field="documento" sortable header="Documento"></Column>

          <Column field="nomeentidade" sortable header="Fornecedor"></Column>
          <Column field="observacao" header="Origem"></Column>
          <Column field="tipodocumento" sortable header="Tipo"></Column>
          <Column field={valor_duplicata_template} header="Valor"></Column>
          <Column field={status_duplicate_template} header="Status"></Column>
        </DataTable>
      </Dialog>
    </>
  );
}
