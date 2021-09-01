const { ethers } = require("ethers");

const Comp = artifacts.require("Comp");
const Timelock = artifacts.require("Timelock");
const GovernorBravoDelegate = artifacts.require("GovernorBravoDelegate");
const GovernorBravoDelegator = artifacts.require("GovernorBravoDelegator");

module.exports = async function (deployer) {
  const provider = new ethers.providers.JsonRpcProvider();
  const developer = "DEVELOPER_ADDRESS";

  // Deploy Comp, Timelock, GovernorBravoDelegate
  await deployer.deploy(Comp, developer);
  const comp = await Comp.deployed();

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
    comp.address,
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
  await GovernorBravo._initiate();
};
