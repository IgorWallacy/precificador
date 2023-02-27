import React from "react";

import "primereact/resources/themes/lara-light-teal/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons

import { registerLicense } from "@syncfusion/ej2-base";

import ReactDOM from "react-dom";
import "./index.css";

import reportWebVitals from "./reportWebVitals";
import App from "./App";

// Registering Syncfusion license key
registerLicense(
  "ORg4AjUWIQA/Gnt2VVhkQlFadVdJXGFWfVJpTGpQdk5xdV9DaVZUTWY/P1ZhSXxQdkRjXn5XcnFWT2dbWUE="
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();
