/* เว็บไซต์ NECH — สลับภาษา · ไฮไลต์สารบัญ · สารบัญแบบปุ่มลอย + แผ่นจากล่างบนมือถือ/แท็บเล็ต
   ไม่มี JS ก็อ่านได้ครบ (สองภาษาเรียงต่อกัน · สารบัญเป็นกล่องพับ)
   ภาษาเริ่มต้น: #th / #en / หัวข้อในลิงก์ → ที่เลือกไว้ครั้งก่อน (เก็บในเครื่องผู้อ่านเท่านั้น) → ภาษาเครื่อง (ไทย = ไทย · อื่น ๆ = อังกฤษ) */
(function () {
  var secs = { th: document.getElementById("th"), en: document.getElementById("en") };
  if (!secs.th || !secs.en) return;
  var root = document.documentElement;
  root.classList.add("js");
  var pills = document.querySelectorAll("nav.lang a[data-lang]");
  var cur = "th";

  function langOfHash(h) {
    h = (h || "").replace("#", "");
    if (h === "th" || h === "en") return h;
    var el = h && document.getElementById(h);
    if (el && el.closest) { var s = el.closest("section[lang]"); if (s) return s.id; }
    return null;
  }
  function stored() { try { return localStorage.getItem("lang"); } catch (e) { return null; } }

  // ── แผ่นสารบัญจากล่าง (มือถือ/แท็บเล็ต) ──
  var fab = document.createElement("button");
  fab.className = "fab"; fab.type = "button"; fab.setAttribute("aria-haspopup", "dialog");
  fab.innerHTML = '<i aria-hidden="true"></i><span></span>';
  var scrim = document.createElement("div"); scrim.className = "scrim";
  var sheet = document.createElement("div");
  sheet.className = "sheet"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true");
  sheet.innerHTML = '<div class="grip" aria-hidden="true"></div><div class="sheet-title"><span></span><a href="#doc"></a></div><ol></ol>';
  document.body.appendChild(fab); document.body.appendChild(scrim); document.body.appendChild(sheet);

  var words = { th: { toc: "สารบัญ", top: "กลับขึ้นบน ↑" }, en: { toc: "Contents", top: "Back to top ↑" } };
  function fillSheet(l) {
    var src = secs[l].querySelector("nav.toc ol");
    sheet.querySelector("ol").innerHTML = src ? src.innerHTML : "";
    fab.querySelector("span").textContent = words[l].toc;
    fab.setAttribute("aria-label", words[l].toc);
    sheet.setAttribute("aria-label", words[l].toc);
    sheet.querySelector(".sheet-title span").textContent = words[l].toc;
    sheet.querySelector(".sheet-title a").textContent = words[l].top;
  }
  function openSheet(on) {
    root.classList.toggle("sheet-open", on);
    if (on) { var a = sheet.querySelector("a.on") || sheet.querySelector("ol a"); if (a) a.focus({ preventScroll: true }); }
    else fab.focus({ preventScroll: true });
  }
  fab.addEventListener("click", function () { openSheet(true); });
  scrim.addEventListener("click", function () { openSheet(false); });
  sheet.addEventListener("click", function (ev) { if (ev.target.closest && ev.target.closest("a")) openSheet(false); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && root.classList.contains("sheet-open")) openSheet(false); });

  function pick(l, keepScroll) {
    cur = l;
    for (var k in secs) secs[k].hidden = k !== l;
    for (var i = 0; i < pills.length; i++) pills[i].setAttribute("aria-pressed", pills[i].getAttribute("data-lang") === l ? "true" : "false");
    root.lang = l;
    try { localStorage.setItem("lang", l); } catch (e) {}
    fillSheet(l);
    if (!keepScroll) window.scrollTo(0, 0);
    watch(secs[l]);
  }

  for (var i = 0; i < pills.length; i++) {
    pills[i].addEventListener("click", function (ev) {
      ev.preventDefault();
      var l = this.getAttribute("data-lang");
      if (history.replaceState) history.replaceState(null, "", "#" + l);
      pick(l, false);
    });
  }
  window.addEventListener("hashchange", function () {
    var l = langOfHash(location.hash);
    if (l && l !== cur) pick(l, true);
  });

  // ── ไฮไลต์หัวข้อที่กำลังอ่าน (สารบัญข้างซ้าย + แผ่นจากล่าง) ──
  var io = null;
  function watch(sec) {
    if (io) io.disconnect();
    if (!("IntersectionObserver" in window)) return;
    var ids = [];
    var links = sec.querySelectorAll("nav.toc a[href^='#']");
    for (var i = 0; i < links.length; i++) ids.push(links[i].getAttribute("href").slice(1));
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var all = document.querySelectorAll("nav.toc a, .sheet a");
        for (var j = 0; j < all.length; j++) all[j].classList.toggle("on", all[j].getAttribute("href") === "#" + e.target.id);
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  // ปุ่มลอยหลบตอนเลื่อนลงเร็ว แล้วกลับมาเมื่อเลื่อนขึ้น/หยุด — ไม่บังตัวหนังสือที่กำลังอ่าน
  var lastY = window.scrollY, idle = null;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    fab.classList.toggle("away", y > lastY + 6 && y > 300);
    lastY = y;
    clearTimeout(idle); idle = setTimeout(function () { fab.classList.remove("away"); }, 700);
  }, { passive: true });

  var nav = (navigator.language || "").toLowerCase();
  var start = langOfHash(location.hash) || stored() || (nav.indexOf("th") === 0 ? "th" : "en");
  pick(start === "th" || start === "en" ? start : "en", true);

  // จอกว้าง: สารบัญข้างซ้ายกางไว้เสมอ
  if (window.matchMedia && window.matchMedia("(min-width:1040px)").matches) {
    var ds = document.querySelectorAll("nav.toc details");
    for (var j = 0; j < ds.length; j++) ds[j].open = true;
  }
})();
