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

}