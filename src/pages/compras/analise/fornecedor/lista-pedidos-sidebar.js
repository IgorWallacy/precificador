import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";

import { FilterMatchMode, FilterOperator } from "primereact/api";

import api from "../../../../services/axios";

import { formataMoeda } from "../../../../util";

const PedidoListaSidebar = ({
  filial,
  linhas,
  dialogSelectedProductsAtualizar,
  setDialogSelectedProductsAtualizar,

  unidadeMedidaLista,
  getItensPedido,
  pedidos,
  footerGroupPedido,
  loading3,

  idPedido,
  precoPedido,
  precoPedidoLinhaTotal,
  deletarItemPedido,
  loadingLojas,

  setSelectedProductsPedido,
  selectedProductsPedido,

  setEditDialog,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [loadingTodosProdutos, setLoadingTodosProdutos] = useState(false);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [dialogProduto, setDialogProduto] = useState(false);

  const [produto, setProduto] = useState([]);
  const [novoProduto, setNovoProduto] = useState(null);

  const [quantidade, setQuantidade] = useState(null);
  const [precoVenda, setPrecoVenda] = useState(null);
  const custoEmbalagem = useRef(null);
  const [quantidadeEmbalagem, setQuantidadeEmbalagem] = useState(null);
  const [preco, setPreco] = useState(0);
  const [fator, setFator] = useState(null);
  const [unCompra, setUnCompra] = useState(0);
  const [total, setTotal] = useState(0);
  const [ultimaEmbalagemCompra, setUltimaEmbalagemCompra] = useState([]);

  const toast = useRef(null);

  useState([]);

  const [loadingSelectedProductsPedido, setLoadingSelectedProductsPedido] =
    useState(false);

  const [dialogNovoProduto, setDialogNovoProduto] = useState(false);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "idproduto.nome": { value: null, matchMode: FilterMatchMode.CONTAINS },
    "filial.id": { value: null, matchMode: FilterMatchMode.EQUALS },
    quantidade: {
      value: null,
      matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
    },
    "filial.nome": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    "idproduto.ean": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const [filtersProduto, setFiltersProduto] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nome: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    codigo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    ean: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const editarItem = (data, props) => {
    return (
      <>
        <Button
          className="p-button p-button-primary p-button-rounded p-button-sm"
          icon="pi pi-pencil"
          tooltip="Editar"
          onClick={() => editarItemDialog(data, props)}
        />
      </>
    );
  };

  const editarItemDialog = (data, props) => {
    console.log(data);
    custoEmbalagem.current = data?.total;
    setDialogNovoProduto(true);
    setPreco(data?.preco);
    setPrecoVenda(data?.precoVenda);
    setNovoProduto(data);
    setQuantidade(data?.quantidade);
    setQuantidadeEmbalagem(data?.quantidade / data?.fatorConversao);
    setFator(data?.fatorConversao);
    setUnCompra(data?.unidadeCompra);
    getUltimaEmbalagem(data?.idproduto);
    setDialogProduto(false);
  };

  const onRowEditComplete = (e) => {
    let data = e;

    if (quantidade > 0 && fator > 0) {
      api
        .post(`/api/pedido/compra/salvar/${idPedido}`, {
          id: data?.id,
          idpedido: idPedido,
          idproduto: { id: data?.idproduto?.id },
          unidadeCompra: data?.unidadeCompra,
          quantidadeVenda: data?.quantidadeVenda,
          fatorConversao: data?.fatorConversao,

          embalagem: fator,

          quantidade: quantidade,
          //  filial: { id: data?.filial.id },
          //  quantidade2: quantidade2,
          preco: data?.preco,
          total: quantidade * data?.preco,
        })
        .then((r) => {
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `${data.idproduto.nome} atualizado`,
          });
        })
        .catch((e) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${e.message}`,
          });
        })
        .finally((f) => {
          getItensPedido();
          setQuantidade(null);
        });
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: `Informe uma quantidade`,
      });
    }
  };

  const editarDialog = (data, props) => {
    setEditDialog(true);
    setProduto(data);
    setQuantidade(data.quantidade);

    setFator(data.fatorConversao);
    setPreco(data.preco);
    setUnCompra(data.unidadeCompra);
  };

  const getTodosProdutos = () => {
    setLoadingTodosProdutos(true);
    return api
      .get(
        `/api/pedido/compra/produtos/${
          filial[0]?.id ? filial[0]?.id : filial?.id
        }`
      )
      .then((r) => {
        setTodosProdutos(r.data);
        //  console.log(todosProdutos);
      })
      .catch((e) => {
        console.log(e?.message);
      })
      .finally((f) => {
        setLoadingTodosProdutos(false);
      });
  };

  const getUltimaEmbalagem = (row) => {
    return api
      .get(`/api/pedido/compra/embalagem/${row?.id}`)
      .then((r) => {
        setUltimaEmbalagemCompra(r.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const adicionarProduto = (row) => {
    //console.log(row);
    setDialogNovoProduto(true);
    setPreco(null);
    setPrecoVenda(row?.preco);
    setNovoProduto(row);
    setQuantidade(null);
    setFator(null);
    setUnCompra(null);
    getUltimaEmbalagem(row);
    setDialogProduto(false);
  };
  const salvarProduto = (e) => {
    {
      console.log(e);
    }
    if (quantidade > 0 && fator > 0) {
      api
        .post(`/api/pedido/compra/salvar/${idPedido}`, {
          id: e?.idpedido ? e?.id : "",
          idpedido: idPedido,
          idproduto: { id: e?.idproduto?.id ? e?.idproduto?.id : e?.id },
          unidadeCompra: { id: unCompra?.id },
          fatorConversao: fator,
          quantidade: quantidade,
          preco: preco,
          precoVenda: precoVenda,
          total: quantidade * preco,
        })
        .then((r) => {
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `${e.nome} adicionado`,
          });
        })
        .catch((e) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${e.message}`,
          });
        })
        .finally((f) => {
          getItensPedido();
          setQuantidade(null);
          setFator(null);
          setUnCompra(null);

          setDialogNovoProduto(false);
        });
    } else {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: `Informe uma quantidade`,
      });
    }
  };
  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      {dialogProduto ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "10px",
              margin: "10px",
            }}
          >
            <Button
              icon="pi pi-backward"
              label="Voltar"
              className="p-button p-button-rounded p-button-danger"
              onClick={() => setDialogProduto(false)}
              onKeyUp={(e) => {
                if (e.key === "Escape") {
                  setDialogProduto(false);
                }
              }}
            />

            <DataTable
              header="Informe um produto para adicionar ao pedido"
              style={{ width: "100%" }}
              emptyMessage="Sem dados para exibir no momento"
              value={todosProdutos}
              loading={loadingTodosProdutos}
              showGridlines
              virtualScrollerOptions={{ itemSize: 72 }}
              filters={filtersProduto}
              globalFilterFields={["codigo", "nome", "ean"]}
              scrollable
              scrollHeight="75vh"
              tableStyle={{ width: "100vh" }}
              // header={renderHeader}
              filterDisplay="row"
            >
              <Column
                filter
                field="codigo"
                filterPlaceholder="Pesquisar por código"
                header="Código"
              ></Column>
              <Column
                filter
                field="ean"
                filterPlaceholder="Pesquisar por código de barras"
                header="Código de barras"
              ></Column>
              <Column
                filter
                field="nome"
                filterPlaceholder="Pesquisar por nome"
                header="Nome"
              ></Column>
              <Column
                field="precocusto"
                header="Preço de custo"
                body={(row) => {
                  return Intl.NumberFormat("pt-BR", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                    style: "currency",
                    currency: "BRL",
                  }).format(row.precocusto);
                }}
              ></Column>
              <Column
                field="preco"
                header="Preço de venda"
                body={(row) => {
                  return Intl.NumberFormat("pt-BR", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                    style: "currency",
                    currency: "BRL",
                  }).format(row?.preco);
                }}
              ></Column>
              <Column
                body={(row) => {
                  return (
                    <>
                      <Button
                        label="Adicionar"
                        className="p-button p-button-rounded p-button-sucesss"
                        icon="pi pi-plus"
                        onClick={() => adicionarProduto(row)}
                      />
                    </>
                  );
                }}
              ></Column>
            </DataTable>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "1rem",
                margin: "1rem",
              }}
              icon="pi pi-plus"
              label="Adicionar produto"
              className=" p-button-primary p-button-rounded"
              onClick={() => {
                getTodosProdutos();
                setDialogProduto(true);
              }}
            />
          </div>
          <DataTable
            style={{ marginTop: "1px", backgroundColor: "#F2F2F2" }}
            // editMode="row"
            // scrollable
            // resizableColumns
            // columnResizeMode="fit"
            size="small"
            showGridlines
            //  scrollHeight="650px"
            responsiveLayout="scroll"
            footer={`Existem ${pedidos.length} produto(s) adicionado(s) a lista de compras - Produtos selecionados ${selectedProductsPedido.length}`}
            footerColumnGroup={footerGroupPedido}
            value={pedidos}
            breakpoint="1739px"
            rows={linhas?.current}
            stripedRows
            loading={loading3}
            paginator
            //  paginatorTemplate={template1}
            emptyMessage="Nenhum produto adicionado a lista"
            dataKey="id"
            filters={filters2}
            filterDisplay="row"
            sortOrder={1}
            selection={selectedProductsPedido}
            selectionMode="multiple"
            onSelectionChange={(e) => setSelectedProductsPedido(e.value)}
            onRowEditComplete={onRowEditComplete}
            sortField="idproduto.nome"
            rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "1px" }}
            ></Column>
            <Column
              header="#"
              body={(data, props) => <div> {props.rowIndex + 1}</div>}
            ></Column>
            {/* <Column
              field="filial.id"
              style={{ minWidth: "300px" }}
              //  body={lojaTemplate}
              body={(data, props) => (
                <div>{data.filial.id + "-" + data.filial.nome}</div>
              )}
              filter
              sortable
              header="Cód.Loja"
              /> */}

            <Column
              field="idproduto.ean"
              filter
              body={(row) => {
                return row?.idproduto?.ean
                  ? row?.idproduto?.ean
                  : row?.idproduto?.codigo;
              }}
              header="Código/Ean"
                filterPlaceholder="Pesquisar por código e/ou cód.barras"
            ></Column>

            <Column
              style={{ minWidth: "600px" }}
              field="idproduto.nome"
              filter
              filterPlaceholder="Pesquisar por nome"
              sortable
              header="Produto"
            ></Column>

            <Column
              style={{ minWidth: "150px" }}
              body={(data) => (
                <>
                  {Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 3,
                    style: "decimal",
                  }).format(data?.quantidade / data?.fatorConversao)}{" "}
                  {data.unidadeCompra.codigo} ( {data?.fatorConversao} )
                </>
              )}
              header="UN"
            ></Column>
            <Column
              field="quantidade"
              style={{ minWidth: "150px" }}
              body={(row) => {
                return Intl.NumberFormat("pt-BR", {
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 2,
                  style: "decimal",
                }).format(row?.quantidade);
              }}
              header="Quantidade total"
            ></Column>

            <Column
              field="preco"
              body={precoPedido}
              sortable
              header="Custo unitário"
            ></Column>
            <Column
              body={(row) => {
                return (
                  <>
                    {Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      style: "decimal",
                    }).format(row.preco * row?.fatorConversao)}
                  </>
                );
              }}
              header="Custo total"
            ></Column>
            <Column
              body={(row) => {
                return (
                  <>
                    {Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      style: "decimal",
                    }).format(
                      ((row.precoVenda - row.preco) / row.preco) * 100
                    )}{" "}
                    %
                  </>
                );
              }}
              header="Markup Atual"
            ></Column>

            <Column
              field="precoVenda"
              body={(row) => {
                return Intl.NumberFormat("pt-BR", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                  style: "currency",
                  currency: "BRL",
                }).format(row?.precoVenda);
              }}
              header="Venda atual"
            ></Column>
            <Column
              field="sugestaoMarkup"
              body={(row) => {
                return (
                  Intl.NumberFormat("pt-BR", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                    style: "decimal",
                  }).format(row?.percentualmarkupminimo) + " % "
                );
              }}
              header="Sugestão de Markup"
            ></Column>

            <Column
              field="sugestao"
              body={(row) => {
                return Intl.NumberFormat("pt-BR", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                  style: "currency",
                  currency: "BRL",
                }).format(
                  (row?.percentualmarkupminimo / 100) * row?.preco + row?.preco
                );
              }}
              header="Sugestão de venda"
            ></Column>
            <Column field={precoPedidoLinhaTotal} header="Total "></Column>

            <Column field={editarItem}></Column>
            <Column field={deletarItemPedido}></Column>
          </DataTable>
        </>
      )}

      <Dialog
        closable={false}
        showOnFocus
        header={`Atualizar ${selectedProductsPedido.length} produtos selecionados`}
        visible={dialogSelectedProductsAtualizar}
        onHide={() => setDialogSelectedProductsAtualizar(false)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <h4>Nova quantidade</h4>
          <InputNumber
            minFractionDigits={2}
            maxFractionDigits={3}
            autoFocus
            label="Quantidade"
            value={quantidade}
            onChange={(e) => {
              setQuantidade(e.value);
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Button
            disabled={loadingSelectedProductsPedido}
            style={{ marginTop: "20px" }}
            label="Cancelar"
            icon="pi pi-times"
            className="p-button p-button-rounded p-button-danger"
            onClick={() => setDialogSelectedProductsAtualizar(false)}
          />
        </div>
      </Dialog>

      <Dialog
        closable={false}
        visible={loadingLojas}
        header="Aguarde por favor"
      >
        <h4>Buscando dados de compra e venda</h4>
        <h2>{produto?.idproduto?.nome}</h2>
      </Dialog>

      <Dialog
        header={
          novoProduto?.idproduto
            ? "Código " +
              (novoProduto?.idproduto?.ean
                ? novoProduto?.idproduto?.ean +
                  " - " +
                  novoProduto?.idproduto?.nome
                : novoProduto?.idproduto?.codigo +
                  " - " +
                  novoProduto?.idproduto?.nome)
            : "Código " +
              (novoProduto?.ean
                ? novoProduto?.ean + " - " + novoProduto?.nome
                : novoProduto?.codigo + " - " + novoProduto?.nome)
        }
        position="bottom"
        draggable={false}
        visible={dialogNovoProduto}
        onHide={() => setDialogNovoProduto(false)}
        style={{ height: "100vh", width: "100%" }}
        footer={
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                gap: "5px",
                justifyContent: "space-between",
                alignContent: "center",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <h3>Total comprado</h3>
                <h1>{formataMoeda(quantidade * preco)}</h1>
              </div>
              <div>
                <Button
                  label="Gravar"
                  className="p-button p-button-rounded p-button-success"
                  icon="pi pi-save"
                  onClick={() => salvarProduto(novoProduto)}
                />
              </div>
            </div>
          </>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "5px",
            }}
          >
            <h4 style={{ color: "green" }}>Última(s) embalagem(s) de compra</h4>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {ultimaEmbalagemCompra?.map((item, index) => (
                <p key={index}>
                  {" "}
                  <i className="pi pi-box" style={{ fontSize: "1em" }}></i>{" "}
                  {item?.nome} COM ( {item?.fatorConversao} )
                </p>
              ))}
            </div>

            {novoProduto?.precocusto ? (
              <>
                <h4 style={{ color: "red" }}>Custo atual (aquisição) </h4>

                <InputNumber
                  disabled
                  prefix="R$ "
                  size={12}
                  mode="decimal"
                  locale="pt-BR"
                  minFractionDigits={2}
                  value={novoProduto?.precocusto}
                />
              </>
            ) : (
              <></>
            )}

            <h4 style={{ color: "green" }}>Venda atual </h4>
            <InputNumber
              disabled
              prefix="R$ "
              label="Preço de venda"
              size={12}
              mode="decimal"
              locale="pt-BR"
              minFractionDigits={2}
              value={precoVenda}
              onChange={(e) => {
                setPrecoVenda(e.value);
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "5px",
            }}
          >
            <h4>EMBALAGEM</h4>
            <Dropdown
              autoFocus
              value={unCompra}
              options={unidadeMedidaLista}
              optionLabel="nome"
              onChange={(e) => setUnCompra(e.value)}
              placeholder="Selecione a unidade de compra"
            />

            <h4>Quantidade de {unCompra ? unCompra?.nome : "Embalagem"}</h4>

            <InputNumber
              minFractionDigits={2}
              maxFractionDigits={3}
              size={3}
              value={quantidadeEmbalagem}
              onChange={(e) => {
                setQuantidadeEmbalagem(e.value);
                setQuantidade(e?.value * fator);
              }}
            />

            <h4>
              {" "}
              {unCompra ? unCompra?.nome : " "} COM ( Fator de conversão )
            </h4>

            <InputNumber
              minFractionDigits={2}
              maxFractionDigits={3}
              size={3}
              value={fator}
              onChange={(e) => {
                setFator(e.value);

                custoEmbalagem.current = e.value * preco;
                setQuantidade(e?.value * quantidadeEmbalagem);
              }}
            />
            <h4>Quantidade total do produto</h4>
            <InputNumber
              minFractionDigits={2}
              maxFractionDigits={3}
              size={3}
              required
              label="Quantidade"
              value={quantidade}
              onChange={(e) => {
                setQuantidade(e.value);
                setQuantidadeEmbalagem(e?.value / fator);
                setTotal(quantidade * preco);
              }}
            />

            <h4>Custo unitário </h4>
            <InputNumber
              prefix="R$ "
              label="preco"
              size={12}
              mode="decimal"
              locale="pt-BR"
              minFractionDigits={2}
              value={preco}
              onChange={(e) => {
                setPreco(e.value);
                setTotal(quantidade * preco);
                custoEmbalagem.current = e.value * fator;
              }}
            />

            <h3>Custo {unCompra ? " do(a) " + unCompra?.nome : ""} </h3>
            <InputNumber
              prefix="R$ "
              size={12}
              mode="decimal"
              locale="pt-BR"
              minFractionDigits={2}
              value={custoEmbalagem.current}
              onChange={(e) => {
                custoEmbalagem.current = e?.value;
                setPreco(
                  custoEmbalagem ? custoEmbalagem.current / fator : null
                );
              }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export { PedidoListaSidebar };
