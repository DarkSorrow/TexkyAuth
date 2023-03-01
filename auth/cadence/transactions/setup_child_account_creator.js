export const template = 
`
import ChildAccount from {{MasterAdress}}

transaction {
    prepare(signer: AuthAccount) {
        // Return early if already configured
        if let creatorRef = signer.borrow<&ChildAccount.ChildAccountCreator>(from: ChildAccount.ChildAccountCreatorStoragePath) {
            return
        }
        signer.save(<-ChildAccount.createChildAccountCreator(), to: ChildAccount.ChildAccountCreatorStoragePath)
        // Link the public Capability
        signer.link<&{ChildAccount.ChildAccountCreatorPublic}>(ChildAccount.ChildAccountCreatorPublicPath,target: ChildAccount.ChildAccountCreatorStoragePath)
        if let managerRef = signer.borrow<&ChildAccount.ChildAccountManager>(from: ChildAccount.ChildAccountManagerStoragePath) {
            return
        }
        signer.save(<-ChildAccount.createChildAccountManager(), to: ChildAccount.ChildAccountManagerStoragePath)
        signer.link<&{ChildAccount.ChildAccountCreatorPublic}>(ChildAccount.ChildAccountCreatorPublicPath,target: ChildAccount.ChildAccountManagerStoragePath)
    }
}
`