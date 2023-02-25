import ChildAccount from 0x01

transaction(pubKey: String, childAccountName: String, childAccountMailAdress: String, childAccountEMail: String) {
    prepare(signer: AuthAccount) {
        // Get a reference to the signer's ChildAccountCreator
        let creatorRef = signer.borrow<&ChildAccount.ChildAccountCreator>(from: ChildAccount.ChildAccountCreatorStoragePath)
        ?? panic("No ChildAccountCreator in signer's account at ".concat(ChildAccount.ChildAccountCreatorStoragePath.toString()))
        // Construct the ChildAccountInfo metadata struct
        let info = ChildAccount.ChildAccountInfo(name: childAccountName, mailAdress: childAccountMailAdress, email: childAccountEMail, originatingPublicKey: pubKey)

        // Create the account
        let newAccount = creatorRef.createChildAccount(signer: signer, childAccountInfo: info)
    }
}