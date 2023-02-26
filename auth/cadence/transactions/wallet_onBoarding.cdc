import ChildAccount from "../contracts/ChildAccount.cdc"

transaction(pubKey: String, childAccountName: String, childAccountMailAdress: String, childAccountEMail: String) {
    prepare(parent: AuthAccount, client: AuthAccount) {
        // Get a reference to the signer's ChildAccountCreator
        let creatorRef = parent.borrow<&ChildAccount.ChildAccountCreator>(from: ChildAccount.ChildAccountCreatorStoragePath)
        ?? panic("No ChildAccountCreator in signer's account at ".concat(ChildAccount.ChildAccountCreatorStoragePath.toString()))
        
        // Construct the ChildAccountInfo metadata struct
        let info = ChildAccount.ChildAccountInfo(name: childAccountName, mailAdress: childAccountMailAdress, email: childAccountEMail, originatingPublicKey: pubKey)

        // Create the account
        creatorRef.addChildAccountTag(account: client, childAccountInfo: info)
    }
}