import React, { useState } from "react";
import networkService from "../../services/networkService";
import { ethers } from "ethers";
import * as styles from "./Transfer.module.scss";

function Transfer() {
  const { balance } = networkService;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const transferTokens = async (e) => {
    e.preventDefault();
    const recipient = e.target.elements[0].value;
    const amount = e.target.elements[1].value;
    await networkService.transfer(recipient, ethers.utils.parseEther(amount));
  };
  return (
    <>
      <div>
        <h4>Wallet Balance</h4>
        <h3>{balance.toLocaleString()} BOBA</h3>
      </div>
      <button className={styles.transfer} onClick={handleShow}>
        Transfer BOBA
      </button>

      {show ? (
        <>
          <div className={styles.modal}>
            <form
              className={styles.transferForm}
              onSubmit={(e) => transferTokens(e)}
            >
              <h2>Transfer BOBA</h2>
              <input type="text" placeholder="Recipient Address" />
              <input type="text" placeholder="Amount" />
              <button className={styles.close} onClick={handleClose}>
                x
              </button>
              <button type="submit" className={styles.send}>
                Send
              </button>
            </form>
          </div>
          <div className={styles.tint} />
        </>
      ) : null}
    </>
  );
}

export default Transfer;
