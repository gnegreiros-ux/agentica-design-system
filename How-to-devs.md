# How-to — Développeurs (équipe design system)

> Ce guide s'adresse à l'équipe qui **maintient** le système, pas aux équipes produit.
> Dernier mot toujours humain. Les agents proposent, vous approuvez.
> **Type:** instruction
> **Chemin logique:** How-to-devs.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** tokens/semantic.json, tokens/component.json, .eslintrc-ds.json, AGENTS.md

---

## 1. Setup initial

### Cloner et installer
```bash
git clone [REPO_URL]
cd agentic-design-system
npm install
```

### Compiler les tokens
```bash
npx style-dictionary build --config style-dictionary/config.json
# Génère : dist/tokens/css/, dist/tokens/js/, dist/tokens/ios/, dist/tokens/android/, …
```

### Générer le site
```bash
node site/build.js
# Génère site/dist/ (99 fichiers HTML + site.css + agtc.js)
```

---

## 2. Workflow quotidien

### Modifier un token existant

**Règle :** tout changement de token sémantique ou composant = TCR.

```
1. Créer une branche : token/[nom-court]  (convention git-workflow.md)
2. Modifier le fichier JSON concerné (semantic.json ou component.json)
3. Soumettre PR → review Principal Designer obligatoire
4. Après merge : compiler les tokens + rebuilder le site + communiquer aux équipes
```

### Ajouter un composant

```
1. Créer le contrat : guidelines/components/[nom].md
2. Ajouter les tokens : tokens/component.json  (TCR requis)
3. Implémenter le Web Component (Lit) : components/agtc-[nom].js
4. Ajouter les métadonnées : .claude/skills/ai-component-metadata.md
5. Mettre à jour guidelines/components/overview.md
6. Rebuilder le site : node site/build.js
```

### Vérifier les dérives avant une PR
```bash
# Accessibilité WCAG — pipeline CI actif (axe-core)
# Se déclenche automatiquement sur chaque push ; vérifier les runs GitHub Actions

# Régressions visuelles — Chromatic
# Idem : automatique sur push, approval manuel si changement visuel détecté

# Tokens orphelins / variables CSS fantômes
node site/build.js   # validateCssVars() s'exécute dans le build, signale les fantômes

# Nommage CSS — règle absolue (ADR-2026-06-30)
# Zéro préfixe de version (v2-, ds-), zéro valeur en dur
# Voir .claude/rules/code-style.md
```

---

## 3. Fichiers à connaître

| Fichier | Rôle | Quand le modifier |
|---------|------|-------------------|
| `tokens/semantic.json` | Source de vérité des intentions UX | Via TCR uniquement |
| `tokens/component.json` | Contrats UI | Via TCR + approbation |
| `site/build.js` | Générateur du site statique (CSS, HTML, JS) | À chaque changement de layout ou composant site |
| `.claude/rules/code-style.md` | Conventions CSS/HTML — règles de nommage | Si nouvelle règle de style décidée |
| `.claude/rules/` | Règles et contraintes pour les agents IA | Si nouvelle décision de gouvernance |
| `AGENTS.md` | Routeur d'agents | Si nouveau type d'agent ajouté |

---

## 4. Règles non négociables

- ❌ Jamais de valeur hex ou px en dur dans le code
- ❌ Jamais de token primitif dans un composant
- ❌ Jamais de token inventé (non défini dans semantic.json)
- ❌ Jamais de préfixe de version dans les noms de classes CSS (`v2-`, `ds-`) — voir `code-style.md`
- ✅ Tout changement de token sémantique = TCR
- ✅ `node site/build.js` avant chaque commit touchant le site
- ✅ Les règles agents sont dans `.claude/rules/` — les lire avant de modifier l'architecture
