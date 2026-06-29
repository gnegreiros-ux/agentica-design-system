# Rule : illustrations-source

> Source unique de vérité pour toutes les illustrations — Brand/illustrations/.
> **Type:** rule
> **Chemin logique:** .claude/rules/illustrations-source.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/performance.md
> **Relations:** site/build.js (copyImages), .claude/rules/performance.md

---

## Règle absolue

> **`Brand/illustrations/` est la source unique de vérité pour toutes les illustrations.**
> Ne jamais ajouter, modifier ou supprimer une illustration directement dans `site/dist/img/`.

```
✅ Ajouter une illustration → la déposer dans Brand/illustrations/
✅ Mettre à jour → remplacer le fichier dans Brand/illustrations/
✅ Supprimer → retirer le fichier de Brand/illustrations/
❌ Jamais modifier un PNG directement dans site/dist/img/
❌ Jamais committer un PNG dans site/dist/img/ qui n'existe pas dans Brand/illustrations/
```

---

## Convention de nommage

| Type | Format | Exemple |
|------|--------|---------|
| Illustration site | `IMG-[NOM].png` | `IMG-HERO-SYSTEM.png` |
| Variante thème sombre | `IMG-[NOM]-on-dark.png` | `IMG-HERO-SYSTEM-on-dark.png` |
| Variante thème clair | `IMG-[NOM]-on-light.png` | `IMG-HERO-SYSTEM-on-light.png` |
| Affiche de marque | `Agentica [nom].png` | `Agentica Affiche.png` |
| Infographique de marque | `Agentica-[nom].png` | `Agentica-infographique.png` |

**Seuls les fichiers `IMG-*.png` sont copiés vers `site/dist/img/` par le build.**
Les affiches et infographiques de marque (`Agentica *.png`) restent dans `Brand/illustrations/`
uniquement — elles sont destinées aux présentations et à la communication, pas au site web.

> Un fichier `IMG-*.png` peut exister dans `Brand/illustrations/` **sans être référencé dans le site** —
> il est alors destiné aux présentations uniquement. Il sera copié dans `site/dist/img/` par le build
> (comportement normal), mais aucune page HTML ne l'inclut. Ce n'est pas une erreur.
>
> Exemple : `IMG-FUTURE.png` — slide 16 des présentations, pas utilisé sur le site.

---

## Variantes thème (dark / light)

Quand une illustration a des variantes pour les deux thèmes :
- Le fichier de base `IMG-[NOM].png` peut coexister mais n'est pas requis
- Le build utilise les variantes `-on-dark` et `-on-light` pour le swap JS
- Le swap est géré par `applyThemeImages()` dans `siteJS()` (build.js)

### Références déclarées dans build.js (home page)

| Section | Sombre | Clair |
|---------|--------|-------|
| Hero système | `IMG-HERO-SYSTEM-on-dark.png` | `IMG-HERO-SYSTEM-on-light.png` |
| Contexte | `IMG-CONTEXT-on-dark.png` | `IMG-CONTEXT.png` |
| Human loop | `IMG-HUMAN-LOOP.png` | `IMG-HUMAN-LOOP-on-light.png` |
| Durabilité | `IMG-DURABILITY.png` | *(pas de variante — fonctionne sur les deux)* |

Pour ajouter une variante thème à une image existante :
1. Ajouter les fichiers `IMG-[NOM]-on-dark.png` et/ou `IMG-[NOM]-on-light.png` dans `Brand/illustrations/`
2. Dans `build.js`, ajouter `class="img-theme-aware"` + `data-src-dark` + `data-src-light` sur le `<img>`
3. `applyThemeImages()` gère le reste automatiquement

---

## Consommateurs de Brand/illustrations/

| Projet | Usage | Chemin source |
|--------|-------|---------------|
| Site Agentica (`site/`) | Web — `IMG-*.png` copiés automatiquement à chaque build | `Brand/illustrations/IMG-*.png` |
| Présentations | Slides — toutes les illustrations (`IMG-*.png` + `Agentica *.png`) | `Brand/illustrations/` |
| *(Futur)* | Autres projets | `Brand/illustrations/` |

> Tous les projets de ce dépôt consomment `Brand/illustrations/` comme source.
> Ne jamais dupliquer les fichiers dans un dossier `assets/` local d'un sous-projet.

### Fichiers présentation uniquement (non référencés sur le site)

Ces fichiers `IMG-*.png` sont dans `Brand/illustrations/` pour les présentations.
Ils sont copiés dans `site/dist/img/` par le build mais aucune page HTML du site ne les inclut.

| Fichier | Usage |
|---------|-------|
| `IMG-FUTURE.png` | Slide 16 des présentations |

---

## Pipeline build — comportement automatique

À chaque `node site/build.js` :
1. Lit tous les `IMG-*.png` dans `Brand/illustrations/`
2. Copie vers `site/dist/img/`
3. **Supprime automatiquement** les `IMG-*.png` dans `dist/img/` qui n'existent plus dans `Brand/illustrations/` (nettoyage des orphelins)

Aucune action manuelle requise après ajout/suppression dans `Brand/illustrations/`.

---

## Règles pour les agents

```
✅ Référencer les nouvelles illustrations dans build.js après les avoir ajoutées dans Brand/illustrations/
✅ Utiliser data-src-dark / data-src-light pour les variantes thème
✅ Vérifier que IMG-*.png référencés dans build.js existent dans Brand/illustrations/
✅ Un IMG-*.png sans référence dans le site est normal s'il est destiné aux présentations
   → l'ajouter au tableau "Fichiers présentation uniquement" ci-dessus
❌ Créer ou modifier des PNG directement dans site/dist/img/
❌ Utiliser des affiches de marque (Agentica *.png) comme illustrations de page web
❌ Dupliquer les illustrations dans un autre dossier du projet
❌ Supprimer un IMG-*.png de Brand/illustrations/ sans vérifier s'il est utilisé en présentation
```
