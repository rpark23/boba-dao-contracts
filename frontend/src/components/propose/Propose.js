import React, { useState, useEffect } from "react";
import networkService from "../../services/networkService";
import Action from "./Action";
import * as styles from "./Propose.module.scss";

function Propose() {
  const { delegate } = networkService;

  const [actions, setActions] = useState([""]);
  const [contracts, setContracts] = useState(["select"]);
  const [values, setValues] = useState([0]);
  const [calldata, setCalldata] = useState(undefined);

  let actionsMarkup = actions.map((action, index) => (
    <Action
      index={index}
      key={index}
      actions={actions}
      contracts={contracts}
      setActions={setActions}
      setContracts={setContracts}
      setCalldata={setCalldata}
    />
  ));

  const addAction = (e) => {
    e.preventDefault();
    setActions((actions) => [...actions, ""]);
    setContracts((contracts) => [...contracts, "select"]);
    setValues((values) => [...values, 0]);
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    console.log(contracts);
    console.log(values);
    console.log(actions);
    const nInputs = e.target.elements.length;
    console.log();
    delegate.propose(
      contracts,
      values,
      actions,
      [calldata],
      e.target.elements[nInputs - 3].value +
        "\n" +
        e.target.elements[nInputs - 2].value
    );
  };

  return (
    <div className={styles.Propose}>
      <h2>Create Proposal</h2>
      <form className={styles.proposalForm} onSubmit={(e) => submitProposal(e)}>
        <div className={styles.createProposal}>
          <div>
            <h3>Actions</h3>
            {actionsMarkup}
            <button className={styles.addAction} onClick={(e) => addAction(e)}>
              + Add an Action
            </button>
          </div>
          <div>
            <h3>Proposal Title</h3>
            <input className={styles.title}></input>
            <h3>Proposal Description</h3>
            <textarea className={styles.description}></textarea>
          </div>
        </div>
        <button type="submit" className={styles.submit}>
          Submit Proposal
        </button>
      </form>
    </div>
  );
}

export default Propose;
