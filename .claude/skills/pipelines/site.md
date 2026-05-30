# Pipeline : site

> Rebuild et validation du site de documentation statique.
> **Statut :** ✅ Actif
> **Déclencheur :** tout changement dans `site/build.js`, `tokens/`, `decisions/`, `guidelines/`

---

## Déclencheurs

| Fichier modifié | Action requise |
|----------------|---------------|
| `site/build.js` | Rebuild complet |
| `tokens/primitives.json` | Rebuild (tokens.css régénéré) |
| `tokens/semantic.json` | Rebuild (tokens.css régénéré) |
| `decisions/ADR-*.md` | Rebuild (nouvelle page ADR générée) |
| `guidelines/**/*.md` | Rebuild si contenu injecté |
| `Brand/` | Rebuild + copie assets (logo, favicons, image sociale) |

---

## Commande

```bash
cd site && node build.js
```

---

## Vérifications post-build

### 1. Nombre de fichiers générés
- Baseline : 37 fichiers (à mettre à jour lors d'ajouts de pages)
- Un nouveau ADR = +1 fichier
- Une nouvelle page = +1 fichier
- Vérifier que le count augmente correctement

### 2. Assets statiques présents
```
site/dist/
├── logo.svg          ← logo Agentica teal
├── social.jpg        ← image OG
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest
```

### 3. Métadonnées par page
Chaque page HTML doit contenir :
- `<title>` — non vide, ≥ 30 caractères pour la home
- `og:title`, `og:description`, `og:image` — présents
- `twitter:card`, `twitter:domain` — présents
- `<link rel="apple-touch-icon">` — présent

### 4. Parité bilingue
- Chaque `<span class="lang-fr">` a un `<span class="lang-en">` dans le même contexte
- Vérifier visuellement en basculant FR ↔ EN sur les pages modifiées

### 5. Tableaux de tokens
- Vérifier que les nouvelles entrées de tokens apparaissent dans l'explorateur
- `class="token-table"` présent sur tous les tableaux de tokens

---

## Rapport partiel (exemple)

```
### Site rebuild
- [x] node site/build.js → ✓ 38 fichiers générés (37 + adr-029.html)
- [x] logo.svg présent dans dist/
- [x] Métadonnées OG vérifiées sur index.html
- [x] ADR-029 visible dans decisions/index.html
- [x] Parité FR/EN vérifiée sur typography.html
```
