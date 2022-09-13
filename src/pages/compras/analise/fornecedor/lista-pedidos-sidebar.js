import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Messages } from "primereact/messages";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Card } from "primereact/card";

import api from "../../../../services/axios";

import { formataMoeda } from "../../../../util";
import moment from "moment";

const PedidoListaSidebar = ({
  msgs1,
  dialogSelectedProductsAtualizar,
  setDialogSelectedProductsAtualizar,
  giroTemplate,
  unidadeMedidaLista,
  getItensPedido,
  pedidos,
  footerGroupPedido,
  loading3,
  template1,
  EanOrCodigoPedido,
  precoPedido,
  precoPedidoLinhaTotal,
  deletarItemPedido,
  loadingLojas,
  produtoPorFilialLista,
  data_inclusao_template,
  saldo_estoque_template,
  sugestao_quantidade_compra,
  valor_unitario_template,
  quantidade_comprada_template,
  total_comprado_template,
  preco_media_venda_template,
  quantidade_vendida_template,
  diasVenda,
  venda_diaria_template,
  total_template,
  quantidade_comprada_template_02,
  total_comprado_template_02,
  margemErroDiasEntrega,
  tempoDiasEntrega,
  tempoDiasPedido,
  dataFinalVenda,
  fornecedor,
  dataFinalCompra,
  dataInicialCompra,
  setLoadingLojas,
  setSelectedProductsPedido,
  selectedProductsPedido,
}) => {
  const [editDialog, setEditDialog] = useState(false);
  const [produto, setProduto] = useState([]);

  const [quantidade, setQuantidade] = useState(0);
  const [preco, setPreco] = useState(0);
  const [fator, setFator] = useState(0);
  const [unCompra, setUnCompra] = useState(0);
  const [total, setTotal] = useState(0);
  const toast = useRef(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState([]);
  const [produtoSelecionadoTodasasLojas, setProdutoSelecionadoTodasasLojas] =
    useState([]);
  const [loadingTodasLojas, setLoadingTodasLojas] = useState(false);

  const [loadingSelectedProductsPedido, setLoadingSelectedProductsPedido] =
    useState(false);

  const [filters2, setFilters2] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "idproduto.nome": { value: null, matchMode: FilterMatchMode.CONTAINS },
    "filial.id": { value: null, matchMode: FilterMatchMode.EQUALS },
    quantidade: {
      value: null,
      matchMode: FilterMatchMode.EQUALS,
    },
    "filial.nome": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    "idproduto.ean": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const editar = (data) => {
    return (
      <>
        <Button
          label="Editar"
          className="p-button p-button-primary p-button-rounded"
          icon="pi pi-pencil"
          onClick={() => editarDialog(data)}
        />
      </>
    );
  };

  const editarDialog = (data) => {
    setEditDialog(true);
    setProduto(data);
    setQuantidade(data.quantidade);
    setFator(data.fatorConversao);
    setPreco(data.preco);
    setUnCompra(data.unidadeCompra);
    dialogProdutoTodasLojas(data);
    dialogProdutoPorFilial(data);
    setProdutoSelecionado([]);
    setProdutoSelecionadoTodasasLojas([]);
  };

  const dialogProdutoPorFilial = (loja) => {
    setLoadingLojas(true);

    let filial = null;

    //console.log(loja);

    filial = loja?.data?.id ? loja?.data?.id : loja?.filial?.id;

    api
      .post(
        `/api_react/compras/produtos/${loja?.idproduto?.id}/${moment(
          dataInicialCompra
        ).format("YYYY-MM-DD")}/${moment(dataFinalCompra).format(
          "YYYY-MM-DD"
        )}/${fornecedor.id}/${filial}/${moment(moment.now())
          .subtract(diasVenda, "days")
          .format("YYYY-MM-DD")}/${moment(dataFinalVenda).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        setPreco(r.data[0].ultimoprecocompra);
        //  setUnCompra(r.data[0].id_unidade_compra);

        let total = r.data[0].quantidade_vendida;

        let venda_diaria = total / diasVenda;

        let qtdeAComprar =
          venda_diaria *
          (tempoDiasPedido + tempoDiasEntrega + margemErroDiasEntrega);

        setQuantidade(qtdeAComprar.toFixed());
        setProdutoSelecionado(r.data);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoadingLojas(false);
      });
  };

  const dialogProdutoTodasLojas = (data) => {
    setLoadingTodasLojas(true);

    api
      .post(
        `/api_react/compras/produtos/${data?.idproduto?.id}/${moment(
          dataInicialCompra
        ).format("YYYY-MM-DD")}/${moment(dataFinalCompra).format(
          "YYYY-MM-DD"
        )}/${fornecedor.id}/${moment(moment.now())
          .subtract(diasVenda, "days")
          .format("YYYY-MM-DD")}/${moment(dataFinalVenda).format("YYYY-MM-DD")}`
      )
      .then((r) => {
        setPreco(r.data[0].ultimoprecocompra);
        //  setUnCompra(r.data[0].id_unidade_compra);

        //    let total = r.data[0].quantidade_vendida;

        //  let venda_diaria = total / diasVenda;

        //        let qtdeAComprar =
        //      venda_diaria *
        //  (tempoDiasPedido + tempoDiasEntrega + margemErroDiasEntrega);

        //setQuantidade(qtdeAComprar.toFixed());
        setProdutoSelecionadoTodasasLojas(r.data);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoadingTodasLojas(false);
      });
  };

  const atualizarPedido = (data) => {
    api
      .post(`/api/pedido/compra/salvar/${data?.idpedido?.id}`, {
        id: data.id,
        idpedido: { id: data?.idpedido?.id },
        idproduto: { id: data?.idproduto?.id },
        unidadeCompra: unCompra,
        quantidadeVenda: data?.quantidadeVenda,
        fatorConversao: fator,

        embalagem: Intl.NumberFormat("pt-BR", {}).format(data?.embalagem),

        quantidade: quantidade,
        filial: { id: data?.filial.id },
        //  quantidade2: quantidade2,
        preco: preco,
        total: quantidade * preco,
      })
      .then((r) => {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: `${produto.idproduto.nome} atualizado`,
        });
      })
      .catch((e) => {
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: `${e.data} `,
        });
      })
      .finally((e) => {
        getItensPedido();
        setEditDialog(false);
      });
  };

  const atualizarPedidoMassa = (data) => {
    setLoadingSelectedProductsPedido(true);
    data.map((m) => {
      api
        .post(`/api/pedido/compra/salvar/${m?.idpedido?.id}`, {
          id: m.id,
          idpedido: { id: m?.idpedido?.id },
          idproduto: { id: m?.idproduto?.id },
          unidadeCompra: m?.unidadeCompra,
          quantidadeVenda: m?.quantidadeVenda,
          fatorConversao: m.fatorConversao,

          embalagem: Intl.NumberFormat("pt-BR", {}).format(m?.embalagem),

          quantidade: quantidade,
          filial: { id: m?.filial.id },
          //  quantidade2: quantidade2,
          preco: m?.preco,
          total: quantidade * m?.preco,
        })
        .then((r) => {
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: `Produto(s) atualizado(s)`,
          });
          setLoadingSelectedProductsPedido(true);
          setSelectedProductsPedido([]);
        })
        .catch((e) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${e.data} `,
          });
        })
        .finally((e) => {
          getItensPedido();
          setEditDialog(false);
          setDialogSelectedProductsAtualizar(false);
          setSelectedProductsPedido([]);
          setLoadingSelectedProductsPedido(false);
        });
    });
  };

  const lojaTemplate = (data) => {
    return data.filial.id + "-" + data.filial.nome;
  };

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      <Messages ref={msgs1} />
      <Card>
        <DataTable
          style={{
            padding: "10px",
            backgroundColor: "#F2F2F2",
            borderRadius: "25px",
            border: "1px solid #FFF",
          }}
          scrollable
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          scrollHeight="650px"
          responsiveLayout="scroll"
          footer={`Existem ${pedidos.length} produto(s) adicionado(s) a lista de compras - Produtos selecionados ${selectedProductsPedido.length}`}
          footerColumnGroup={footerGroupPedido}
          value={pedidos}
          breakpoint="968px"
          rows={20}
          stripedRows
          loading={loading3}
          paginator
          paginatorTemplate={template1}
          emptyMessage="Nenhum produto adicionado a lista"
          editMode="row"
          dataKey="id"
          filters={filters2}
          filterDisplay="row"
          selection={selectedProductsPedido}
          selectionMode="multiple"
          onSelectionChange={(e) => setSelectedProductsPedido(e.value)}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3em" }}
          ></Column>

          <Column
            field="filial.id"
            body={lojaTemplate}
            filter
            sortable
            header="Cód.Loja"
          />

          <Column
            field="idproduto.ean"
            filter
            //  body={EanOrCodigoPedido}
            header="Código/Ean"
          ></Column>
          <Column
            field="idproduto.nome"
            filter
            sortable
            header="Produto"
          ></Column>

          <Column field="unidadeCompra.nome" sortable header="UN"></Column>
          <Column field="fatorConversao" sortable header="Emb.C/"></Column>

          <Column
            field="quantidade"
            filter
            sortable
            header="Quantidade"
          ></Column>
          <Column
            field="preco"
            body={precoPedido}
            sortable
            header="Preço unitário "
          ></Column>

          <Column field={precoPedidoLinhaTotal} header="Preço Total "></Column>

          <Column header="Editar" field={editar}></Column>

          <Column header="Deletar item" field={deletarItemPedido}></Column>
        </DataTable>
      </Card>
      <Dialog
        style={{
          padding: "10px",
          backgroundColor: "#F2F2F2",
          borderRadius: "25px",
          border: "1px solid #FFF",
        }}
        modal
        header={`${produto?.idproduto?.nome} - ${produto?.filial?.nome}`}
        closable={false}
        focusOnShow
        position="bottom-left"
        draggable={false}
        visible={editDialog}
        onHide={() => setEditDialog(false)}
        footer={
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                backgroundColor: "#F2F2F2",
              }}
            >
              <Button
                label="Gravar"
                icon="pi pi-save"
                className="p-button-rounded p-button-success"
                onClick={() => atualizarPedido(produto)}
              />

              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-rounded p-button-danger"
                onClick={() => setEditDialog(false)}
              />
            </div>
          </>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center ",
            alignContent: "stretch",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>{EanOrCodigoPedido(produto)}</div>
          <div style={{ width: "95%" }}>
            <DataTable
              loading={loadingTodasLojas}
              value={produtoSelecionadoTodasasLojas}
              responsiveLayout="stack"
              style={{ width: "100%", marginBottom: "70px" }}
            >
              <Column header="Loja" body="Todas" />

              <Column
                field={saldo_estoque_template}
                header="Estoque total"
              ></Column>

              <Column
                field={sugestao_quantidade_compra}
                header="Sugestão"
              ></Column>

              <Column
                field={quantidade_comprada_template_02}
                header="Compra total no período"
              ></Column>

              <Column
                field={total_comprado_template_02}
                header={`Total comprado no período ${moment(
                  dataInicialCompra
                ).format("DD/MM/YY")} até ${moment(dataFinalCompra).format(
                  "DD/MM/YY"
                )}`}
              ></Column>

              <Column
                header="Preço médio de venda"
                field={preco_media_venda_template}
              ></Column>

              <Column
                field={quantidade_vendida_template}
                header={`Qtde venda ${diasVenda} dias`}
              ></Column>

              <Column
                field={venda_diaria_template}
                header="Qtde venda diária"
              ></Column>

              <Column
                field={total_template}
                header={`Total vendido ${diasVenda} dias`}
              ></Column>
              <Column
                field="quantidade_vendida"
                header="Classificação"
                body={giroTemplate}
              ></Column>
            </DataTable>
          </div>
          <div>
            <h1>Análise por loja</h1>
            <DataTable
              emptyMessage="Sem dados para exibir no momento. Selecione uma loja para análise"
              loading={loadingLojas}
              style={{ width: "100%" }}
              value={produtoSelecionado}
              responsiveLayout="stack"
            >
              <Column
                field={data_inclusao_template}
                header="Nota fiscal última compra"
              ></Column>
              <Column field={saldo_estoque_template} header="Estoque"></Column>
              <Column
                field={sugestao_quantidade_compra}
                header="Sugestão"
              ></Column>

              <Column
                field={valor_unitario_template}
                header="Custo Últm.Compra"
              ></Column>

              <Column
                field={quantidade_comprada_template}
                header="Compra"
              ></Column>

              <Column
                field={quantidade_comprada_template_02}
                header="Compra total no período"
              ></Column>

              <Column
                field={total_comprado_template_02}
                header={`Total comprado no período ${moment(
                  dataInicialCompra
                ).format("DD/MM/YY")} até ${moment(dataFinalCompra).format(
                  "DD/MM/YY"
                )}`}
              ></Column>

              <Column
                header="Preço médio de venda"
                field={preco_media_venda_template}
              ></Column>

              <Column
                field={quantidade_vendida_template}
                header={`Qtde venda ${diasVenda} dias`}
              ></Column>

              <Column
                field={venda_diaria_template}
                header="Qtde venda diária"
              ></Column>

              <Column
                field={total_template}
                header={`Total vendido ${diasVenda} dias`}
              ></Column>
              <Column
                field="quantidade_vendida"
                header="Classificação"
                body={giroTemplate}
              ></Column>
            </DataTable>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexDirection: "row",
              gap: "15px",
            }}
          >
            <h4>Quantidade</h4>
            <InputNumber
              label="Quantidade"
              value={quantidade}
              onChange={(e) => {
                setQuantidade(e.value);
                setTotal(quantidade * preco);
              }}
            />
            <h4>UN</h4>
            <Dropdown
              value={unCompra}
              options={unidadeMedidaLista}
              optionLabel="nome"
              onChange={(e) => setUnCompra(e.value)}
              placeholder="Selecione a unidade de compra"
            />

            <h4>Emb</h4>
            <InputNumber
              label="emb"
              value={fator}
              onChange={(e) => setFator(e.value)}
            />
            <h4>Preço</h4>
            <InputNumber
              prefix="R$ "
              label="preco"
              mode="decimal"
              locale="pt-BR"
              minFractionDigits={2}
              value={preco}
              onChange={(e) => {
                setPreco(e.value);
                setTotal(quantidade * preco);
              }}
            />
            <div>
              <h3>Total</h3>
            </div>
            <div>
              <h1>{formataMoeda(quantidade * preco)}</h1>
            </div>
          </div>
        </div>
      </Dialog>
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
            loading={loadingSelectedProductsPedido}
            disabled={loadingSelectedProductsPedido}
            style={{ marginTop: "20px" }}
            label="Atualizar"
            icon="pi pi-refresh"
            className="p-button p-button-rounded p-button-success"
            onClick={() => atualizarPedidoMassa(selectedProductsPedido)}
          />
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
    </>
  );
};

export { PedidoListaSidebar };
