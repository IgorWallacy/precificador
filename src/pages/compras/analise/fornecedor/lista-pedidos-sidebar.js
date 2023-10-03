import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

import { FilterMatchMode } from "primereact/api";
import { SelectButton } from "primereact/selectbutton";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import api from "../../../../services/axios";

import { formataMoeda } from "../../../../util";
import moment from "moment";
import { FaStore, FaProductHunt } from "react-icons/fa";

const PedidoListaSidebar = ({
  msgs1,
  checked,
  dialogSelectedProductsAtualizar,
  setDialogSelectedProductsAtualizar,
  giroTemplate,
  unidadeMedidaLista,
  getItensPedido,
  pedidos,
  footerGroupPedido,
  loading3,
  template1,

  precoPedido,
  precoPedidoLinhaTotal,
  deletarItemPedido,
  loadingLojas,

  data_inclusao_template,
  saldo_estoque_template,
  sugestao_quantidade_compra,
  valor_unitario_template,
  quantidade_comprada_template,

  preco_media_venda_template,
  quantidade_vendida_template,
  quantidade_vendida_template2,
  quantidade_vendida_template3,
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
  editDialog,
  setEditDialog,
}) => {
  const [indexAtual, setIndexAtual] = useState(-1);
  const [produto, setProduto] = useState([]);
  const [editMode, setEditMode] = useState(false);
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
      matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
    },
    "filial.nome": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    "idproduto.ean": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const [index, setIndex] = useState(0);

  const [graficoMode, setGraficoMode] = useState(1);

  const [produtoGrafico, setProdutoGrafico] = useState([]);
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Quantidade vendida",

        font: {
          size: 16,
        },
      },

      legend: {
        position: "top",
        display: false,
      },
    },
  };

  let trinta = diasVenda - 30;
  let sessenta = diasVenda - 61;
  let noventa = diasVenda - 0;

  const basicData = {
    labels: [
      moment(moment.now()).subtract(noventa, "days").format("DD/MM/YYYY") +
        " a " +
        moment(moment.now()).subtract(61, "days").format("DD/MM/YYYY"),

      moment(moment.now()).subtract(trinta, "days").format("DD/MM/YYYY") +
        " a " +
        moment(moment.now()).subtract(30, "days").format("DD/MM/YYYY"),
      moment(moment.now()).subtract(sessenta, "days").format("DD/MM/YYYY") +
        " a " +
        moment(moment.now()).subtract(0, "days").format("DD/MM/YYYY"),
    ],
    datasets: [
      {
        label: `${produtoGrafico?.produto}`,
        data: [
          produtoGrafico?.quantidade_vendida4,
          produtoGrafico?.quantidade_vendida2,
          produtoGrafico?.quantidade_vendida3,
        ],
        fill: false,
        tension: 0.1,
        backgroundColor: "#42A5F5",
      },
    ],
  };

  const editar = (data, props) => {
    return (
      <>
        <Button
          className="p-button p-button-primary p-button-rounded p-button-sm"
          icon="pi pi-eye"
          tooltip="Visualizar detalhes"
          onClick={() => editarDialog(data, props)}
        />
      </>
    );
  };

  const onRowEditComplete = (e) => {
    let data = e;
    console.log(data);
    api
      .post(`/api/pedido/compra/salvar/${data?.idpedido?.id}`, {
        id: data.id,
       
        idpedido: { id: data?.idpedido?.id },
        idproduto: { id: data?.idproduto?.id },
        unidadeCompra: data?.unidadeCompra,
        quantidadeVenda: data?.quantidadeVenda,
        fatorConversao: data?.fatorConversao,

        embalagem: Intl.NumberFormat("pt-BR", {}).format(data?.embalagem),

        quantidade: quantidade,
      //  filial: { id: data?.filial.id },
        //  quantidade2: quantidade2,
        preco: data?.preco,
        total: quantidade * data?.preco,
      })
      .then((r) => {
        setEditMode(false);
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
  };

  const editarDialog = (data, props) => {
    console.log(data);
    setIndex(props.rowIndex);
    setEditDialog(true);
    setProduto(data);
    setQuantidade(data.quantidade);
    setFator(data.embalagem);
    setPreco(data.preco);
    setUnCompra(data.unidadeCompra);

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
            (tempoDiasPedido + tempoDiasEntrega + margemErroDiasEntrega) -
          (checked ? r.data[0].saldo_estoque : 0);

        setQuantidade(qtdeAComprar.toFixed());
        setProdutoSelecionado(r.data);
        setProdutoGrafico(r.data[0]);
        //  console.log(produtoGrafico);
      })
      .catch((e) => {})
      .finally((f) => {
        setLoadingLojas(false);
      });
  };

  const atualizarPedido = (data) => {
    if (!quantidade || !preco) {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Informe o preço e quantidade",
      });
    } else {
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
          setIndex(index + 1);
          setProduto(pedidos[index]);

          //  setEditDialog(true);

          setQuantidade(pedidos[index].quantidade);
          setFator(pedidos[index].embalagem);
          setPreco(pedidos[index].preco);
          setUnCompra(pedidos[index].unidadeCompra);

          dialogProdutoPorFilial(pedidos[index]);
          setProdutoGrafico(pedidos[index]);
          setProdutoSelecionado([]);
        })
        .catch((e) => {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: `${e.message} `,
          });
        })
        .finally((e) => {
          getItensPedido();
          //  setEditDialog(false);
        });
    }
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
            detail: `${e.message} `,
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
      <Toast ref={toast} position="top-center" />

      {editDialog ? (
        <>
          <div
            style={{
              width: "100%",
              height: "100%",
              margin: "0px auto",
              backgroundColor: "#F2F2F2",
            }}
          >
            <div style={{ width: "45%", margin: "0px auto" }}>
              <SelectButton
                value={graficoMode}
                optionLabel="name"
                options={[
                  { name: "Bar", value: 1 },
                  { name: "Line", value: 2 },
                ]}
                onChange={(e) => setGraficoMode(e.value)}
              />
              {graficoMode === 1 ? (
                <>
                  <Bar data={basicData} options={options} />
                </>
              ) : (
                <>
                  <Line data={basicData} options={options} />
                </>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center ",
              alignContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              backgroundColor: "#F2F2F2",
              padding: "5px",
            }}
          >
            <div
              style={{
                width: "100%",
                alignContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: "20px",
                }}
              >
                <h4>Quantidade atual </h4>
                <InputNumber
                  size={3}
                  value={
                    pedidos[index]?.quantidade ? pedidos[index]?.quantidade : 0
                  }
                  disabled
                />
                <h4>Nova Quantidade</h4>
                <InputNumber
                  min={0}
                  size={3}
                  required
                  autoFocus
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
                  size={1}
                  value={fator}
                  onChange={(e) => setFator(e.value)}
                />

                <h4>Custo / Novo Preço</h4>
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
                  }}
                />
                <div>
                  <h3>Total</h3>
                </div>
                <div>
                  <h1>{formataMoeda(quantidade * preco)}</h1>
                </div>
              </div>
              <h1
                style={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                  padding: "5px",
                  fontWeight: "800",
                  color: "#FFFF",
                  backgroundColor: "blue",
                  margin: "5px",
                }}
              >
                {index >= pedidos.length ? (
                  setEditDialog(false)
                ) : (
                  <>
                    <p>
                      # {index + 1} - <FaProductHunt />{" "}
                      {produto?.idproduto?.nome} - <FaStore />{" "}
                      {produto?.filial?.nome}
                    </p>
                  </>
                )}
              </h1>
              <div style={{ width: "100%", padding: "10px" }}>
                <DataTable
                  size="small"
                  emptyMessage="Sem dados para exibir no momento. Selecione um produto para análise"
                  loading={loadingLojas}
                  style={{ width: "100%", backgroundColor: "#F2F2F2" }}
                  value={produtoSelecionado}
                  responsiveLayout="stack"
                >
                  <Column
                    field={data_inclusao_template}
                    header="Nota fiscal última compra"
                  ></Column>
                  <Column
                    field={saldo_estoque_template}
                    header="Estoque"
                  ></Column>
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
            </div>
            <div>
              <Button
                disabled={index <= 0}
                className="p-button p-button-warn p-button-rounded"
                label="Anterior"
                icon="pi pi-arrow-left"
                onClick={() => {
                  setIndex(index - 1);
                  setProduto(pedidos[index]);

                  setEditDialog(true);

                  setQuantidade(pedidos[index].quantidade);
                  setFator(pedidos[index].embalagem);
                  setPreco(pedidos[index].preco);
                  setUnCompra(pedidos[index].unidadeCompra);

                  dialogProdutoPorFilial(pedidos[index]);
                  setProdutoSelecionado([]);
                  setProdutoSelecionadoTodasasLojas([]);
                }}
              />
            </div>
            <div>
              <Button
                disabled={index >= pedidos.length}
                className="p-button p-button-info p-button-rounded"
                label="Próximo"
                icon="pi pi-arrow-right"
                onClick={() => {
                  setIndex(index + 1);
                  setProduto(pedidos[index]);

                  setEditDialog(true);

                  setQuantidade(pedidos[index].quantidade);
                  setFator(pedidos[index].embalagem);
                  setPreco(pedidos[index].preco);
                  setUnCompra(pedidos[index].unidadeCompra);
                  setProdutoSelecionado([]);
                  dialogProdutoPorFilial(pedidos[index]);
                  setProdutoGrafico(pedidos[index]);
                }}
              />
            </div>
            <div>
              <Button
                className="p-button p-button-rounded p-button-danger"
                icon="pi pi-list"
                onClick={() => setEditDialog(false)}
                label="Voltar a lista"
              />
            </div>
            <div>
              <Button
                className="p-button p-button-success p-button-rounded"
                label="Gravar alteração"
                icon="pi pi-save"
                disabled={loadingLojas || index > pedidos.length}
                onClick={() => {
                  atualizarPedido(produto);
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <DataTable
            style={{ marginTop: "1px", backgroundColor: "#F2F2F2" }}
            // editMode="row"
            scrollable
            // resizableColumns
            // columnResizeMode="fit"
            size="small"
            showGridlines
            scrollHeight="650px"
            responsiveLayout="scroll"
            footer={`Existem ${pedidos.length} produto(s) adicionado(s) a lista de compras - Produtos selecionados ${selectedProductsPedido.length}`}
            footerColumnGroup={footerGroupPedido}
            value={pedidos}
            breakpoint="968px"
            rows={50}
            // stripedRows
            loading={loading3}
            //  paginator
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
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "1px" }}
            ></Column>
            <Column
              header="#"
              body={(data, props) => <div> {props.rowIndex + 1}</div>}
            ></Column>
           { /* <Column
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
            {/*
            <Column
              field="idproduto.ean"
              filter
              //  body={EanOrCodigoPedido}
              header="Código/Ean"
              ></Column>
              */}
            <Column
              style={{ minWidth: "600px" }}
              field="idproduto.nome"
              filter
              sortable
              header="Produto"
            ></Column>
            <Column
              field="quantidade"
              style={{ minWidth: "150px" }}
              filter
              filterClear
              filterMatchModeOptions={[
                {
                  label: "Maior ou igual a ",
                  value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
                },
                {
                  label: "Menor ou igual a ",
                  value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
                },
                { label: "Igual a ", value: FilterMatchMode.EQUALS },
              ]}
              sortable
              header="Quantidade"
            ></Column>
            <Column
              style={{ minWidth: "150px" }}
              header={editMode ? "Nova quantidade" : "Editar quantidade"}
              body={(data, props) => (
                <div>
                  {editMode === true && props.rowIndex + 1 === indexAtual ? (
                    <>
                      <InputNumber
                        size={3}
                        value={quantidade}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFracionDigits={2}
                        onChange={(e) => setQuantidade(e.value)}
                        autoFocus
                        style={{ margin: "1rem" }}
                      />
                      <Button
                        label="Gravar"
                        icon="pi pi-check"
                        className="p-button p-button-rounded p-button-sm"
                        onClick={() => onRowEditComplete(data)}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        icon="pi pi-pencil"
                        className="p-button p-button-rounded p-button-sm"
                        onClick={() => {
                          setEditMode(true);
                          setIndexAtual(props.rowIndex + 1);
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            />
            <Column
              style={{ minWidth: "150px" }}
              field="unidadeCompra.codigo"
              body={(data, props) => (
                <>
                  {data.unidadeCompra.codigo} ( {data.embalagem})
                </>
              )}
              sortable
              header="UN"
            ></Column>
            <Column
              field="preco"
              body={precoPedido}
              sortable
              header="Preço unitário "
            ></Column>
            <Column
              field={precoPedidoLinhaTotal}
              header="Preço Total "
            ></Column>

            <Column body={editar}></Column>
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

      <Dialog
        closable={false}
        visible={loadingLojas}
        header="Aguarde por favor"
      >
        <h4>Buscando dados de compra e venda</h4>
        <h2>{produto?.idproduto?.nome}</h2>
      </Dialog>
    </>
  );
};

export { PedidoListaSidebar };
