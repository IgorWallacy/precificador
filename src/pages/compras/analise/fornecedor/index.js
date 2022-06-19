import React, { useEffect, useState, useRef } from "react";
import "./styles.css";

import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import Header from "../../../../components/header";
import { addLocale } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { Rating } from "primereact/rating";
import { Sidebar } from "primereact/sidebar";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toolbar } from "primereact/toolbar";

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
    today: " Agora ",
    clear: " Limpar ",
  });

  const [loading, setLoading] = useState(false);
  const [dataInicialCompra, setDataInicialCompra] = useState("");
  const [dataFinalCompra, setDataFinalCompra] = useState("");
  const [dataInicialVenda, setDataInicialVenda] = useState("");
  const [dataFinalVenda, setDataFinalVenda] = useState("");
  const [fornecedor, setFornecedor] = useState(null);
  const [fornecedores, setFornecedores] = useState([""]);
  const [filial, setFilial] = useState(null);
  const [lojas, setLojas] = useState([""]);

  const [produtos, setProdutos] = useState([""]);
  const [pedidos, setPedidos] = useState([]);

  const [visibleLeft, setVisibleLeft] = useState(false);
  const [displayDialog, setDisplayDialog] = useState(false);

  const [produto, setProduto] = useState(['']);
  const [quantidade, setQuantidade] = useState(0);
  const [preco, setPreco] = useState(0);

  const [condicaoPagamento , setCondicaoPagamento] = useState()
  const [condicoesPagamento, setCondicoesPagamento] = useState([])
  const [prazoEntrega, setPrazoEntrega] = useState()

  const toast = useRef(null);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);

  const [produtoDeleteSelecionado , setProdutoDeleteSelecionado] = useState('')
  
  let eanUrl = "https://cdn-cosmos.bluesoft.com.br/products"
  let totalVenda = 0

 
  const getFornecedores = () => {
    setLoading(true);

    api
      .get(`/api/entidade/fornecedores/`)
      .then((r) => {
        setFornecedores(r.data);
      })
      .catch((error) => {
         toast.current.show({severity: 'error', summary: 'Erro', detail: {error} });;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCondficaoPagamento = () => {

    setLoading(true)

    api.get("/api/condicaopagamento/todas").then((r) => {
      setCondicoesPagamento(r.data)
    }).catch((error) => {
      toast.show({severity: 'error', summary: 'Erro', detail: error})
    }).finally(setLoading(false))
  }

  const getLojas = () => {
    setLoading(true);
    api
      .get("/api/filial")
      .then((r) => {
        setLojas(r.data);
      })
      .catch((error) => {
         toast.current.show({severity: 'error', summary: 'Erro', detail: {error} });;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const analisar = () => {
    setLoading(true);

    if(!dataInicialCompra || !dataFinalCompra || !dataInicialVenda || !dataFinalVenda || !filial) {

      toast.current.show({ severity: 'warn' , summary : 'Aviso' ,detail  : 'Preencha todos os campos' })
      setLoading(false)
    } else{

    api
      .get(
        `/api_react/compras/produtos/${moment(dataInicialCompra).format(
          "YYYY-MM-DD"
        )}/${moment(dataFinalCompra).format("YYYY-MM-DD")}/${fornecedor.id}/${
          filial.codigo
        }/${moment(dataInicialVenda).format("YYYY-MM-DD")}/${moment(
          dataFinalVenda
        ).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        setProdutos(r.data);
      //  console.log(r.data)
      
      })
      .catch((error) => {
      
        toast.current.show({severity: 'error', summary: 'Erro', detail: {error} });
      })
      .finally(() => {
        setLoading(false);
      });
    }
  };

  const total_comprado_template = (rowData) => {
    let total = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.total_comprado);
    return (
      <>
        {" "}
        <font color="red">
          {" "}
          <u> Total comprado </u> <br />
        </font>
        <font style={{ fontSize: "15px", color: "red", fontWeight: "800" }}>
          {" "}
          {total}{" "}
        </font>
      </>
    );
  };

  const valor_unitario_template = (rowData) => {
    let valor_unitario = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(rowData.custo_unitario);
    return (
      <>
        {" "}
        <font color="red">
          {" "}
          <u>Custo unitário </u> <br />
        </font>{" "}
        <font style={{ fontSize: "15px", color: "red", fontWeight: "800" }}>
          {" "}
          {valor_unitario}
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
          <u>Comprou </u> <br />
        </font>
        <font color="red" style={{ fontSize: "15px", fontWeight: "800" }}>
          {rowData.quantidade_comprada} {rowData.unidade_compra} ({embalagem})
        </font>
      </>
    );
  };

  

  

  const data_inclusao_template = (rowData) => {
    return (
      <>
        {" "}
        <div>
          {" "}
          <h4>Chegou dia </h4>
        </div>{" "}
        {moment(rowData.data_inclusao).format("DD/MM/yyyy")}{" "}
      </>
    );
  };

  const giroTemplate = (rowData) => {
    let totalEstrelas =
      (rowData.quantidade_vendida /
        (rowData.quantidade_comprada * rowData.embalagem)) *
      5;

    return (
      <>
        {totalEstrelas.toFixed(2)}
        <Rating value={totalEstrelas} stars={5} readOnly cancel={false} />
      </>
    );
  };

  const EanOrCodigo = (rowData) => {
    if (rowData.ean) {
      return (
        <>
          <div>{rowData.ean} </div>
          <div>
            <img
              style={{
                width: "100px",
                height: "100px",
                margin: "5px",
                borderRadius: "25px",
                padding: "5px",
              }}
              src={`${eanUrl}/${rowData.ean}`}
              onError={(e) =>
                (e.target.src =
                  "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
              }
              alt={rowData.ean}
            />
          </div>
        </>
      );
    } else {
      return rowData.codigo;
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
}




  const openNew = (produto) => {
    
    setQuantidade(null)
    setPreco(produto.custo_unitario)
    setDisplayDialog(true);
    setProduto({ ...produto });
    
  };

  const botaoAddTemplate = (rowdata) => {
    //  setProduto({...rowdata})

    return (
      <>
        <Button
          style={{ margin: "5px" }}
          className="p-button-rounded"
          label="+"
          icon="pi pi-shopping-bag"
          //  onClick={() => adicionarProduto(rowdata)}
          onClick={() => openNew(rowdata)}
        />
      </>
    );
  };

  const hideDialog = () => {
    // setSubmitted(false);
    setDisplayDialog(false);
  };

  const adicionarProduto = (rowData) => {
    if(!quantidade || !preco  ) {
       toast.current.show({severity: 'warn', summary: 'Aviso' , detail : 'Infome o preço e quantidade para compra'})
    } else {
    setPedidos((oldArray) => [
      ...oldArray,
      {
        idproduto : rowData.idproduto,
        produto: rowData.produto,
        codigo: rowData.codigo,
        ean: rowData.ean,
        quantidade_venda : rowData.quantidade_vendida,
        
        unidade_compra: rowData.unidade_compra,
        embalagem: Intl.NumberFormat("pt-BR",{}).format(rowData.embalagem),
        quantidade : quantidade,
        preco : Intl.NumberFormat("pt-BR",{style : 'currency' , currency:'BRL', mode:"decimal" }).format(preco)
      },
    ]);
    toast.current.show({
      severity: "success",
      summary: "Sucesso",
      detail: `${rowData.produto} adicionado a lista de pedidos`,
      life: 3000,
    });
    hideDialog();
  }};

  const deletarProduto = (rowData) => {
        let _products = pedidos.filter(val => val.idproduto !== rowData.idproduto);
      
        setPedidos(_products);
        setDeleteProductDialog(false);
        
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto deletado', life: 3000 });
}

  const rightContents = () => {
    return (
      <>
        <Button
          style={{ margin: "5px" }}
          icon="pi pi-trash"
          className="p-button p-button-danger p-button-rounded"
          label="Esvaziar lista"
          onClick={() => setPedidos([])}
        />
        <Button
          style={{ margin: "5px" }}
          icon="pi pi-save"
          className="p-button p-button-success p-button-rounded"
          label="Gravar Pedido"
          disabled
       //   onClick={() => setPedidos(null)}
        />
      </>
    );
  };

  const saldo_estoque_template = (rowdata) => {
    let saldo = Intl.NumberFormat("pt-BR" , {} ).format(rowdata.saldo_estoque)
    return (
       
      saldo > 0 ? <> <div style={{color:'green' , fontWeight : '800'}}> Estoque <br/>{saldo}</div></> : <> <div style={{color:'red', fontWeight : '800'}}> Estoque <br/>{saldo}</div></>
    ) 
    
  }

  const deleteProductDialogFooter = (
    <React.Fragment>
        <Button label="Não" icon="pi pi-times" className="p-button-text" onClick={() => hideDeleteProductDialog()} />
        <Button label="Sim" icon="pi pi-check" className="p-button-text" onClick={() => deletarProduto()} />
    </React.Fragment>
);

const hideDeleteProductDialog = () => {
  setDeleteProductDialog(false);
}

const abrirDialogDeleteProduto = (rowdata) => {
  
  produtoDeleteSelecionado = rowdata.produto
  setDeleteProductDialog(true)
  

 

}

  useEffect(() => {
    getFornecedores();
    getLojas();
    getCondficaoPagamento()
  }, []);


  return (
        
    <>
   
      <Header />

      <Dialog
        header="Adicionar produto a lista de compras"
        modal={false}
        visible={displayDialog}
        onHide={hideDialog}
        style={{ width: "100%" ,height : '60%' }}
        maximizable 
        resizable
        
        position="top-right"
      >
       <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap : 'wrap',
          justifyContent: "space-around",
        }}
       >
       <div >
         
          
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

        <div >
          <label style={{ fontWeight: "800", width : '100%' }} htmlFor="nome">
            Produto
          </label>
          <h1 style={{fontSize : '15px', width : '100%'}}>{produto.produto}</h1>
        </div>
        <br/>
        <div  style={{
             
              margin: "5px",
              borderRadius: "25px",
              padding: "5px",
            }}>
          <label style={{ fontWeight: "800" , margin:'10px' }} htmlFor="quantidade">
            Quantidade para compra
          </label>
          <InputNumber
            style={{ width: "100%", margin:'10px' }}
            id="quantidade"
            autoFocus
          
            value={quantidade}
            onChange={(e) => setQuantidade(e.value)}
            required
          />
        </div>

        <div  style={{
            
              margin: "5px",
              borderRadius: "25px",
              padding: "5px",
            }} >
          <label style={{ fontWeight: "800" }} htmlFor="embalagem">
            Embalagem
          </label>
          <h4>
          {produto.unidade_compra} ( { Intl.NumberFormat("pt-BR", {}).format(produto.embalagem)} )  
          </h4>
        </div>


        <div >
          <label style={{ fontWeight: "800", margin:'10px' }} htmlFor="preco">
            Preço para compra
          </label>
          <InputNumber
            style={{ width: "100%", margin:'10px' }}
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
         { 
          Intl.NumberFormat("pt-BR", {
            style: "decimal",
         
          }).format(
         
         produto.quantidade_vendida) } {produto.unidade_venda}
        </div>

        <div>
          <h4>Preço de venda médio</h4>
          {
           Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(
          produto.preco_medio_venda)}
        </div>

        <div>
          
          <h4>Total da venda</h4>
          {  
              Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(produto.preco_medio_venda * produto.quantidade_vendida)
          }
        </div>
        
        <div >
          <Button style={{marginTop:'20px'}} className="p-button p-button-success p-button-rounded" label="Adicionar" icon="pi pi-plus" onClick={() => adicionarProduto(produto)} />
        </div>
        </div> 
      </Dialog>

      <Button
        icon="pi pi-shopping-cart"
        onClick={() => setVisibleLeft(true)}
        className="botao-add-colado mr-2"
      />

      <Sidebar
        style={{ width: "100%" }}
        visible={visibleLeft}
        onHide={() => setVisibleLeft(false)}
      >
        <div className="lista-itens">
          <h4 style={{ color: "#FFF", margin: "15px" }}>Pedido de compra</h4>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              justifyContent: "center",
              color: "#FFF",
            }}
          >
            <h4> Pedido para a loja</h4>
            <h1> {filial?.nome}</h1> 
            <h4> Fornecedor </h4> 
            <h1> {fornecedor?.nome} </h1>
            Prazo de entrega
            <Calendar showIcon showButtonBar locale="pt-BR" dateFormat="dd/mm/yy" style={{width : '100%',  margin:"10px 0px"}}  value={prazoEntrega} onChange={(e) => setPrazoEntrega(e.value)} required />
            Condição de Pagamento (dias)

            <Dropdown filter value={condicaoPagamento} optionValue="prazos" options={condicoesPagamento} optionLabel="descricao"  onChange={(e) => setCondicaoPagamento(e.value)} placeholder="Selecione uma condição de pagamento"/>

           
            
          </div>

          <Toolbar style={{ margin: "20px" }} right={rightContents} />

          <div style={{ width: "100%" }}>
            <DataTable
              style={{
                padding: "15px",
                backgroundColor: "#FFF",
                borderRadius: "25px",
                border: "1px solid #FFF",
              }}
              value={pedidos}
            >
              <Column field={EanOrCodigo} header="Código/Ean"></Column>
              <Column field="produto" header="Produto"></Column>
              <Column field="quantidade" header="Quantidade"></Column>
              <Column field="unidade_compra" header="Embalagem"></Column>
              <Column field="embalagem" header="Qtde(dentro da embalagem)"></Column>
             
              <Column field="preco" header="Preço"></Column>

              <Column
              //  body={() => abrirDialogDeleteProduto()}
              
              ></Column>
            </DataTable>
          </div>
        </div>
      </Sidebar>

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
             required
              style={{ marginTop: "10px" }}
              placeholder="Selecione um fornecedor"
              value={fornecedor}
              options={fornecedores}
              optionLabel="nome"
              filter
              showClear
              filterBy="nome"
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
              Informe o período inicial para análise de venda
            </h4>

            <Calendar
             showButtonBar
             
            showOnFocus={false}
            showIcon
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataInicialVenda(e.target.value)}
              value={dataInicialVenda}
            ></Calendar>
          </div>

          <div className="fornecedor-input">
            <h4 style={{ color: "green" }}>
              Informe o período final para análise de venda
            </h4>

            <Calendar
             showButtonBar
             showIcon
             showOnFocus={false}
              dateFormat="dd/mm/yy"
              locale="pt-BR"
              style={{ marginTop: "10px" }}
              onChange={(e) => setDataFinalVenda(e.target.value)}
              value={dataFinalVenda}
            ></Calendar>
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
      </div>
      <Toast ref={toast} position="bottom-center" />
      <div className="tabela">
        <DataTable
          selectionMode="single"
          loading={loading}
          value={produtos}
          style={{
            width: "100%",
            borderRadius: "20px",
            border: "20px solid #FFF",
            alignItems: "center",
          }}
          emptyMessage="Sem dados "
          responsiveLayout="stack"
          breakpoint="960px"
          rowGroupMode="subheader"
          groupRowsBy="produto"
          sortMode="single"
          sortField="produto"
          sortOrder={1}
        >
          <Column
            field={data_inclusao_template}
            header="Data de entrada"
          ></Column>

          <Column field={EanOrCodigo} header="Código"></Column>

          <Column field="produto" header="Produto"></Column>

          <Column field={cfop_template} header="CFOP"></Column>

          <Column body={botaoAddTemplate}></Column>

          <Column
            field="saldo_estoque"
            header="Saldo em Estoque"
            body={saldo_estoque_template}
          ></Column>

          <Column
            field="rating"
            header="Classificação"
            body={giroTemplate}
          ></Column>

          <Column
            field={valor_unitario_template}
            header="Custo unitário"
          ></Column>

          <Column
            field={quantidade_comprada_template}
            header="Qtde compra"
          ></Column>

          <Column
            field={total_comprado_template}
            header="Total comprado"
          ></Column>

        </DataTable>
      </div>

      <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirmação" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
                    {produto && <span>Deseja deletar <b>{produtoDeleteSelecionado.produto}</b>?</span>}
                </div>
            </Dialog>

    </>
  );
}
