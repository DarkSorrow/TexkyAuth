# <p align="center">Texky auth</p>

Secure authentication system leveraging flow blockchain resources concept ease of use and scalability combined with robust and widely spread connection protocol such as openID connect and new extensions like [HEART](https://openid.net/wg/heart/) and [FAPI](https://openid.net/wg/fapi/) to create a new identity and information sharing system.

## 🛠️ Tech Stack

- NodeJS 18 - [Documentation](https://nodejs.org/dist/latest-v18.x/docs/api/)
- Flow - [Documentation](https://developers.flow.com/learn/concepts)

## 🛠️ Install Dependencies    
```bash
yarn install
```

Le projet est de faire un serveur de login basé sur openID avec les informations du user sauvegardé dans une "ressource" sur la blockchain flow. On aura deux option de stockage
 1. On garde les private key sur notre backend (avec encryption et un truc a penser) et on "gere" le wallet du user chez nous
 2. On donne la possibilié au user de sauvegardé sa clef privée et on utilise le systeme de signature de message pour les interactions a la blockchain pour qu'il utilise son compte (transmission d'information...)

Pour la partie connection on laisse notre serveur creer des JWT en fonction des protocole qui sont choisi et on etand le systeme de claim demandé par le flux basic de openID pour demander des information au lieu d'obtenir le claim lui meme (exmeple age > 21) ce qui demandera un ecran de consentement apres un login qui interagit avec les ressources presente dans la blockchain

Il faut creer un systeme qui permet de stocker les information pour utilisé des preuve et interagir avec la ressource du compte user.

Il faut avoir un systeme de signature multiple qui peut permettre d'interagir avec certaine ressource utilisateur aussi exemple creation de ressource sur la santé avec multi signature de ressource (ressource docteur, ressource assurance santé...) ressource financier etc...