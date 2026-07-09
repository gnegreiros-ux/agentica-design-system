# Checklist — Mise à jour du site

> À exécuter dans l'ordre avant chaque commit touchant `site/`, `tokens/`, `guidelines/` ou `decisions/`.
> **Type:** instruction
> **Chemin logique:** .claude/instructions/site-checklist.md
> **Auteur:** Guilherme Negreiros
> **Relations:** site/build.js, .claude/instructions/session-spec.md, decisions/ADR-069-migration-suivi-projet-github-projects.md

---

## 1. Tokens

- [ ] Toute nouvelle valeur primitive a `$value`, `$type`, `$description`
- [ ] Les tokens sémantiques référencent des primitifs via `{primitive.X.Y}` — jamais de valeur en dur
- [ ] Aucun préfixe `--ds-` — uniquement `--agtc-`
- [ ] Un ADR créé si la décision est architecturale (nouvelle police, nouvelle bibliothèque, nouveau système)

---

## 2. Build site

```bash
cd site && node build.js
```

- [ ] Le build se termine sans erreur
- [ ] Le compteur de fichiers dans la console est cohérent (`N + adrs.length`)
- [ ] Vérifier le compte réel : `find site/dist -name "*.html" | wc -l`
- [ ] Si un écart existe, mettre à jour `const total = N + adrs.length` dans `build()`

---

## 3. Nouvelles pages ou sections

Pour toute nouvelle page de fondation ou composant :

- [ ] Fonction `buildXxx()` créée dans `build.js`
- [ ] Appelée dans `build()` au bon endroit
- [ ] Ajoutée dans `sidebarFoundations()` ou `sidebarComponents()`
- [ ] Le `base` de la sidebar est `'../'` pour toute page en sous-répertoire (`depth: 1`)
- [ ] `layout({ depth: 1, ... })` utilisé pour les pages dans `foundations/`, `components/`, `decisions/`

---

## 4. Contenu

- [ ] Aucun emoji UI — uniquement des icônes Lucide via `icon('nom', taille)`
- [ ] Aucune mention d'"Inter" — la police est Atkinson Hyperlegible
- [ ] Les valeurs dans les tableaux sont résolues depuis `SEM['key']`, pas hardcodées
- [ ] Les règles ✅/❌ utilisent `icon('circle-check', 16)` / `icon('circle-x', 16)` avec classes `.icon-ok` / `.icon-no`

---

## 5. Liens

Tester au moins une page par niveau de profondeur :

- [ ] Page racine (`index.html`) — liens sans `../`
- [ ] Page fondation (`foundations/*.html`) — liens sidebar avec `../`
- [ ] Page composant (`components/*.html`) — liens sidebar avec `../`
- [ ] Page décision (`decisions/*.html`) — liens sidebar locaux

Signe de liens cassés : chemin doublé comme `foundations/foundations/color.html`.

---

## 6. Suivi de projet

- [ ] Chantier reflété dans GitHub Projects (statut, domaine) — voir ADR-069, pas de fichier de log dans le dépôt

---

## 7. session-spec.md

À mettre à jour si l'un des éléments suivants a changé :

- [ ] Nouveau token sémantique → ajouter dans "Tokens sémantiques — référence rapide"
- [ ] Nouveau composant → ajouter dans "Inventaire des composants"
- [ ] Nouvel ADR → ajouter dans "Décisions architecturales actives"
- [ ] Changement de stack → mettre à jour "Identité du système"

---

## 8. Commit

```bash
git status          # vérifier les fichiers stagés
git add <fichiers>
git commit -m "type(scope): description"
git push origin main
```

- [ ] Convention Conventional Commits respectée (`feat`, `fix`, `token`, `docs`, `ci`, `chore`...)
- [ ] Pas de fichiers hors-repo accidentellement inclus

---

## 9. CI

```bash
# Vérifier via l'API GitHub
curl -s "https://api.github.com/repos/gnegreiros-ux/agentic-design-system/actions/runs?per_page=1" \
  | python3 -c "import json,sys; r=json.load(sys.stdin)['workflow_runs'][0]; print(r['head_sha'][:7], r['status'], r['conclusion'] or 'en cours')"
```

- [ ] CI `completed success` sur le bon SHA
- [ ] Si échec : vérifier `npm ci` présent dans le workflow, vérifier les erreurs de build

---

## 10. Site déployé

Vérifier au moins ces URLs après déploiement :

- [ ] `https://gnegreiros-ux.github.io/agentic-design-system/` — page d'accueil
- [ ] `https://gnegreiros-ux.github.io/agentic-design-system/foundations/color.html` — fondation
- [ ] `https://gnegreiros-ux.github.io/agentic-design-system/components/button.html` — composant
- [ ] Toute nouvelle page ajoutée dans cette session

Signe de succès : sidebar affiche 4 fondations, 3 composants, liens sans chemin doublé.
