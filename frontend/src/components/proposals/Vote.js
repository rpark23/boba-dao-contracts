import React, { useState, useEffect } from "react";
import networkService from "../../services/networkService";
import * as styles from "./Proposals.module.scss";

function Vote(props) {
  const { id } = props;
  const { delegate } = networkService;
  const [show, setShow] = useState(false);
  const [vote, setVote] = useState(undefined);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const submitVote = async (e) => {
    e.preventDefault();
    console.log(await delegate.castVote(id, vote));
    handleClose();
  };

  const updateVote = async (e, userVote) => {
    e.preventDefault();
    setVote(userVote);
    console.log(vote);
  };

  return (
    <>
      <button className={styles.vote} onClick={handleShow}>
        Vote Now
      </button>
      {show ? (
        <>
          <div className="modal">
            <form className="proposalVote" onSubmit={(e) => submitVote(e)}>
              <h2>Vote on Proposal {id}</h2>
              <input
                type="button"
                className={vote === 1 ? "black" : ""}
                value="For"
                onClick={(e) => updateVote(e, 1)}
              />
              <input
                type="button"
                className={vote === 0 ? "black" : ""}
                value="Against"
                onClick={(e) => updateVote(e, 0)}
              />
              <input
                type="button"
                className={vote === 2 ? "black" : ""}
                value="Abstain"
                onClick={(e) => updateVote(e, 2)}
              />
              <button className="close" onClick={handleClose}>
                x
              </button>
              <button type="submit" className="submit">
                <h4>Vote</h4>
              </button>
            </form>
          </div>
          <div className="tint" />
        </>
      ) : null}
    </>
  );
}

export default Vote;
