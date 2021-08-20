import React, { useState, useEffect } from "react";
import * as styles from "./App.module.scss";
import NavBar from "../../components/navBar/NavBar";
import Home from "../home/Home";
import networkService from "../../services/networkService";

function App() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const init = async () => {
      await networkService.enableBrowserWallet();
      await networkService.initializeAccounts();
      setEnabled(await networkService.initializeContracts());
    };
    init();
  });

  return (
    <div className={styles.App}>
      <NavBar enabled={enabled} />
      {enabled ? <Home /> : "Connect Wallet"}
    </div>
  );
}

export default App;
