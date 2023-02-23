# <p align="center">Texky walletless</p>

Secure authentication system leveraging flow blockchain resources concept ease of use and scalability combined with robust and widely spread connection protocol such as openID connect and new extensions like [HEART](https://openid.net/wg/heart/) and [FAPI](https://openid.net/wg/fapi/) to create a new identity and information sharing system.

## 🛠️ Tech Stack

- NodeJS 18 - [Documentation](https://nodejs.org/dist/latest-v18.x/docs/api/)
- Flow - [Documentation](https://developers.flow.com/learn/concepts)

## 🛠️ Run the application
```bash
docker compose -p texky build
docker compose -p texky up
# If you have problem with cassandra refusing to start do (not on a prod server)
chmod 777 db-data
# otherwise the user cassandra should have rights on this directory if you want to keep things clean
```

## FlowpenID connect

Today a lot of application rely on user informations without keeping track of how those data are stored and used. User usually have data scattered amoung different applications and account related information scattered in different applications / places / blockchains. The aim of this tool is to allow users to keep track of all the information that are scattered around and stay up to date with what is happening in a single interface while having full autonomy on owning their data.

In order to apply the soverignity of data that every user should have today we decided to leverage the child account concept that cadence has. The aim is to build a system that will allow applications to access data that are part of a `child account` and still give the ability to transfer the keys managing that child account to a `parent account` owned by the user itself

The first principle tho is to have an identification ID for the user, today two element could be used to identify a user.
  - A blockchain wallet address that would be signed with a random text each time the user try to connect
  - An email taken from an application from the web2 ecosystem or the classical user password way

Those two entity could be used to allow the application to display a list of account that the user own on his profile interface in the application. The use of a private key from the blockchain could allow him to remain anonymous if he wishes to but would some apps from contacting him. The share of that information could be asked by application's `contract` in order to communicate with him later

An `application` when it starts can ask access or create `child accounts` based on a `contract` he lists in his application as well as the email of the user if this one is available. The email part is a classic openID claim. This action should enable user to grant the application usage and creation of a `child account` they can use.
At first the `child account` would be created by the `master account` and linked to it with a `contract` but if a user decide to take his `account` out of the `master account` he should be able to do so with a simple transfer. However once this is done the user should have a wallet connection available in the `application` that would grant him the right to still perform actions on with his `child account`. In order to do this in the userInfo endpoint of the flowpenID server should be able to tell the application if the account link to the contract is Sovereign, Hybrid or owned by the flowpenID server. A fallback system can be created by apps in order to avoid this call if necessary and a specific error will be received from the flowpenID server if the endpoint being called don't have the necessary private keys to perform the action.

That last part is a bit tricky as it required full trust of the user with the plateform. The say not your keys not your asset can also be extended to not only your keys not *your* assets :D. That being said we also fully understand the ease of use of centralised system and the need for those system to be reliable and have a good reputation. The fact that the blockchain ecosystem exist and provide transparent transaction and such could be leverage to give a degree of trust to users but this might require application users to provide more information off chain and have legal entities that are not anonymous guarantee them.

## Concepts

A few concept should exist in the flowpenID server in order to ease the comprehension of the system to developers.

| Name | Concept| Types | Values |
| -------- | -------- | -------- | -------- |
| consent_flow | Option to display a consent to the user logging to an application | tinyint | TBD |
| flow_custody | Option to define the account custody mode of the application | tinyint | TBD |
| flow_account_creation | Address (contract) used to create child account | string | 0x... |
| flow_contracts | List of contract with their type to ease some call on profile management if needed | Dictionary<string, string> | {'nft_sort': 0x...} |

 1. Application administration

#### The application will allow users to create an application for their Dapps

#### The application will allow users view the accounts they hold

In order to display this a query can be made on the account of the user to view the account he has custody of.
For application that he still has acccess to and don't have an inner link the information should be available in the database, normally the data shouldn't be duplicated but a request should allow a user to list all the account he has and where they are stored and how. In order to allow the user to not let us handle some data an option should allow him to delete this information from our application. This could lead to the claim of some error but a delete action date could be created to know that the user did delete something manually

#### Profile page to manage information related to his subjectID from flowpenID server

A user should be able to delete his account.
Transfering an account should be done easily thanks to the custody of the flow account and the ownership of the private keys. So if a user still have private keys own by the dapp but he decide to erase his account we should notify the dapp contact in order to let them know and then erase the access from our side.

 2. FlowpenID server

#### Login with social network or email

This type of login will generate an entry in an email database and if it's the first time the user is created with this email a subjectID will be created for him. from this point a consent page with the configuration added in the application will be prompted to him. He should be able to link his already existing account, or have the account created for him by the app and respecting the contract app. Information about that should be displayed in the term of services. Help can be provided to write them according to the `flow_custody` option choosen

#### Login with another blockchain

This type of login replace the email by the blockchain address and its chainID, so far the rest of the flow is the same as the email except that we based the retrival on the chainID and blockchain address with a signature provided by the user when he tries to login (which should be a random signing sentence)

#### Login with flow account

This type of login is the same as the above except that we directly go search in its table a flow address. Signing message will be done as well

#### User info endpoint

If the token provided to applications are opaque, the user info endpoint should allow to give information about the custody wallet given to the user.
 - Custody from the user should allow the user to be prompted for their signing up of transaction
 - Wallet owned by flowpenID should provide endpoints that are protected to allow only the dapps or token provided to work
 - Wallet owned by the application itself will keep their own implementation so no work is required by flowpenID

#### Endpoints interacting with the flow blockchain

The gosdk might be leverage with an added protection by token / authorization from the flowpenID ecosystem.
For the hackathon the freshmint library with a few changes was used in order to keep things not too long until the end of the hackathon
The aim after is to have whitelisted address in case of application custody applications allowing users and app to be more secured about where the external flow might go.

### Hackathon wanrning

In order to acheive the sharing of contract between application and the user itself the claim were used as consent but in order to be compliant with standard this kind of action should fall inside the [FAPI](https://openid.net/wg/fapi/). A correct implementation would be to warn contract on creation that would be interacting with financial value. Other contract that wish to interact with health value should be implemented following the [HEART recommandations](https://openid.net/wg/heart/)

### General warning

The fact that an account could transfer to another account could create the problem of having the access to the account vulnerable with one application and having this application being exploited to send the ressources owned by the end user to another account (at least as long as its private key are used by a third party app). A way to mitigate this would be to add the option of multi factor authorisation for this action and / or a 3 days delay before the action is performed

## Directories

The project will rely on the [account linking](https://developers.flow.com/account-linking) documentation in order to create child account to access a main application

 1. App: Administration part

This is the interface were you can manage details related to your applications

 2. Auth: OpenID complient server (flowpenID :D)

This is the server that will create and manage account for your apps. It should respect the openID best practice and allow all protocol to be fully implemented in order to gain control of an account.

 3. Schema / db-data: Database related

Data and schema related to the database.

## 🧐 Features    
- Fully compliant openID connect server
- Leverage zero knowledge concept to avoid sharing sensitive content
- Keep ownership of your own data and be able to see who access it

Each user creating an account will have a child account linked to the application account.
An application account will have the possibility of giving back the custody of the child account to a user that creates his own wallet.

Each application account should have the possibility of using a zero knowledge proof information that will later allow them to share information with other applications and verify private informations.
An application should be able to give its signature to some data given by a user which gets tagged in the data list itself and give a guarantee that this data is correct so other application requesting the information on that data can have a guarantee that this is correct. (this can be important for governement related check ex: going on website with age restriction when making a payment or have gated information about some event being produced)

## 🙇 Acknowledgements
- [Flow core contract](https://github.com/onflow/flow-core-contracts)
- [Zero knowledge proof - ETH](https://ethereum.org/en/zero-knowledge-proofs/)
- [ZKP StackExchange response](https://crypto.stackexchange.com/questions/81167/how-do-i-implement-zero-knowledge-proof)
- [OpenID panva](https://github.com/panva/node-oidc-provider)
- [Financial-grade API CIBA](https://openid.net/specs/openid-financial-api-ciba-ID1.html)

## ➤ License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
