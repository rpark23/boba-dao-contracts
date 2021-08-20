import React, { useState, useEffect } from "react";
import networkService from "../../services/networkService";
import Vote from "./Vote";
import { ethers } from "ethers";
import * as styles from "./Proposals.module.scss";

function Proposal(props) {
  const { id, proposal, title, description } = props;
  const { boba, delegate, provider } = networkService;

  const [contract, setContract] = useState(undefined);
  const [contractName, setContractName] = useState(undefined);
  const [data, setData] = useState(undefined);
  const [params, setParams] = useState([]);

  const [votePercent, setVotePercent] = useState(undefined);
  const [totalVotes, setTotalVotes] = useState(undefined);

  const [show, setShow] = useState(false);
  const [vote, setVote] = useState(undefined);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const init = async () => {
      console.log("pass");
      if (proposal[0][0] === delegate.address) {
        setContract(delegate);
        setContractName("GovernorBravo");
        let fn = await delegate.interface.getFunction(proposal[2][0]);
        setParams(fn.inputs);
        const proposalData = await delegate.proposals(id);
        setData(proposalData);

        let forVotes = ethers.utils.formatEther(proposalData.forVotes);
        forVotes = parseInt(forVotes);
        let againstVotes = ethers.utils.formatEther(proposalData.againstVotes);
        againstVotes = parseInt(againstVotes);
        let abstainVotes = ethers.utils.formatEther(proposalData.abstainVotes);
        abstainVotes = parseInt(abstainVotes);
        const totalVotes = forVotes + againstVotes;
        setTotalVotes(totalVotes);

        if (totalVotes > 0) {
          setVotePercent(Math.round((100 * forVotes) / totalVotes));
        } else {
          setVotePercent(50);
        }
      }
    };
    init();
  }, []);

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

  if (
    typeof contract === "undefined" ||
    typeof contractName === "undefined" ||
    typeof data === "undefined" ||
    typeof totalVotes === "undefined"
  ) {
    return null;
  }

  return (
    <>
      <div className={styles.Proposal} onClick={handleShow}>
        <div className={styles.info}>
          <h3>
            Proposal #{id}: {title}
          </h3>
          <div className={styles.proposalState}>
            <span className={styles.state}>Voting</span>
            <span>Approximately 1 day left</span>
          </div>
        </div>
        <div className={styles.status}>
          {/*<Vote id={id} />*/}
          <div className={styles.percent}>
            <p>{votePercent}%</p>
            <p>{100 - votePercent}%</p>
          </div>
          <div className={styles.percentBar}>
            <div className={styles.for} style={{ width: votePercent + "%" }} />
            <div
              className={styles.against}
              style={{ width: 100 - votePercent + "%" }}
            />
          </div>
          <p className={styles.votesIn}>
            {totalVotes.toLocaleString()} votes cast
          </p>
        </div>
      </div>
      {show ? (
        <>
          <div className={styles.modal}>
            <form
              className={styles.proposalVote}
              onSubmit={(e) => submitVote(e)}
            >
              <h2>Vote on Proposal {id}</h2>
              <input
                type="button"
                className={vote === 1 ? styles.black : ""}
                value="For"
                onClick={(e) => updateVote(e, 1)}
              />
              <input
                type="button"
                className={vote === 0 ? styles.black : ""}
                value="Against"
                onClick={(e) => updateVote(e, 0)}
              />
              <input
                type="button"
                className={vote === 2 ? styles.black : ""}
                value="Abstain"
                onClick={(e) => updateVote(e, 2)}
              />
              <button className={styles.close} onClick={handleClose}>
                x
              </button>
              <button type="submit" className={styles.submit}>
                <h4>Vote</h4>
              </button>
            </form>
          </div>
          <div className={styles.tint} />
        </>
      ) : null}
    </>
  );
}

export default Proposal;
