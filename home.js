/* หน้าแรก — วงโคจรวัฏจักร (สูตรเดียวกับ `HelpArt.Orbiter` ในคู่มือ) · เม็ดแสงกลางวง · วงหกธาตุ · ของที่ค่อย ๆ โผล่
   ระบบเกมเป็นหน้ายาวสี่ช่วงต่อกัน (ไม่มีแท็บแล้ว · 11 ต.ค. 69) — ไอคอนบนวงเป็นลิงก์ไปช่วงนั้น
   ไม่มี JS ก็อ่านได้ครบ: จุดแสงไม่โคจร · ทุกอย่างมองเห็นทันที
   ตั้งลดการเคลื่อนไหว = ไม่มีจุดโคจร ไม่มีการโผล่ แอนิเมชันหยุด (home.css) */
(function () {
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  root.classList.add("js");

  // ── ของที่ค่อย ๆ โผล่ตอนเลื่อนถึง ──
  var seen = null;
  if (!still && "IntersectionObserver" in window) {
    root.classList.add("rv-on");
    seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); seen.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) { seen.observe(el); });
  } else {
    // ลดการเคลื่อนไหว/ไม่มีตัวสังเกต — ทุกอย่าง "ถึงแล้ว" ทันที (แถบโอกาสรายขั้นเติมเต็มเลย ไม่ค้างว่าง)
    document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
  }

  // ── วงโคจร — จุดแสงอำพันวิ่งตามเข็มนาฬิกา 1.1 เรเดียน/วิ · ไอคอนที่จุดผ่านโต ×1.22 สว่าง 0.6 → 1 ภายใน 60° (`Orbiter`) ──
  var orbits = document.querySelectorAll(".orbit");
  var visible = new Set();
  if ("IntersectionObserver" in window) {
    var oio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); }); });
    orbits.forEach(function (o) { oio.observe(o); });
  } else orbits.forEach(function (o) { visible.add(o); });
  function frame(ts) {
    var t = ts / 1000;
    visible.forEach(function (o) {
      if (o.offsetParent === null) return;      // อยู่ในภาษาที่ซ่อนอยู่
      var track = o.querySelector(".track"), dot = o.querySelector(".dot");
      var W = o.clientWidth, H = o.clientHeight;
      var tl = track.offsetLeft, tt = track.offsetTop, tw = track.offsetWidth, th = track.offsetHeight;
      var cx = tl + tw / 2, cy = tt + th / 2, rx = tw / 2, ry = th / 2;
      var a = Math.PI / 2 - t * 1.1;
      if (dot) dot.style.transform = "translate(" + (cx + Math.cos(a) * rx).toFixed(1) + "px," + (cy - Math.sin(a) * ry).toFixed(1) + "px)";
      var ns = o.querySelectorAll(".node"), beads = o.querySelectorAll(".bead");
      for (var i = 0; i < ns.length; i++) {
        var ia = Math.PI / 2 - i * Math.PI / 2;
        var d = Math.abs(((a - ia) * 180 / Math.PI) % 360); if (d > 180) d = 360 - d;
        var k = Math.max(0, Math.min(1, 1 - d / 60));
        ns[i].style.setProperty("--k-scale", (1 + 0.22 * k).toFixed(3));
        ns[i].style.setProperty("--k-alpha", (0.6 + 0.4 * k).toFixed(3));
        ns[i].style.setProperty("--k-glow", k.toFixed(3));
        if (beads[i]) beads[i].style.setProperty("--kb", k.toFixed(3));   // เม็ดแสงทิศเดียวกันบนลูกแก้วกลางวงสว่างตาม
      }
    });
    requestAnimationFrame(frame);
  }
  if (!still) requestAnimationFrame(frame);
  else orbits.forEach(function (o) { o.querySelectorAll(".node").forEach(function (n) { n.style.setProperty("--k-alpha", "1"); }); });

  // ── มาตรวัดความลึก — 200 ม. ที่หัวหน้า ถึง 10,900 ม. (ร่องลึกที่สุดของโลก) ที่ท้ายหน้า · ภาษาตามส่วนที่แสดง ──
  var gauge = document.querySelector(".depth");
  if (gauge) {
    var num = gauge.querySelector("b"), dot = gauge.querySelector(".dbar i");
    var lab = gauge.querySelectorAll("[data-th]");
    var tick = function () {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var f = Math.min(1, Math.max(0, window.scrollY / max));
      var m = Math.round((200 + f * f * 10700) / 10) * 10;      // ไล่ช้าตอนบน เร็วตอนลึก — เหมือนน้ำที่มืดเร็วขึ้นตามความลึก
      num.textContent = m.toLocaleString("en-US");
      dot.style.setProperty("--p", (f * 100).toFixed(1) + "%");
      var l = document.documentElement.lang === "en" ? "en" : "th";
      for (var i = 0; i < lab.length; i++) lab[i].textContent = lab[i].getAttribute("data-" + l);
    };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("hashchange", tick);
    document.querySelectorAll("nav.lang a").forEach(function (a) { a.addEventListener("click", function () { setTimeout(tick, 0); }); });
    tick();
  }

  // ── วงหกธาตุ — ไล่ทีละธาตุ: ชนะทาง (×1.35) ช่องถัดไป · ได้เปรียบ (×1.15) ช่องถัดอีก ──
  document.querySelectorAll(".wheel").forEach(function (w) {
    var els = w.querySelectorAll(".el"), arcs = w.querySelectorAll(".arc"), note = w.parentNode.querySelector(".wheel-note");
    var names = (w.getAttribute("data-names") || "").split("|");
    var th = w.closest("section[lang]").getAttribute("lang") === "th";
    var k = 0;
    function show() {
      for (var i = 0; i < els.length; i++) els[i].className = "el" + (i === k ? " atk" : i === (k + 1) % 6 ? " def" : i === (k + 2) % 6 ? " def2" : "");
      for (var j = 0; j < arcs.length; j++) arcs[j].classList.toggle("hit", j === k);
      if (note) {
        var a = names[k], b = names[(k + 1) % 6], c = names[(k + 2) % 6];
        note.innerHTML = th
          ? "<b>" + a + "</b>ชนะทาง <b style='display:inline;font-size:inherit'>" + b + "</b> <span class='x'>×1.35</span><br>ได้เปรียบ " + c + " <span class='x'>×1.15</span><br>กลับทางโดนลด <span class='x'>×0.65 · ×0.85</span>"
          : "<b>" + a + "</b>Strong against <b style='display:inline;font-size:inherit'>" + b + "</b> <span class='x'>×1.35</span><br>Edge on " + c + " <span class='x'>×1.15</span><br>The reverse is reduced <span class='x'>×0.65 · ×0.85</span>";
      }
    }
    show();
    if (!still) setInterval(function () { if (w.offsetParent !== null) { k = (k + 1) % 6; show(); } }, 2200);
  });
})();
