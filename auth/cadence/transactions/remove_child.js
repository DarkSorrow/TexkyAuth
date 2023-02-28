export default template = 
`
import ChildAccount from {{MasterAdress}}

transaction(childAddress: Address) {

    let managerRef: &ChildAccount.ChildAccountManager
    
    prepare(signer: AuthAccount) {
        // Assign a reference to signer's ChildAccountmanager
        self.managerRef = signer.borrow<&ChildAccount.ChildAccountManager>(from: ChildAccount.ChildAccountManagerStoragePath) ?? panic("Signer does not have a ChildAccountManager configured!")
    }

    execute {
        // Remove child account, revoking any granted Capabilities
        self.managerRef.removeChildAccount(withAddress: childAddress)
    }
}
`