import ParentAccountContract from 0x01

// This transaction allows the administrator of the Voting contract
// to create a new ballot and store it in a voter's account
// The voter and the administrator have to both sign the transaction
// so it can access their storage

transaction {
    prepare(admin: AuthAccount, app: AuthAccount) {

        // borrow a reference to the admin Resource
        let adminRef = admin.borrow<&ParentAccountContract.Administrator>(from: /storage/Admin)!

        // create a new Ballot by calling the issueBallot
        // function of the admin Reference
        let setter <- adminRef.issueStringDataSetter(index: 1)

        // store that ballot in the voter's account storage
        app.save<@ParentAccountContract.StringDataSetter>(<-setter, to: /storage/Setter)
    }
}