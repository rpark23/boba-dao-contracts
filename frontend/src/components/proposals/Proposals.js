import React from "react";
import networkService from "../../services/networkService";
import Proposal from "./Proposal";
import * as styles from "./Proposals.module.scss";

function Proposals() {
  const { newDescriptions, newProposals, newTitles, numProposals } =
    networkService;

  let proposalsMarkup = newProposals.map((proposal, index) => (
    <Proposal
      key={index}
      id={numProposals - index}
      proposal={proposal}
      title={newTitles[index]}
      description={newDescriptions[index]}
    />
  ));

  return (
    <div className={styles.Proposals}>
      <h2>Newest Proposals</h2>
      {proposalsMarkup}
    </div>
  );
}

export default Proposals;
