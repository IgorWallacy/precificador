import PrecificadorAgenda from "../../pages/precificador/agenda/precificador-dataTable-novo";
import Typing from "react-typing-animation";
import DestaqueImg from "../../assets/img/undraw_projections_re_ulc6.svg";

import "./styles.css";

const Main = () => {
  return (
    <>
      <div className="agenda-label">
        <h1 style={{ fontFamily: "cabin-sketch-bold" }}>
          Pesquisar notas fiscais de entrada,
        </h1>

        <h4
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "cabin-sketch-bold",
          }}
        >
          Agendar os preços de venda
        </h4>

        <img style={{ width: "250px" }} src={DestaqueImg} />
      </div>

      <div className="container-flex">
        <PrecificadorAgenda />
      </div>
    </>
  );
};

export default Main;
