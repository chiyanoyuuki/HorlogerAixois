# Guide d'administration — HorlogerAixois

Ce document explique le **mode administration** ajouté au site : comment s'y
connecter, ce qu'on peut modifier, et ce qui reste à câbler côté serveur.

---

## 1. Accéder à l'administration

1. Aller sur **`https://<le-site>/admin`**
2. Saisir le **mot de passe** (voir §2)
3. Le panneau d'édition s'ouvre. Un bouton flottant **✎** (en bas à droite)
   permet de le rouvrir à tout moment tant qu'on est connecté.

La session reste active tant que l'onglet du navigateur est ouvert
(`sessionStorage`). « Déconnexion » (en bas du panneau) la ferme.

## 2. Changer le mot de passe

> ⚠️ Par défaut : **`horloger2025`** — **à changer avant mise en ligne.**

Éditer la constante dans `src/app/admin/admin.service.ts` :

```ts
private readonly PASSWORD = 'horloger2025'; // ← mettre votre mot de passe ici
```

puis reconstruire (`npm run build`) et redéployer.

**Note de sécurité.** Cette authentification est **côté client** : elle
protège l'accès à l'interface, mais n'est pas une barrière serveur.
L'endpoint `sethorlogeraixois` est de toute façon déjà ouvert en écriture.
Pour un vrai contrôle d'accès, ajouter un endpoint d'authentification PHP
(retour d'un token) et l'appeler depuis `login()` — voir §5.

## 3. Modifier le contenu du site

Le panneau range le contenu par **onglets** correspondant aux sections :

| Onglet                | Ce qu'on y modifie                                          |
| --------------------- | ----------------------------------------------------------- |
| Accueil               | Titres et paragraphes de la page d'accueil (FR/EN)          |
| Magasin / Atelier     | Textes et images de ces pages                               |
| Horlogerie            | Présentation, mouvements, complications                     |
| À propos / Contact    | Blocs de texte, champs du formulaire                        |
| Navigation            | Libellés des menus, affichage/masquage (case « Masqué »)    |
| Français / Anglais    | Tous les textes d'interface (boutons, titres récurrents…)   |
| Images des blocs      | Noms de fichiers d'images des carrousels                    |
| Champs des fiches     | Libellés des caractéristiques techniques des montres        |
| Montres               | Ajout / modification / suppression des montres              |

L'éditeur est **générique** : chaque texte devient un champ, chaque liste
peut être réordonnée (▲ ▼), complétée (**＋ Ajouter**) ou allégée (**✕**).

Après toute modification, le bandeau du bas indique « Modifications non
enregistrées ». Cliquer sur **Enregistrer** envoie l'ensemble du contenu au
serveur (`POST sethorlogeraixois`).

## 4. Gérer les montres

Onglet **Montres** :

- **Ajouter** : remplir les caractéristiques, joindre des photos, puis
  « Ajouter la montre ». Les images sont compressées côté navigateur puis
  envoyées à `montreshorloger.php` (comme le flux d'import existant).
- **Modifier / Supprimer** : boutons présents sur chaque montre de la liste.

> L'**ajout** fonctionne avec le backend actuel. La **modification** et la
> **suppression** nécessitent le support serveur décrit ci-dessous.

## 5. Contrat backend à compléter (édition / suppression de montres)

Le front envoie déjà les requêtes ; il reste à les traiter côté PHP dans
`montreshorloger.php` :

**Supprimer** — `POST montreshorloger.php` (multipart) :

```
action=delete
id=<id de la montre>
```

**Modifier** — `POST montreshorloger.php` (multipart) :

```
action=update
id=<id de la montre>
<champ>=<valeur>   (brand, model, price, …)
```

Tant que ces actions ne sont pas gérées, l'ajout reste pleinement
fonctionnel et les boutons Modifier/Suppression afficheront un message
d'erreur clair.

## 6. Où se trouve le code

```
src/app/admin/
├── admin.service.ts          # état, connexion, sauvegarde, CRUD montres
├── label-map.ts              # libellés FR lisibles des champs
├── admin-node/               # éditeur récursif générique (texte/liste/groupe)
├── admin-panel/              # panneau à onglets + gestion des montres
└── admin-login/              # page /admin (connexion)
```
