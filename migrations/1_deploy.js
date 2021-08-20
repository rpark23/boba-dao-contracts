const { ethers } = require("ethers");

const Boba = artifacts.require("Boba");
const Timelock = artifacts.require("Timelock");
const GovernorBravoDelegate = artifacts.require("GovernorBravoDelegate");
const GovernorBravoDelegator = artifacts.require("GovernorBravoDelegator");

module.exports = async function (deployer) {
  const provider = new ethers.providers.JsonRpcProvider();
  const accounts = await provider.listAccounts();

  // Deploy Boba, Timelock, GovernorBravoDelegate
  await deployer.deploy(Boba, accounts[0]);
  const boba = await Boba.deployed();

  await deployer.deploy(Timelock, accounts[0], 0); //Increse Timelock!
  const timelock = await Timelock.deployed();

  await deployer.deploy(GovernorBravoDelegate);
  const delegate = await GovernorBravoDelegate.deployed();

  // Deploy GovernorBravoDelegator
  await deployer.deploy(
    GovernorBravoDelegator,
    timelock.address,
    boba.address,
    accounts[0],
    delegate.address,
    5760,
    1,
    ethers.utils.parseEther("100000")
  );
  const delegator = await GovernorBravoDelegator.deployed();

  // Set Delegator as pending admin
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

  await timelock.executeTransaction(
    timelock.address,
    0,
    "setPendingAdmin(address)",
    data,
    eta
  );

  const GovernorBravo = await GovernorBravoDelegate.at(delegator.address);
  GovernorBravo._initiate();

  for (let i = 1; i < 10; i++) {
    await boba.transfer(accounts[i], ethers.utils.parseEther("1000000"));
    await boba.delegate(accounts[i], { from: accounts[i] });
  }
  boba.delegate(accounts[0]);

  await GovernorBravo.propose(
    [delegator.address],
    [0],
    ["_setVotingPeriod(uint256)"],
    [ethers.utils.defaultAbiCoder.encode(["uint256"], [7 * 5760])],
    "Increase Voting Period\nGive BOBA users more time to vote on proposals"
  );

  await GovernorBravo.propose(
    [delegator.address],
    [0],
    ["_setVotingDelay(uint256)"],
    [ethers.utils.defaultAbiCoder.encode(["uint256"], [2 * 5760])],
    "Increase Voting Delay\nAllow BOBA users more time to review proposals",
    { from: accounts[1] }
  );

  await GovernorBravo.castVote(2, 1);
};
