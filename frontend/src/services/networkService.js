import { ethers, Contract } from "ethers";
import Boba from "../contracts/Boba.json";
import GovernorBravoDelegate from "../contracts/GovernorBravoDelegate.json";
import GovernorBravoDelegator from "../contracts/GovernorBravoDelegator.json";
import Timelock from "../contracts/Timelock.json";

class NetworkService {
  constructor() {
    this.provider = null;
    this.networkId = null;
    this.chainID = null;
    this.boba = null;
    this.delegate = null;
    this.delegator = null;
  }

  async enableBrowserWallet() {
    try {
      // connect to the wallet
      await window.ethereum.enable();
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async initializeAccounts() {
    this.signer = this.provider.getSigner();
    this.account = await this.signer.getAddress();
    this.networkId = window.ethereum.networkVersion;
    return this.account;
    /*this.account = await this.provider.getSigner().getAddress();
    const network = await this.provider.getNetwork();
    this.chainID = network.chainId;*/
  }

  async updateBalance() {
    this.balance = parseInt(
      ethers.utils.formatEther(await this.boba.balanceOf(this.account))
    );
  }

  async updateVotes() {
    this.votes = parseInt(
      ethers.utils.formatEther(await this.boba.getCurrentVotes(this.account))
    );
  }

  async updateNumProposals() {
    const numProposals = await this.delegate.proposalCount();
    this.numProposals = await numProposals.toNumber();
  }

  async getProposals() {
    this.newProposals = [];
    this.newTitles = [];
    this.newDescriptions = [];
    const filter = this.delegate.filters.ProposalCreated(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    const allDescriptions = await this.delegate.queryFilter(filter);
    for (let i = this.numProposals; i > 1 && i > this.numProposals - 3; i--) {
      let newProposal = await this.delegate.getActions(i);
      this.newProposals.push(newProposal);
      let fullDescription = allDescriptions[i - 2].args[8].toString();
      let titleEnd = fullDescription.search(/\n/);
      let title = fullDescription.substring(0, titleEnd);
      let description = fullDescription.substring(titleEnd + 1);
      this.newDescriptions.push(description);
      this.newTitles.push(title);
    }
  }

  async initializeContracts() {
    if (!Boba.networks[this.networkId]) {
      return false;
    }
    this.boba = new Contract(
      Boba.networks[this.networkId].address,
      Boba.abi,
      this.signer
    );
    this.delegate = new Contract(
      GovernorBravoDelegator.networks[this.networkId].address,
      GovernorBravoDelegate.abi,
      this.signer
    );
    this.delegator = new Contract(
      GovernorBravoDelegator.networks[this.networkId].address,
      GovernorBravoDelegator.abi,
      this.signer
    );
    this.timelock = new Contract(
      Timelock.networks[this.networkId].address,
      Timelock.abi,
      this.signer
    );
    await this.updateBalance();
    await this.updateVotes();
    await this.updateNumProposals();
    await this.getProposals();

    return true;
  }

  async transfer(recipient, amount) {
    const tx = await this.boba.transfer(recipient, amount);
    await tx.wait();
    await this.updateBalance();
  }

  async delegateVotes(recipient) {
    const tx = await this.boba.delegate(recipient);
    await tx.wait();
    await this.updateVotes();
  }
}

const networkService = new NetworkService();
export default networkService;
