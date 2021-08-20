import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import Param from "./Param";
import networkService from "../../services/networkService.js";
import * as styles from "./Propose.module.scss";

function Action(props) {
  const { actions, contracts, index, setActions, setContracts, setCalldata } =
    props;
  const { delegate, timelock } = networkService;
  const [action, setAction] = useState(actions[index]);
  const [contract, setContract] = useState(contracts[index]);
  const interfaces = [delegate, timelock];
  const [n, setn] = useState(undefined);

  const [options, setOptions] = useState([]);
  const [params, setParams] = useState([]);
  const [paramNames, setParamNames] = useState([]);
  const [paramTypes, setParamTypes] = useState([]);

  let optionMarkup = options.map((fn, i) => (
    <option key={i} value={fn}>
      {fn}
    </option>
  ));
  const updateContracts = (e) => {
    e.preventDefault();
    let newContracts = contracts;
    newContracts[index] = e.target.value;
    setContract(e.target.value);
    setContracts(newContracts);
    let newActions = actions;
    newActions[index] = "";
    setAction("");
    setActions(newActions);
    let functions;
    let fn;
    let newOptions = [];
    for (let i = 0; i < interfaces.length; i++) {
      if (e.target.value === interfaces[i].address) {
        setn(i);
        functions = interfaces[i].interface.functions;
        for (let fragment in functions) {
          fn = interfaces[i].interface.getFunction(fragment);
          if (fn.stateMutability === "nonpayable") {
            newOptions.push(fn.name);
          }
        }
      }
    }
    setOptions(newOptions);
  };

  const updateData = (e, index) => {
    e.preventDefault();
    console.log(paramTypes);
    let newParams = params;
    newParams[index] = e.target.value;
    setParams(newParams);
    console.log(newParams);
    setCalldata(ethers.utils.defaultAbiCoder.encode(paramTypes, params));
  };

  let paramMarkup = paramNames.map((name, index) => (
    <Param
      key={index}
      index={index}
      name={name}
      type={paramTypes[index]}
      updateData={updateData}
    />
  ));
  const updateActions = (e) => {
    e.preventDefault();
    let newActions = actions;
    if (e.target.value !== "") {
      let fn = interfaces[n].interface.getFunction(e.target.value);
      newActions[index] = fn.format();
      setParams([]);
      setParamNames([]);
      setParamTypes([]);
      for (let i = 0; i < fn.inputs.length; i++) {
        setParams((params) => [...params, ""]);
        setParamNames((paramNames) => [...paramNames, fn.inputs[i].name]);
        setParamTypes((paramTypes) => [...paramTypes, fn.inputs[i].type]);
      }
    } else {
      newActions[index] = e.target.value;
    }
    setAction(e.target.value);
    setActions(newActions);
  };

  if (typeof delegate === "undefined" || typeof timelock === "undefined") {
    return "Loading...";
  }

  return (
    <div className={styles.Action}>
      <h3>{index + 1}.</h3>
      <div className={styles.column}>
        <select value={contract} onChange={(e) => updateContracts(e)}>
          <option value="select">Select a Contract</option>
          <option value="boba">Boba Fees</option>
          <option value={delegate.address}>Governor Bravo Delegate</option>
          <option value={timelock.address}>Timelock</option>
        </select>
        {options.length === 0 ? null : (
          <select value={action} onChange={(e) => updateActions(e)}>
            <option value="">Select a Function</option>
            {optionMarkup}
          </select>
        )}
        {options.length > 0 && action ? paramMarkup : null}
      </div>
    </div>
  );
}

export default Action;
