 pub contract UserAccount {
    pub let UserAccountManagerStoragePath: StoragePath

    pub resource UserInfo {
        pub var name: String
        pub var bloodGroup: String

        init(name:String, bloodGroup: String) {
            self.name = name
            self.bloodGroup = bloodGroup
        }
    }

    pub resource UserInfoManger {
        pub var info: &UserInfo?
        pub let infoMap: {String: [String]}

        init() {
            self.info = nil
            self.infoMap = {}
        }

        pub fun getName(): String {
            return self.info!.name
        }
    }

    pub fun createUserInfoManager(): @UserInfoManger {
        return <-create UserInfoManger()
    }

    init() {
        self.UserAccountManagerStoragePath = /storage/UserAccountManager
    }
 }