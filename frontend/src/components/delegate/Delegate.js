import React, { useState } from "react";
import networkService from "../../services/networkService";
import * as styles from "./Delegate.module.scss";

function Delegate() {
  const { votes } = networkService;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const delegateVotes = async (e) => {
    e.preventDefault();
    const recipient = e.target.elements[0].value;
    await networkService.delegateVotes(recipient);
  };
  return (
    <>
      <div>
        <h4>Voting Power</h4>
        <h3>{votes.toLocaleString()} BOBA</h3>
      </div>
      <button className={styles.delegate} onClick={handleShow}>
        Delegate BOBA
      </button>

      {show ? (
        <>
          <div className={styles.modal}>
            <form
              className={styles.delegateForm}
              onSubmit={(e) => delegateVotes(e)}
            >
              <h2>Delegate BOBA</h2>
              <input type="text" placeholder="Delegate Address" />
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

export default Delegate;
