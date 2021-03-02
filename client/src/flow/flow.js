import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export const addDog = (dogName) => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.transaction`
  import DogHotel from 0xe03daebed8ca0615

    transaction(dogName: String) {
      prepare(contractOwner: AuthAccount) {
        DogHotel.addDog(dog: dogName)
      }
    }
  `,
        fcl.args([fcl.arg(dogName, t.String)]),
        fcl.proposer(fcl.authz),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz]),
      ])
      .then((res) => {
        fcl.decode(res);
        console.log(res);
        console.log("finished deploying!", res.transactionId);
        resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};

export const getDogs = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.script`
 import DogHotel from 0xe03daebed8ca0615

pub fun main(): [String] {
    return DogHotel.getDogs()
}

  `,
      ])
      .then((res) => {
        fcl.decode(res);
        resolve(res.encodedData.value);
      });
  });
};

export const helloWorld = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.script`
import HelloWorld from 0x01cf0e2f2f715450

pub fun main(): String {
    return HelloWorld.hello()
}

  `,
      ])
      .then((res) => {
        fcl.decode(res);
        resolve(res.encodedData.value);
        // resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};

export const getBalance = async (userAddress) => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.script`
import DeenoToken from 0x8389f671275a94c5
import FungibleToken from 0x9a0766d93b6608b7 

pub fun main(account: Address): UFix64? {
    let acct = getAccount(account)
    // let acct = getAccount(0x8104a23cb080f65a)

    let cap = acct.getCapability<&{FungibleToken.Balance}>(/public/deenoTokenBalance)

    if let vault = cap.borrow() {
        return vault.balance
    }
    return nil;

    // let vaultRef = acct.getCapability(/public/deenoTokenBalance)
    //     .borrow<&DeenoToken.Vault{FungibleToken.Balance}>()
    //     ?? panic("Could not borrow Balance reference to the Vault")

    //     return vaultRef.balance

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
        // resolve(res.encodedData.value);
        resolve("");
        // resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};

export const transferToken = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.transaction`
// Transfer Tokens

import DeenoToken from 0x8389f671275a94c5
import FungibleToken from 0x9a0766d93b6608b7 

// This transaction is a template for a transaction that
// could be used by anyone to send tokens to another account
// that owns a Vault
transaction {

  // Temporary Vault object that holds the balance that is being transferred
  var temporaryVault: @FungibleToken.Vault

  prepare(acct: AuthAccount) {
    // withdraw tokens from your vault by borrowing a reference to it
    // and calling the withdraw function with that reference
    let vaultRef = acct.borrow<&DeenoToken.Vault>(from: /storage/deenoTokenVault)
        ?? panic("Could not borrow a reference to the owner's vault")
      
    self.temporaryVault<- vaultRef.withdraw(amount: 990.0)
  }

  execute {
    // get the recipient's public account object
    let recipient = getAccount(0x8104a23cb080f65a)

    // get the recipient's Receiver reference to their Vault
    // by borrowing the reference from the public capability
    let receiverRef = recipient.getCapability(/public/deenoTokenReceiver)
                      .borrow<&DeenoToken.Vault{FungibleToken.Receiver}>()
                      ?? panic("Could not borrow a reference to the receiver")

    // deposit your tokens to their Vault
    receiverRef.deposit(from: <-self.temporaryVault)

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
        // resolve(res.encodedData.value);
        console.log(res);
        resolve("");
        // resolve(fcl.tx(res.transactionId).onceSealed());
      })
      .catch(console.log);
  });
};

export const mintNFT = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.transaction`
import ExampleNFT from 0xe03daebed8ca0615
import NonFungibleToken from 0xe03daebed8ca0615

// This script uses the NFTMinter resource to mint a new NFT
// It must be run with the account that has the minter resource
// stored in /storage/NFTMinter

transaction(recipient: Address) {

    // local variable for storing the minter reference
    let minter: &ExampleNFT.NFTMinter

    prepare(signer: AuthAccount) {

        // borrow a reference to the NFTMinter resource in storage
        self.minter = signer.borrow<&ExampleNFT.NFTMinter>(from: /storage/NFTMinter)
            ?? panic("Could not borrow a reference to the NFT minter")
    }

    execute {
        // Borrow the recipient's public NFT collection reference
        let receiver = getAccount(recipient)
            .getCapability(/public/NFTCollection)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        // Mint the NFT and deposit it to the recipient's collection
        self.minter.mintNFT(recipient: receiver)
    }
}


  `,
        fcl.args([fcl.arg("0xe03daebed8ca0615", t.Address)]),
        fcl.proposer(fcl.authz),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(50),
      ])
      .then((res) => {
        fcl.decode(res);
        // resolve(res.encodedData.value);
        resolve("");
        // resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};

export const printNFTs = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.script`
import ExampleNFT from 0xe03daebed8ca0615
import NonFungibleToken from 0xe03daebed8ca0615

// This transaction returns an array of all the nft ids in the collection

pub fun main(account: Address): [UInt64] {
    let collectionRef = getAccount(account)
        .getCapability(/public/NFTCollection)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")

    return collectionRef.getIDs()
}


  `,
        // fcl.args([fcl.arg("0x045a1763c93006ca", t.Address)]),
        fcl.args([fcl.arg("0xe03daebed8ca0615", t.Address)]),
        // fcl.proposer(fcl.authz),
        // fcl.payer(fcl.authz),
        // fcl.authorizations([fcl.authz]),
        // fcl.limit(50),
      ])
      .then((res) => {
        fcl.decode(res);
        console.log(res);
        // resolve(res.encodedData.value);
        resolve("");
        // resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};

export const transferNFT = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.transaction`
import ExampleNFT from 0xe03daebed8ca0615
import NonFungibleToken from 0xe03daebed8ca0615

// This transaction is for transferring and NFT from
// one account to another

transaction(recipient: Address, withdrawID: UInt64) {

    prepare(acct: AuthAccount) {

        // get the recipients public account object
        let recipient = getAccount(recipient)

        // borrow a reference to the signer's NFT collection
        let collectionRef = acct.borrow<&ExampleNFT.Collection>(from: /storage/NFTCollection)
            ?? panic("Could not borrow a reference to the owner's collection")

        // borrow a public reference to the receivers collection
        let depositRef = recipient.getCapability(/public/NFTCollection)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow a reference to the receiver's collection")

        // withdraw the NFT from the owner's collection
        let nft <- collectionRef.withdraw(withdrawID: withdrawID)

        // Deposit the NFT in the recipient's collection
        depositRef.deposit(token: <-nft)
    }
}


  `,
        fcl.args([
          fcl.arg("0x045a1763c93006ca", t.Address),
          fcl.arg(0, t.UInt64),
        ]),
        fcl.proposer(fcl.authz),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(50),
      ])
      .then((res) => {
        fcl.decode(res);
        // resolve(res.encodedData.value);
        resolve("");
        // resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};

export const setupAccountNFT = () => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.transaction`
import ExampleNFT from 0xe03daebed8ca0615
import NonFungibleToken from 0xe03daebed8ca0615

// This transaction is what an account would run
// to set itself up to receive NFTs

transaction {

    prepare(acct: AuthAccount) {

        // Return early if the account already has a collection
        if acct.borrow<&ExampleNFT.Collection>(from: /storage/NFTCollection) != nil {
            return
        }

        // Create a new empty collection
        let collection <- ExampleNFT.createEmptyCollection()

        // save it to the account
        acct.save(<-collection, to: /storage/NFTCollection)

        // create a public capability for the collection
        acct.link<&{NonFungibleToken.CollectionPublic}>(
            /public/NFTCollection,
            target: /storage/NFTCollection
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
        // resolve(res.encodedData.value);
        resolve("");
        // resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};

export const getFlowBalance = (address = "0x8389f671275a94c5") => {
  return new Promise(async (resolve) => {
    await fcl
      .send([
        fcl.script`
// import ExampleToken from 0xe03daebed8ca0615
// import FungibleToken from 0xee82856bf20e2aa6
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868 

pub fun main(address: Address): UFix64 {
    let acct = getAccount(address)

    let acctReceiverRef = acct.getCapability<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)
        .borrow()
        ?? panic("Could not borrow a reference to the acct receiver")

    // Read and log balance fields
    // log("Account Balance")
    // log(acctReceiverRef.balance)
    return acctReceiverRef.balance
}

  `,
        fcl.args([fcl.arg(address, t.Address)]),
      ])
      .then((res) => {
        fcl.decode(res);
        console.log(res);
        resolve(res.encodedData.value);
        // resolve(fcl.tx(res.transactionId).onceSealed());
      });
  });
};
