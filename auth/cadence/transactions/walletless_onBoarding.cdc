import ChildAccount from 0xf8d6e0586b0a20c7

transaction(pubKey: String, fundingAmt: UFix64,, childAccountName: String, childAccountMailAdress: String, childAccountEMail: String, childAccountAge: UInt64) {
    prepare(signer: AuthAccount) {
        log("WalletLess")
        // Get a reference to the signer's ChildAccountCreator
        let managerRef = signer.borrow<&ChildAccount.ChildAccountManager>(from: ChildAccount.ChildAccountManagerStoragePath)
        ?? panic("No ChildAccountManager in signer's account at ".concat(ChildAccount.ChildAccountManagerStoragePath.toString()))
        // Construct the ChildAccountInfo metadata struct
        let info = ChildAccount.ChildAccountInfo(name: childAccountName, mailAdress: childAccountMailAdress, email: childAccountEMail, age: childAccountAge, originatingPublicKey: pubKey)

        // Create the account
        let newAccount = managerRef.createChildAccount(signer: signer, initialFundingAmount: fundingAmt,, childAccountInfo: info, authAccountCapPath: ChildAccount.AuthAccountCapabilityPath)
    }
}
 