pub contract ParentAccountContract {
    pub var users: @[User]

    pub resource StringDataSetter {
        pub let userIndex: Int
        pub var value: String
        init(index: Int) {
            self.userIndex = index
            self.value = ""
        }

        pub fun getValue(): String { return self.value }
        pub fun setValue(newValue: String) {
            pre {
                newValue != nil: "Cannot set a value that doesn't exist"
            }
            self.value = newValue
        }
    }

    pub resource User {
        access(self) var firstName: String
        access(self) var lastName: String
        access(self) var adress: String
        access(self) var mail: String

        init() {
            self.firstName = ""
            self.lastName = ""
            self.adress = ""
            self.mail = ""
        }

        pub fun getFirstName(): String { return self.firstName }
        pub fun getLastName(): String { return self.lastName }
        pub fun getAdress(): String {return self.adress }
        pub fun getMail(): String { return self.mail }
        
        pub fun setFirstName(_ firstName: String) { self.firstName = firstName }
        pub fun setLastName(_ lastName: String) { self.lastName = lastName }
        pub fun setAdress(_ adress: String) { self.adress = adress }
        pub fun setMail(_ mail: String) { self.mail = mail }
    }

    pub resource Administrator {
        pub fun issueStringDataSetter(index: Int): @StringDataSetter {
            return <-create StringDataSetter(index: index)
        }
    }

    pub fun changeMail(stringDataSetter: @StringDataSetter) {
        let user: @User <- self.account.load<@User>(from: /storage/User)!
        user.setMail(stringDataSetter.getValue())
        self.account.save<@User>(<- user, to: /storage/User)

        destroy stringDataSetter
    }

    init() {
        self.users <- []

        self.account.save<@Administrator>(<-create Administrator(), to: /storage/Admin)
        self.account.save<@User>(<-create User(), to: /storage/User)
    }
}