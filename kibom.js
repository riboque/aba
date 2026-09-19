(function(){
  "use strict";
  var FX = 24.5; // dobra pegged to the euro since 2010: 1 € = 24,5 Db
  var region = "pt";

  /* ---- região: preços, telefone, nota cambial ---- */
  function fmtEur(v){ return v.toLocaleString("pt-PT") + " €"; }
  function fmtDb(v){ return Math.round(v * FX / 5) * 5 + " Db"; }
  function paintPrices(){
    document.querySelectorAll("[data-eur]").forEach(function(el){
      var v = parseFloat(el.getAttribute("data-eur"));
      var from = el.hasAttribute("data-from") ? "desde " : "";
      el.textContent = from + (region === "stp" ? fmtDb(v) : fmtEur(v));
    });
    var note = document.getElementById("fxNote");
    note.textContent = region === "stp"
      ? "Preços em dobras, convertidos à taxa fixa de 1 € = 24,5 Db. Em São Tomé aceitamos dobras e euros; transporte fora de Água Grande orçamentado à parte."
      : "Preços em euros, IVA incluído. Para São Tomé mostramos o valor em dobras à taxa fixa de 1 € = 24,5 Db. Transporte fora da Grande Lisboa orçamentado à parte.";
  }
  function setRegion(r){
    region = r;
    document.querySelectorAll("[data-region-btn]").forEach(function(b){
      b.setAttribute("aria-pressed", String(b.getAttribute("data-region-btn") === r));
    });
    var sel = document.getElementById("f-local");
    if (sel && !sel.dataset.touched) sel.value = (r === "stp" ? "stp" : "pt");
    paintPrices();
    buildMsg();
  }
  document.querySelectorAll("[data-region-btn]").forEach(function(b){
    b.addEventListener("click", function(){ setRegion(b.getAttribute("data-region-btn")); });
  });

  /* ---- menu mobile ---- */
  var nav = document.getElementById("nav"), burger = document.getElementById("burger");
  function closeNav(){ nav.setAttribute("data-open","false"); burger.setAttribute("aria-expanded","false"); }
  burger.addEventListener("click", function(){
    var open = nav.getAttribute("data-open") === "true";
    nav.setAttribute("data-open", String(!open));
    burger.setAttribute("aria-expanded", String(!open));
  });
  document.getElementById("navClose").addEventListener("click", closeNav);
  nav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeNav); });

  /* ---- modo revisão ---- */
  var rb = document.getElementById("reviewBtn");
  rb.addEventListener("click", function(){
    var on = document.body.classList.toggle("review");
    rb.setAttribute("aria-pressed", String(on));
    rb.textContent = on ? "Esconder marcações" : "Marcar o que falta preencher";
  });

  /* ---- galeria: filtros ---- */
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function(chip){
    chip.addEventListener("click", function(){
      var f = chip.getAttribute("data-filter");
      chips.forEach(function(c){ c.setAttribute("aria-pressed", String(c === chip)); });
      document.querySelectorAll("#gal .shot").forEach(function(s){
        s.hidden = !(f === "todos" || s.getAttribute("data-cat") === f);
      });
    });
  });

  /* ---- lightbox ---- */
  var lb = document.getElementById("lb"), lbArt = document.getElementById("lbArt"),
      lbCap = document.getElementById("lbCap"), lastTrigger = null;
  document.querySelectorAll(".shot-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var fig = btn.closest(".shot");
      var art = fig.querySelector(".shot-art");
      lbArt.className = "shot-art " + (art.classList.contains("b") ? "b" : art.classList.contains("c") ? "c" : art.classList.contains("d") ? "d" : "a");
      lbArt.innerHTML = art.innerHTML;
      lbCap.textContent = fig.querySelector("figcaption").textContent;
      lb.hidden = false; lastTrigger = btn;
      document.getElementById("lbClose").focus();
    });
  });
  function closeLb(){ lb.hidden = true; if (lastTrigger) lastTrigger.focus(); }
  document.getElementById("lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", function(e){ if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape"){ if (!lb.hidden) closeLb(); closeNav(); }
  });

  /* ---- formulário -> mensagem ---- */
  var form = document.getElementById("quoteForm");
  var out = document.getElementById("msgPreview");
  var waLink = document.getElementById("waLink");
  var mailLink = document.getElementById("mailLink");
  var LOCALS = { "pt":"Grande Lisboa", "pt-out":"Portugal (outra zona)", "stp":"São Tomé", "principe":"Príncipe" };
  // substituir pelos números e email reais da empresa
  var WA = { pt:"351900000000", stp:"2399000000" };
  var MAIL = { pt:"geral@exemplo.pt", stp:"stp@exemplo.st" };

  function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function dataPT(iso){
    if (!iso) return "";
    var p = iso.split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }
  function buildMsg(){
    var nome = val("f-nome") || "…";
    var localKey = val("f-local") || "pt";
    var linhas = [
      "Ola  Kibom cakes! Sou " + nome + " e queria um orçamento.",
      "Evento: " + val("f-tipo"),
      "Onde: " + (LOCALS[localKey] || localKey),
      "Data: " + (dataPT(val("f-data")) || "por definir"),
      "Pessoas: " + (val("f-pessoas") || "por definir")
    ];
    var msg = val("f-msg");
    if (msg) linhas.push("", msg);
    var contacto = val("f-contacto");
    if (contacto) linhas.push("", "Contacto: " + contacto);
    var texto = linhas.join("\n");
    out.textContent = texto;
    var dest = (localKey === "stp" || localKey === "principe") ? "stp" : "pt";
    waLink.href = "https://wa.me/" + WA[dest] + "?text=" + encodeURIComponent(texto);
    mailLink.href = "mailto:" + MAIL[dest] + "?subject=" + encodeURIComponent("Pedido de orçamento — " + val("f-tipo")) + "&body=" + encodeURIComponent(texto);
    return texto;
  }
  form.addEventListener("input", buildMsg);
  form.addEventListener("change", buildMsg);
  document.getElementById("f-local").addEventListener("change", function(){ this.dataset.touched = "1"; });
  form.addEventListener("submit", function(e){ e.preventDefault(); });

  document.getElementById("copyBtn").addEventListener("click", function(){
    var texto = buildMsg(), note = document.getElementById("copied");
    function ok(){ note.textContent = "Mensagem copiada."; setTimeout(function(){ note.textContent = ""; }, 2600); }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(texto).then(ok, function(){ note.textContent = "Não foi possível copiar — selecione o texto acima."; });
    } else { note.textContent = "Não foi possível copiar — selecione o texto acima."; }
  });

  /* ---- fab segue o destino ---- */
  document.getElementById("yr").textContent = new Date().getFullYear();
  setRegion("pt");
  buildMsg();
})();