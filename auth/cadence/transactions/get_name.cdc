import ChildAccount from "../contracts/ChildAccount.cdc"

transaction(pubKey: String) {
    prepare(parent: AuthAccount) {
        // Get a reference to the signer's ChildAccountCreator
        let creatorRef = parent.borrow<&ChildAccount.ChildAccountCreator>(from: ChildAccount.ChildAccountCreatorStoragePath)
        ?? panic("No ChildAccountCreator in signer's account at ".concat(ChildAccount.ChildAccountCreatorStoragePath.toString()))

        let adress: Address = creatorRef.getAddressFromPublicKey(publicKey: pubKey) ?? panic("No adress")
        let account = getAccount(adress)

       
       let cap = account.getCapability<&{ChildAccount.ChildAccountTagPublic}>(ChildAccount.ChildAccountTagPublicPath)
       let infoTag = cap.borrow() ?? panic("No cap")
       log(infoTag.info.name)
    }
}