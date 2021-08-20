import React from "react";
import * as styles from "./Propose.module.scss";

function Param(props) {
  const { index, name, type, updateData } = props;

  return (
    <input
      type="text"
      placeholder={`${name} (${type})`}
      onChange={(e) => updateData(e, index)}
    ></input>
  );
}

export default Param;
