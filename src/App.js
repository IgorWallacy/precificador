import "devextreme/dist/css/dx.light.css";
import "devextreme/dist/css/dx.light.css";
import "devextreme/dist/css/dx.light.css";


import React, { useEffect} from "react";

import { BrowserRouter } from "react-router-dom";

import Router from "./Routes";

function App() {


  


  return (
    <>
      <BrowserRouter>
       
          <div className="fullscreen">
            <div id="main">
              <Router />
            </div>
          </div>
        
      </BrowserRouter>
    </>
  );
}

export default App;
