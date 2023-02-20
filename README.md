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
Distributed under the MIT License. See [LICENSE](LICENSE.txt) for more information.
