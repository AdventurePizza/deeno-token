const t = require("@onflow/types");
const authorization = require("./authorization.js");
const fcl = require("@onflow/fcl");

export default class TransactionHandler {
  private static transferTokenTx: string;
  private static deployContractTx: string;
  private static getBalanceTx: string;

  constructor(transferTokenTx, deployContractTx, getBalanceTx) {
    TransactionHandler.transferTokenTx = transferTokenTx;
    TransactionHandler.deployContractTx = deployContractTx;
    TransactionHandler.getBalanceTx = getBalanceTx;
  }

  public static transferToken = async (address) => {
    const txId = await fcl
      .send([
        fcl.transaction`${TransactionHandler.transferTokenTx}`,
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

  public static deployContract = async (
    contractCode: string,
    contractName: string
  ) => {
    const hexCode = Buffer.from(contractCode, "utf8").toString("hex");

    const txId = await fcl
      .send([
        fcl.transaction`${TransactionHandler.deployContractTx}`,
        fcl.proposer(authorization),
        fcl.payer(authorization),
        fcl.authorizations([authorization]),
        fcl.limit(1000),
        fcl.args([fcl.arg(hexCode, t.String), fcl.arg(contractName, t.String)]),
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
  public static getBalance = async (address: string) => {
    return new Promise(async (resolve, reject) => {
      await fcl
        .send([
          fcl.script`${TransactionHandler.getBalanceTx}`,
          fcl.proposer(authorization),
          fcl.payer(authorization),
          fcl.authorizations([authorization]),
          fcl.limit(1000),
          fcl.args([fcl.arg(address, t.Address)]),
        ])
        .then((res) => resolve(res))
        .catch((e) => {
          console.log(e);
          reject(e);
        });
    });
  };
}
