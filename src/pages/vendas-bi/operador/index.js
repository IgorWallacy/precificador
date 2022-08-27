import React, { useEffect } from "react";
import axios from "../../../services/axios";

const OperadorBI = () => {
  const getOperadores = () => {
    axios
      .get(`/api/vendas/bi/porOperador`)
      .then((r) => {
        console.log(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {});
  };

  return (
    <>
      <h1>Operadores</h1>
    </>
  );
};

export default OperadorBI;
