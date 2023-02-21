# <p align="center">Texky walletless</p>

Secure authentication system leveraging flow blockchain resources concept ease of use and scalability combined with robust and widely spread connection protocol such as openID connect and new extensions like [HEART](https://openid.net/wg/heart/) and [FAPI](https://openid.net/wg/fapi/) to create a new identity and information sharing system.

## 🛠️ Tech Stack

- NodeJS 18 - [Documentation](https://nodejs.org/dist/latest-v18.x/docs/api/)
- Flow - [Documentation](https://developers.flow.com/learn/concepts)

## 🛠️ Run the application
```bash
docker compose -p texky build
docker compose -p texky up
```

## FlowpenID connect

Today a lot of application rely on user informations without keeping track of how those data are stored and used. User usually have data scattered amound different applications and account related information scattered in different applications / places / blockchains. The aim of this tool is to allow users to keep track of all the information that are scattered around and keep some track of what is happening in a single interface while having full autonomy on actually owning their data.

In order to apply the soverignity of data that every user should have today we decided to leverage the child account concept that cadence has. The aim is to build a system that will allow applications to access data that are part of a `child account` and still give the ability to transfer the keys managing that child account to a `parent account` owned by the user itself

The first principle tho is to have an identification ID for the user, today two element could be used to identify a user.
  - A blockchain wallet address that would be signed with a random text each time the user try to connect
  - An email taken from an application from the web2 ecosystem or the classical user password way

Those two entity could be used to allow the application to display a list of account that the user own on his profile interface in the application. The use of a private key from the blockchain could allow him to remain anonymous if he wishes to but would some apps from contacting him. The share of that information could be asked by application's `contract` in order to communicate with him later

An `application` when it starts can ask access or create `child accounts` for the `contract` he lists in his application as well as the email of the user if this one is available. The email part is a classic openID claim. This action should enable user to grant the application usage and creation of a `child account` they can use.
At first the `child account` would be created by the `master account` owning the `contract` but if a user decide to take his `account` out of the `master account` he should be able to do so with a simple transfer. However once this is done the user should have a wallet connection available in the `application` that would grant him the right to still perform actions on his account. In order to do this in the userInfo endpoint a user the flowpenID server should be able to tell the application if the account link to the contract is Sovereign, Hybrid or owned by the flowpenID server. A fallback system can be created by apps in order to avoid this call if necessary and a specific error will be received from the flowpenID server if the contract endpoint can't be used by the end user

### Hackathon wanrning

In order to acheive the sharing of contract between application and the user itself the claim were used as consent but in order to be compliant with standard this kind of action should fall inside the [FAPI](https://openid.net/wg/fapi/). A correct implementation would be to warn contract on creation that would be interacting with financial value. Other contract that wish to interact with health value should be implemented following the [HEART recommandations](https://openid.net/wg/heart/)

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
- [Zero knowledge proof - ETH](https://ethereum.org/en/zero-knowledge-proofs/)
- [ZKP StackExchange response](https://crypto.stackexchange.com/questions/81167/how-do-i-implement-zero-knowledge-proof)
- [OpenID panva](https://github.com/panva/node-oidc-provider)
- [Financial-grade API CIBA](https://openid.net/specs/openid-financial-api-ciba-ID1.html)

## ➤ License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
