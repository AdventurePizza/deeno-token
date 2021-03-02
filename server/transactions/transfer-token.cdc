import DeenoToken from 0x8389f671275a94c5
import FungibleToken from 0x9a0766d93b6608b7 

// This transaction is a template for a transaction that
// could be used by anyone to send tokens to another account
// that owns a Vault
transaction(address: Address) {

  // Temporary Vault object that holds the balance that is being transferred
  var temporaryVault: @FungibleToken.Vault

  prepare(acct: AuthAccount) {
    // withdraw tokens from your vault by borrowing a reference to it
    // and calling the withdraw function with that reference
    let vaultRef = acct.borrow<&DeenoToken.Vault>(from: /storage/deenoTokenVault)
        ?? panic("Could not borrow a reference to the owner's vault")
      
    self.temporaryVault<- vaultRef.withdraw(amount: 10.0)
  }

  execute {
    // get the recipient's public account object
    let recipient = getAccount(address)

    // get the recipient's Receiver reference to their Vault
    // by borrowing the reference from the public capability
    let receiverRef = recipient.getCapability(/public/deenoTokenReceiver)
                      .borrow<&DeenoToken.Vault{FungibleToken.Receiver}>()
                      ?? panic("Could not borrow a reference to the receiver")

    // deposit your tokens to their Vault
    receiverRef.deposit(from: <-self.temporaryVault)

  }
}