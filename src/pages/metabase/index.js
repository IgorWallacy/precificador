import React, { useEffect, useRef } from "react";

import Header from "../../components/header";
import Footer from "../../components/footer";
import api from "../../services/axios";
import { useNavigate } from "react-router-dom";

const Metabase = () => {
  const url = useRef(null);

  const navigate = useNavigate();

  const getDashboard = () => {
    return api
      .get("/api/metabase/dashboard")
      .then((r) => {
        url.current = r.data[0]?.url;
      })
      .catch((e) => {
        navigate("/menu");
      }).finally((f) => {

       // console.log(window.location.protocol+"//"+window.location.hostname+":3030"+url.current)
        if (url.current === undefined) {

            navigate("/menu");
          }
      })
      ;
  };

  useEffect(() => {
    getDashboard();
  }, []);

  return (
    <>
      <Header />
      <Footer />
      <div
        style={{
          height: "100vh",
          width: "100%",
          margin: "0px",
          padding: "0px",

          backgroundColor: "#f2f2f2",
        }}
      >
        <iframe
          style={{
            height: "100vh",
            width: "100%",
            border: "none",
            overflow: "hidden",
            backgroundColor: "#ffff",
          }}
          src={window.location.protocol+"//"+window.location.hostname+":3030"+url.current}
        />
      </div>
    </>
  );
};

export default Metabase;
