# <p align="center">Texky walletless</p>

Secure authentication system leveraging flow blockchain resources concept ease of use and scalability combined with robust and widely spread connection protocol such as openID connect and new extensions like [HEART](https://openid.net/wg/heart/) and [FAPI](https://openid.net/wg/fapi/) to create a new identity and information sharing system.

## 🛠️ Tech Stack

- NodeJS 18 - [Documentation](https://nodejs.org/dist/latest-v18.x/docs/api/)
- Flow - [Documentation](https://developers.flow.com/learn/concepts)
- Cassandra - [Documentation](https://cassandra.apache.org/)
- Redis - [Documentation](https://redis.io/)

## 🛠️ Run the application
```bash
docker compose -p texky build
docker compose -p texky up
# If you have problem with cassandra refusing to start do (not on a prod server)
chmod 777 db-data
# otherwise the user cassandra should have rights on this directory if you want to keep things clean
```

## FlowpenID connect

Today most identity provider focus on gathering, creating and handling users data in order to help application focus more on their core business. However core businesses often relies heavily on the data provided by the user and a certain amount of trust must be forged and created to make this relationship work. Most of the time however an identity provider will focus on guaranteeing the security of the data access to an application but the services around the data itself is left to the applications. Their use and share is often linked to various security considerations that is not often well understood specially with the emergence of new data privacy regulations.

Aside privacy regulation another industry is emerging around technologies linked with blockchains that often aims at bringing transparency and ownership in a world that often lack of it. The transparent nature of this industry often created skepticism when it came to privacy as the notion of being private and transparent doesn't always goes hand in hand. But this is also evolving with work around zero knowledge proof and access control which brings us new way of handling data.

Our goal project is to leverage existing proven solution and protocols when it comes to identity and private data management with the transparency and ownership required to handle them.

Our project aim at using certified identity service provider based on the openid connect specification which is today recognize as one of the industry standard and trying to apply the flow concept of child account in order to achieve the required transparency, privacy but also true ownership of the data being handled.

The openID connect specification allow different device to exchange data in a clear and explicit manner and is built on several specifications focused on security. Using a certified server and being able to actually obtain security certification is a first step to make sure the basis of our application is solid. Aside the openID certification the project aims at using zero trust concept and obtain certification from various organization the first being the iso 27001.

In order to achieve transparency the use of the flow blockchain and the ability to audit contract but also have those contract being openly available to check should show users how their data is handled. And even if everyone knows that nobody read term of services and condition of use, the fact that the contract is code and is openly available will make more people read this and uncover bad usage from good one. The ability to upgrade and easily change contract here will help remain safe and secure.

Privacy is another subject that we aim to address using technologies such as zero knowledge proof, though this can't cover all use case of data requirement for some application we think it's a great source of first contact when it comes to sharing private and sensitive data for a user. The ability to allow diverse application to make sure that the person have certain set of data without giving them access to can help companies understand their user a lot better and allow user to more easily share their data.

The way user share their data is being more and more scrutinize and for good reasons. More users are becoming aware of the power their data hold but too often are not able to prevent the lost of ownership when they want to use an application. This is largely due to the fact that up to today a company was supposed to hold the data and in the end the trust had to be put in this company. The blockchain and technologies allowing sharing and handling of an account could solve this pain point and allow users to be completely free of this mind burden by choosing how and with who those data are shared

All those technological tools being developed sometime for different purpose could help us build specific system that would empower users to choose how and where their data are being used. We do not plan on giving a standard based on our point of view but thanks to the nature of blockchains and also the way flow contract are created with the audit being built in we hope to be able to create partnership with different industries new ways of allowing apps to handle data. Those standard contract could be built in turn based on already existing emerging specification such as FAPI or HEART and empower both application creators but also users in understanding and knowing in a transparent way how their private data are being handled

## Concepts

In order to apply the self custody of data that every user should have today we decided to leverage the concepts from the flow blockchain. The aim is to build a system that will allow applications to access data that are part of a `child account` and still give the ability to transfer the management of that child account to a `parent account` owned by the user itself.

There is however several way of acheiving the concept of `child account`. Those concept will be dependent of the `contract` implementing it which is why we decided to allow application being created to choose how they want to build this relationship while still giving them enough tool to securely interact between web2 and web3 to authentify their user. Each application being created will be able to choose a **flow_account_creator** that will be responsible of creating the relationship between the app and the user.

Here is an exemple of how the parameters when creating the app
| Name | Concept| Types | Values |
| -------- | -------- | -------- | -------- |
| consent_flow | Option to display a consent to the user logging to an application | tinyint | View below |
| flow_custody | Option to define the account custody mode of the application | tinyint | View below |
| flow_account_creation | Address (contract) used to create child account | string | 0x... |
| flow_contracts | List of contract with their type to ease some call on profile management if needed | Dictionary<string, string> | {'nft_sort': 0x...} |


In order to acheive this a configuration will have to be made and the `consent` page of openID will be leverage to give a choice to the user but also start an early education if needed. Several options will be available to the Dapp creator to let a user access his Dapp

1. Consent flow available

|Value| Concept  |
| - | -------- |
| 0 | Seamless: create a global wallet attached to the **flow_account_creation** of flowpenID |
| 1 | Seamless specifc: create a wallet attached to the  **flow_account_creation** specified, an option to see audited by and security related will be displayed on consent |
| 2 | User choice: when the user first log he will have the choice of creating his account or use a **flow_account_creation** |
| 3 | User only: The user must create his self custody wallet in order to access the app |
| 4 | User hybrid: The user must create his self custody wallet in order to access the app and the **flow_account_creation** will be run to help him attached the required informations, multi sig information etc... |

A user token should have the `flow_custody` information to help a Dapp know how to handle him 
|Value| Concept  |
| - | -------- |
| 0 | FlowpenID main contract |
| 1 | Custom contract  |
| 2 | User owned  |
| 2 | Hybrid owned  |

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

### Hackathon warning

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
