import React from "react";

import Main from "./components/main";

import Header from "./components/header";

import Footer from "./components/footer";

function App() {
  return (
    <>
      <div className="header">
        <Header />
      </div>
      <Footer />
      <Main />
    </>
  );
}

export default App;
