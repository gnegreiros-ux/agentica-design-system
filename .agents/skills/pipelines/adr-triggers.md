# Pipeline : adr-triggers

> Matrice de déclenchement — détermine si un nouvel ADR est requis après un changement.
> **Statut :** ✅ Actif
> **Déclencheur :** tout changement (vérification systématique)

---

## Principe

> Toute **décision architecturale ou de design** qui n'est pas déjà couverte par un ADR existant doit en créer un.
> Un changement peut être sans ADR seulement si c'est une **application** d'une décision déjà documentée.

---

## Matrice de déclenchement

| Changement effectué | ADR requis ? | Type d'ADR |
|--------------------|-------------|-----------|
| Nouvelle police de caractères | ✅ Oui | Typographie |
| Modification de l'échelle typographique | ✅ Oui | Typographie |
| Nouveau système de grille ou d'espacement | ✅ Oui | Espacement |
| Nouvelle palette de couleurs | ✅ Oui | Couleur / Marque |
| Nouveau mode de densité | ✅ Oui | Espacement |
| Nouveau composant ajouté au système | ✅ Oui | Composant |
| Changement de bibliothèque d'icônes | ✅ Oui | Icônes |
| Nouveau pipeline CI/CD | ✅ Oui | Infrastructure |
| Nouvelle dépendance technique majeure | ✅ Oui | Infrastructure |
| Changement de token sémantique (sens / intention) | ✅ Oui | Token |
| Changement de token de composant | ✅ Oui | Token — approbation Principal Designer |
| Nouvelle règle de gouvernance | ✅ Oui | Gouvernance |
| Correction de valeur dans un token existant | ❌ Non | Application d'ADR existant |
| Ajout de page au site de documentation | ❌ Non | Documentation courante |
| Correction de bug CSS | ❌ Non | Fix standard |
| Mise à jour du log de construction | ❌ Non | Log courant |
| Ajout d'un ADR (ce fichier) | ❌ Non | Meta-documentation |

---

## Questions à se poser

Pour chaque changement, répondre à ces questions :

1. **Est-ce une décision nouvelle ?** Pas déjà couverte par un ADR existant.
2. **A-t-elle un impact cross-équipe ?** Designers, développeurs, agents IA concernés.
3. **Est-ce irréversible ou difficile à changer ?** Plus c'est difficile à défaire, plus l'ADR est critique.
4. **Y a-t-il des alternatives rejetées ?** Si oui → ADR obligatoire pour documenter le pourquoi.

**Si 2 réponses "oui" ou plus → créer un ADR.**

---

## Format d'un ADR (rappel)

```markdown
# ADR-0XX — [Titre de la décision]

> **Date :** YYYY-MM-DD
> **Statut :** ✅ Actif
> **Décideurs :** [Nom] — [Rôle]
> **Relations :** [fichiers impactés]

## Contexte
## Décision
## Argumentaire
## Alternatives rejetées
## Conséquences
```

---

## Rapport partiel (exemple)

```
### 4. ADRs manquants
- [x] Nouveau token couleur → déjà couvert par ADR-024 (palettes marque)
- [ ] ⚠️ Nouvelle police monospace → ADR-028 à créer : "Atkinson Hyperlegible Mono"
- [x] Aucune autre décision sans ADR détectée
```
