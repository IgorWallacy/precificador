const formataMoeda = (data) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(data);
};

const meuNome = (data) => {
  console.log("igor");
};

export { formataMoeda, meuNome };
