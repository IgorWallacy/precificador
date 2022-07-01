import PrecificadorAgenda from "../../pages/precificador/agenda/precificador-dataTable-novo";
import Typing from "react-typing-animation";
import { FcCalendar } from "react-icons/fc";
import DestaqueImg from "../../assets/img/undraw_projections_re_ulc6.svg";

import "./styles.css";

const Main = () => {
  return (
    <>
      <div className="agenda-label">
        <Typing speed={50}>
          <h1> Pesquisar notas fiscais de entrada </h1>

          <h4
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Agendar os preços de venda
          </h4>
        </Typing>
        <img style={{ width: "250px" }} src={DestaqueImg} />
      </div>

      <div className="container-flex">
        <PrecificadorAgenda />
      </div>
    </>
  );
};

export default Main;
