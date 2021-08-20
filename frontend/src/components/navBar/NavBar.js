import React, { useState, useEffect } from "react";
import * as styles from "./NavBar.module.scss";
import networkService from "../../services/networkService";

function NavBar(props) {
  const { enabled } = props;
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { account } = networkService;
      if (!account) {
        setNetwork("Not Connected");
      } else if (!enabled) {
        setNetwork("Wrong Network");
      } else {
        setNetwork("BOBA");
        setAddress(
          account.substr(0, 6) + "..." + account.substr(account.length - 4)
        );
      }
    };
    init();
  });

  return (
    <div className={styles.NavContainer}>
      <div className={styles.nav}>
        <div className={styles.logo}>
          <a href="index.html">
            <img src="img/enya.png" alt="Enya Logo" />
          </a>
        </div>
        <div className={styles.account}>
          {network ? <p className={styles.network}>{network}</p> : null}
          {address ? <p className={styles.address}>{address}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
