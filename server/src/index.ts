require("dotenv").config();
const fcl = require("@onflow/fcl");
const path = require("path");
const fs = require("fs");

import Router from "./router";
import TransactionHandler from "./flow";
fcl.config().put("accessNode.api", process.env.ACCESS_NODE);

let txHandler;

let setupAccountTx;
let getBalanceTx;
let transferTokenTx;
let deployContractTx;
let contractCode;

const loadTx = () => {
  return new Promise<void>(async (resolve) => {
    setupAccountTx = fs.readFileSync(
      path.join(__dirname, `../transactions/setup-account.cdc`),
      "utf8"
    );

    getBalanceTx = fs.readFileSync(
      path.join(__dirname, `../scripts/get-balance.cdc`),
      "utf8"
    );

    transferTokenTx = fs.readFileSync(
      path.join(__dirname, `../transactions/transfer-token.cdc`),
      "utf8"
    );

    contractCode = fs.readFileSync(
      path.join(__dirname, `../contracts/DeenoToken.cdc`),
      "utf8"
    );

    deployContractTx = fs.readFileSync(
      path.join(__dirname, `../transactions/deploy-contract.cdc`),
      "utf8"
    );

    resolve();
  });
};

(async function main() {
  await loadTx();

  // allow users to request tokens
  Router.subscribe.transferToken(async (requestBody) => {
    const body = requestBody as {
      address: string;
    };

    const txId = await TransactionHandler.transferToken(body.address);

    console.log("transfer token complete with txId = ", txId);

    return { res: { txId } };
  });

  txHandler = new TransactionHandler(
    transferTokenTx,
    deployContractTx,
    getBalanceTx
  );

  await TransactionHandler.getBalance("0x8104a23cb080f65a");
})();
