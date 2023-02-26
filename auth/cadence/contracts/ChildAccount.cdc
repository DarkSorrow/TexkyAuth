 pub contract ChildAccount {
    pub let AuthAccountCapabilityPath: CapabilityPath
    pub let ChildAccountManagerStoragePath: StoragePath
    pub let ChildAccountManagerPublicPath: PublicPath
    pub let ChildAccountManagerPrivatePath: PrivatePath
    pub let ChildAccountTagStoragePath: StoragePath
    pub let ChildAccountTagPublicPath: PublicPath
    pub let ChildAccountTagPrivatePath: PrivatePath
    pub let ChildAccountCreatorStoragePath: StoragePath
    pub let ChildAccountCreatorPublicPath: PublicPath

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

            self.addChildAccountTag(account: newAccount, childAccountInfo: childAccountInfo)

            return newAccount
        }

        pub fun addChildAccountTag( account: AuthAccount, childAccountInfo: ChildAccountInfo): AuthAccount {
            // Create a public key for the proxy account from string value in the provided
            // ChildAccountInfo
            let key = PublicKey(publicKey: childAccountInfo.originatingPublicKey.decodeHex(), signatureAlgorithm: SignatureAlgorithm.ECDSA_P256)
            // Add the key to the new account
            account.keys.add(publicKey: key, hashAlgorithm: HashAlgorithm.SHA3_256, weight: 1000.0)

            // Create the ChildAccountTag for the new account
            let childTag <-create ChildAccountTag(parentAddress: self.owner!.address, address: account.address, info: childAccountInfo)

            // Save the ChildAccountTag in the child account's storage & link
            account.save(<-childTag, to: ChildAccount.ChildAccountTagStoragePath)
            account.link<&{ChildAccountTagPublic}>(ChildAccount.ChildAccountTagPublicPath, target: ChildAccount.ChildAccountTagStoragePath)
            account.link<&ChildAccountTag>(ChildAccount.ChildAccountTagPrivatePath, target: ChildAccount.ChildAccountTagStoragePath)

            self.createdChildren.insert(key:childAccountInfo.originatingPublicKey, account.address)

            return account
        }
    }

    pub resource interface ChildAccountManagerViewer {
        pub fun getChildAccountAddresses(): [Address]
        // TODO: Metadata views collection?
        pub fun getChildAccountInfo(address: Address): ChildAccountInfo?
    }

    pub fun createChildAccountManager(): @ChildAccountManager {
        return <-create ChildAccountManager()
    }

    pub resource ChildAccountController {
        access(self) let authAccountCapability: Capability<&AuthAccount>
        init(authAccountCap: Capability<&AuthAccount>) {
            self.authAccountCapability = authAccountCap
        }
        pub fun getAuthAcctRef(): &AuthAccount {
            return self.authAccountCapability.borrow()!
        }
    }

    pub resource ChildAccountManager {
        pub let childAccounts: @{Address: ChildAccountController}

        init() {
            self.childAccounts <- {}
        }

        pub fun getChildAccountAddresses(): [Address] {
            return self.childAccounts.keys
        }

        pub fun getChildAccountControllerRef(address: Address): &ChildAccountController? {
            return &self.childAccounts[address] as &ChildAccountController?
        }

        pub fun createChildAccount( signer: AuthAccount, childAccountInfo: ChildAccountInfo, authAccountCapPath: CapabilityPath): AuthAccount {
            // Create the child account
            let newAccount = AuthAccount(payer: signer)

            self.addChildAccountTag(account: newAccount, childAccountInfo: childAccountInfo, authAccountCapPath: authAccountCapPath)

            return newAccount
        }

        pub fun getChildAccountRef(address: Address): &AuthAccount? {
            if let controllerRef = self.getChildAccountControllerRef(address: address) {
                return controllerRef.getAuthAcctRef()
            }
            return nil
        }

        pub fun addChildAccountTag( account: AuthAccount, childAccountInfo: ChildAccountInfo, authAccountCapPath: CapabilityPath): AuthAccount {
            // Create a public key for the proxy account from string value in the provided
            // ChildAccountInfo
            let key = PublicKey(publicKey: childAccountInfo.originatingPublicKey.decodeHex(), signatureAlgorithm: SignatureAlgorithm.ECDSA_P256)
            // Add the key to the new account
            account.keys.add(publicKey: key, hashAlgorithm: HashAlgorithm.SHA3_256, weight: 1000.0)

            // Create the ChildAccountTag for the new account
            let childTag <-create ChildAccountTag(parentAddress: self.owner!.address, address: account.address, info: childAccountInfo)

            // Save the ChildAccountTag in the child account's storage & link
            account.save(<-childTag, to: ChildAccount.ChildAccountTagStoragePath)
            account.link<&{ChildAccountTagPublic}>(ChildAccount.ChildAccountTagPublicPath, target: ChildAccount.ChildAccountTagStoragePath)
            account.link<&ChildAccountTag>(ChildAccount.ChildAccountTagPrivatePath, target: ChildAccount.ChildAccountTagStoragePath)

            let childAccountCap: Capability<&AuthAccount> = account.linkAccount(authAccountCapPath)!
            // Create ChildAccountController
            let controller <-create ChildAccountController(authAccountCap: childAccountCap)
            // Add the controller to this manager
            log("addChildAccountTag")
            log(account.address)
            self.childAccounts[account.address] <-! controller

            return account
        }

        destroy () {
            pre {
                self.childAccounts.length == 0:
                    "Attempting to destroy ChildAccountManager with remaining ChildAccountControllers!"
            }
            destroy self.childAccounts
        }
    }

    pub fun createChildAccountCreator(): @ChildAccountCreator {
        return <-create ChildAccountCreator()
    }
    
    init() {
        self.AuthAccountCapabilityPath = /private/AuthAccountCapability
        
        self.ChildAccountManagerStoragePath = /storage/ChildAccountManager
        self.ChildAccountManagerPublicPath = /public/ChildAccountManager
        self.ChildAccountManagerPrivatePath = /private/ChildAccountManager

        self.ChildAccountTagStoragePath = /storage/ChildAccountTag
        self.ChildAccountTagPublicPath = /public/ChildAccountTag
        self.ChildAccountTagPrivatePath = /private/ChildAccountTag
        
        self.ChildAccountCreatorStoragePath = /storage/ChildAccountCreator
        self.ChildAccountCreatorPublicPath = /public/ChildAccountCreator
    }
 }
 