/* Xord X Dev interactions — no build tools required.
   Add your Tally URL below. Use the public share URL from Tally. */
const TALLY_FORM_URL = ""; // Example: "https://tally.so/r/yourFormID"

(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  $("#year").textContent = new Date().getFullYear();

  // Service filtering and live search
  const cards = $$(".service-card");
  let activeFilter = "all";
  const searchInput = $("#serviceSearch");
  function filterServices() {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesQuery = !query || (card.dataset.search + " " + card.innerText).toLowerCase().includes(query);
      const show = matchesCategory && matchesQuery;
      card.hidden = !show;
      if (show) visible++;
    });
    $("#emptyState").hidden = visible > 0;
    $$(".filter-pill").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === activeFilter));
  }
  $$(".filter-pill").forEach(btn => btn.addEventListener("click", () => { activeFilter = btn.dataset.filter; filterServices(); }));
  searchInput.addEventListener("input", filterServices);

  // 2D / 3D visual mode
  $$(".view-button").forEach(btn => btn.addEventListener("click", () => {
    const is3d = btn.dataset.view === "3d";
    document.body.classList.toggle("view-3d", is3d);
    $$(".view-button").forEach(b => { const active = b === btn; b.classList.toggle("active", active); b.setAttribute("aria-pressed", String(active)); });
  }));

  // Contact links preselect service in the Tally URL when Tally supports URL parameters.
  $$("[data-service]").forEach(link => link.addEventListener("click", () => {
    try {
      const url = new URL(TALLY_FORM_URL);
      url.searchParams.set("service", link.dataset.service);
      const iframe = $("#tallyEmbedSlot iframe");
      if (iframe) iframe.src = url.toString();
    } catch (_) { /* The user has not configured a Tally URL yet. */ }
  }));

  // Tally embed
  const tallySlot = $("#tallyEmbedSlot");
  function loadTallyForm() {
    if (!TALLY_FORM_URL.trim()) return;
    let url;
    try { url = new URL(TALLY_FORM_URL.trim()); } catch (_) { return; }
    if (!["https:", "http:"].includes(url.protocol) || !/tally\.so$/i.test(url.hostname) && !/\.tally\.so$/i.test(url.hostname)) return;
    const iframe = document.createElement("iframe");
    iframe.src = url.toString();
    iframe.title = "Xord X Dev project inquiry form";
    iframe.loading = "lazy";
    iframe.allow = "camera; microphone; autoplay; encrypted-media;";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    tallySlot.replaceChildren(iframe);
    $(".form-intro").textContent = "Share your project details below. Tally handles the form submission.";
  }
  loadTallyForm();
  $("#showSetup").addEventListener("click", () => { $("#tallySetup").hidden = false; });
  $("#hideSetup").addEventListener("click", () => { $("#tallySetup").hidden = true; });

  // Global search overlay
  const overlay = $("#searchOverlay");
  const globalInput = $("#globalSearch");
  function openSearch() { overlay.hidden = false; globalInput.value = ""; renderSearch(""); globalInput.focus(); document.body.style.overflow = "hidden"; }
  function closeSearch() { overlay.hidden = true; document.body.style.overflow = ""; }
  function renderSearch(query) {
    const q = query.trim().toLowerCase();
    const items = [
      ...cards.map(card => ({ title: $("h3", card).textContent, desc: $("p", card).textContent, target: "#services", keywords: card.dataset.search })),
      {title:"CV starter",desc:"Create a clean first draft of your CV.",target:"#tools",keywords:"cv resume tool"},
      {title:"Document helper",desc:"Organize notes into a document outline.",target:"#tools",keywords:"word document letter"},
      {title:"Slide planner",desc:"Plan a presentation with a logical sequence.",target:"#tools",keywords:"slides powerpoint presentation"},
      {title:"Contact & project inquiry",desc:"Tell us what you want to build.",target:"#contact",keywords:"contact tally form quote project"}
    ].filter(item => !q || (item.title+" "+item.desc+" "+item.keywords).toLowerCase().includes(q)).slice(0,7);
    const resultBox = $("#searchResults");
    resultBox.replaceChildren();
    if (!items.length) { const empty=document.createElement("span"); empty.className="search-hint"; empty.textContent="No matches yet. Try a broader search."; resultBox.append(empty); return; }
    items.forEach(item => {
      const button=document.createElement("button"); button.className="search-result";
      const copy=document.createElement("div"); const title=document.createElement("strong"); title.textContent=item.title;
      const desc=document.createElement("small"); desc.textContent=item.desc; copy.append(title,desc);
      const arrow=document.createElement("span"); arrow.textContent="↗"; button.append(copy,arrow);
      button.addEventListener("click",()=>{ closeSearch(); location.hash=item.target; if(item.target==="#services"){searchInput.value=q;activeFilter="all";filterServices();} });
      resultBox.append(button);
    });
  }
  $(".search-open").addEventListener("click", openSearch);
  globalInput.addEventListener("input", () => renderSearch(globalInput.value));
  overlay.addEventListener("click", e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="k") { e.preventDefault(); openSearch(); }
    if (e.key==="Escape") { closeSearch(); closeChat(); closeToolModal(); }
  });

  // Responsive navigation
  const menuToggle = $(".menu-toggle"), nav = $(".desktop-nav");
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open"); menuToggle.setAttribute("aria-expanded", String(open));
  });
  $$(".desktop-nav a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded","false"); }));

  // Interactive local assistant: clearly disclosed as a non-AI demo.
  const chatPanel = $("#chatPanel"), chatLauncher = $("#chatLauncher"), chatMessages = $("#chatMessages");
  function openChat() { chatPanel.hidden=false; chatLauncher.classList.add("open"); chatLauncher.setAttribute("aria-expanded","true"); $("#chatInput").focus(); }
  function closeChat() { if (!chatPanel) return; chatPanel.hidden=true; chatLauncher.classList.remove("open"); chatLauncher.setAttribute("aria-expanded","false"); }
  chatLauncher.addEventListener("click", () => chatPanel.hidden ? openChat() : closeChat());
  $("#chatClose").addEventListener("click", closeChat);
  const quickReplies = $$(".quick-replies button");
  function addMessage(text, type) { const node=document.createElement("div"); node.className="message "+(type==="user"?"user-message":"assistant-message"); node.textContent=text; chatMessages.append(node); chatMessages.scrollTop=chatMessages.scrollHeight; }
  function guideReply(message) {
    const m=message.toLowerCase();
    if (/website|web app|ecommerce|portfolio|landing/.test(m)) return "For websites, we can help with business sites, landing pages, portfolios and web apps. A good first step is to share your goal, audience and any reference links in the project inquiry form.";
    if (/chatbot|chat bot|ai bot|support bot/.test(m)) return "Our chatbot service can be planned for FAQs, lead capture and customer support flows. The right setup depends on where it will run and what information it should use. Select “AI chatbot” in your project inquiry.";
    if (/automat|make\.com|n8n|workflow|integration/.test(m)) return "Automation can connect forms, email, CRM and other tools to reduce repetitive work. List the tools you already use and the task you want to automate in your inquiry.";
    if (/marketing|social|seo|growth|campaign/.test(m)) return "Digital marketing can include content planning, social media presence and SEO basics. We recommend defining one measurable business goal before choosing tactics.";
    if (/cv|resume|word|document|slides|presentation|tool/.test(m)) return "Try the browser-based starter tools in the “Useful by design” section. They create editable drafts locally; they are not connected to a live AI model.";
    if (/price|cost|budget|quote/.test(m)) return "Pricing depends on the scope, features and timeline. Share what you need and your approximate budget through the project inquiry form so the requirements can be reviewed.";
    if (/location|address|rawalpindi|committee chowk|office/.test(m)) return "Xord X Dev is listed as based in Committee Chowk, Rawalpindi, Pakistan. Please confirm an in-person meeting before visiting.";
    if (/human|contact|email|talk|project|start/.test(m)) return "The best next step is the project inquiry form in the contact section. Add your Tally form URL in script.js to enable submissions.";
    return "I’m a local demo guide, not a live AI assistant yet. I can point you toward websites, AI chatbots, automations, digital marketing, design and browser tools. What are you hoping to achieve?";
  }
  function submitChat(text) { const msg=text.trim(); if(!msg)return; addMessage(msg,"user"); addMessage(guideReply(msg),"assistant"); }
  $("#chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#chatInput");submitChat(input.value);input.value="";});
  quickReplies.forEach(btn=>btn.addEventListener("click",()=>{ $$(".quick-replies").forEach(el=>el.remove());submitChat(btn.dataset.prompt); }));
  $$("[data-service]").forEach(link => link.addEventListener("click", () => {
    // The form is the main action; service is also sent into the local assistant if opened.
  }));

  // Local CV, document and slide planning tools
  const modal=$("#toolModal"), fields=$("#toolFields"), outputWrap=$("#toolOutputWrap"), output=$("#toolOutput");
  let currentTool="cv";
  const toolConfigs = {
    cv:{title:"CV starter",intro:"Fill in a few details to create a simple, editable CV draft.",fields:[
      ["name","Full name","text","Your full name"],["role","Role or objective","text","e.g. Student / Web Designer"],["email","Email or contact","text","you@example.com"],["skills","Skills (comma-separated)","text","HTML, communication, teamwork"],["experience","Experience or education","textarea","Add education, projects or experience here"]
    ],make:v=>`${v.name||"YOUR NAME"}\n${v.role||"Professional / Student"}\nContact: ${v.email||"Add your contact"}\n\nPROFILE\n${v.role?`Interested in ${v.role.toLowerCase()} opportunities.`:"Write a short profile about your goals and strengths."}\n\nSKILLS\n${v.skills||"Add relevant skills"}\n\nEDUCATION / EXPERIENCE\n${v.experience||"Add your education, projects, achievements or experience."}\n\nREFERENCES\nAvailable on request.`},
    doc:{title:"Document helper",intro:"Turn a subject and notes into a structured document outline.",fields:[
      ["title","Document title","text","e.g. Project Proposal"],["audience","Who is it for?","text","Client, teacher, team…"],["notes","Key notes","textarea","Write your main points here"]
    ],make:v=>`${v.title||"DOCUMENT TITLE"}\n\nPrepared for: ${v.audience||"Intended audience"}\n\nOVERVIEW\n${v.notes||"Add a concise summary of the purpose of this document."}\n\nKEY DETAILS\n• Background and context\n• Main points / requirements\n• Proposed next steps\n\nACTION ITEMS\n1. Confirm the requirements.\n2. Review the draft.\n3. Finalize and share.`},
    slides:{title:"Slide planner",intro:"Create a presentation outline you can use in PowerPoint or Google Slides.",fields:[
      ["title","Presentation topic","text","e.g. Introducing our business"],["audience","Audience","text","Customers, class, team…"],["count","Number of slides","select","5",["5","6","7","8","10"]],["notes","Main points to cover","textarea","List the key ideas"]
    ],make:v=>{const n=Math.max(3,Math.min(10,Number(v.count)||5));const titles=["Title & introduction","The opportunity / problem","Key idea or solution","How it works","Benefits and evidence","Plan and next steps","Summary & questions"];let lines=`${v.title||"PRESENTATION"}\nAudience: ${v.audience||"Your audience"}\n\n`;for(let i=0;i<n;i++)lines+=`SLIDE ${i+1}: ${i===0?(v.title||titles[0]):titles[i%titles.length]}\n${i===0?"Introduce the topic and the presenter.":i===n-1?"Summarize the key points and invite questions.":"• Main point\n• Supporting detail\n• Example or visual"}\n\n`;return lines+`NOTES TO INCLUDE\n${v.notes||"Add your key points and examples."}`;}}
  };
  function openTool(name) {
    currentTool=name;const config=toolConfigs[name];if(!config)return;
    $("#modalTitle").textContent=config.title;$("#modalIntro").textContent=config.intro;fields.replaceChildren();outputWrap.hidden=true;output.value="";$("#copyStatus").textContent="";
    const grid=document.createElement("div");grid.className="field-grid";
    config.fields.forEach(([id,label,type,placeholder,options])=>{
      const wrap=document.createElement("label");wrap.textContent=label;wrap.htmlFor="field-"+id;
      let input;
      if(type==="textarea"){input=document.createElement("textarea");input.placeholder=placeholder;input.rows=3;}
      else if(type==="select"){input=document.createElement("select");(options||[]).forEach(opt=>{const o=document.createElement("option");o.value=opt;o.textContent=opt;input.append(o);});}
      else{input=document.createElement("input");input.type=type;input.placeholder=placeholder;}
      input.id="field-"+id;input.name=id;
      if(type==="textarea"||id==="notes"||id==="experience")wrap.classList.add("wide");
      wrap.append(input);grid.append(wrap);
    });
    fields.append(grid);modal.hidden=false;document.body.style.overflow="hidden";
  }
  function closeToolModal(){if(!modal)return;modal.hidden=true;document.body.style.overflow="";}
  $$(".tool-launch").forEach(btn=>btn.addEventListener("click",()=>openTool(btn.dataset.tool)));
  $$("[data-close-modal]").forEach(btn=>btn.addEventListener("click",closeToolModal));
  $("#generateTool").addEventListener("click",()=>{
    const config=toolConfigs[currentTool], values={};
    config.fields.forEach(([id])=>{const el=$("#field-"+id);values[id]=el?el.value.trim():"";});
    output.value=config.make(values);outputWrap.hidden=false;output.focus();
  });
  $("#copyOutput").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(output.value);$("#copyStatus").textContent="Copied to clipboard.";}
    catch(_){output.focus();output.select();const ok=document.execCommand("copy");$("#copyStatus").textContent=ok?"Copied to clipboard.":"Select the text and copy it manually.";}
  });

  // Reveal elements gently as they enter the viewport; keep graceful fallback.
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("revealed");observer.unobserve(entry.target);}}),{threshold:.08});
    const style=document.createElement("style");style.textContent=".service-card,.stat-card,.tool-card,.process-grid article{opacity:0;transform:translateY(12px);transition:opacity .55s ease,transform .55s ease}.service-card.revealed,.stat-card.revealed,.tool-card.revealed,.process-grid article.revealed{opacity:1;transform:translateY(0)}body.view-3d .service-card.revealed:not(:hover){transform:rotateX(1.2deg) rotateY(-1.1deg)}";document.head.append(style);
    $$(".service-card,.stat-card,.tool-card,.process-grid article").forEach(el=>observer.observe(el));
  }
})();