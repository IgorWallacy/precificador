import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Messages } from "primereact/messages";

import api from "../../../../services/axios";

import { formataMoeda } from "../../../../util";

const PedidoListaSidebar = ({
  msgs1,
  dialogProdutoPorFilial,
  lojas,
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
}) => {
  const [editDialog, setEditDialog] = useState(false);
  const [produto, setProduto] = useState(true);

  const [quantidade, setQuantidade] = useState(0);
  const [preco, setPreco] = useState(0);
  const [fator, setFator] = useState(0);
  const [unCompra, setUnCompra] = useState(0);
  const [total, setTotal] = useState(0);
  const toast = useRef(null);

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

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      <Messages ref={msgs1} />
      <DataTable
        style={{
          padding: "10px",
          backgroundColor: "#FFF",
          borderRadius: "25px",
          border: "1px solid #FFF",
        }}
        responsiveLayout="scroll"
        footer={`Existem ${pedidos.length} produto(s) adicionado(s) a lista de compras`}
        footerColumnGroup={footerGroupPedido}
        value={pedidos}
        breakpoint="968px"
        rows={10}
        loading={loading3}
        paginator
        paginatorTemplate={template1}
        emptyMessage="Nenhum produto adicionado a lista"
        editMode="row"
        dataKey="id"
        onRowEditComplete={atualizarPedido}
      >
        <Column field="filial.id" sortable header="Cód.Loja" />
        <Column field="filial.nome" sortable header="Loja" />
        <Column field={EanOrCodigoPedido} header="Código/Ean"></Column>
        <Column field="idproduto.nome" sortable header="Produto"></Column>

        <Column field="quantidade" sortable header="Quantidade"></Column>

        <Column field="unidadeCompra.nome" sortable header="UN"></Column>
        <Column field="fatorConversao" sortable header="Emb.C/"></Column>

        <Column
          field="preco"
          body={precoPedido}
          sortable
          header="Preço unitário "
        ></Column>

        <Column field={precoPedidoLinhaTotal} header="Preço Total "></Column>

        <Column header="Editar" field={editar}></Column>

        <Column header="Deletar item" field={deletarItemPedido}></Column>

        <Column
        //  body={() => abrirDialogDeleteProduto()}
        ></Column>
      </DataTable>

      <Dialog
        header={produto?.idproduto?.nome}
        closable={false}
        focusOnShow
        modal={false}
        position="bottom"
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
            alignContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {EanOrCodigoPedido(produto)}
          <DataTable
            value={lojas}
            style={{ width: "50%" }}
            responsiveLayout="stack"
            selectionMode="single"
            dataKey="id"
            emptyMessage="Nenhuma loja encontrada"
            onRowSelect={dialogProdutoPorFilial}
          >
            <Column field="codigo" header="Código"></Column>
            <Column field="nome" header="Loja"></Column>
          </DataTable>

          <DataTable
            emptyMessage="Sem dados para exibir no momento. Selecione uma loja para análise"
            loading={loadingLojas}
            style={{ width: "100%" }}
            value={produtoPorFilialLista}
            responsiveLayout="stack"
          >
            <Column field="idfilial" header="Loja"></Column>
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
              field={total_comprado_template}
              header="Total comprado"
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
          </DataTable>

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
    </>
  );
};

export { PedidoListaSidebar };
