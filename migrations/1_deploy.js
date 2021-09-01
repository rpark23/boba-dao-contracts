const { ethers } = require("ethers");

const Boba = artifacts.require("Boba");
const Timelock = artifacts.require("Timelock");
const GovernorBravoDelegate = artifacts.require("GovernorBravoDelegate");
const GovernorBravoDelegator = artifacts.require("GovernorBravoDelegator");

module.exports = async function (deployer, network, accounts) {
  const provider = new ethers.providers.JsonRpcProvider();
  const developer = accounts[0];

  // Deploy Boba, Timelock, GovernorBravoDelegate
  await deployer.deploy(Boba, developer);
  const boba = await Boba.deployed();

  const TIMELOCK_DELAY = 0;
  await deployer.deploy(Timelock, developer, TIMELOCK_DELAY);
  const timelock = await Timelock.deployed();

  await deployer.deploy(GovernorBravoDelegate);
  const delegate = await GovernorBravoDelegate.deployed();

  // Deploy GovernorBravoDelegator
  const VOTING_PERIOD = 5760; // block(s)
  const VOTING_DELAY = 1; // block(s)
  const PROPOSAL_THRESHOLD = 50000; // tokens
  await deployer.deploy(
    GovernorBravoDelegator,
    timelock.address,
    boba.address,
    developer,
    delegate.address,
    VOTING_PERIOD,
    VOTING_DELAY,
    ethers.utils.parseEther(PROPOSAL_THRESHOLD.toString())
  );
  const delegator = await GovernorBravoDelegator.deployed();

  // Queue Delegator as pending admin
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  const eta = block.timestamp + 3;
  const data = ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [delegator.address]
  );
  await timelock.queueTransaction(
    timelock.address,
    0,
    "setPendingAdmin(address)",
    data,
    eta
  );

  const sleep = (timeout) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  };

  console.log("Waiting for timelock...");
  await sleep(5000);

  // Execute Delegator as pending admin
  await timelock.executeTransaction(
    timelock.address,
    0,
    "setPendingAdmin(address)",
    data,
    eta
  );

  const GovernorBravo = await GovernorBravoDelegate.at(delegator.address);
  GovernorBravo._initiate();

  // Transfer 1,000,000 tokens to other accounts and claim voting power
  for (let i = 1; i < 10; i++) {
    await boba.transfer(accounts[i], ethers.utils.parseEther("1000000"));
    await boba.delegate(accounts[i], { from: accounts[i] });
  }
  await boba.delegate(developer);

  // Create a Proposal to Increase Voting Period to 7 days
  await GovernorBravo.propose(
    [delegator.address],
    [0],
    ["_setVotingPeriod(uint256)"],
    [ethers.utils.defaultAbiCoder.encode(["uint256"], [7 * 5760])],
    "Increase Voting Period\nGive BOBA users more time to vote on proposals"
  );

  // Create a Proposal to Increase Voting Delay to 2 days
  await GovernorBravo.propose(
    [delegator.address],
    [0],
    ["_setVotingDelay(uint256)"],
    [ethers.utils.defaultAbiCoder.encode(["uint256"], [2 * 5760])],
    "Increase Voting Delay\nAllow BOBA users more time to review proposals",
    { from: accounts[1] }
  );

  // Vote in support of proposal #2 (0 = against, 1 = for, 2 = abstain)
  await GovernorBravo.castVote(2, 1);
};
