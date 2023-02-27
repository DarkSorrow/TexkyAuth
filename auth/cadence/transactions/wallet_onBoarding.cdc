import ChildAccount from "../contracts/ChildAccount.cdc"

transaction(pubKey: String, childAccountName: String, childAccountMailAdress: String, childAccountEMail: String, childAccountAge: UInt64) {
    prepare(parent: AuthAccount, client: AuthAccount) {
        let managerRef = signer.borrow<&ChildAccount.ChildAccountManager>(from: ChildAccount.ChildAccountManagerStoragePath)
        ?? panic("No ChildAccountCreator in signer's account at ".concat(ChildAccount.ChildAccountCreatorStoragePath.toString()))
        
        // Construct the ChildAccountInfo metadata struct
        let info = ChildAccount.ChildAccountInfo(name: childAccountName, mailAdress: childAccountMailAdress, email: childAccountEMail, age: childAccountAge, originatingPublicKey: pubKey)

        // Create the account
        managerRef.addChildAccountTag(account: client, childAccountInfo: info)
    }
}