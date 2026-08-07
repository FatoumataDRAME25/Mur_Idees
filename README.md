
**Environnement de production :** https://mur-idees.vercel.app/
**Hébergeur :** Vercel

---

## 1. Présentation du projet

SUNU IDEES est une boîte à idées collaborative permettant aux utilisateurs de soumettre, consulter, rechercher, filtrer, modifier et supprimer des idées classées par catégorie (Pédagogie, Événement, Vie de campus, Amélioration technique). Une fonctionnalité d'assistance par IA suggère automatiquement une catégorie à partir du titre et de la description saisis. Les données sont stockées dans une base **Supabase** (table `Idees`).

## 2. Stack technique

| Composant | Technologie | Détail |
|---|---|---|
| Build tool | Vite `^8.0.16` | Bundling et serveur de dev |
| Langage | JavaScript (vanilla, ES modules) | Pas de framework (React/Vue) |
| UI | Bootstrap 5.3.8 + Font Awesome 6.7.2 | Chargés via CDN dans `index.html`, non bundlés |
| Backend / Base de données | **Supabase** (`@supabase/supabase-js ^2.107.0`) | Table `Idees` (colonnes : `id`, `titre`, `categorie`, `description`, `created_at`) — CRUD complet (`recupererIdees`, `createIdees`, `updateIdees`, `deleteIdees`) dans `api/supabase.js` |
| IA / Suggestion de catégorie | API OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`) | Appelée côté client, logique isolée dans `api/openrouter.js` |
| Validation de formulaire | Module maison `validation.js` | Validation du titre (≥ 3 caractères, doit commencer par une lettre) et de la description (≥ 10 caractères), avec retour visuel Bootstrap (`is-valid` / `is-invalid`) |
| Hébergement | Vercel | Détection automatique du framework Vite |



## 3. Structure du dépôt

```
Mur_Idees/
├── api/
│   ├── supabase.js       # Fonctions CRUD vers Supabase (table "Idees")
│   └── openrouter.js     # Appel à l'API OpenRouter pour la suggestion de catégorie IA
├── index.html             # Structure HTML + formulaire + zone d'affichage des idées
├── app.js                 # Logique applicative (orchestration UI + appels api/*)
├── validation.js          # Validation des champs du formulaire
├── style.css               # Styles custom minimes (classe .erreur)
├── package.json            # Dépendances et scripts npm
├── package-lock.json
└── .gitignore               # Exclut .env et node_modules
```

Aucun fichier `vercel.json` ni `vite.config.js` n'est présent : Vercel s'appuie sur sa détection automatique du framework Vite (preset "Vite"). Le dossier `api/` ici n'est **pas** un dossier de Vercel Serverless Functions (il ne contient pas de handlers `req/res` exportés) — ce sont de simples modules JS importés côté client par `app.js`.

## 4. Prérequis

- Node.js (version compatible avec Vite 8, recommandé Node ≥ 18)
- npm (livré avec Node.js)
- Un compte [Supabase](https://supabase.com/) avec un projet créé et la table `Idees` configurée (voir section 6)
- Un compte [OpenRouter](https://openrouter.ai/) avec une clé API valide (utilisée pour la suggestion de catégorie par IA)
- Un compte Vercel connecté au dépôt GitHub `FatoumataDRAME25/Mur_Idees`

## 5. Variables d'environnement

| Nom | Requise | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Oui | URL du projet Supabase (visible dans Supabase → Project Settings → API) |
| `VITE_SUPABASE_KEY` | Oui | Clé API Supabase (clé publique `anon`, utilisée côté client dans `api/supabase.js`) |
| `VITE_OPENROUTER_API_KEY` | Oui | Clé API OpenRouter utilisée par `api/openrouter.js` pour appeler `https://openrouter.ai/api/v1/chat/completions` |

Le préfixe `VITE_` est obligatoire : Vite n'expose côté client que les variables d'environnement préfixées ainsi (via `import.meta.env`).

Un fichier `.env` local (non versionné, exclu par `.gitignore`) doit contenir :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_KEY=votre_cle_anon_supabase
VITE_OPENROUTER_API_KEY=votre_cle_api_openrouter
```

⚠️ Ces clés étant exposées côté client (bundle JavaScript envoyé au navigateur), elles sont visibles par n'importe quel utilisateur inspectant le code source de la page. Pour Supabase, ce n'est pas anormal en soi *si* la clé utilisée est bien la clé publique `anon` (protégée par les règles RLS — Row Level Security — configurées sur la table `Idees`) ; il faut cependant vérifier que le RLS est bien activé et correctement paramétré, sinon n'importe qui peut lire/écrire/supprimer les données. La clé OpenRouter, elle, ne devrait idéalement pas être exposée côté client (voir section 10).

## 6. Configuration Supabase (préalable au déploiement)

Avant de pouvoir lancer l'application, la base Supabase doit être prête :

1. Créer un projet sur [supabase.com](https://supabase.com/).
2. Créer une table nommée exactement **`Idees`** avec au minimum les colonnes suivantes :

   | Colonne | Type | Remarque |
   |---|---|---|
   | `id` | `int8` (ou `uuid`) | Clé primaire, auto-incrémentée |
   | `titre` | `text` | |
   | `categorie` | `text` | |
   | `description` | `text` | |
   | `created_at` | `timestamp` | Généralement rempli automatiquement à l'insertion (défaut `now()`) |

3. Configurer les règles **RLS (Row Level Security)** sur la table `Idees` pour autoriser les opérations `select`, `insert`, `update`, `delete` nécessaires au fonctionnement de l'app (à adapter selon le niveau de sécurité souhaité — actuellement l'app suppose un accès ouvert en lecture/écriture).
4. Récupérer l'URL du projet et la clé `anon` dans **Project Settings → API**, à utiliser pour `VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY`.

## 7. Déploiement en local (développement)

```bash
# 1. Cloner le dépôt
git clone https://github.com/FatoumataDRAME25/Mur_Idees.git
cd Mur_Idees

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env à la racine
cat <<EOF > .env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_KEY=votre_cle_anon_supabase
VITE_OPENROUTER_API_KEY=votre_cle_api_openrouter
EOF

# 4. Lancer le serveur de développement
npm run dev
```

L'application est alors accessible sur l'URL locale fournie par Vite (généralement `http://localhost:5173`).

## 8. Build de production

```bash
npm run build
```

Génère les fichiers statiques optimisés dans le dossier `dist/` (comportement par défaut de Vite). Pour prévisualiser localement le résultat du build :

```bash
npm run preview
```

## 9. Déploiement sur Vercel

### 9.1 Méthode utilisée (déploiement continu via GitHub)

1. Le dépôt GitHub `FatoumataDRAME25/Mur_Idees` est connecté à un projet Vercel.
2. Vercel détecte automatiquement le framework **Vite** (aucune configuration `vercel.json` requise).
3. Paramètres de build utilisés par défaut pour un projet Vite :
   - **Build Command** : `vite build` (ou `npm run build`)
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`
4. Chaque push sur la branche suivie (`master`) déclenche un nouveau déploiement automatique en production ; les autres branches génèrent des déploiements de preview.

### 9.2 Configuration des variables d'environnement sur Vercel

Étapes à réaliser dans le tableau de bord Vercel :

1. Aller dans **Project Settings → Environment Variables**.
2. Ajouter les trois variables suivantes :
   - `VITE_SUPABASE_URL` — URL du projet Supabase
   - `VITE_SUPABASE_KEY` — clé `anon` Supabase
   - `VITE_OPENROUTER_API_KEY` — clé API OpenRouter
   - **Environments** : cocher Production (et Preview/Development si nécessaire)
3. Redéployer le projet après ajout/modification des variables (les variables d'environnement ne sont prises en compte qu'au moment du build).

### 9.3 Déploiement manuel (alternative via CLI Vercel)

```bash
npm install -g vercel
vercel login
vercel --prod
```

La CLI demandera de confirmer le framework détecté (Vite) et le répertoire de sortie (`dist`).

## 10. Vérification post-déploiement

Checklist à effectuer après chaque déploiement :

- [ ] La page se charge sans erreur sur l'URL de production
- [ ] Les idées existantes se chargent bien depuis Supabase à l'ouverture de la page
- [ ] Le formulaire de soumission d'idée fonctionne (l'idée créée apparaît dans Supabase et dans la liste)
- [ ] La validation du formulaire s'affiche correctement (bordures rouge/vert, messages d'erreur) pour titre/description invalides
- [ ] Le bouton "Soumettre" se désactive pendant l'enregistrement puis se réactive
- [ ] La suggestion de catégorie par IA se déclenche au `blur` du champ description (vérifier dans la console navigateur qu'aucune erreur `data.error` d'OpenRouter n'apparaît)
- [ ] La recherche et le filtre par catégorie fonctionnent
- [ ] La modification et la suppression d'une idée fonctionnent et se répercutent bien dans Supabase
- [ ] Les données persistent après rechargement de la page (lues depuis Supabase, pas localStorage)

## 11. Limites connues et pistes d'évolution

- **Exposition des clés côté client** : `VITE_SUPABASE_KEY` et `VITE_OPENROUTER_API_KEY` sont visibles dans le bundle JS livré au navigateur. Pour Supabase c'est le fonctionnement attendu avec la clé `anon` (à condition que le RLS soit bien configuré) ; pour OpenRouter, il serait préférable de déplacer l'appel dans une fonction serverless Vercel afin de ne pas exposer la clé publiquement.
- **Sécurité Supabase (RLS)** : à vérifier explicitement — si le Row Level Security n'est pas configuré correctement sur la table `Idees`, n'importe qui possédant la clé `anon` (visible dans le bundle) peut lire/modifier/supprimer toutes les idées.
- **Bug de validation** : faute de frappe `lenght` au lieu de `length` dans `validation.js` (section 2) qui désactive silencieusement la vérification de longueur maximale de la description.
- **Absence de fichier `vercel.json`** : le projet dépend entièrement de la détection automatique de Vercel ; toute modification de structure (ex. changement du dossier de sortie) nécessiterait l'ajout d'une configuration explicite.
- **Le dossier `api/`** peut prêter à confusion : il ne s'agit pas de fonctions serverless Vercel mais de modules JS classiques importés côté client.

## 12. Résumé rapide (TL;DR)

| Étape | Commande / Action |
|---|---|
| Cloner | `git clone https://github.com/FatoumataDRAME25/Mur_Idees.git` |
| Installer | `npm install` |
| Config Supabase | Créer le projet + table `Idees` + RLS, récupérer URL et clé `anon` |
| Variables d'env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `VITE_OPENROUTER_API_KEY` dans `.env` (local) ou Vercel Dashboard (prod) |
| Dev local | `npm run dev` |
| Build | `npm run build` → sortie dans `dist/` |
| Déploiement | Push sur `master` → build automatique Vercel (preset Vite, output `dist`) |