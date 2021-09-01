# DAO explained

## Overview

The DAO is a fork of Compound Finance's current governance module (Governor Bravo), which is comprised of 4 main contracts:

### Token

`Comp.sol` encodes the token, which follows the ERC-20 standard and grants token holders voting power proportional to the number of tokens they own. These votes can be delegated to either themselves or a trusted delegate who will be able to vote on proposals on the token owner's behalf.

### Governor Bravo Delegate

`GovernorBravoDelegate.sol` contains the current implementation of the DAO. This contract allows token holders with voting power greater than the proposal threshold (between 50,000 - 100,000 votes) to create proposals that others can vote on. After a voting delay (up to 1 week) for participants to review the proposal, the voting period opens for at least 1 day and can last up to 2 weeks. For a proposal to pass, the number of for votes must be greater than the number of against votes and the number of for votes must meet the quorum of 400,000 votes. Once a proposal passes, it can be queued and then executed to go into effect.

### Governor Bravo Delegator

`GovernorBravoDelegator.sol` is the proxy that allows the DAO to be upgradeable. This contract is simply a wrapper that points to an implementation (currently `GovernorBravoDelegate`), but can be changed to a newer implementation of the DAO when appropriate.

### Timelock

`Timelock.sol` delays the implementation of actions passed by the governance module. The minimum delay is 2 days and can be increased up to 30 days for major changes. The purpose of this security feature is to ensure that the community is given enough time to react to and prepare for changes that are passed.

## Deployment

The deployment script can be found in `migrations/1_deploy.js` and can be used to deploy the DAO.

First, we deploy the token and pass in the developer address which receives the initial supply of tokens. Then, we deploy the timelock with the developer address and chosen timelock delay (between 2 and 30 days). The developer address is set as the temporary admin of the timelock. Next, we deploy the GovernorBravoDelegate contract. Finally, we pass in the timelock address, token address, developer address, GovernorBravoDelegate address, voting period, voting delay, and proposal threshold to deploy GovernorBravoDelegator.

After deploying these contracts, we set GovernorBravoDelegator as the admin of the timelock contract by first queueing this transaction. The function `queueTransaction` takes in 5 arguments: target contract address, value of ether, function signature, function data, and estimated time of arrival (ETA) where the ETA must satisfy the timelock delay. Once the transaction is queued and the ETA has arrived, the transaction can be executed by calling the function `executeTransaction` with the same 5 arguments. Note: there is a grace period of 14 days from the ETA where the transaction must be executed before it becomes stale.

Once GovernorBravoDelegator has been set as the admin of the Timelock contract, the `_initiate` function can be called which allows proposals to be created and the BOBA DAO is live!

## Changes to Compound's Governance Contracts

In `GovernorBravoDelegate.sol`, modify the `_initiate` function:

- Change line 326 to `proposalCount = 1;`
- Delete line 321
- Delete parameter (`address governorAlpha`) in line 323

```
    /**
      * @notice Initiate the GovernorBravo contract
      * @dev Admin only. Sets initial proposal id which initiates the contract, ensuring a continuous proposal id count
      */
    function _initiate() external {
        require(msg.sender == admin, "GovernorBravo::_initiate: admin only");
        require(initialProposalId == 0, "GovernorBravo::_initiate: can only initiate once");
        proposalCount = 1;
        initialProposalId = proposalCount;
        timelock.acceptAdmin();
    }
```

In `GovernorBravoInterfaces.sol`, delete `GovernorAlpha` Interface:

- Delete lines 179-182

## Testing Notes

- MINIMUM_DELAY in Timelock.sol set to 0 for allow for timely testing
