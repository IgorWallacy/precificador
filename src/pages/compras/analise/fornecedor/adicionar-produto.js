import { Toolbar } from "primereact/toolbar";

import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";

import { formataMoeda } from "../../../../util";

const teste = () => {
  return "aaaa";
};

const AdicionarProduto = ({
  indexP,
  produto,
  fecharTemplateRight,
  fecharTemplateLeft,
  preco,
  quantidade,
  lojaSelecionada,
  unidadeMedida,
  unidadeMedidaLista,
  fator,
  setFator,
  diasVenda,
  setQuantidade,
  setTotal,
  setPreco,
  toast3,
  setUnidadeMedida,
  produtoPorFilialLista,
  lojas,
  loadingLojas,
  eanUrl,
  produtoSelecionado,
  data_inclusao_template,
  saldo_estoque_template,
  sugestao_quantidade_compra,
  valor_unitario_template,

  preco_media_venda_template,
  quantidade_vendida_template,
  venda_diaria_template,
  total_template,
  dialogProdutoPorFilial,
  itemPorPedido,
  footerGroupPedidoProduto,
  loading2,
  precoPedido,
  precoPedidoLinhaTotal,
  deletarItemPedido,
  quantidade_comprada_template_02,
  total_comprado_template_02,
}) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontFamily: "cabin-sketch-bold",
            color: "#FFF",
            margin: "5px",
            fontSize: "50px",
          }}
        >
          {indexP} - {produto?.produto}
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "5px",
          justifyContent: "space-evenly",
          backgroundColor: "#f2f2f2",
          padding: "1px",
          margin: "1px",
          border: "10px solid #f2f2f2",
          borderTopLeftRadius: "50px",
          borderTopRightRadius: "50px",
        }}
      >
        <Toast ref={toast3} position="bottom" />
        <div>
          {produto?.ean ? produto?.ean : produto?.codigo}
          <br />
          <img
            style={{
              maxWidth: "100px",
              height: "100px",
              margin: "5px",
              borderRadius: "5px",
              padding: "5px",
            }}
            src={`${eanUrl}/${produto?.ean}`}
            onError={(e) =>
              (e.target.src =
                "https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png")
            }
            alt={produto?.ean}
          />
        </div>
        <div>
          <h4>
            Quantidade loja {lojaSelecionada?.id} - {lojaSelecionada?.nome}
          </h4>
          <InputNumber
            autoFocus
            style={{ width: "100%", marginTop: "10px" }}
            size={1}
            id="quantidade"
            disabled={lojaSelecionada ? false : true}
            value={quantidade}
            onChange={(e) => setQuantidade(e.value)}
            required
            onBlur={(e) => setTotal(preco * quantidade)}
          />
        </div>
        <div>
          <h4>UN Compra </h4>
          <Dropdown
            style={{ width: "100%", marginTop: "10px" }}
            required
            value={unidadeMedida}
            options={unidadeMedidaLista}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setUnidadeMedida(e.value)}
            placeholder="Selecione uma unidade"
          />
        </div>
        <div>
          <h4>Embalagem com </h4>
          <InputNumber
            style={{ width: "100%", marginTop: "10px" }}
            placeholder="Fator de conversão"
            value={fator}
            onChange={(e) => setFator(e.value)}
            onBlur={(e) => setTotal(preco * quantidade)}
          />
        </div>
        <div>
          <h4>Preço para compra</h4>
          <InputNumber
            style={{ width: "100%", marginTop: "10px" }}
            mode="decimal"
            prefix="R$ "
            locale="pt-BR"
            minFractionDigits={2}
            maxFractionDigits={2}
            id="preco"
            value={preco}
            onChange={(e) => setPreco(e.value)}
            required
            onBlur={(e) => setTotal(preco * quantidade)}
          />
        </div>
        <div>
          <h1>Subtotal </h1>
          <h1>{formataMoeda(preco * quantidade)}</h1>
        </div>

        <DataTable
          value={lojas}
          style={{ width: "100%" }}
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
            field={valor_unitario_template}
            header="Custo Últm.Compra"
          ></Column>

          <Column
            field={total_comprado_template_02}
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

        <DataTable
          style={{ width: "100%" }}
          value={itemPorPedido}
          footerColumnGroup={footerGroupPedidoProduto}
          responsiveLayout="stack"
          loading={loading2}
          emptyMessage="Nenhum produto adicionado a  lista"
        >
          <Column field="filial.id" header="Cód.Loja"></Column>
          <Column field="filial.nome" header="Loja"></Column>
          <Column field="idproduto.nome" header="Produto"></Column>

          <Column field="preco" header="Preço" body={precoPedido} />
          <Column field="unidadeCompra.nome" header="UN" />
          <Column field="fatorConversao" header="Emb" />
          <Column field="quantidade" header="Quantidade" />
          <Column field={precoPedidoLinhaTotal} header="Preço Total "></Column>

          <Column header="Deletar item" field={deletarItemPedido}></Column>
        </DataTable>
        <DataTable
          value={produtoSelecionado}
          responsiveLayout="stack"
          style={{ width: "100%", marginBottom: "70px" }}
        >
          <Column header="Loja" body="Todas" />

          <Column
            field={saldo_estoque_template}
            header="Estoque total"
          ></Column>

          <Column field={sugestao_quantidade_compra} header="Sugestão"></Column>

          <Column
            field={quantidade_comprada_template_02}
            header="Compra total no período"
          ></Column>

          <Column
            field={total_comprado_template_02}
            header="Total comprado no período"
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
      </div>
      <Toolbar
        style={{ backgroundColor: "#F2F2F2", position: "fixed", bottom: "1px" }}
        right={fecharTemplateRight}
        left={fecharTemplateLeft}
      />
    </>
  );
};

export { AdicionarProduto, teste };
