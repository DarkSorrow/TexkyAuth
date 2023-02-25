 pub contract ChildAccount {
    pub let ChildAccountTagStoragePath: StoragePath
    pub let ChildAccountTagPublicPath: PublicPath
    pub let ChildAccountTagPrivatePath: PrivatePath
    pub let ChildAccountCreatorStoragePath: StoragePath

    pub struct ChildAccountInfo {
        pub let name: String
        pub let mailAdress: String
        pub let email: String
        pub let originatingPublicKey: String

        init(name: String, mailAdress: String, email: String, originatingPublicKey: String) {
            self.name = name
            self.mailAdress = mailAdress
            self.email = email
            self.originatingPublicKey = originatingPublicKey
        }
    }

    pub resource interface ChildAccountTagPublic {
        pub var parentAddress: Address?
        pub let address: Address
        pub let info: ChildAccountInfo
    }

    pub resource ChildAccountTag : ChildAccountTagPublic {
        pub var parentAddress: Address?
        pub let address: Address
        pub let info: ChildAccountInfo

        init(parentAddress: Address?, address: Address, info: ChildAccountInfo) {
            self.parentAddress = parentAddress
            self.address = address
            self.info = info
        }

        access(contract) fun assignParent(address: Address) {
            pre {
                self.parentAddress == nil:
                    "Parent has already been assigned to this ChildAccountTag as ".concat(self.parentAddress!.toString())
            }
            self.parentAddress = address
        }
    }

    pub resource interface ChildAccountCreatorPublic {
        pub fun getAddressFromPublicKey (publicKey: String): Address?
    }

    pub resource ChildAccountCreator : ChildAccountCreatorPublic {
        access(self) let createdChildren: {String: Address}

        init () {
            self.createdChildren = {}
        }

        pub fun getAddressFromPublicKey (publicKey: String): Address? {
            return self.createdChildren[publicKey]
        }

        pub fun createChildAccount( signer: AuthAccount, childAccountInfo: ChildAccountInfo): AuthAccount {
            // Create the child account
            let newAccount = AuthAccount(payer: signer)

            // Create a public key for the proxy account from string value in the provided
            // ChildAccountInfo
            let key = PublicKey(publicKey: childAccountInfo.originatingPublicKey.decodeHex(), signatureAlgorithm: SignatureAlgorithm.ECDSA_P256)
            // Add the key to the new account
            newAccount.keys.add(publicKey: key, hashAlgorithm: HashAlgorithm.SHA3_256, weight: 1000.0)

            // Create the ChildAccountTag for the new account
            let childTag <-create ChildAccountTag(parentAddress: self.owner!.address, address: newAccount.address, info: childAccountInfo)

            // Save the ChildAccountTag in the child account's storage & link
            newAccount.save(<-childTag, to: ChildAccount.ChildAccountTagStoragePath)
            newAccount.link<&{ChildAccountTagPublic}>(ChildAccount.ChildAccountTagPublicPath, target: ChildAccount.ChildAccountTagStoragePath)
            newAccount.link<&ChildAccountTag>(ChildAccount.ChildAccountTagPrivatePath, target: ChildAccount.ChildAccountTagStoragePath)

            self.createdChildren.insert(key:childAccountInfo.originatingPublicKey, newAccount.address)


            return newAccount
        }
    }
    
    init() {
        self.ChildAccountTagStoragePath = /storage/ChildAccountTag
        self.ChildAccountTagPublicPath = /public/ChildAccountTag
        self.ChildAccountTagPrivatePath = /private/ChildAccountTag
        
        self.ChildAccountCreatorStoragePath = /storage/ChildAccountCreator
    }
 }
 