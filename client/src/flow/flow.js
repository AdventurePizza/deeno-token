import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export const getBalance = async (userAddress) => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.script`
import DeenoToken from 0x8389f671275a94c5
import FungibleToken from 0x9a0766d93b6608b7 

pub fun main(account: Address): UFix64? {
    let acct = getAccount(account)

    let cap = acct.getCapability<&{FungibleToken.Balance}>(/public/deenoTokenBalance)

    if let vault = cap.borrow() {
        return vault.balance
    }
    return nil;

}
  `,
        fcl.args([fcl.arg(userAddress, t.Address)]),
      ])
      .then((res) => {
        resolve(
          res.encodedData.value
            ? res.encodedData.value.value
            : res.encodedData.value
        );
      })
      .catch((e) => {
        console.log(e);
        resolve(-1);
      });
  });
};

export const getTotalSupply = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.script`
import DeenoToken from 0x8389f671275a94c5
import FungibleToken from 0x9a0766d93b6608b7 

pub fun main(): UFix64 {
    return DeenoToken.totalSupply
}
  `,
      ])
      .then((res) => {
        resolve(res.encodedData.value);
      });
  });
};

//setups account with vault
export const setupAccount = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.transaction`
import DeenoToken from 0x8389f671275a94c5
import FungibleToken from 0x9a0766d93b6608b7 

// This transaction configures an account to store and receive tokens defined by
// the DeenoToken contract.
transaction {

    prepare(signer: AuthAccount) {

        if signer.borrow<&DeenoToken.Vault>(from: /storage/deenoTokenVault) != nil {
            return
        }

        signer.save(
            <-DeenoToken.createEmptyVault(),
            to: /storage/deenoTokenVault
        )

        // Create a public capability to the Vault that only exposes
        // the deposit function through the Receiver interface
        signer.link<&DeenoToken.Vault{FungibleToken.Receiver}>(
            /public/deenoTokenReceiver,
            target: /storage/deenoTokenVault
        )

        // Create a public capability to the Vault that only exposes
        // the balance field through the Balance interface
        signer.link<&DeenoToken.Vault{FungibleToken.Balance}>(
            /public/deenoTokenBalance,
            target: /storage/deenoTokenVault
        )
    }
}

  `,
        fcl.proposer(fcl.authz),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(50),
      ])
      .then((res) => {
        fcl.decode(res);
        console.log(res);
        resolve(res.encodedData.value);
      });
  });
};
