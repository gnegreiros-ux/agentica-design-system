// Agentica Builder — Segmented (Phase 3 fin)
// Colle ce fichier dans code.js de ton plugin local Figma

(async function () {

  // ── 1. Polices ───────────────────────────────────────────────────────────
  var FA = "Atkinson Hyperlegible";
  try {
    await figma.loadFontAsync({ family: FA, style: "Regular" });
    await figma.loadFontAsync({ family: FA, style: "Bold" });
  } catch (e) {
    FA = "Inter";
    await figma.loadFontAsync({ family: FA, style: "Regular" });
    await figma.loadFontAsync({ family: FA, style: "Semi Bold" });
  }

  function ahStyle(s) {
    return ["Bold","Semi Bold","Extra Bold","ExtraBold","Black","Heavy"].includes(s)
      ? (FA === "Inter" ? "Semi Bold" : "Bold")
      : "Regular";
  }

  // ── 2. Page ──────────────────────────────────────────────────────────────
  var pg = figma.root.children.find(function (p) {
    return /segmented/i.test(p.name);
  });
  if (!pg) {
    pg = figma.root.appendChild(figma.createPage());
    pg.name = "Components / Segmented";
  }
  await figma.setCurrentPageAsync(pg);

  // Fond canevas #535353 (règle §13)
  pg.backgrounds = [{ type: "SOLID", color: { r: 0.325, g: 0.325, b: 0.325 } }];

  // ── 3. Variables & Text Styles ───────────────────────────────────────────
  var VARS = {};
  figma.variables.getLocalVariables().forEach(function (v) { VARS[v.name] = v; });

  var TX = {};
  figma.getLocalTextStyles().forEach(function (s) { TX[s.name] = s; });

  // ── 4. Utilitaires ───────────────────────────────────────────────────────
  function hex(h) {
    return {
      r: parseInt(h.slice(1, 3), 16) / 255,
      g: parseInt(h.slice(3, 5), 16) / 255,
      b: parseInt(h.slice(5, 7), 16) / 255
    };
  }

  // vFill : toujours token sémantique + fallback (règle §0)
  function vFill(tok, fb) {
    var v = VARS[tok];
    var p = { type: "SOLID", color: hex(fb) };
    if (!v) return [p];
    try { return [figma.variables.setBoundVariableForPaint(p, "color", v)]; }
    catch (e) { return [p]; }
  }

  // bv : lier une propriété float à une Variable
  function bv(node, prop, tok, fallback) {
    var v = VARS[tok];
    if (v) {
      try { node.setBoundVariable(prop, v); return; } catch (e) {}
    }
    node[prop] = fallback;
  }

  // mkI : texte inline (WIDTH_AND_HEIGHT)
  function mkI(chars, style, size, tok, fb) {
    var t = figma.createText();
    t.fontName = { family: FA, style: ahStyle(style || "Regular") };
    t.fontSize = size || 14;
    t.characters = String(chars);
    t.fills = vFill(tok || "color/text/primary", fb || "#202020");
    t.textAutoResize = "WIDTH_AND_HEIGHT";
    return t;
  }

  // mkT : texte bloc (HEIGHT auto)
  function mkT(chars, style, size, tok, fb) {
    var t = figma.createText();
    t.fontName = { family: FA, style: ahStyle(style || "Regular") };
    t.fontSize = size || 14;
    t.characters = String(chars);
    t.fills = vFill(tok || "color/text/primary", fb || "#202020");
    t.textAutoResize = "HEIGHT";
    return t;
  }

  // Anneau de focus 2+4px teal (drop-shadow trick)
  function ring() {
    return [
      { type:"DROP_SHADOW", color:{r:1,g:1,b:1,a:1},         offset:{x:0,y:0}, radius:0, spread:2, visible:true, blendMode:"NORMAL" },
      { type:"DROP_SHADOW", color:{r:0,g:0.478,b:0.408,a:1}, offset:{x:0,y:0}, radius:0, spread:4, visible:true, blendMode:"NORMAL" }
    ];
  }

  // mkSection : section full-width 1440px VERTICAL AUTO
  function mkSection(name, bgTok, bgFb) {
    var s = figma.createFrame();
    s.name = name;
    s.fills = vFill(bgTok, bgFb);
    s.layoutMode = "VERTICAL";
    s.resize(1440, 40);
    s.primaryAxisSizingMode = "AUTO";
    s.counterAxisSizingMode = "FIXED";
    s.itemSpacing = 24;
    s.paddingTop = 60; s.paddingBottom = 60;
    s.paddingLeft = 80; s.paddingRight = 80;
    s.clipsContent = false;
    return s;
  }

  // mkLinksRow : pills de liens avec tokens
  function mkLinksRow(links) {
    var row = figma.createFrame();
    row.name = "links-row";
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    row.itemSpacing = 12;
    row.fills = [];
    links.forEach(function (link) {
      var pill = figma.createFrame();
      pill.name = "link-" + link.label.toLowerCase().replace(/[\s/]+/g, "-");
      pill.layoutMode = "HORIZONTAL";
      pill.primaryAxisSizingMode = "AUTO";
      pill.counterAxisSizingMode = "AUTO";
      pill.itemSpacing = 4;
      pill.paddingTop = 6;  pill.paddingBottom = 6;
      pill.paddingLeft = 12; pill.paddingRight = 12;
      pill.cornerRadius = 100;
      pill.fills = vFill("color/background/surface", "#FFFFFF");
      var v = VARS["color/border/focus"];
      var p = { type: "SOLID", color: hex("#006B5C") };
      pill.strokes = [v ? figma.variables.setBoundVariableForPaint(p, "color", v) : p];
      pill.strokeWeight = 1;
      pill.strokeAlign = "INSIDE";
      var txt = mkI("↗  " + link.label, "Regular", 12, "color/border/focus", "#006B5C");
      if (link.url) txt.hyperlink = { type: "URL", value: link.url };
      pill.appendChild(txt);
      row.appendChild(pill);
    });
    return row;
  }

  // ── 5. ComponentSet Segmented ────────────────────────────────────────────
  //
  // Structure :
  //   Tab=1..3, State=Default  — chaque segment actif tour à tour
  //   Tab=1,    State=Hover    — tab 1 actif, survol sur tab 2
  //   Tab=1,    State=Focus    — anneau focus sur le conteneur
  //   Tab=1,    State=Disabled — tout désactivé (opacité 40%)
  //
  // Conteneur   : color/background/subtle  cornerRadius 10  padding 4
  // Seg actif   : color/action/primary     cornerRadius 7   shadow légère
  // Seg inactif : transparent              texte secondary
  // Seg hover   : overlay 6% noir

  var TABS = ["Journée", "Semaine", "Mois"];

  var variants = [
    { name: "Tab=1, State=Default",  active: 0, hoverIdx: -1, focus: false, disabled: false },
    { name: "Tab=2, State=Default",  active: 1, hoverIdx: -1, focus: false, disabled: false },
    { name: "Tab=3, State=Default",  active: 2, hoverIdx: -1, focus: false, disabled: false },
    { name: "Tab=1, State=Hover",    active: 0, hoverIdx: 1,  focus: false, disabled: false },
    { name: "Tab=1, State=Focus",    active: 0, hoverIdx: -1, focus: true,  disabled: false },
    { name: "Tab=1, State=Disabled", active: 0, hoverIdx: -1, focus: false, disabled: true  }
  ];

  var comps = [];
  for (var i = 0; i < variants.length; i++) {
    var d = variants[i];
    var c = figma.createComponent();
    c.name = d.name;
    c.layoutMode = "HORIZONTAL";
    c.counterAxisAlignItems = "CENTER";
    c.primaryAxisSizingMode = "AUTO";
    c.counterAxisSizingMode = "AUTO";
    c.paddingLeft = 4; c.paddingRight = 4;
    c.paddingTop = 4;  c.paddingBottom = 4;
    c.itemSpacing = 2;
    c.cornerRadius = 10;
    c.fills = vFill("color/background/subtle", "#f0f0f0");
    if (d.focus) c.effects = ring();
    if (d.disabled) c.opacity = 0.4;

    for (var j = 0; j < TABS.length; j++) {
      var isActive = j === d.active;
      var isHover  = j === d.hoverIdx;

      var seg = figma.createFrame();
      seg.name = "tab-" + (j + 1);
      seg.layoutMode = "HORIZONTAL";
      seg.primaryAxisAlignItems = "CENTER";
      seg.counterAxisAlignItems = "CENTER";
      seg.primaryAxisSizingMode = "AUTO";
      seg.counterAxisSizingMode = "AUTO";
      seg.paddingLeft = 16; seg.paddingRight = 16;
      seg.paddingTop = 7;   seg.paddingBottom = 7;
      seg.cornerRadius = 7;

      if (isActive) {
        seg.fills = vFill("color/action/primary", "#007A68");
        seg.effects = [{
          type: "DROP_SHADOW",
          color: { r: 0, g: 0, b: 0, a: 0.08 },
          offset: { x: 0, y: 1 },
          radius: 3, spread: 0,
          visible: true, blendMode: "NORMAL"
        }];
      } else if (isHover) {
        seg.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.06 } }];
      } else {
        seg.fills = [];
      }

      var lbl = mkI(
        TABS[j],
        isActive ? "Bold" : "Regular",
        14,
        isActive ? "color/text/on-action" : "color/text/secondary",
        isActive ? "#FFFFFF" : "#646464"
      );
      seg.appendChild(lbl);
      c.appendChild(seg);
    }
    comps.push(c);
  }

  var cs = figma.combineAsVariants(comps, pg);
  cs.name = "Segmented";
  cs.x = 0; cs.y = 3000; // hors flux — règle §15 (showcase via instances)

  // ── 6. Page-wrapper ──────────────────────────────────────────────────────
  var wrapper = figma.createFrame();
  wrapper.name = "page-wrapper";
  wrapper.fills = vFill("color/background/page", "#fcfcfc");
  wrapper.layoutMode = "VERTICAL";
  wrapper.resize(1440, 800);
  wrapper.primaryAxisSizingMode = "AUTO";
  wrapper.counterAxisSizingMode = "FIXED";
  wrapper.itemSpacing = 0;
  wrapper.paddingTop = 0; wrapper.paddingBottom = 0;
  wrapper.paddingLeft = 0; wrapper.paddingRight = 0;
  wrapper.clipsContent = false;
  wrapper.x = 0; wrapper.y = 0;

  // ── 6.1 Header ───────────────────────────────────────────────────────────
  var sHeader = figma.createFrame();
  sHeader.name = "section-header";
  sHeader.fills = vFill("color/background/surface", "#FFFFFF");
  sHeader.layoutMode = "VERTICAL";
  sHeader.resize(1440, 40);
  sHeader.primaryAxisSizingMode = "AUTO";
  sHeader.counterAxisSizingMode = "FIXED";
  sHeader.itemSpacing = 20;
  sHeader.paddingTop = 60; sHeader.paddingBottom = 60;
  sHeader.paddingLeft = 80; sHeader.paddingRight = 80;
  sHeader.clipsContent = true;

  // Décorations gradient (exception §0 — gradientStops, fallback hex commenté)
  var decoGrad = figma.createFrame();
  decoGrad.name = "_deco-gradient";
  decoGrad.resize(800, 320);
  decoGrad.fills = [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1, 0, 0], [0, 1, 0.5]],
    gradientStops: [
      { position: 0,   color: { r: 1, g: 1,     b: 1,     a: 0    } }, // color/background/surface transparent
      { position: 0.5, color: { r: 0, g: 0.478,  b: 0.408, a: 0.06 } }, // color/action/primary 6%
      { position: 1,   color: { r: 0, g: 0.478,  b: 0.408, a: 0.14 } }  // color/action/primary 14%
    ]
  }];
  decoGrad.strokes = []; decoGrad.effects = [];
  decoGrad.layoutPositioning = "ABSOLUTE";
  decoGrad.x = 640; decoGrad.y = 0;
  sHeader.appendChild(decoGrad);

  var blob1 = figma.createEllipse();
  blob1.name = "_deco-blob-lg";
  blob1.resize(340, 340);
  blob1.fills = vFill("color/action/primary", "#007A68");
  blob1.opacity = 0.07; // opacité nœud — exception §0
  blob1.layoutPositioning = "ABSOLUTE";
  blob1.x = 1160; blob1.y = -120;
  sHeader.appendChild(blob1);

  var blob2 = figma.createEllipse();
  blob2.name = "_deco-blob-sm";
  blob2.resize(180, 180);
  blob2.fills = vFill("color/action/primary", "#007A68");
  blob2.opacity = 0.05;
  blob2.layoutPositioning = "ABSOLUTE";
  blob2.x = 1310; blob2.y = 100;
  sHeader.appendChild(blob2);

  sHeader.appendChild(mkI("Segmented", "Bold", 32, "color/text/primary", "#202020"));
  sHeader.appendChild(mkT(
    "Contrôle de sélection exclusive parmi 2 à 5 options mutuellement exclusives. " +
    "Idéal pour basculer entre des vues ou des modes dans un espace compact. " +
    "Une option est toujours active — jamais d'état sans sélection.",
    "Regular", 16, "color/text/secondary", "#646464"
  ));
  sHeader.appendChild(mkLinksRow([
    { label: "NN/g — Tabs",    url: "https://www.nngroup.com/articles/tabs-used-right/" },
    { label: "ARIA Tablist",   url: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/" },
    { label: "WCAG 4.1.3",     url: "https://www.w3.org/WAI/WCAG21/Understanding/status-messages" },
    { label: "Tokens",         url: "https://github.com/gnegreiros-ux/agentic-design-system/blob/main/tokens/semantic.json" }
  ]));

  wrapper.appendChild(sHeader);

  // ── 6.2 Showcase ─────────────────────────────────────────────────────────
  var sShowcase = mkSection("section-showcase", "color/background/subtle", "#f0f0f0");
  sShowcase.clipsContent = true;

  // Grille de points décoratifs
  for (var dc = 0; dc < 20; dc++) {
    for (var dr = 0; dr < 8; dr++) {
      var dot = figma.createEllipse();
      dot.name = "_dot";
      dot.resize(4, 4);
      dot.fills = vFill("color/action/primary", "#007A68");
      dot.opacity = 0.12;
      dot.layoutPositioning = "ABSOLUTE";
      dot.x = dc * 24; dot.y = dr * 24;
      sShowcase.appendChild(dot);
    }
  }

  sShowcase.appendChild(mkI("Aperçu des variantes", "Bold", 14, "color/text/primary", "#202020"));

  // Instances row WRAP — règle §15
  var instRow = figma.createFrame();
  instRow.name = "instances-row";
  instRow.layoutMode = "HORIZONTAL";
  instRow.layoutWrap = "WRAP";
  instRow.primaryAxisSizingMode = "AUTO";
  instRow.counterAxisSizingMode = "AUTO";
  try { bv(instRow, "itemSpacing",         "space/layout/component", 20); } catch(e) { instRow.itemSpacing = 20; }
  try { bv(instRow, "counterAxisSpacing",  "space/layout/component", 20); } catch(e) { instRow.counterAxisSpacing = 20; }
  instRow.fills = [];

  cs.children.forEach(function (variant) {
    try {
      var wrap = figma.createFrame();
      wrap.name = variant.name;
      wrap.layoutMode = "VERTICAL";
      wrap.primaryAxisSizingMode = "AUTO";
      wrap.counterAxisSizingMode = "AUTO";
      try { bv(wrap, "itemSpacing", "space/control/gap", 8); } catch(e) { wrap.itemSpacing = 8; }
      wrap.fills = [];
      wrap.appendChild(variant.createInstance());
      var lbl = mkI(
        variant.name.replace(/Tab=\d+,\s*/g, "").replace(/State=/, ""),
        "Regular", 11, "color/text/secondary", "#646464"
      );
      lbl.letterSpacing = { value: 0.3, unit: "PIXELS" };
      wrap.appendChild(lbl);
      instRow.appendChild(wrap);
    } catch (e) {}
  });

  sShowcase.appendChild(instRow);
  instRow.layoutSizingHorizontal = "FILL";
  wrapper.appendChild(sShowcase);

  // ── 6.3 États ────────────────────────────────────────────────────────────
  var sStates = mkSection("section-states", "color/background/surface", "#FFFFFF");
  sStates.appendChild(mkI("États", "Bold", 20, "color/text/primary", "#202020"));

  var statesData = [
    { state: "Default",  desc: "Option sélectionnée courante. Segment actif : fond color/action/primary, texte color/text/on-action, ombre légère. Segments inactifs : transparent, texte color/text/secondary." },
    { state: "Hover",    desc: "Survol d'un segment inactif : overlay 6% noir. Pas d'état hover sur le segment déjà actif — il reste inchangé." },
    { state: "Focus",    desc: "Navigation clavier (Tab, flèches) : anneau de focus 2px blanc + 4px color/border/focus sur le conteneur entier. Conforme WCAG 2.4.11 (focus apparence)." },
    { state: "Disabled", desc: "Toutes les options désactivées : opacité 40%, cursor not-allowed, aria-disabled='true'. L'état actif reste visible pour indiquer la valeur courante." }
  ];

  var stTable = figma.createFrame();
  stTable.name = "states-table";
  stTable.layoutMode = "VERTICAL";
  stTable.resize(1280, 40);
  stTable.primaryAxisSizingMode = "AUTO";
  stTable.counterAxisSizingMode = "FIXED";
  stTable.itemSpacing = 1;
  stTable.fills = vFill("color/border/default", "#e8e8e8");
  stTable.cornerRadius = 8;
  stTable.clipsContent = true;

  var stHead = figma.createFrame();
  stHead.name = "header-row";
  stHead.layoutMode = "HORIZONTAL";
  stHead.resize(1280, 40);
  stHead.primaryAxisSizingMode = "FIXED";
  stHead.counterAxisSizingMode = "AUTO";
  stHead.fills = vFill("color/background/subtle", "#f0f0f0");
  stHead.itemSpacing = 0;

  [{ w: 160, label: "État" }, { w: 1120, label: "Description" }].forEach(function (col) {
    var cell = figma.createFrame();
    cell.layoutMode = "HORIZONTAL";
    cell.resize(col.w, 40);
    cell.primaryAxisSizingMode = "FIXED";
    cell.counterAxisSizingMode = "AUTO";
    cell.paddingLeft = 16; cell.paddingRight = 16;
    cell.paddingTop = 10;  cell.paddingBottom = 10;
    cell.fills = [];
    cell.appendChild(mkI(col.label, "Bold", 13, "color/text/primary", "#202020"));
    stHead.appendChild(cell);
  });
  stTable.appendChild(stHead);

  statesData.forEach(function (row, idx) {
    var tr = figma.createFrame();
    tr.name = "row-" + row.state.toLowerCase();
    tr.layoutMode = "HORIZONTAL";
    tr.resize(1280, 40);
    tr.primaryAxisSizingMode = "FIXED";
    tr.counterAxisSizingMode = "AUTO";
    tr.fills = idx % 2 === 0 ? vFill("color/background/surface","#FFFFFF") : vFill("color/background/subtle","#f0f0f0");
    tr.itemSpacing = 0;

    var c1 = figma.createFrame();
    c1.layoutMode = "HORIZONTAL"; c1.resize(160, 40);
    c1.primaryAxisSizingMode = "FIXED"; c1.counterAxisSizingMode = "AUTO";
    c1.paddingLeft = 16; c1.paddingRight = 16; c1.paddingTop = 10; c1.paddingBottom = 10;
    c1.fills = [];
    c1.appendChild(mkI(row.state, "Bold", 13, "color/text/primary", "#202020"));

    var c2 = figma.createFrame();
    c2.layoutMode = "HORIZONTAL"; c2.resize(1120, 40);
    c2.primaryAxisSizingMode = "FIXED"; c2.counterAxisSizingMode = "AUTO";
    c2.paddingLeft = 16; c2.paddingRight = 16; c2.paddingTop = 10; c2.paddingBottom = 10;
    c2.fills = [];
    c2.appendChild(mkT(row.desc, "Regular", 13, "color/text/secondary", "#646464"));

    tr.appendChild(c1); tr.appendChild(c2);
    stTable.appendChild(tr);
  });

  sStates.appendChild(stTable);
  wrapper.appendChild(sStates);

  // ── 6.4 Tokens ───────────────────────────────────────────────────────────
  var sTokens = mkSection("section-tokens", "color/background/subtle", "#f0f0f0");
  sTokens.appendChild(mkI("Tokens utilisés", "Bold", 20, "color/text/primary", "#202020"));

  var tokData = [
    { token: "color/background/subtle",  role: "Fond du conteneur (piste)" },
    { token: "color/action/primary",     role: "Fond segment actif" },
    { token: "color/action/primary-hover", role: "Fond segment actif au survol" },
    { token: "color/text/on-action",     role: "Texte du segment actif" },
    { token: "color/text/secondary",     role: "Texte des segments inactifs" },
    { token: "color/border/focus",       role: "Anneau de focus (2px + 4px spread)" },
    { token: "space/control/padding-x",  role: "Padding horizontal de chaque segment (16px)" },
    { token: "space/control/padding-y",  role: "Padding vertical de chaque segment (7px)" }
  ];

  var tokTable = figma.createFrame();
  tokTable.name = "tokens-table";
  tokTable.layoutMode = "VERTICAL";
  tokTable.resize(1280, 40);
  tokTable.primaryAxisSizingMode = "AUTO";
  tokTable.counterAxisSizingMode = "FIXED";
  tokTable.itemSpacing = 1;
  tokTable.fills = vFill("color/border/default", "#e8e8e8");
  tokTable.cornerRadius = 8;
  tokTable.clipsContent = true;

  var tokHead = figma.createFrame();
  tokHead.name = "header-row";
  tokHead.layoutMode = "HORIZONTAL";
  tokHead.resize(1280, 40);
  tokHead.primaryAxisSizingMode = "FIXED";
  tokHead.counterAxisSizingMode = "AUTO";
  tokHead.fills = vFill("color/background/subtle", "#f0f0f0");
  tokHead.itemSpacing = 0;

  [{ w: 460, label: "Token sémantique" }, { w: 820, label: "Rôle dans le composant" }].forEach(function (col) {
    var cell = figma.createFrame();
    cell.layoutMode = "HORIZONTAL"; cell.resize(col.w, 40);
    cell.primaryAxisSizingMode = "FIXED"; cell.counterAxisSizingMode = "AUTO";
    cell.paddingLeft = 16; cell.paddingRight = 16; cell.paddingTop = 10; cell.paddingBottom = 10;
    cell.fills = [];
    cell.appendChild(mkI(col.label, "Bold", 13, "color/text/primary", "#202020"));
    tokHead.appendChild(cell);
  });
  tokTable.appendChild(tokHead);

  tokData.forEach(function (row, idx) {
    var tr = figma.createFrame();
    tr.name = "row";
    tr.layoutMode = "HORIZONTAL"; tr.resize(1280, 40);
    tr.primaryAxisSizingMode = "FIXED"; tr.counterAxisSizingMode = "AUTO";
    tr.fills = idx % 2 === 0 ? vFill("color/background/surface","#FFFFFF") : vFill("color/background/subtle","#f0f0f0");
    tr.itemSpacing = 0;

    var c1 = figma.createFrame();
    c1.layoutMode = "HORIZONTAL"; c1.resize(460, 40);
    c1.primaryAxisSizingMode = "FIXED"; c1.counterAxisSizingMode = "AUTO";
    c1.paddingLeft = 16; c1.paddingRight = 16; c1.paddingTop = 10; c1.paddingBottom = 10;
    c1.fills = [];
    c1.appendChild(mkI(row.token, "Regular", 13, "color/action/primary", "#007A68"));

    var c2 = figma.createFrame();
    c2.layoutMode = "HORIZONTAL"; c2.resize(820, 40);
    c2.primaryAxisSizingMode = "FIXED"; c2.counterAxisSizingMode = "AUTO";
    c2.paddingLeft = 16; c2.paddingRight = 16; c2.paddingTop = 10; c2.paddingBottom = 10;
    c2.fills = [];
    c2.appendChild(mkT(row.role, "Regular", 13, "color/text/secondary", "#646464"));

    tr.appendChild(c1); tr.appendChild(c2);
    tokTable.appendChild(tr);
  });

  sTokens.appendChild(tokTable);
  wrapper.appendChild(sTokens);

  // ── 6.5 DO / DON'T ───────────────────────────────────────────────────────
  var sDos = mkSection("section-dos-donts", "color/background/surface", "#FFFFFF");
  sDos.appendChild(mkI("Bonnes pratiques", "Bold", 20, "color/text/primary", "#202020"));

  function mkDoCol(type, badgeLabel, exampleText, descText) {
    var col = figma.createFrame();
    col.name = type + "-column";
    col.layoutMode = "VERTICAL";
    col.resize(600, 40);
    col.primaryAxisSizingMode = "AUTO";
    col.counterAxisSizingMode = "FIXED";
    col.itemSpacing = 12;
    col.paddingTop = 20; col.paddingBottom = 20;
    col.paddingLeft = 20; col.paddingRight = 20;
    col.cornerRadius = 8;
    col.fills = vFill("color/background/surface", "#FFFFFF");

    var borderTok = type === "do" ? "color/feedback/success" : "color/feedback/danger";
    var borderFb  = type === "do" ? "#1B6E1B"               : "#B91C1C";
    var vb = VARS[borderTok];
    var pb = { type: "SOLID", color: hex(borderFb) };
    col.strokes = [vb ? figma.variables.setBoundVariableForPaint(pb, "color", vb) : pb];
    col.strokeWeight = 4;
    col.strokeAlign = "INSIDE";

    col.appendChild(mkI(badgeLabel, "Bold", 12, borderTok, borderFb));
    col.appendChild(mkT(exampleText, "Regular", 14, "color/text/primary", "#202020"));
    col.appendChild(mkT(descText, "Regular", 13, "color/text/secondary", "#646464"));
    return col;
  }

  var dosItems = [
    {
      do:   { badge: "✅  DO",   example: "2 à 5 options, libellés courts",    desc: "Le Segmented fonctionne bien pour 2-5 choix mutuellement exclusifs. Libellés courts (1-2 mots) pour que chaque segment reste lisible." },
      dont: { badge: "❌  DON'T", example: "7 segments ou libellés longs",      desc: "Au-delà de 5 segments, utiliser un Select ou un Tab nav. Les libellés trop longs compressent les segments et cassent la lisibilité." }
    },
    {
      do:   { badge: "✅  DO",   example: "Une option toujours sélectionnée",  desc: "Comme un radio group, le Segmented maintient toujours une valeur active. C'est un choix entre états, pas une action déclenchable." },
      dont: { badge: "❌  DON'T", example: "Utiliser pour des actions (Submit, Annuler)", desc: "Le Segmented représente un état persistant, pas une action. Pour déclencher une action, utiliser Button ou Link." }
    }
  ];

  dosItems.forEach(function (pair) {
    var row = figma.createFrame();
    row.name = "dos-row";
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "AUTO";
    row.counterAxisSizingMode = "AUTO";
    row.itemSpacing = 32;
    row.fills = [];
    row.appendChild(mkDoCol("do",   pair.do.badge,   pair.do.example,   pair.do.desc));
    row.appendChild(mkDoCol("dont", pair.dont.badge, pair.dont.example, pair.dont.desc));
    sDos.appendChild(row);
  });

  wrapper.appendChild(sDos);

  // ── 6.6 Règles a11y ──────────────────────────────────────────────────────
  var sA11y = mkSection("section-a11y", "color/background/subtle", "#f0f0f0");
  sA11y.appendChild(mkI("Accessibilité", "Bold", 20, "color/text/primary", "#202020"));

  var a11yItems = [
    { rule: "ARIA",          desc: 'role="tablist" sur le conteneur · role="tab" sur chaque segment · aria-selected="true/false" · tabindex="0" sur l\'actif, tabindex="-1" sur les autres' },
    { rule: "Clavier",       desc: "Tab : entrer/quitter le composant · Flèches ←→ : naviguer entre les segments · Home/End : premier/dernier segment" },
    { rule: "Focus visible", desc: 'Anneau 2px blanc + 4px color/border/focus sur le conteneur (conforme WCAG 2.4.11). Jamais outline:none sans compensation.' },
    { rule: "Contraste",     desc: "Texte actif : blanc sur #007A68 = 5.3:1 ✅ AA · Texte inactif : #646464 sur #f0f0f0 = 5.7:1 ✅ AA · Badge état : visible dans les deux modes" },
    { rule: "Disabled",      desc: 'aria-disabled="true" sur le conteneur · Ne pas supprimer du DOM — opacité 40% + pointer-events:none en CSS uniquement' }
  ];

  var a11yTable = figma.createFrame();
  a11yTable.name = "a11y-table";
  a11yTable.layoutMode = "VERTICAL";
  a11yTable.resize(1280, 40);
  a11yTable.primaryAxisSizingMode = "AUTO";
  a11yTable.counterAxisSizingMode = "FIXED";
  a11yTable.itemSpacing = 1;
  a11yTable.fills = vFill("color/border/default", "#e8e8e8");
  a11yTable.cornerRadius = 8;
  a11yTable.clipsContent = true;

  var a11yHead = figma.createFrame();
  a11yHead.name = "header-row";
  a11yHead.layoutMode = "HORIZONTAL";
  a11yHead.resize(1280, 40);
  a11yHead.primaryAxisSizingMode = "FIXED";
  a11yHead.counterAxisSizingMode = "AUTO";
  a11yHead.fills = vFill("color/background/subtle", "#f0f0f0");
  a11yHead.itemSpacing = 0;

  [{ w: 160, label: "Aspect" }, { w: 1120, label: "Règle" }].forEach(function (col) {
    var cell = figma.createFrame();
    cell.layoutMode = "HORIZONTAL"; cell.resize(col.w, 40);
    cell.primaryAxisSizingMode = "FIXED"; cell.counterAxisSizingMode = "AUTO";
    cell.paddingLeft = 16; cell.paddingRight = 16; cell.paddingTop = 10; cell.paddingBottom = 10;
    cell.fills = [];
    cell.appendChild(mkI(col.label, "Bold", 13, "color/text/primary", "#202020"));
    a11yHead.appendChild(cell);
  });
  a11yTable.appendChild(a11yHead);

  a11yItems.forEach(function (row, idx) {
    var tr = figma.createFrame();
    tr.name = "row-" + row.rule.toLowerCase();
    tr.layoutMode = "HORIZONTAL"; tr.resize(1280, 40);
    tr.primaryAxisSizingMode = "FIXED"; tr.counterAxisSizingMode = "AUTO";
    tr.fills = idx % 2 === 0 ? vFill("color/background/surface","#FFFFFF") : vFill("color/background/subtle","#f0f0f0");
    tr.itemSpacing = 0;

    var c1 = figma.createFrame();
    c1.layoutMode = "HORIZONTAL"; c1.resize(160, 40);
    c1.primaryAxisSizingMode = "FIXED"; c1.counterAxisSizingMode = "AUTO";
    c1.paddingLeft = 16; c1.paddingRight = 16; c1.paddingTop = 10; c1.paddingBottom = 10;
    c1.fills = [];
    c1.appendChild(mkI(row.rule, "Bold", 13, "color/text/primary", "#202020"));

    var c2 = figma.createFrame();
    c2.layoutMode = "HORIZONTAL"; c2.resize(1120, 40);
    c2.primaryAxisSizingMode = "FIXED"; c2.counterAxisSizingMode = "AUTO";
    c2.paddingLeft = 16; c2.paddingRight = 16; c2.paddingTop = 10; c2.paddingBottom = 10;
    c2.fills = [];
    c2.appendChild(mkT(row.desc, "Regular", 13, "color/text/secondary", "#646464"));

    tr.appendChild(c1); tr.appendChild(c2);
    a11yTable.appendChild(tr);
  });

  sA11y.appendChild(a11yTable);
  wrapper.appendChild(sA11y);

  // ── 6.7 Liens ────────────────────────────────────────────────────────────
  var sLinks = mkSection("section-links", "color/background/surface", "#FFFFFF");
  sLinks.appendChild(mkI("Ressources", "Bold", 20, "color/text/primary", "#202020"));
  sLinks.appendChild(mkLinksRow([
    { label: "NN/g — Tabs used right",  url: "https://www.nngroup.com/articles/tabs-used-right/" },
    { label: "ARIA APG — Tabs pattern", url: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/" },
    { label: "WCAG 2.4.11 Focus",       url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html" },
    { label: "ADR-055 focus-visible",   url: "https://github.com/gnegreiros-ux/agentic-design-system/blob/main/decisions/ADR-055-focus-visible-i18n-interactive.md" }
  ]));
  wrapper.appendChild(sLinks);

  // ── 7. Viewport ──────────────────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([wrapper]);
  figma.closePlugin("✅ Segmented — page Components / Segmented créée");

})();
