# ADR-010 — Choix de Playwright pour les tests E2E et d'accessibilité

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Tech Lead, Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-010-playwright.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-007-axe-core-accessibilite.md
> **Relations:** .claude/rules/development.md, decisions/ADR-007-axe-core-accessibilite.md, decisions/ADR-009-storybook.md

---

## Contexte

axe-core (ADR-007) audite les composants au niveau de leur structure sémantique.
Chromatic (ADR-006) audite leur apparence visuelle en isolation.
Aucun des deux ne teste le comportement d'un composant dans un parcours utilisateur réel :
la navigation clavier complète, la gestion du focus trap dans une modale, ou
le déclenchement correct du pattern de confirmation d'un bouton `critical`.

La question posée était :

> **Comment tester les interactions et parcours complets que ni axe-core
> ni Chromatic ne peuvent couvrir — notamment les comportements clavier
> et les séquences d'actions requises par les contrats de composants ?**

---

## Décision

Adoption de **Playwright** (Microsoft) pour les tests E2E et les tests
d'interaction accessibilité, en complément d'axe-core.

Playwright couvre deux cas que les autres outils ne peuvent pas adresser :

**1. Tests d'interaction accessibilité**
axe-core audite la structure ARIA statique. Playwright teste le comportement
dynamique : la touche `Tab` passe-t-elle dans le bon ordre ? `Escape` ferme-t-il
le bon élément ? L'annonce du lecteur d'écran se déclenche-t-elle après l'action ?

```javascript
// Exemple : test du bouton critical
test('critical button requires confirmation before action', async ({ page }) => {
  await page.click('agtc-button[variant="critical"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible(); // confirmation dialog
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

**2. Intégration axe-core dans les parcours complets**
Via `@axe-core/playwright`, axe-core peut être exécuté sur des pages entières
en contexte réel — pas seulement sur des composants isolés dans Storybook.
Les violations qui n'apparaissent que dans un contexte d'intégration sont ainsi détectées.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Cypress** | Excellent outil E2E, mais plus lent et plus lourd que Playwright pour les tests de composants Web. Support Web Components moins mature. L'API Playwright est plus proche du navigateur natif, ce qui est un avantage pour tester le Shadow DOM et les Custom Elements. |
| **Jest + Testing Library** | Excellents pour les tests unitaires de composants React/Vue. Mais les tests JSDOM ne simulent pas un vrai navigateur — le Shadow DOM des Web Components n'est pas supporté nativement. Les tests d'accessibilité clavier en JSDOM sont peu fiables. |
| **WebDriverIO** | Wrapper autour de WebDriver/DevTools. Plus verbeux que Playwright, configuration plus complexe. Playwright offre les mêmes capacités avec une API plus moderne et un meilleur support des navigateurs multiples. |
| **Puppeteer** | Développé par Google, basé sur Chrome uniquement. Playwright supporte Chrome, Firefox et Safari en parallèle — garantie plus large de la compatibilité cross-browser des composants. |
| **Tests manuels uniquement** | Non automatisables en CI. La navigation clavier complète de chaque composant dans chaque variante est irréaliste à vérifier manuellement à chaque PR. |

---

## Conséquences

**Pour le CI/CD :**
- Tests Playwright exécutés après le build Storybook — ils testent les composants
  dans leurs stories pour assurer le contexte isolé
- Le tag `--grep a11y` permet d'exécuter uniquement les tests d'accessibilité
  (référencé dans `How-to-devs.md`)
- En mode CI, les violations axe-core via Playwright bloquent le merge au même titre
  que les violations détectées dans Storybook

**Pour les agents IA :**
- Les tests Playwright sont le contrat exécutable des **comportements** des composants
- Un agent qui génère une implémentation de bouton `critical` sans pattern de confirmation
  verra le test Playwright correspondant échouer — feedback automatique sans intervention humaine
- Les agents peuvent lire les tests Playwright pour comprendre les comportements attendus
  d'un composant (complément du contrat `.md`)

**Pour les développeurs :**
- Les tests d'interaction remplacent partiellement la documentation comportementale :
  le test dit exactement ce que le composant doit faire, pas seulement ce qu'il doit être
- Playwright génère des traces d'exécution (screenshots + vidéo) sur échec —
  facilite le debug sans reproduction manuelle

**Périmètre vs axe-core (ADR-007) :**

| | axe-core (Storybook) | Playwright + axe-core |
|--|---------------------|----------------------|
| **Contexte** | Composant isolé | Page / parcours complet |
| **Interactions** | Statique | Dynamique (clic, clavier, focus) |
| **Vitesse** | Rapide | Plus lent (vrai navigateur) |
| **Déclenchement** | Développement + PR | PR + pre-deploy |

**Coût accepté :**
- Les tests Playwright sont les plus lents du pipeline CI (rendu navigateur complet)
- Chaque comportement critique d'un composant doit être explicitement testé —
  pas de couverture automatique comme avec axe-core

---

## Incidents ou déclencheurs

Décision fondatrice. Le pattern de confirmation du bouton `critical` (ADR-005)
est le cas d'usage emblématique : axe-core valide que le dialog de confirmation
a un rôle ARIA correct, mais seul Playwright peut vérifier qu'il s'affiche
effectivement quand le bouton est cliqué.
