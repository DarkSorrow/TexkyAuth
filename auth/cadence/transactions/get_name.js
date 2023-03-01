export const template = 
`
import ChildAccount from {{MasterAdress}}

transaction(fundingChildAddress: Address) {
    prepare(parent: AuthAccount) {
       let managerRef = parent.borrow<&ChildAccount.ChildAccountManager>(from: ChildAccount.ChildAccountManagerStoragePath)
            ?? panic("Could not borrow reference to ChildAccountManager in signer's account at expected path!")
        let childAccount = managerRef.getChildAccountRef(address: fundingChildAddress)
            ?? panic("Could not get AuthAccount reference for specified address ")
        let tagRef = childAccount.borrow<&ChildAccount.ChildAccountTag>(from: ChildAccount.ChildAccountTagStoragePath)
            ?? panic("Could not borrow a reference to the child account's TicketToken Vault at expected path!")
        log(tagRef.info.name)
    }
}
 
`