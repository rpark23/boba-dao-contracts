import React from "react";
import * as styles from "./Home.module.scss";
import Transfer from "../../components/transfer/Transfer";
import Delegate from "../../components/delegate/Delegate";
import Proposals from "../../components/proposals/Proposals";
import Propose from "../../components/propose/Propose";

function Home() {
  return (
    <div className={styles.Home}>
      <h1>BOBA DAO</h1>
      <div className={styles.info}>
        <Transfer />
        <Delegate />
      </div>
      <Proposals />
      <Propose />
    </div>
  );
}

export default Home;
