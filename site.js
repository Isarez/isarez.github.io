/* เว็บไซต์ NECH — สลับภาษา + ไฮไลต์สารบัญ (ไม่มี JS ก็อ่านได้ครบ: สองภาษาเรียงต่อกัน)
   ภาษาเริ่มต้น: #th / #en / หัวข้อในลิงก์ → ที่เลือกไว้ครั้งก่อน (เก็บในเครื่องผู้อ่านเท่านั้น) → ภาษาเครื่อง (ไทย = ไทย · อื่น ๆ = อังกฤษ) */
(function () {
  var secs = { th: document.getElementById("th"), en: document.getElementById("en") };
  if (!secs.th || !secs.en) return;
  document.documentElement.classList.add("js");
  var pills = document.querySelectorAll("nav.lang a[data-lang]");

  function langOfHash(h) {
    h = (h || "").replace("#", "");
    if (h === "th" || h === "en") return h;
    var el = h && document.getElementById(h);
    if (el && el.closest) { var s = el.closest("section[lang]"); if (s) return s.id; }
    return null;
  }
  function stored() { try { return localStorage.getItem("lang"); } catch (e) { return null; } }

  function pick(l, keepScroll) {
    for (var k in secs) secs[k].hidden = k !== l;
    for (var i = 0; i < pills.length; i++) pills[i].setAttribute("aria-pressed", pills[i].getAttribute("data-lang") === l ? "true" : "false");
    document.documentElement.lang = l;
    try { localStorage.setItem("lang", l); } catch (e) {}
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
    if (l && secs[l].hidden) pick(l, true);
  });

  // สารบัญ: ไฮไลต์หัวข้อที่กำลังอ่าน
  var io = null;
  function watch(sec) {
    if (io) io.disconnect();
    if (!("IntersectionObserver" in window)) return;
    var links = sec.querySelectorAll("nav.toc a[href^='#']");
    var map = {};
    for (var i = 0; i < links.length; i++) map[links[i].getAttribute("href").slice(1)] = links[i];
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        for (var id in map) map[id].classList.toggle("on", id === e.target.id);
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    for (var id in map) { var el = document.getElementById(id); if (el) io.observe(el); }
  }

  var nav = (navigator.language || "").toLowerCase();
  var start = langOfHash(location.hash) || stored() || (nav.indexOf("th") === 0 ? "th" : "en");
  pick(start === "th" || start === "en" ? start : "en", true);

  // จอกว้าง: สารบัญกางไว้เสมอ
  if (window.matchMedia && window.matchMedia("(min-width:1040px)").matches) {
    var ds = document.querySelectorAll("nav.toc details");
    for (var j = 0; j < ds.length; j++) ds[j].open = true;
  }
})();
