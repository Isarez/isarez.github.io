/* หน้าผู้เล่น — สลับภาษา (เก็บในเครื่องผู้อ่านเท่านั้น · คีย์เดียวกับ site.js) · คู่มือจากคู่มือในเกม · เคล็ดลับ · คลังท่า
   ข้อความคู่มือมาจาก data/game-data.js (ดึงจาก App/Tutorial/HelpText.cs ด้วย tools/wiki/gen_data.sh) — ตรงกับในเกมเสมอ ห้ามแก้ในหน้า
   ข้อความคงที่ของหน้าใช้ data-th / data-en บนตัว element · ไม่มี JS ก็เห็นภาษาไทย (หน้าบอกให้เปิด JS ดูคู่มือ) */
(function () {
  var D = window.ABYSS_DATA;
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function rich(s) { return esc(s).replace(/\\n|\n/g, "</p><p>").replace(/&lt;(\/?)b&gt;/g, "<$1b>"); }

  // ── ภาษา ──
  function stored() { try { return localStorage.getItem("lang"); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem("lang", l); } catch (e) {} }
  var h = location.hash.replace("#", "");
  var lang = h === "en" || h === "th" ? h : (stored() || ((navigator.language || "th").toLowerCase().indexOf("th") === 0 ? "th" : "en"));
  var pills = document.querySelectorAll("nav.lang a[data-lang]");
  var listeners = [];
  function apply() {
    root.lang = lang;
    document.querySelectorAll("[data-th]").forEach(function (el) { el.innerHTML = el.getAttribute(lang === "th" ? "data-th" : "data-en"); });
    pills.forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-lang") === lang ? "true" : "false"); });
    var t = document.querySelector("title[data-th]"); if (t) document.title = t.getAttribute(lang === "th" ? "data-th" : "data-en");
    listeners.forEach(function (f) { f(lang); });
  }
  pills.forEach(function (p) {
    p.addEventListener("click", function (ev) {
      ev.preventDefault();
      lang = p.getAttribute("data-lang"); save(lang);
      if (history.replaceState) history.replaceState(null, "", "#" + lang);
      apply();
    });
  });

  // ── ปรากฏตอนเลื่อนถึง ──
  var ro = !reduce && "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -6% 0px" }) : null;
  function reveal(scope) {
    scope.querySelectorAll(".p-reveal").forEach(function (el) { if (ro) ro.observe(el); else el.classList.add("in"); });
  }

  // ════════ คู่มือ ════════
  var ICON = { goal: "logo-mark-w", tank: "sys-tank", eggs: "sys-egg", "catch": "loop-loot", feed: "loop-raise", battle: "loop-battle", parts: "slot-0", battle2: "sc-0",
    elements: "el-0", status: "sc-4", genes: "sys-gene", tiers: "sys-scale", breed: "loop-breed", team: "sys-team", stages: "sys-dive", pond: "sys-pond", decor: "sys-decor",
    symbiont: "slot-5", extras: "slot-8", followers: "sc-1", looks: "el-4", shop: "sys-coin", season: "sys-event", bag: "sys-pearl", events: "sys-heart", abyss: "sys-arena" };
  var STEPS = [
    ["sys-egg", "ฟักไข่", "Hatch", "แตะไข่ที่พร้อมในตู้ — ปลาทุกตัวเริ่มจากไข่", "Tap a ready egg in the tank — every fish starts as an egg"],
    ["loop-raise", "เลี้ยงให้โต", "Raise", "ลูกปลา 3 มื้อ วัยรุ่น 4 มื้อ ยีนเผยทีละชั้น", "3 meals as fry, 4 as juvenile — genes reveal in stages"],
    ["loop-battle", "ลงสนาม", "Battle", "เลือกท่า เลือกชิ้นที่จะทุบ กดจังหวะให้ตรง", "Pick a move, pick a part to break, nail the timing"],
    ["loop-loot", "เก็บของ", "Loot", "เหรียญ สารพันธุกรรม เกล็ดยีน ไข่ และปลาที่จับได้", "Coins, gene essence, gene scales, eggs and caught fish"],
    ["loop-breed", "ผสมพันธุ์", "Breed", "ได้ลูกที่ชิ้นส่วน ขั้น และท่าไม่ซ้ำพ่อแม่", "Get a child with new parts, tiers and moves"]
  ];
  var TIPS = [
    ["sc-0", "ทุบชิ้นให้ถูกตัว", "Break the right part",
      "ตัวที่ตีแรง ทุบปาก (ตีเบาลง) · ตัวที่ได้ตาถี่ ทุบหางหรือครีบอก (ช้าลง) · ตัวที่ทั้งทีมรุมอยู่ ทุบลำตัว (โดนแรงขึ้น 25%) · ครีบหลังแตก = กันไม่ได้",
      "Hard hitters: break the mouth (weaker hits). Fast fish: the tail or pectorals (slower). Your focus target: the body (+25% damage taken). A broken dorsal can't guard."],
    ["loop-battle", "PERFECT คือของจริง", "PERFECT matters",
      "กดตรงแกนแรง ×1.55 ลงชิ้น ×2.2 ติดสถานะ และปลดผลพิเศษของธาตุเมื่อได้เปรียบ · กดพลาดมีโอกาสครึ่งหนึ่งที่ท่าไม่ติดเลย",
      "A dead-center hit deals ×1.55 (×2.2 to the part), lands its status and unlocks your element's bonus when you have the edge. A miss has a 50% chance to fizzle entirely."],
    ["sc-1", "กันทุกครั้งที่ทำได้", "Always guard",
      "ตอนศัตรูตี แตะตอนฝูงปลาหุบ — PARRY เหลือดาเมจ 65% · กันได้ 85% · และเติมหลอด BREAK ทั้งสองแบบ · ครีบหลังขั้นสูงขยายช่องกัน",
      "When a foe attacks, tap as the school closes in — PARRY leaves 65% damage, a guard 85%, and both fill your BREAK bar. A high-tier dorsal widens the window."],
    ["el-3", "ดูวงธาตุก่อนลง", "Check the element wheel",
      "น้ำแข็ง → เพลิง → เงา → ตะไคร่ → พิษ → กระแสไฟ → น้ำแข็ง · ตีธาตุถัดไป ×1.20 · ถัดอีกช่อง ×1.10 · กลับทางโดนลด · ธาตุมาจากสีลำตัว · สัปดาห์ช่วงน้ำธาตุนั้นแรงขึ้น 15%",
      "Frost → Fire → Shadow → Moss → Venom → Current → Frost. Next in line ×1.20, the one after ×1.10, the reverse is reduced. Element comes from body colour; the weekly tide boosts one element by 15%."],
    ["sys-team", "วางแถวให้ถูกงาน", "Use the rows",
      "แถวหน้ารับดาเมจน้อยลง 10% · แถวกลางตีแรงขึ้น 10% · แถวหลังท่าประชิดเอื้อมไม่ถึง และใช้ส่งจังหวะยกตาให้เพื่อน · ตัวอึดไว้หน้า ตัวตีไว้กลาง ตัวช่วยไว้หลัง",
      "Front row takes 10% less, middle hits 10% harder, back row is out of melee reach and can pass its turn to an ally. Tank in front, hitter in the middle, support at the back."],
    ["sys-heart", "ความอึดคือรอบเล่น", "Stamina is your pacing",
      "ต่ำกว่า 50% พลังเริ่มลด · 0% ลงสู้ไม่ได้ · ฟื้นเต็มใน 4 ชั่วโมง · ชนะด่านใหม่ครั้งแรกไม่เสียความอึด — หมุนปลาหลายตัว แล้วเหลือแรงไว้ผสม (ตัวละ 30%)",
      "Below 50% your fish weakens; at 0% it can't fight. Full again in 4 hours. Clearing a new stage the first time costs nothing — rotate several fish and keep 30% each for breeding."],
    ["loop-breed", "ไอเทมผสมให้เหมาะขั้น", "Match the item to the tier",
      "ไอเทมคูณโอกาส ไม่ใช่บวก — ขั้นต่ำตะไคร่ก็พอ ขั้นสูงของแพงคุ้มกว่ามาก · ธาตุเดียวกันโอกาส ×1.10 · สายเลือดชิด ×0.75 · ชิ้นที่แตกค้างขึ้นขั้นไม่ได้ พักให้หายก่อน",
      "Items multiply the odds — moss is fine at low tiers, premium items pay off at high tiers. Same element ×1.10, close kin ×0.75. A part still cracked from battle can't tier up — let it heal first."],
    ["sys-scale", "เกล็ดยีนไว้ช่องที่สำคัญ", "Spend scales where it counts",
      "เกล็ดเสริมทีละช่อง: ระดับ 1 กันถอย · 2–3 การันตีสืบขั้นสูงสุดและเพิ่มโอกาสขึ้นขั้น · ผ่านด่านครั้งแรกได้เกล็ดของชิ้นที่ศัตรูใช้ · หน้าก่อนผสมบอกโอกาสรายชิ้นรายขั้น",
      "Scales boost one slot: grade 1 stops a drop, grades 2–3 lock the best tier and add a tier-up chance. First clears drop scales for the part the foes used. The pre-breed screen shows the odds per part and tier."],
    ["sc-2", "คัดสายเพื่อเก็บท่า", "Breed to keep a move",
      "ชิ้นแต่ละแบบมีห้าท่า · ชิ้นที่ลูกได้จากพ่อหรือแม่มีโอกาส 40% ได้ท่าเดียวกับตัวนั้น — ผสมต่อสายเดิมเพื่อเก็บท่าที่ชอบ · ขั้นของชิ้นยิ่งสูง ท่าระดับทองยิ่งมาบ่อย",
      "Each part shape has five moves. A part inherited from a parent has a 40% chance to keep that parent's move — breed within a line to keep a favourite. Higher part tiers roll gold moves more often."],
    ["loop-loot", "จับปลาให้ติด", "Catch it",
      "ลดเลือดก่อน (เลือดเต็มติดยากสามเท่า) · ชา พันธนาการ หรือเกร็งช่วย ×1.5 · ใช้ของให้ตรงช่วงขั้นปลา · โยนจากแถวหลัง +15% · PERFECT ×1.35 · จับได้หนึ่งตัวต่อด่าน",
      "Wear it down first (full HP is three times harder). Numb, Bind or Stun ×1.5. Use the right catcher for its tier, throw from the back row (+15%), hit PERFECT (×1.35). One catch per stage."],
    ["sys-pond", "ปล่อยปลาไม่เสียเปล่า", "Releasing isn't waste",
      "ปล่อยแล้วได้สารพันธุกรรมทันที และขวดจากทะเลลอยกลับมาใน 12–24 ชั่วโมงพร้อมของตามขั้น — ตู้เต็มก็คัดได้ไม่ต้องเสียดาย",
      "Releasing gives gene essence right away, and a bottle drifts back in 12–24 hours with gifts by tier — cull a full tank without regret."],
    ["sys-dive", "อ่านกระแสน้ำก่อนดำ", "Read the current",
      "หอดำดิ่งตั้งแต่ชั้น 11 มีกระแสน้ำที่บอกก่อนเข้า เช่นน้ำขุ่นฟื้นครึ่งเดียว มืดสนิทแถบจังหวะแคบ — เลือกปลาให้เข้ากับชั้น · ชั้นที่ยังไม่เคยผ่านไม่เสียความอึด",
      "From floor 11 every tower floor shows its current before you enter — murky water halves healing, pitch dark narrows the bar. Bring fish that fit. Uncleared floors cost no stamina."],
    ["sys-event", "เก็บสามดาว", "Go for three stars",
      "ด่านละสามดาว: ผ่าน · ไม่มีตัวล้ม · PERFECT ครบ 5 ครั้ง (นับทั้งตีและกัน) · ดาวเต็มทั้งบทเปิดหีบของบท — กลับมาเก็บตอนทีมแรงขึ้น",
      "Three stars per stage: clear, nobody falls, 5 PERFECTs (attacks and guards both count). A full chapter of stars opens its chest — come back with a stronger team."],
    ["sc-3", "อย่าลืมเลือกไม้ตาย", "Pick your ultimate",
      "ปลาโตเต็มวัยได้ข้อเสนอสามช่อง เลือกครั้งเดียวถาวร — ยังไม่เลือก = ไม่มีไม้ตาย · หลอด BREAK เติมมากสุดตอนโดนตี",
      "An adult fish gets three ultimate offers — the pick is permanent, and with no pick it has no ultimate. The BREAK bar fills fastest when you take hits."],
    ["sys-pearl", "ไอเทมในด่านมีจำกัด", "Battle items are limited",
      "ใช้แทนท่าของตัวที่ถึงตา · ด่านละ 4 ชิ้น ฟื้นชีพได้ 1 ครั้ง · ติดพิษใช้ยาเลือดไม่ได้ ใช้น้ำทะเลใสล้างก่อน",
      "Using one replaces that fish's move. Four per stage, one revive. Venom blocks healing — clear it with Clear Water first."],
    ["sc-4", "อย่าดึงเกมยาว", "Don't stall",
      "เทิร์นที่ 40 ของแต่ละ wave เข้าน้ำเชี่ยว — ฟื้นและโล่อ่อนลง ศัตรูตีแรงขึ้นทุกสิบเทิร์น · ทีมที่จบเร็วได้เปรียบ",
      "At turn 40 of a wave the riptide sets in — heals and shields weaken and foes hit harder every ten turns. Fast teams win."]
  ];

  function guide(rootEl) {
    var chapters = D ? D.guide : [];
    function render(l) {
      var th = l === "th";
      var steps = STEPS.map(function (s, i) {
        return '<li class="p-reveal" style="--i:' + i + '"><img src="assets/icons/' + s[0] + '.png" alt=""><b>' + (th ? s[1] : s[2]) + "</b><span>" + (th ? s[3] : s[4]) + "</span></li>";
      }).join("");
      var chs = chapters.map(function (c, i) {
        return '<button type="button" class="p-ch p-reveal" style="--i:' + (i % 12) + '" data-ch="' + i + '"><img src="assets/icons/' + (ICON[c.key] || "sys-tank") + '.png" alt=""><span><b>' +
          esc(th ? c.th : c.en) + "</b><small>" + c.pages.length + (th ? " หน้า" : (c.pages.length > 1 ? " pages" : " page")) + "</small></span></button>";
      }).join("");
      var tips = TIPS.map(function (t, i) {
        return '<article class="p-tip p-reveal" style="--i:' + (i % 8) + '"><img src="assets/icons/' + t[0] + '.png" alt=""><b>' + esc(th ? t[1] : t[2]) + "</b><p>" + esc(th ? t[3] : t[4]) + "</p></article>";
      }).join("");
      rootEl.innerHTML =
        '<section class="p-sec" id="start"><h2><img src="assets/icons/logo-mark-w.png" alt="">' + (th ? "เริ่มต้นห้าก้าว" : "Five steps to start") + '</h2><p class="sub">' +
        (th ? "วงของเกม — ทุกอย่างหมุนกลับมาที่การผสมพันธุ์" : "The loop — everything comes back to breeding") + '</p><ol class="p-steps">' + steps + "</ol></section>" +
        '<section class="p-sec" id="chapters"><h2><img src="assets/icons/sys-gene.png" alt="">' + (th ? "คู่มือทุกบท" : "Every chapter") + '</h2><p class="sub">' +
        (th ? "ข้อความเดียวกับคู่มือในเกม แตะบทเพื่ออ่าน" : "The same text as the in-game guide — tap a chapter to read") + '</p><div class="p-chapters">' + chs + "</div></section>" +
        '<section class="p-sec" id="tips"><h2><img src="assets/icons/sc-0.png" alt="">' + (th ? "เคล็ดลับและกลเม็ด" : "Tips &amp; tricks") + '</h2><p class="sub">' +
        (th ? "สิ่งที่ผู้เล่นมือโปรทำ — ตัวเลขทุกตัวตรงกับเกมรุ่นปัจจุบัน" : "What strong players do — every number matches the current build") + '</p><div class="p-tips">' + tips + "</div></section>" +
        '<div class="p-foot-cta"><a class="btn" href="skills.html#' + l + '">' + (th ? "ดูท่าทั้งหมดในเกม →" : "See every move in the game →") + "</a></div>" +
        (D ? '<p class="p-gen">' + (th ? "คู่มืออัปเดตจากเกม · " : "Guide synced from the game · ") + esc(D.generated) + "</p>" : "");
      reveal(rootEl);
      rootEl.querySelectorAll(".p-ch").forEach(function (b) {
        b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - r.left) + "px"); b.style.setProperty("--my", (e.clientY - r.top) + "px"); });
        b.addEventListener("click", function () { openReader(+b.getAttribute("data-ch"), 0); });
      });
    }
    // ตัวอ่าน
    var rd = document.createElement("div");
    rd.className = "p-reader"; rd.setAttribute("role", "dialog"); rd.setAttribute("aria-modal", "true");
    rd.innerHTML = '<div class="p-card"><header><img alt=""><b></b><button type="button" class="p-x" aria-label="close">×</button></header><div class="p-pages"></div><div class="p-nav"><button type="button" class="p-prev"></button><div class="p-dots"></div><button type="button" class="p-next"></button></div></div>';
    document.body.appendChild(rd);
    var cur = { c: 0, p: 0 }, lastFocus = null;
    function show(dir) {
      var c = chapters[cur.c], th = lang === "th", pg = c.pages[cur.p];
      rd.querySelector("header img").src = "assets/icons/" + (ICON[c.key] || "sys-tank") + ".png";
      rd.querySelector("header b").textContent = th ? c.th : c.en;
      rd.querySelector(".p-pages").innerHTML = '<div class="p-page' + (dir < 0 ? " back" : "") + '"><h3>' + esc(th ? pg.thTitle : pg.enTitle) + "</h3><p>" + rich(th ? pg.th : pg.en) + "</p></div>";
      rd.querySelector(".p-dots").innerHTML = c.pages.map(function (_, i) { return "<i" + (i === cur.p ? ' class="on"' : "") + "></i>"; }).join("");
      var prev = rd.querySelector(".p-prev"), next = rd.querySelector(".p-next");
      prev.textContent = th ? "← ก่อนหน้า" : "← Back"; prev.disabled = cur.p === 0;
      next.textContent = cur.p < c.pages.length - 1 ? (th ? "ถัดไป →" : "Next →") : (cur.c < chapters.length - 1 ? (th ? "บทถัดไป →" : "Next chapter →") : (th ? "ปิด" : "Close"));
    }
    function openReader(c, p) { lastFocus = document.activeElement; cur.c = c; cur.p = p; show(1); rd.classList.add("open"); rd.querySelector(".p-next").focus({ preventScroll: true }); }
    function close() { rd.classList.remove("open"); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
    function step(d) {
      var c = chapters[cur.c];
      if (d > 0) { if (cur.p < c.pages.length - 1) cur.p++; else if (cur.c < chapters.length - 1) { cur.c++; cur.p = 0; } else { close(); return; } }
      else { if (cur.p > 0) cur.p--; else return; }
      show(d);
    }
    rd.querySelector(".p-x").addEventListener("click", close);
    rd.addEventListener("click", function (e) { if (e.target === rd) close(); });
    rd.querySelector(".p-prev").addEventListener("click", function () { step(-1); });
    rd.querySelector(".p-next").addEventListener("click", function () { step(1); });
    document.addEventListener("keydown", function (e) {
      if (!rd.classList.contains("open")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1);
    });
    var sx = 0;
    rd.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    rd.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
    listeners.push(function (l) { render(l); if (rd.classList.contains("open")) show(1); });
  }

  var g = document.getElementById("guide-root");
  if (g && D) guide(g);
  var sk = document.getElementById("skills-root");
  if (sk && D && window.AbyssSkills) {
    var app = window.AbyssSkills.mount(sk, { lang: lang, internal: false, icons: "assets/icons/" });
    listeners.push(function (l) { app.setLang(l); });
  }
  apply();
})();
