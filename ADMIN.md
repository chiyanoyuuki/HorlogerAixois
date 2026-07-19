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
  envoyées à `montreshorloger.php`.
- **Modifier** : bouton « Modifier » sur chaque montre → le formulaire se
  pré-remplit. On peut ajouter des photos (elles s'ajoutent à la suite des
  existantes). Les images déjà en ligne sont conservées.
- **Supprimer** : bouton « Supprimer » → retire la montre et son dossier
  d'images.

## 5. Backend des montres

Le fichier **`backend/montreshorloger.php`** (fourni dans le dépôt) prend en
charge l'ensemble des opérations :

| Opération   | Requête                                                       |
| ----------- | ------------------------------------------------------------- |
| Liste       | `GET montreshorloger.php` (ou `?id=` pour une seule)          |
| Ajout       | `POST` sans `id` (+ `images[]`)                               |
| Modification| `POST` avec `id` (otherData renvoyé pour préserver les images)|
| Suppression | `POST` avec `action=delete` + `id`                            |

> **À déployer** : remplacer le `montreshorloger.php` du serveur par celui de
> `backend/`. Il est rétro-compatible (ajout/édition inchangés) et ajoute la
> suppression + la conservation des images en édition.

Les écritures ne sont pas protégées côté serveur : prévoir une auth avant la
mise en production (cf. §2).

## 6. Où se trouve le code

```
src/app/admin/
├── admin.service.ts          # état, connexion, sauvegarde, CRUD montres
├── label-map.ts              # libellés FR lisibles des champs
├── admin-node/               # éditeur récursif générique (texte/liste/groupe)
├── admin-panel/              # panneau à onglets + gestion des montres
└── admin-login/              # page /admin (connexion)
```
