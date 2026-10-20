/* คลังท่าทั้งหมด — ตัวแสดงชุดเดียวที่ทั้งหน้าเว็บผู้เล่น (docs/site/skills.html · สองภาษา) และ wiki (docs/wiki/skills.html · ไทย + ช่องภายใน) ใช้
   ข้อมูลมาจาก data/game-data.js (สร้างจากโค้ดเกมด้วย tools/wiki/gen_data.sh — ห้ามแก้ข้อมูลในหน้า)
   AbyssSkills.mount(el, { lang: "th"|"en", internal: bool, icons: "assets/icons/" }) · .setLang(l) เปลี่ยนภาษาโดยไม่เสียตัวกรอง */
(function () {
  var D = window.ABYSS_DATA;
  var T = {
    th: { moves: "ท่าชิ้นส่วน", ults: "ไม้ตาย", gloss: "สถานะ · ธาตุ · ท่าประจำแถว", more: "ความถนัด · กระแสน้ำ", search: "ค้นชื่อท่า ผล หรือชิ้นส่วน…",
      allSlots: "ทุกชิ้น", allSchools: "ทุกสาย", shown: "ท่า", of: "จาก", fromShapes: "ได้จากชิ้น", home: "ท่าเดิมของชิ้น", cd: "พัก", turns: "ตา", noCd: "ไม่พัก",
      ranged: "ตีไกล", melee: "ประชิด", newOnly: "เฉพาะท่าใหม่ 18 ต.ค. 69", isNew: "ท่าใหม่", value: "ค่าแรง", none: "ไม่พบท่าที่ตรง",
      cat: ["เป้าเดี่ยว", "เป้ากลุ่ม", "ตามธาตุ"], element: "ธาตุของปลา", aim: "เป้า", status: "สถานะ", effect: "ผล", odds: "โอกาสได้ระดับท่าตามขั้นของชิ้น", tier: "ขั้น",
      rowMoves: "ท่าประจำแถว (มีทุกตัว · ไม่ใช่ท่าของชิ้น)", elements: "หกธาตุ", strong: "ชนะแรง", weak: "ชนะเบา", elStatus: "สถานะประจำธาตุ", elPower: "ผลพิเศษตอน PERFECT",
      statuses: "สถานะทั้งหมด", shield: "โล่ดูดซับดาเมจก่อนเลือด (จากท่าป้องกัน)", extras: "ของประดับ (ผลติดตัว)", masteries: "ความถนัดทั่วไป", level: "เลเวล",
      currents: "กระแสน้ำของชั้น (หอดำดิ่ง ตั้งแต่ชั้น 11)", hint: "ควรพา", ultNote: "เลือกหนึ่งในสามช่องตอนปลาโตเต็มวัย (สุ่มหนึ่งท่าต่อแบบ) · ถาวร · กดจังหวะ PERFECT แรงสุด",
      cycle: "วงธาตุ", kitNote: "ชิ้นแต่ละแบบมี 5 ท่า · ปลาได้หนึ่งท่าต่อชิ้น · ระดับ ฟ้า/ม่วง/ทอง สุ่มตอนฟักตามขั้นของชิ้น",
      gen: "ดึงจากโค้ดเกม" },
    en: { moves: "Part moves", ults: "Ultimates", gloss: "Statuses · Elements · Row moves", more: "Mastery · Currents", search: "Search a move, effect or part…",
      allSlots: "All parts", allSchools: "All schools", shown: "moves", of: "of", fromShapes: "From parts", home: "signature move", cd: "Cooldown", turns: "t", noCd: "no cooldown",
      ranged: "ranged", melee: "melee", newOnly: "New moves only", isNew: "new", value: "value", none: "No moves match",
      cat: ["Single", "Group", "Element"], element: "Fish element", aim: "Target", status: "Status", effect: "Effect", odds: "Chance of each move grade by part tier", tier: "Tier",
      rowMoves: "Row moves (every fish · not from a part)", elements: "Six elements", strong: "Strong vs", weak: "Edge vs", elStatus: "Element status", elPower: "PERFECT bonus",
      statuses: "All statuses", shield: "Absorbs damage before HP (from guard moves)", extras: "Extras (passive perks)", masteries: "General masteries", level: "Lv",
      currents: "Floor currents (dive towers, from floor 11)", hint: "Bring", ultNote: "Pick one of three offers when the fish grows up (one random move per type) · permanent · PERFECT hits hardest",
      cycle: "Element wheel", kitNote: "Each part shape offers 5 moves · a fish gets one per part · blue/purple/gold grade rolls at hatch by part tier",
      gen: "Pulled from the game code" }
  };
  var SCHOOL_IX = { attack: 0, guard: 1, evade: 2, heal: 3, control: 4 };
  var EL_IX = { Fire: 0, Venom: 1, Moss: 2, Frost: 3, Shadow: 4, Current: 5 };
  var RANK_CLS = ["r-blue", "r-purple", "r-gold"];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nl(s) { return esc(s).replace(/\\n|\n/g, "<br>").replace(/&lt;(\/?)b&gt;/g, "<$1b>"); }

  function mount(el, opt) {
    if (!D || !el) return null;
    var st = { lang: opt.lang || "th", internal: !!opt.internal, icons: opt.icons || "assets/icons/", tab: "moves", slot: -1, school: "", q: "", newOnly: false, ultSchool: "attack", el: 0 };
    var t = function () { return T[st.lang]; };
    var L = function (o, k) { return st.lang === "th" ? o[k + "Th"] : o[k + "En"]; };

    // ทุกท่าในคลัง (ต่อช่อง × เลขท่า) + ชิ้นที่ให้ท่านั้น
    var fams = [];
    D.slots.forEach(function (s, si) {
      s.families.forEach(function (f) {
        var from = [];
        s.shapes.forEach(function (sh) { var k = sh.kit.indexOf(f.id); if (k >= 0) from.push({ th: sh.th, en: sh.en, home: k === 0 }); });
        var blob = [s.th, s.en].concat(from.map(function (x) { return x.th + " " + x.en; }));
        f.ranks.forEach(function (r) { blob.push(r.th, r.en, r.descTh, r.descEn); });
        fams.push({ slot: si, s: s, f: f, school: f.ranks[0].school, from: from, blob: blob.join(" ").toLowerCase() });
      });
    });

    function icon(name, cls) { return '<img class="' + (cls || "") + '" src="' + st.icons + name + '.png" alt="" loading="lazy">'; }
    function schoolWord(key) { var s = D.schools[SCHOOL_IX[key]]; return st.lang === "th" ? s.th : s.en; }

    function rankRow(r, ri) {
      var chips = [];
      chips.push('<span class="sk-chip">' + (r.cd > 0 ? t().cd + " " + r.cd + " " + t().turns : t().noCd) + "</span>");
      if (r.power > 0) chips.push('<span class="sk-chip">' + (r.ranged ? t().ranged : t().melee) + "</span>");
      chips.push('<span class="sk-chip">' + esc(L(r, "hard")) + "</span>");
      if (st.internal) {
        chips.push('<span class="sk-chip in">' + t().value + " " + r.value + "</span>");
        if (r.fx) chips.push('<span class="sk-chip in">' + esc(r.fx) + "</span>");
      }
      var rk = D.ranks[ri];
      return '<div class="sk-rank ' + RANK_CLS[ri] + '"><div class="sk-rk"><span class="sk-pill">' + esc(st.lang === "th" ? rk.th : rk.en) + '</span><b>' + esc(r.en) + "</b>" +
        (st.lang === "th" ? ' <span class="sk-th">' + esc(r.th) + "</span>" : "") + '</div><p class="sk-desc">' + esc(L(r, "desc")) + '</p><div class="sk-meta">' + chips.join("") + "</div></div>";
    }

    function card(x, i) {
      var head = '<div class="sk-head">' + icon("sc-" + SCHOOL_IX[x.school], "sk-sc") + '<div class="sk-ht"><span class="sk-kick">' + icon("slot-" + x.slot, "sk-slot") +
        esc(st.lang === "th" ? x.s.th : x.s.en) + " · " + esc(schoolWord(x.school)) + (x.f.isNew && st.internal ? ' · <i class="sk-new">' + t().isNew + "</i>" : "") + "</span></div></div>";
      var rows = x.f.ranks.map(rankRow).join("");
      var from = '<div class="sk-from"><span>' + t().fromShapes + "</span> " + x.from.map(function (f) {
        return '<em class="' + (f.home ? "home" : "") + '"' + (f.home ? ' title="' + t().home + '"' : "") + ">" + esc(st.lang === "th" ? f.th : f.en) + "</em>";
      }).join("") + "</div>";
      return '<article class="sk-card" style="--i:' + (i % 12) + '">' + head + rows + from + "</article>";
    }

    function renderMoves(p) {
      var q = st.q.trim().toLowerCase();
      var list = fams.filter(function (x) {
        return (st.slot < 0 || x.slot === st.slot) && (!st.school || x.school === st.school) && (!st.newOnly || x.f.isNew) && (!q || x.blob.indexOf(q) >= 0);
      });
      p.querySelector(".sk-count").textContent = list.length + " " + t().of + " " + fams.length + " (" + (list.length * 3) + " / " + D.skillCount + ")";
      var g = p.querySelector(".sk-grid");
      g.classList.remove("in"); void g.offsetWidth;
      g.innerHTML = list.length ? list.map(card).join("") : '<p class="sk-none">' + t().none + "</p>";
      g.classList.add("in");
    }

    function chipBar(items, cur, attr) {
      return items.map(function (it) { return '<button type="button" class="sk-f' + (it.v === cur ? " on" : "") + '" data-' + attr + '="' + it.v + '">' + (it.ic || "") + "<span>" + esc(it.label) + "</span></button>"; }).join("");
    }

    function movesPanel() {
      var slots = [{ v: -1, label: t().allSlots }].concat(D.slots.map(function (s, i) { return { v: i, label: st.lang === "th" ? s.th : s.en, ic: icon("slot-" + i) }; }));
      var schools = [{ v: "", label: t().allSchools }].concat(D.schools.map(function (s) { return { v: s.key, label: st.lang === "th" ? s.th : s.en, ic: icon("sc-" + SCHOOL_IX[s.key]) }; }));
      return '<p class="sk-note">' + t().kitNote + '</p><div class="sk-filters"><input class="sk-q" type="search" placeholder="' + t().search + '" value="' + esc(st.q) + '">' +
        '<div class="sk-bar" data-k="slot">' + chipBar(slots, st.slot, "slot") + "</div>" +
        '<div class="sk-bar" data-k="school">' + chipBar(schools, st.school, "school") + "</div>" +
        (st.internal ? '<label class="sk-tog"><input type="checkbox" class="sk-new-only"' + (st.newOnly ? " checked" : "") + "> " + t().newOnly + "</label>" : "") +
        '<span class="sk-count"></span></div><div class="sk-grid"></div>';
    }

    function ultsPanel() {
      var schools = D.schools.map(function (s) { return { v: s.key, label: st.lang === "th" ? s.th : s.en, ic: icon("sc-" + SCHOOL_IX[s.key]) }; });
      var els = D.elements.map(function (e, i) { return '<button type="button" class="sk-f sk-el' + (i === st.el ? " on" : "") + '" data-el="' + i + '">' + icon("el-" + i) + "<span>" + esc(st.lang === "th" ? e.th : e.en) + "</span></button>"; }).join("");
      var list = D.ults.filter(function (u) { return u.school === st.ultSchool; });
      var html = '<p class="sk-note">' + t().ultNote + '</p><div class="sk-filters"><div class="sk-bar" data-k="ult">' + chipBar(schools, st.ultSchool, "ult") + '</div><div class="sk-bar"><span class="sk-lab">' + t().element + "</span>" + els + "</div></div>";
      [0, 1, 2].forEach(function (c) {
        html += '<h3 class="sk-h">' + t().cat[c] + '</h3><div class="sk-grid in ult">';
        list.filter(function (u) { return u.cat === c; }).forEach(function (u, i) {
          var v = u.byElement[st.el];
          html += '<article class="sk-card ult" style="--i:' + i + '"><div class="sk-head">' + icon(c === 2 ? "el-" + st.el : "sc-" + SCHOOL_IX[u.school], "sk-sc") +
            '<div class="sk-ht"><span class="sk-kick">' + esc(schoolWord(u.school)) + " · " + t().cat[c] + '</span><b class="sk-ult">' + esc(v.en) + "</b>" +
            (st.lang === "th" ? '<span class="sk-th">' + esc(v.th) + "</span>" : "") + '</div></div><p class="sk-desc">' + esc(st.lang === "th" ? v.whatTh : v.whatEn) +
            '</p><div class="sk-meta"><span class="sk-chip">' + t().aim + ": " + esc(L(u, "aim")) + "</span></div></article>";
        });
        html += "</div>";
      });
      return html;
    }

    function glossPanel() {
      var h = '<h3 class="sk-h">' + t().elements + '</h3><div class="sk-wheel">';
      D.cycle.forEach(function (k, i) {
        var e = D.elements[EL_IX[k]];
        h += '<div class="sk-elc" style="--a:' + (i * 60) + 'deg">' + icon("el-" + EL_IX[k]) + "<b>" + esc(st.lang === "th" ? e.th : e.en) + "</b></div>";
      });
      h += '<div class="sk-wheel-mid"><b>×' + D.elementK.strong.toFixed(2) + "</b><span>" + t().strong + "</span><b>×" + D.elementK.weak.toFixed(2) + "</b><span>" + t().weak + "</span></div></div>";
      h += '<div class="sk-tbl wide"><table><thead><tr><th></th><th>' + t().strong + " ×" + D.elementK.strong.toFixed(2) + "</th><th>" + t().weak + " ×" + D.elementK.weak.toFixed(2) + "</th><th>" + t().elStatus + "</th><th>" + t().elPower + "</th></tr></thead><tbody>";
      D.elements.forEach(function (e, i) {
        var nm = function (k) { var x = D.elements[EL_IX[k]]; return st.lang === "th" ? x.th : x.en; };
        h += "<tr><td>" + icon("el-" + i, "sk-ico") + "<b>" + esc(st.lang === "th" ? e.th : e.en) + "</b></td><td>" + esc(nm(e.strong)) + "</td><td>" + esc(nm(e.weak)) + "</td><td>" + esc(L(e, "status")) + "</td><td>" + esc(L(e, "power")) + "</td></tr>";
      });
      h += "</tbody></table></div>";
      h += '<h3 class="sk-h">' + t().statuses + '</h3><div class="sk-tbl"><table><tbody>';
      D.statuses.forEach(function (s) { h += "<tr><td><b>" + esc(st.lang === "th" ? s.th : s.en) + "</b></td><td>" + esc(L(s, "what") || t().shield) + "</td></tr>"; });
      h += "</tbody></table></div>";
      h += '<h3 class="sk-h">' + t().rowMoves + '</h3><div class="sk-grid in">';
      D.basics.forEach(function (b, i) {
        h += '<article class="sk-card" style="--i:' + i + '"><div class="sk-head">' + icon("sc-" + SCHOOL_IX[b.school], "sk-sc") + '<div class="sk-ht"><b class="sk-ult">' + esc(b.en) + "</b>" +
          (st.lang === "th" ? '<span class="sk-th">' + esc(b.th) + "</span>" : "") + '</div></div><p class="sk-desc">' + esc(L(b, "desc")) + "</p></article>";
      });
      h += "</div>";
      h += '<h3 class="sk-h">' + t().odds + '</h3><div class="sk-tbl"><table><thead><tr><th>' + t().tier + "</th>" + D.ranks.map(function (r, i) { return '<th class="' + RANK_CLS[i] + '">' + esc(st.lang === "th" ? r.th : r.en) + "</th>"; }).join("") + "</tr></thead><tbody>";
      D.rankOdds.forEach(function (o) { h += "<tr><td>" + o.tier + "</td><td>" + Math.round(o.blue * 100) + "%</td><td>" + Math.round(o.purple * 100) + "%</td><td>" + Math.round(o.gold * 100) + "%</td></tr>"; });
      h += "</tbody></table></div>";
      h += '<h3 class="sk-h">' + t().extras + '</h3><div class="sk-grid in">';
      D.extras.forEach(function (e, i) { var p = (st.lang === "th" ? e.th : e.en).split(" — "); h += '<article class="sk-card mini" style="--i:' + i + '"><b class="sk-ult">' + esc(p[0]) + '</b><p class="sk-desc">' + esc(p[1] || "") + "</p></article>"; });
      h += "</div>";
      return h;
    }

    function morePanel() {
      var h = '<h3 class="sk-h" id="mastery">' + t().masteries + '</h3><div class="sk-tbl"><table><tbody>';
      D.masteries.forEach(function (m) { h += "<tr><td>" + t().level + " " + m.level + "</td><td><b>" + esc(st.lang === "th" ? m.th : m.en) + "</b></td><td>" + esc(L(m, "what")) + "</td></tr>"; });
      h += "</tbody></table></div>";
      h += '<h3 class="sk-h">' + t().currents + '</h3><div class="sk-grid in">';
      D.currents.forEach(function (c, i) {
        h += '<article class="sk-card mini" style="--i:' + i + '"><b class="sk-ult">' + esc(st.lang === "th" ? c.th : c.en) + '</b><p class="sk-desc">' + esc(L(c, "what")) + '</p><p class="sk-hint">' + t().hint + ": " + esc(L(c, "hint")) + "</p></article>";
      });
      h += "</div>";
      return h;
    }

    function render() {
      var tabs = [["moves", t().moves], ["ults", t().ults], ["gloss", t().gloss], ["more", t().more]];
      el.innerHTML = '<div class="sk-tabs" role="tablist">' + tabs.map(function (x) {
        return '<button type="button" role="tab" class="sk-tab' + (x[0] === st.tab ? " on" : "") + '" data-tab="' + x[0] + '" aria-selected="' + (x[0] === st.tab) + '">' + esc(x[1]) + "</button>";
      }).join("") + '</div><div class="sk-panel">' + (st.tab === "moves" ? movesPanel() : st.tab === "ults" ? ultsPanel() : st.tab === "gloss" ? glossPanel() : morePanel()) + "</div>" +
        '<p class="sk-gen">' + t().gen + " · " + esc(D.generated) + "</p>";
      if (st.tab === "moves") renderMoves(el.querySelector(".sk-panel"));
    }

    el.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.dataset.tab) { st.tab = b.dataset.tab; render(); return; }
      if (b.dataset.slot !== undefined) { st.slot = +b.dataset.slot; render(); return; }
      if (b.dataset.school !== undefined) { st.school = b.dataset.school; render(); return; }
      if (b.dataset.ult !== undefined) { st.ultSchool = b.dataset.ult; render(); return; }
      if (b.dataset.el !== undefined) { st.el = +b.dataset.el; render(); return; }
    });
    var timer = 0;
    el.addEventListener("input", function (e) {
      if (e.target.classList.contains("sk-q")) {
        st.q = e.target.value;
        clearTimeout(timer);
        timer = setTimeout(function () { renderMoves(el.querySelector(".sk-panel")); }, 120);
      }
    });
    el.addEventListener("change", function (e) { if (e.target.classList.contains("sk-new-only")) { st.newOnly = e.target.checked; renderMoves(el.querySelector(".sk-panel")); } });

    if (opt.tab) st.tab = opt.tab;
    render();
    return { setLang: function (l) { st.lang = l; render(); }, setTab: function (tb) { st.tab = tb; render(); } };
  }

  window.AbyssSkills = { mount: mount };
})();
