import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./CustoComposicaoDialog.css";

const CustoComposicaoDialog = ({
  visible,
  onHide,
  produtoCustoComposicao,
  produtoEmExibicaoSugestaoDialog,
}) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const calculateUnitValue = (totalValue, quantidade, embalagem) => {
    if (!totalValue || !quantidade || !embalagem) return 0;
    return totalValue / quantidade / embalagem;
  };

  const renderInfoSection = (title, items, color = "#1a1a1a") => (
    <div className="info-section">
      <h3 className="section-title">{title}</h3>
      <div className="section-content">
        {items.map((item, index) => (
          <div key={index} className="info-row">
            <span className="info-label" style={{ color }}>
              {item.label}
            </span>
            <span className="info-value" style={{ color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProductInfo = () => {
    const produto = produtoCustoComposicao[0];
    if (!produto) return null;

    return (
      <div className="product-info">
        <div className="product-header">
          <i className="pi pi-box product-icon"></i>
          <div className="product-details">
            <h2 className="product-name">{produto.produto}</h2>
            <div className="product-meta">
              <span className="meta-item">
                <i className="pi pi-sort-numeric-up"></i>
                Quantidade: {produto.quantidade}
              </span>
              <span className="meta-item">
                <i className="pi pi-ruler"></i>
                {produto.unidade} - Embalagem: {produto.embalagem}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCostBreakdown = () => {
    const produto = produtoCustoComposicao[0];
    if (!produto) return null;

    const sections = [
      {
        title: "Preços de Compra",
        color: "#1a1a1a",
        items: [
          {
            label: "Preço de Compra Total",
            value: formatCurrency(produto.precodecompra),
          },
          {
            label: "Preço de Compra Unitário",
            value: formatCurrency(
              calculateUnitValue(produto.precodecompra, produto.quantidade, produto.embalagem)
            ),
          },
        ],
      },
      {
        title: "Descontos",
        color: "#dc2626",
        items: [
          {
            label: "(-) Desconto Total",
            value: formatCurrency(produto.desconto),
          },
          {
            label: "(-) Desconto Unitário",
            value: formatCurrency(
              calculateUnitValue(produto.desconto, produto.quantidade, produto.embalagem)
            ),
          },
        ],
      },
      {
        title: "Impostos e Custos",
        color: "#059669",
        items: [
          {
            label: "(+) ICMS ST Total",
            value: formatCurrency(produto.icmsst),
          },
          {
            label: "(+) ICMS ST Unitário",
            value: formatCurrency(
              calculateUnitValue(produto.icmsst, produto.quantidade, produto.embalagem)
            ),
          },
          {
            label: "(+) FCP ST Total",
            value: formatCurrency(produto.fcpst),
          },
          {
            label: "(+) FCP ST Unitário",
            value: formatCurrency(
              calculateUnitValue(produto.fcpst, produto.quantidade, produto.embalagem)
            ),
          },
          {
            label: "(+) IPI Total",
            value: formatCurrency(produto.ipi),
          },
          {
            label: "(+) IPI Unitário",
            value: formatCurrency(
              calculateUnitValue(produto.ipi, produto.quantidade, produto.embalagem)
            ),
          },
          {
            label: "(+) Frete/Outras Despesas Total",
            value: formatCurrency(produto.frete),
          },
          {
            label: "(+) Frete/Outras Despesas Unitário",
            value: formatCurrency(
              calculateUnitValue(produto.frete, produto.quantidade, produto.embalagem)
            ),
          },
        ],
      },
    ];

    return (
      <div className="cost-breakdown">
        {sections.map((section, index) => (
          <div key={index} className="breakdown-section">
            {renderInfoSection(section.title, section.items, section.color)}
          </div>
        ))}
      </div>
    );
  };

  const renderTotalCost = () => {
    if (!produtoEmExibicaoSugestaoDialog?.precocusto) return null;

    return (
      <div className="total-cost">
        <div className="total-header">
          <i className="pi pi-calculator total-icon"></i>
          <h3>Custo Total Final</h3>
        </div>
        <div className="total-value">
          {formatCurrency(produtoEmExibicaoSugestaoDialog.precocusto)}
        </div>
      </div>
    );
  };

  return (
    <Dialog
      header={
        <div className="dialog-header">
          <i className="pi pi-calculator header-icon"></i>
          <span>Composição do Custo</span>
        </div>
      }
      visible={visible}
      position="center"
      style={{ width: "100%", maxWidth: "50vw" }}
      onHide={onHide}
      className="custo-composicao-dialog"
      closeOnEscape={true}
      closable={true}
    >
      <div className="dialog-content">
        {renderProductInfo()}
        {renderCostBreakdown()}
        {renderTotalCost()}
        
        <div className="dialog-actions">
          <Button
            icon="pi pi-times"
            className="p-button p-button-rounded p-button-danger p-button-sm"
            label="Fechar"
            onClick={onHide}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CustoComposicaoDialog;
