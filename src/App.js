import React from "react";

import Main from "./components/main";

import Header from "./components/header";

function App() {
  return (
    <>
    
    <div className="header">
        <Header/>
      </div>

      <div className="container-flex">
        <Main />
       
      </div>

      
      
    </>
  );
}

export default App;
