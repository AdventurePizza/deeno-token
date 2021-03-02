import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export const deploy = async (code, name) => {
  return new Promise(async (resolve) => {
    const hexCode = Buffer.from(code, "utf8").toString("hex");

    await fcl
      .send([
        fcl.transaction`
    transaction(codeAsHexString: String, name: String) {
      prepare(contractOwner: AuthAccount) {
        contractOwner.contracts.add(name: name, code: codeAsHexString.decodeHex())
      }
    }
  `,
        fcl.args([fcl.arg(hexCode, t.String), fcl.arg(name, t.String)]),
        fcl.proposer(fcl.authz),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(50),
      ])
      .then((res) => {
        fcl.decode(res);
        console.log(res);
        console.log("finished deploying!", res.transactionId);
        resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};
