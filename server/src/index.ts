require("dotenv").config();
var fcl = require("@onflow/fcl");
var t = require("@onflow/types");
var authorization = require("./authorization.js");
const path = require("path");
const fs = require("fs");

import Router from "./router";

// console.log({
//   FLOW_ACCOUNT_ADDRESS: process.env.FLOW_ACCOUNT_ADDRESS,
//   FLOW_ACCOUNT_KEY_ID: process.env.FLOW_ACCOUNT_KEY_ID,
//   FLOW_ACCOUNT_PRIVATE_KEY: process.env.FLOW_ACCOUNT_PRIVATE_KEY,
//   authorization: authorization({}),
// });

fcl.config().put("accessNode.api", process.env.ACCESS_NODE);

async function main() {
  var txId = await fcl
    .send([
      //   fcl.transaction`${setupAccount}`,
      fcl.script`${getBalanceTx}`,
      fcl.proposer(authorization),
      fcl.payer(authorization),
      fcl.authorizations([authorization]),
      fcl.limit(1000),
      fcl.args([
        fcl.arg("0x8104a23cb080f65a", t.Address),
        //     fcl.arg(Buffer.from(CONTRACT_CODE, "utf8").toString("hex"), t.String),
      ]),
    ])
    // .then(fcl.decode)
    .then(console.log)
    .catch((e) => console.log("error", e));

  //   if (!txId) return;

  //   console.log("txId", txId);

  //   var unsub = fcl
  //     .tx(txId)
  //     .subscribe((txStatus) => console.log("txStatus", txStatus));
  //   await fcl.tx(txId).onceSealed();
  //   unsub();
}

let setupAccountTx;
let getBalanceTx;
let transferTokenTx;

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

    resolve();
  });
};

const transferToken = async (address) => {
  const txId = await fcl
    .send([
      fcl.transaction`${transferTokenTx}`,
      fcl.proposer(authorization),
      fcl.payer(authorization),
      fcl.authorizations([authorization]),
      fcl.limit(1000),
      fcl.args([fcl.arg(address, t.Address)]),
    ])
    .then(fcl.decode)
    .catch((e) => console.log("error", e));

  if (!txId) return;

  console.log("txId", txId);

  var unsub = fcl
    .tx(txId)
    .subscribe((txStatus) => console.log("txStatus", txStatus));
  await fcl.tx(txId).onceSealed();
  unsub();

  return txId;
};

const run = async () => {
  await loadTx();

  Router.subscribe.transferToken(async (requestBody) => {
    const body = requestBody as {
      address: string;
    };

    const txId = await transferToken(body.address);

    console.log("transfer token complete with txId = ", txId);

    return { res: { txId } };
  });

  main();
};

run();
