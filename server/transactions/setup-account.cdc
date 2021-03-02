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