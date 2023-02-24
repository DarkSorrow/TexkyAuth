import ParentAccountContract from 0x01

transaction {
    prepare(app: AuthAccount) {

        // take the voter's ballot our of storage
        let setter <- app.load<@ParentAccountContract.StringDataSetter>(from: /storage/Setter)!

        // Vote on the proposal
        setter.setValue(newValue: "toto@3ds.com")

        // Cast the vote by submitting it to the smart contract
        ParentAccountContract.changeMail(stringDataSetter: <-setter)
    }
}