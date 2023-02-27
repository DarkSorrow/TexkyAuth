import ChildAccount from 0xf8d6e0586b0a20c7

transaction(/*pubKey: String*/fundingChildAddress: Address) {
    prepare(parent: AuthAccount, grownUpLimite: UInt64) {
        // Get a reference to the signer's ChildAccountCreator
        /*let creatorRef = parent.borrow<&ChildAccount.ChildAccountCreator>(from: ChildAccount.ChildAccountCreatorStoragePath)
        ?? panic("No ChildAccountCreator in signer's account at ".concat(ChildAccount.ChildAccountCreatorStoragePath.toString()))

        let adress: Address = creatorRef.getAddressFromPublicKey(publicKey: pubKey) ?? panic("No adress")
        let account = getAccount(adress)

       
       let cap = account.getCapability<&{ChildAccount.ChildAccountTagPublic}>(ChildAccount.ChildAccountTagPublicPath)
       let infoTag = cap.borrow() ?? panic("No cap")
       log(infoTag.info.name)*/
       let managerRef = parent.borrow<&ChildAccount.ChildAccountManager>(from: ChildAccount.ChildAccountManagerStoragePath)
            ?? panic("Could not borrow reference to ChildAccountManager in signer's account at expected path!")
        let childAccount = managerRef.getChildAccountRef(address: fundingChildAddress)
            ?? panic("Could not get AuthAccount reference for specified address ")
        let tagRef = childAccount.borrow<&ChildAccount.ChildAccountTag>(from: ChildAccount.ChildAccountTagStoragePath)
            ?? panic("Could not borrow a reference to the child account's TicketToken Vault at expected path!")
        log(tagRef.isGrownUp(grownUpLimite: grownUpLimite))
    }
}
 