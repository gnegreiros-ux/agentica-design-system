# Contribuer à Agentica

Merci de l'intérêt porté à Agentica. Ce document explique comment proposer
une contribution et les conditions dans lesquelles elle sera acceptée.

## Principe directeur

**Le dernier mot appartient toujours à l'humain.** Toute contribution —
qu'elle touche aux tokens, aux composants, aux règles d'agents ou à la
documentation — doit respecter ce principe : un agent IA peut proposer,
détecter, générer ; une décision structurante reste validée par une personne.

## Avant de contribuer

- Ouvrez une issue pour discuter du changement envisagé avant d'investir du
  temps dans une pull request, sauf pour les corrections mineures
  (typos, liens cassés, clarifications de documentation).
- Les changements touchant aux tokens primitifs (`tokens/primitives.json`)
  ou à la gouvernance des agents (`AGENTS.md`, `governance/`) nécessitent
  une discussion préalable — ce sont les couches les plus structurantes
  du système.

## Certificate of Origin (DCO)

Ce projet utilise le **Developer Certificate of Origin (DCO)** plutôt qu'un
Contributor License Agreement (CLA) formel. En soumettant une contribution,
vous certifiez que :

1. La contribution a été créée en tout ou en partie par vous et que vous
   avez le droit de la soumettre sous la licence du projet ; ou
2. La contribution est basée sur un travail antérieur qui, à votre
   connaissance, est couvert par une licence open source appropriée, et
   vous avez le droit de soumettre ce travail sous cette même licence
   (ou une licence compatible), tel qu'indiqué dans la contribution ; ou
3. La contribution vous a été fournie directement par une autre personne
   qui a certifié (1), (2) ou (3), et vous ne l'avez pas modifiée ; et
4. Vous comprenez et acceptez que ce projet et la contribution soient
   publics, et qu'un enregistrement de la contribution (y compris toutes
   les informations personnelles que vous soumettez avec, incluant votre
   signature) soit conservé indéfiniment et puisse être redistribué de
   façon compatible avec ce projet ou les licences open source concernées.

Texte complet du DCO : https://developercertificate.org/

### Comment signer

Chaque commit doit inclure une ligne `Signed-off-by` avec votre nom légal
et une adresse courriel valide :

```
Signed-off-by: Jeanne Tremblay <jeanne.tremblay@example.com>
```

Git peut ajouter cette ligne automatiquement avec l'option `-s` :

```bash
git commit -s -m "Description du changement"
```

Les pull requests dont un commit n'est pas signé ne seront pas fusionnées
tant que la signature n'est pas ajoutée (au besoin via `git commit --amend -s`
ou `git rebase --signoff`).

## Processus de pull request

1. Forkez le repo et créez une branche descriptive
   (`fix/token-orphan-detection`, `docs/clarify-onboarding`, etc.).
2. Assurez-vous que `node scripts/audit-tokens.js --ci` passe si vous
   touchez aux tokens.
3. Décrivez dans la pull request : le problème résolu, l'impact sur les
   contrats existants (composants, tokens), et si un point nécessite une
   validation humaine explicite.
4. Une revue humaine est requise avant toute fusion — aucune fusion
   automatique par un agent IA.

## Code de conduite

Soyez respectueux et constructif. Les désaccords techniques sont normaux
et bienvenus ; les échanges doivent rester professionnels.
