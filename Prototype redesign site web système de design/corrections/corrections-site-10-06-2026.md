ROLE
Ta mission est de corriger et améliorer un site de design system existant (https://designsystem.gnegreiros.com) en appliquant des principes UX avancés et nos standards Agentica.
Analyse ce fichier ainsi que les captures d'écran déposées dans ce même dossier.

OBJECTIF
Rendre le site :
- plus cohérent
- plus lisible
- plus navigable
- plus maintenable
- plus conforme aux standards UX/UI et accessibilité

CONTRAINTES
- Ne pas changer la structure métier du design system
- Optimiser sans surcharger
- Respecter WCAG 2.1 AA
- Favoriser la scannabilité
- Garder une cohérence globale (tokens, composants, navigation)
- Produire du code ou pseudo-code si nécessaire

---

TÂCHES

1. NAVIGATION
- Afficher le menu latéral gauche UNIQUEMENT si la page possède des sous-pages
- Ne jamais afficher le menu à gauche et les ancres à droite avec le même contenu
- Créer une page "Vue d’ensemble" pour chaque grande section (Foundations, etc.)
- Afficher les sous-pages uniquement après clic sur une catégorie
- Corriger l’état actif (remplacer style bouton par indicateur discret type border-left token)
- Ajouter un bouton flottant "Retour en haut" sur toutes les pages

---

2. STRUCTURE & HIÉRARCHIE
- Revoir complètement la structure des pages ADR :
  - Aligner les métadonnées (Date, Status, Décideurs, Type, Chemin)
  - Supprimer toute duplication
  - Présenter ces infos sous forme de grille lisible
- Corriger les sections mal positionnées :
  - Déplacer la section "Icônes" dans les variantes de bouton
- Réorganiser les sections :
  - Mettre "Standards ouverts" après les stats
  - Réintroduire la section "Contribution"
- Corriger les tables :
  - Empêcher les retours à la ligne inutiles
  - Optimiser la lisibilité

---

3. UI & DESIGN
- Remplacer les icônes techniques (CSS, Angular, etc.) par leurs logos officiels
- Uniformiser les styles :
  - version (v1.0.0 partout)
  - typographie (éviter FULL CAPS)
- Clarifier la distinction entre lien et bouton
- Harmoniser les alignements (footer, badges, headers)

---

4. CONTENU & COPY
- Ajouter une page "Historique des versions (Changelog)"
  - chaque version doit contenir une description des changements
- Ajouter les liens :
  - Storybook
  - GitHub
  - Audit
- Toujours ouvrir les liens externes dans un nouvel onglet
- Clarifier les labels ambigus (ex: "21 WCAG 2.1 AA compliance items")

---

5. FONCTIONNALITÉS
- Corriger complètement le système de filtre dans la page Tokens
  - le filtre doit fonctionner de manière fiable à chaque utilisation
- Ajouter internationalisation (i18n) sur:
  - bouton "Copier"
  - autres éléments interactifs

---

6. ACCESSIBILITÉ
- Vérifier respect WCAG 2.1 AA :
  - contraste
  - lisibilité
  - navigation clavier
- Optimiser le spacing et la densité pour améliorer la lecture

---

7. AMÉLIORATIONS GLOBALES
- Assurer cohérence entre toutes les pages
- Réduire la charge cognitive
- Maximiser la scannabilité
- Supprimer tous les éléments inutiles ou redondants

---

OUTPUT ATTENDU
- Liste des fichiers à modifier
- Modifications précises (diff ou instructions)
- Code ou composants nécessaires
- Résultat cohérent et prêt à déployer