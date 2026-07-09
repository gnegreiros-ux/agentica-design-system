# Pipeline : docs

> Checklist exhaustive des mises à jour de documentation requises après un changement.
> **Statut :** ✅ Actif
> **Déclencheur :** tout changement (sans exception)

---

## Matrice documentation → déclencheur

| Documentation | Déclencheur |
|--------------|------------|
| `guidelines/foundations/color.md` | Changement dans tokens couleur |
| `guidelines/foundations/typography.md` | Changement de police ou d'échelle |
| `guidelines/foundations/spacing.md` | Changement d'espacement ou de densité |
| `guidelines/components/[composant].md` | Changement d'un composant |
| `guidelines/overview.md` | Ajout d'un nouveau composant |
| `decisions/ADR-0XX.md` | Toute décision architecturale (voir adr-triggers.md) |
| `decisions/README.md` | Tout nouvel ADR |
| `DESIGN.md` | Changement d'identité, de gouvernance ou de principes |
| `README.md` | Changement de structure du projet |
| `AGENTS.md` | Nouvelle règle pour les agents |
| `.claude/rules/` | Nouvelle convention ou modification d'une règle |
| Site web (`site/build.js`) | Tout changement visible sur le site |

---

## Règles de qualité documentaire

### Suivi de projet (GitHub Projects, ADR-069)
- ✅ Chantier reflété dans GitHub Projects (statut, domaine)
- ❌ Ne pas recréer de fichier de log/journal local pour cet usage

### Parité bilingue FR/EN
- ✅ Tout contenu ajouté en français → version anglaise requise dans `<span class="lang-en">`
- ✅ Tout contenu ajouté en anglais → version française requise dans `<span class="lang-fr">`
- ❌ Jamais de texte visible uniquement dans une langue sur le site

### Guidelines composants
- ✅ `guidelines/components/[composant].md` mis à jour si le comportement ou les tokens changent
- ✅ Les variantes autorisées reflètent exactement `tokens/component.json`
- ❌ Jamais de variante documentée mais absente du token

### Décisions
- ✅ `decisions/README.md` → ligne ajoutée pour chaque nouvel ADR
- ✅ L'ADR référence les fichiers qu'il impacte dans ses `Relations:`
- ✅ Les alternatives rejetées sont documentées avec leur justification

---

## Rapport partiel (exemple)

```
### 5. Documentation
- [x] guidelines/foundations/typography.md — mis à jour (section Mono)
- [x] decisions/README.md — ADR-028 indexé
- [x] Parité bilingue vérifiée (lang-fr / lang-en présents)
- [ ] Site rebuild : node site/build.js → ✓ 37 fichiers générés
- [x] DESIGN.md — à jour (aucun changement requis)
```
