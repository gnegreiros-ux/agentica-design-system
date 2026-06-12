// Agentica Builder — Phase 3 : Toggle, Checkbox, Radio, Segmented
// Colle ce fichier dans code.js de ton plugin local Figma

(async function () {

  // ── 1. Polices ──────────────────────────────────────────
  var FA = "Atkinson Hyperlegible";
  var fam = FA, fb = "Bold", fr = "Regular";
  try {
    await figma.loadFontAsync({ family: FA, style: "Regular" });
    await figma.loadFontAsync({ family: FA, style: "Bold" });
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    fam = "Inter";
    fb  = "Semi Bold";
    fr  = "Regular";
  }

  // ── 2. Page ─────────────────────────────────────────────
  var pg = figma.root.children.find(function (p) {
    return /component|composant/i.test(p.name);
  });
  if (pg) await figma.setCurrentPageAsync(pg);

  // ── 3. Utilitaires ──────────────────────────────────────
  function C(h) {
    return {
      r: parseInt(h.slice(1, 3), 16) / 255,
      g: parseInt(h.slice(3, 5), 16) / 255,
      b: parseInt(h.slice(5, 7), 16) / 255
    };
  }
  function ring() {
    return [
      {
        type: "DROP_SHADOW",
        color: { r: 1, g: 1, b: 1, a: 1 },
        offset: { x: 0, y: 0 },
        radius: 0,
        spread: 2,
        visible: true,
        blendMode: "NORMAL"
      },
      {
        type: "DROP_SHADOW",
        color: { r: 0, g: 0.478, b: 0.408, a: 1 },
        offset: { x: 0, y: 0 },
        radius: 0,
        spread: 4,
        visible: true,
        blendMode: "NORMAL"
      }
    ];
  }
  function txt(chars, size, style, color) {
    var t = figma.createText();
    t.fontName = { family: fam, style: style }; // fontName AVANT characters
    t.characters = chars;
    t.fontSize = size;
    t.fills = [{ type: "SOLID", color: C(color) }];
    return t;
  }
  function styleSet(s, x, y) {
    s.fills = [{ type: "SOLID", color: { r: 0.976, g: 0.976, b: 0.976 } }];
    s.cornerRadius = 8;
    s.strokes = [{ type: "SOLID", color: C("#e8e8e8") }];
    s.strokeWeight = 1;
    s.paddingLeft   = 32;
    s.paddingRight  = 32;
    s.paddingTop    = 32;
    s.paddingBottom = 32;
    s.itemSpacing   = 20;
    s.x = x;
    s.y = y;
  }

  // ── 4. TOGGLE ────────────────────────────────────────────
  var toggleData = [
    { ck: "Off", st: "Default",  col: "#8d8d8d", r: false },
    { ck: "Off", st: "Hover",    col: "#838383", r: false },
    { ck: "Off", st: "Focus",    col: "#8d8d8d", r: true  },
    { ck: "Off", st: "Disabled", col: "#d9d9d9", r: false },
    { ck: "On",  st: "Default",  col: "#007a68", r: false },
    { ck: "On",  st: "Hover",    col: "#0d3d38", r: false },
    { ck: "On",  st: "Focus",    col: "#007a68", r: true  },
    { ck: "On",  st: "Disabled", col: "#d9d9d9", r: false }
  ];
  var tComps = [];
  for (var i = 0; i < toggleData.length; i++) {
    var d = toggleData[i];
    var c = figma.createComponent();
    c.name = "Checked=" + d.ck + ", State=" + d.st;
    c.layoutMode = "HORIZONTAL";
    c.counterAxisAlignItems = "CENTER";
    c.primaryAxisSizingMode = "AUTO";
    c.counterAxisSizingMode = "AUTO";
    c.itemSpacing = 10;
    c.fills = [];

    var track = figma.createFrame();
    track.resize(40, 22);
    track.cornerRadius = 11;
    track.fills = [{ type: "SOLID", color: C(d.col) }];
    if (d.r) track.effects = ring();

    var knob = figma.createEllipse();
    knob.resize(16, 16);
    knob.x = d.ck === "On" ? 21 : 3;
    knob.y = 3;
    knob.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    track.appendChild(knob);
    c.appendChild(track);

    var lbl = txt(
      d.ck === "On" ? "On" : "Off",
      14, fr,
      d.st === "Disabled" ? "#d9d9d9" : "#202020"
    );
    c.appendChild(lbl);
    if (d.st === "Disabled") c.opacity = 0.5;
    tComps.push(c);
  }
  var tSet = figma.combineAsVariants(tComps, figma.currentPage);
  tSet.name = "Toggle";
  styleSet(tSet, 700, 200);

  // ── 5. CHECKBOX ──────────────────────────────────────────
  var cbData = [
    { ck: "False",         st: "Default",  border: "#e8e8e8", fill: null,      r: false },
    { ck: "False",         st: "Hover",    border: "#007a68", fill: null,      r: false },
    { ck: "False",         st: "Focus",    border: "#007a68", fill: null,      r: true  },
    { ck: "False",         st: "Disabled", border: "#d9d9d9", fill: null,      r: false },
    { ck: "True",          st: "Default",  border: null,      fill: "#007a68", r: false },
    { ck: "True",          st: "Hover",    border: null,      fill: "#0d3d38", r: false },
    { ck: "True",          st: "Focus",    border: null,      fill: "#007a68", r: true  },
    { ck: "True",          st: "Disabled", border: null,      fill: "#d9d9d9", r: false },
    { ck: "Indeterminate", st: "Default",  border: null,      fill: "#007a68", r: false },
    { ck: "Indeterminate", st: "Disabled", border: null,      fill: "#d9d9d9", r: false }
  ];
  var cbComps = [];
  for (var i = 0; i < cbData.length; i++) {
    var d = cbData[i];
    var c = figma.createComponent();
    c.name = "Checked=" + d.ck + ", State=" + d.st;
    c.layoutMode = "HORIZONTAL";
    c.counterAxisAlignItems = "CENTER";
    c.primaryAxisSizingMode = "AUTO";
    c.counterAxisSizingMode = "AUTO";
    c.itemSpacing = 10;
    c.fills = [];

    var box = figma.createFrame();
    box.cornerRadius = 6;
    box.fills = [{ type: "SOLID", color: C(d.fill || "#ffffff") }];

    // Auto-layout sur box pour centrer coche/barre
    if (d.ck === "True" || d.ck === "Indeterminate") {
      box.layoutMode = "HORIZONTAL";
      box.primaryAxisAlignItems = "CENTER";
      box.counterAxisAlignItems = "CENTER";
      box.primaryAxisSizingMode = "FIXED";
      box.counterAxisSizingMode = "FIXED";
    }
    box.resize(18, 18);

    if (d.border) {
      box.strokes = [{ type: "SOLID", color: C(d.border) }];
      box.strokeWeight = 1.5;
      box.strokeAlign = "INSIDE";
    }
    if (d.r) box.effects = ring();

    if (d.ck === "True") {
      var mark = txt("v", 11, fb, "#ffffff");
      box.appendChild(mark);
    } else if (d.ck === "Indeterminate") {
      var bar = figma.createRectangle();
      bar.resize(10, 2);
      bar.cornerRadius = 1;
      bar.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      box.appendChild(bar);
    }

    c.appendChild(box);
    var lbl = txt("Option", 14, fr,
      d.st === "Disabled" ? "#d9d9d9" : "#202020");
    c.appendChild(lbl);
    if (d.st === "Disabled") c.opacity = 0.5;
    cbComps.push(c);
  }
  var cbSet = figma.combineAsVariants(cbComps, figma.currentPage);
  cbSet.name = "Checkbox";
  styleSet(cbSet, 700, 550);

  // ── 6. RADIO ─────────────────────────────────────────────
  var rdData = [
    { sel: "False", st: "Default",  border: "#e8e8e8", fill: null,      r: false },
    { sel: "False", st: "Hover",    border: "#007a68", fill: null,      r: false },
    { sel: "False", st: "Focus",    border: "#007a68", fill: null,      r: true  },
    { sel: "False", st: "Disabled", border: "#d9d9d9", fill: null,      r: false },
    { sel: "True",  st: "Default",  border: null,      fill: "#007a68", r: false },
    { sel: "True",  st: "Hover",    border: null,      fill: "#0d3d38", r: false },
    { sel: "True",  st: "Focus",    border: null,      fill: "#007a68", r: true  },
    { sel: "True",  st: "Disabled", border: null,      fill: "#d9d9d9", r: false }
  ];
  var rdComps = [];
  for (var i = 0; i < rdData.length; i++) {
    var d = rdData[i];
    var c = figma.createComponent();
    c.name = "Selected=" + d.sel + ", State=" + d.st;
    c.layoutMode = "HORIZONTAL";
    c.counterAxisAlignItems = "CENTER";
    c.primaryAxisSizingMode = "AUTO";
    c.counterAxisSizingMode = "AUTO";
    c.itemSpacing = 10;
    c.fills = [];

    var circle = figma.createFrame();
    circle.cornerRadius = 9;
    circle.fills = [{ type: "SOLID", color: C(d.fill || "#ffffff") }];
    circle.resize(18, 18);

    if (d.border) {
      circle.strokes = [{ type: "SOLID", color: C(d.border) }];
      circle.strokeWeight = 1.5;
      circle.strokeAlign = "INSIDE";
    }
    if (d.r) circle.effects = ring();

    if (d.sel === "True") {
      var dot = figma.createEllipse();
      dot.resize(8, 8);
      dot.x = 5;
      dot.y = 5;
      dot.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      circle.appendChild(dot);
    }

    c.appendChild(circle);
    var lbl = txt("Option", 14, fr,
      d.st === "Disabled" ? "#d9d9d9" : "#202020");
    c.appendChild(lbl);
    if (d.st === "Disabled") c.opacity = 0.5;
    rdComps.push(c);
  }
  var rdSet = figma.combineAsVariants(rdComps, figma.currentPage);
  rdSet.name = "Radio";
  styleSet(rdSet, 700, 950);

  // ── 7. SEGMENTED ─────────────────────────────────────────
  var TABS = ["Option 1", "Option 2", "Option 3"];
  var sgData = [
    { name: "Tab=1, State=Default", active: 0, r: false },
    { name: "Tab=2, State=Default", active: 1, r: false },
    { name: "Tab=3, State=Default", active: 2, r: false },
    { name: "Tab=1, State=Focus",   active: 0, r: true  }
  ];
  var sgComps = [];
  for (var i = 0; i < sgData.length; i++) {
    var d = sgData[i];
    var c = figma.createComponent();
    c.name = d.name;
    c.layoutMode = "HORIZONTAL";
    c.counterAxisAlignItems = "CENTER";
    c.primaryAxisSizingMode = "AUTO";
    c.counterAxisSizingMode = "AUTO";
    c.paddingLeft   = 4;
    c.paddingRight  = 4;
    c.paddingTop    = 4;
    c.paddingBottom = 4;
    c.itemSpacing   = 2;
    c.cornerRadius  = 8;
    c.fills = [{ type: "SOLID", color: C("#f0f0f0") }];
    if (d.r) c.effects = ring();

    for (var j = 0; j < TABS.length; j++) {
      var on = j === d.active;
      var seg = figma.createFrame();
      seg.layoutMode = "HORIZONTAL";
      seg.primaryAxisAlignItems = "CENTER";
      seg.counterAxisAlignItems = "CENTER";
      seg.primaryAxisSizingMode = "AUTO";
      seg.counterAxisSizingMode = "AUTO";
      seg.paddingLeft   = 16;
      seg.paddingRight  = 16;
      seg.paddingTop    = 6;
      seg.paddingBottom = 6;
      seg.cornerRadius  = 6;
      seg.fills = on
        ? [{ type: "SOLID", color: C("#007a68") }]
        : [];
      var t = txt(TABS[j], 14,
        on ? fb : fr,
        on ? "#ffffff" : "#646464");
      seg.appendChild(t);
      c.appendChild(seg);
    }
    sgComps.push(c);
  }
  var sgSet = figma.combineAsVariants(sgComps, figma.currentPage);
  sgSet.name = "Segmented";
  styleSet(sgSet, 700, 1280);

  // ── 8. Zoom ──────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([tSet, cbSet, rdSet, sgSet]);
  figma.closePlugin("Toggle OK | Checkbox OK | Radio OK | Segmented OK");

})();
