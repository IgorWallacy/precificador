import React, { useEffect, useRef, useState } from "react";

import Header from "../../components/header";
import Footer from "../../components/footer";
import api from "../../services/axios";

import { ProgressBar } from "primereact/progressbar";

import { useNavigate } from "react-router-dom";

const Metabase = () => {
  const url = useRef(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getDashboard = () => {
    setLoading(true);
    return api
      .get("/api/metabase/dashboard")
      .then((r) => {
        url.current = r.data[0]?.url;
      })
      .catch((e) => {
        navigate("/menu");
      })
      .finally((f) => {
        if (url.current === undefined) {
          navigate("/menu");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    getDashboard();
  }, []);

  return (
    <>
      <Header />
      <Footer />
      {loading ? (
        <>
          <ProgressBar
            mode="indeterminate"
            style={{ height: "6px" }}
          ></ProgressBar>
        </>
      ) : (
        <>
          <div
            style={{
              height: "100vh",
              width: "100%",

              // backgroundColor: "#f2f2f2",
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
              src={`${window.location.protocol}//${window.location.hostname}:3030${url.current}`}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Metabase;
