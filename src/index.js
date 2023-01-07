import React from "react";
import ReactDOM from "react-dom/client";

import "primereact/resources/themes/lara-light-teal/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons

import { BrowserRouter } from "react-router-dom";

import Router from "./Routes";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <div className=" fullscreen">
        <div id="main">
          <Router />
        </div>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
