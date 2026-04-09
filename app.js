/**
 * ================================================================
 *  BEAUMONT — Alta Relojería · app.js  v3.0 PERFORMANCE EDITION
 * ================================================================
 *  Módulos:
 *   1. AmbientSystem    — Parallax mouse en orbes (throttled)
 *   2. ParticleCanvas   — Starfield canvas (30fps cap, 40 particles)
 *   3. NavigationModule — Scroll-spy + keyboard shortcuts
 *   4. AnatomyModule    — Rolex SVG disassembly (GSAP ScrollTrigger)
 *   5. CatalogModule    — Grid de relojes + filtros
 *   6. ProductModule    — Overlay de producto
 *   7. ModalModule      — Formulario de contacto
 *   8. RevealObserver   — IntersectionObserver para .s-reveal
 *
 *  Reglas de rendimiento:
 *   • transform + opacity ONLY (GPU)
 *   • will-change en CSS, no inline JS
 *   • passive listeners en todo scroll/touch
 *   • Canvas a 30fps (throttle con timestamp)
 *   • ScrollTrigger: solo UN timeline global
 *   • rAF compartido para parallax
 * ================================================================
 */

'use strict';

// ──────────────────────────────────────────────────────────────
// 1. AMBIENT SYSTEM — rAF interno, no setInterval
// ──────────────────────────────────────────────────────────────
const AmbientSystem = (() => {
  function init() {
    const orbs = document.querySelectorAll('.ambient-orb');
    if (!orbs.length) return;

    let mx = 0, my = 0, cx = 0, cy = 0;
    const STRENGTHS = [0.014, 0.009, 0.017];

    window.addEventListener('mousemove', e => {
      mx = e.clientX / window.innerWidth  - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    function tick() {
      cx += (mx - cx) * 0.055;
      cy += (my - cy) * 0.055;
      orbs.forEach((orb, i) => {
        const s  = STRENGTHS[i] || 0.012;
        const dx = cx * window.innerWidth  * s;
        const dy = cy * window.innerHeight * s;
        orb.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
      });
      requestAnimationFrame(tick);
    }
    tick();
  }
  return { init };
})();

// ──────────────────────────────────────────────────────────────
// 2. PARTICLE CANVAS — 30fps, 40 particles max
// ──────────────────────────────────────────────────────────────
const ParticleCanvas = (() => {
  function init() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, lastTime = 0;
    const COUNT = window.innerWidth < 768 ? 20 : 40;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.10,
      vy: (Math.random() - 0.5) * 0.10,
      a:  Math.random() * 0.4 + 0.06,
      gold: Math.random() > 0.5
    }));

    function draw(ts) {
      requestAnimationFrame(draw);
      if (ts - lastTime < 33) return; // ~30fps
      lastTime = ts;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(242,202,80,${p.a})`
          : `rgba(200,190,170,${p.a * 0.28})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }
    }
    requestAnimationFrame(draw);
  }
  return { init };
})();

// ──────────────────────────────────────────────────────────────
// 3. NAVIGATION MODULE
// ──────────────────────────────────────────────────────────────
const NavigationModule = (() => {
  function init() {
    const topNav = document.getElementById('top-nav');
    if (topNav) {
      window.addEventListener('scroll', () => {
        topNav.classList.toggle('scrolled', window.scrollY > 60);
      }, { passive: true });
    }

    const sectionIds = ['home','collections','wrist-shots','heritage','reviews','atelier'];
    const allNavLinks = document.querySelectorAll('.nav-link');

    const sObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          allNavLinks.forEach(a => {
            a.classList.toggle('active',
              a.dataset.section === id || a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.25 });

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) sObs.observe(el);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { ModalModule.close(); ProductModule.close(); }
    });
  }
  return { init };
})();

// ──────────────────────────────────────────────────────────────
// 4. ANATOMY MODULE — Rolex SVG disassembly (native scroll)
// ──────────────────────────────────────────────────────────────
const AnatomyModule = (() => {

  const PHASES = [
    'El tiempo, ensamblado.',
    'La coraza se libera…',
    'El corazón late solo.',
    'Cada pieza, un propósito.'
  ];
  const SLIDE_IDS = ['anat-s1','anat-s2','anat-s3','anat-s4'];
  const DOT_IDS   = ['adot-0','adot-1','adot-2','adot-3'];
  let currentAct  = -1;
  let clockTimer  = null;

  function showSlide(idx) {
    if (idx === currentAct) return;
    currentAct = idx;
    SLIDE_IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.pointerEvents = i === idx ? 'auto' : 'none';
      gsap.to(el, {
        opacity: i === idx ? 1 : 0,
        y:       i === idx ? 0 : (i < idx ? -20 : 20),
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
    DOT_IDS.forEach((id, i) =>
      document.getElementById(id)?.classList.toggle('active', i === idx));
    const lbl = document.getElementById('anat-phase-label');
    if (lbl && lbl.textContent !== PHASES[idx]) {
      gsap.to(lbl, { opacity:0, duration:0.15, onComplete: () => {
        lbl.textContent = PHASES[idx] || '';
        gsap.to(lbl, { opacity:1, duration:0.3 });
      }});
    }
  }

  function startClock() {
    function tick() {
      const now = new Date();
      const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
      gsap.set('#wp-hour',   { rotation: h * 30 + m * 0.5, transformOrigin:'150px 200px' });
      gsap.set('#wp-minute', { rotation: m * 6  + s * 0.1, transformOrigin:'150px 200px' });
      gsap.set('#wp-second', { rotation: s * 6,             transformOrigin:'150px 200px' });
    }
    tick();
    clockTimer = setInterval(tick, 1000);
  }

  function startMechanism() {
    gsap.to('#wp-gear-main',  { rotation:'+=360', duration:7, ease:'none', transformOrigin:'150px 185px', repeat:-1 });
    gsap.to('#wp-gear-escape',{ rotation:'-=90',  duration:0.9, ease:'steps(8)', transformOrigin:'173px 216px', repeat:-1 });
    gsap.to('#wp-balance',    { rotation:150, duration:0.38, ease:'sine.inOut', transformOrigin:'128px 218px', repeat:-1, yoyo:true });
  }

  function spawnParticles(on) {
    const c = document.getElementById('anat-particles');
    if (!c) return;
    if (!on) { c.innerHTML = ''; return; }
    if (c.children.length > 0) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'anat-particle';
      const sz = Math.random() * 4 + 1.5;
      p.style.cssText = [`width:${sz}px`,`height:${sz}px`,
        `left:${Math.random()*80+10}%`, `bottom:${Math.random()*30+15}%`,
        `animation-duration:${Math.random()*4+4}s`,
        `animation-delay:${Math.random()*4}s`].join(';');
      c.appendChild(p);
    }
  }

  function init() {
    const wrap = document.getElementById('anatomy-pin-wrap');
    if (!wrap || typeof gsap === 'undefined') return;

    // ── Set initial states ──────────────────────────────────
    gsap.set(['#wp-strap-top','#wp-strap-bot','#wp-lug-tl','#wp-lug-tr',
               '#wp-lug-bl','#wp-lug-br','#wp-crystal','#wp-crown',
               '#wp-dial','#wp-hour','#wp-minute','#wp-second',
               '#wp-center','#wp-bezel'],
      { x:0, y:0, rotation:0, scale:1, opacity:1 });
    gsap.set('#wp-inner-mech', { opacity:0, scale:0.85 });
    SLIDE_IDS.forEach((id, i) =>
      gsap.set('#'+id, { opacity:i===0?1:0, y:i===0?0:28, pointerEvents:i===0?'auto':'none' }));

    // ── Build Timeline with ScrollTrigger ───
    let mechStarted = false;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#anatomy-pin-wrap',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15, // Ultra-optimized short scrub
        onUpdate: self => {
          const prog = self.progress;
          showSlide(Math.min(3, Math.floor(prog * 4.05)));
          spawnParticles(prog > 0.75);
          if (!mechStarted && prog > 0.45) {
            mechStarted = true;
            startMechanism();
          }
          const ring = document.getElementById('anat-glow-ring');
          if (ring) ring.style.opacity = String(Math.min(1.5, 0.3 + prog * 1.8));
        }
      }
    });

    tl
      // Phase 1
      .to('#wp-crystal',   { y:-130, scale:1.08, opacity:0.04, duration:1, ease:'power2.inOut' }, 0)
      .to('#wp-strap-top', { y:-250, rotation:-12, opacity:0, duration:1, ease:'power2.inOut' }, 0.05)
      .to('#wp-strap-bot', { y: 250, rotation: 12, opacity:0, duration:1, ease:'power2.inOut' }, 0.05)
      .to('#wp-crown',     { x:225, rotation:190, opacity:0.3, duration:0.9, ease:'power2.inOut' }, 0.1)
      // Phase 2
      .to('#wp-lug-tl',    { x:-285, y:-255, rotation:-95, scale:0.7, duration:1, ease:'expo.inOut' }, 1.05)
      .to('#wp-lug-tr',    { x: 285, y:-255, rotation: 95, scale:0.7, duration:1, ease:'expo.inOut' }, 1.05)
      .to('#wp-lug-bl',    { x:-285, y: 255, rotation: 95, scale:0.7, duration:1, ease:'expo.inOut' }, 1.05)
      .to('#wp-lug-br',    { x: 285, y: 255, rotation:-95, scale:0.7, duration:1, ease:'expo.inOut' }, 1.05)
      .to('#wp-bezel',     { scale:1.65, opacity:0, rotation:65, duration:1, ease:'expo.inOut' }, 1.15)
      .to('#wp-inner-mech',{ opacity:1, scale:1, duration:0.8, ease:'back.out(1.4)' }, 1.6)
      // Phase 3
      .to('#wp-dial',      { rotation:235, scale:0.33, opacity:0.22, duration:1, ease:'power3.inOut' }, 2.15)
      .to('#wp-hour',      { x:-215, y:-275, rotation:-158, scale:2.3, duration:1, ease:'power3.inOut' }, 2.2)
      .to('#wp-minute',    { x: 198, y:-305, rotation: 180, scale:2.1, duration:1, ease:'power3.inOut' }, 2.2)
      .to('#wp-second',    { x: -82, y: 318, rotation:-315, scale:2.9, opacity:0.7, duration:1, ease:'power3.inOut' }, 2.25)
      .to('#wp-center',    { scale:9, opacity:0, duration:0.7, ease:'power3.in' }, 2.3)
      .to('#wp-plate',     { x:-258, y: 98, rotation:-52, opacity:0.42, duration:1, ease:'power2.inOut' }, 2.25)
      .to('#wp-gear-main', { x: 258, y:-138, scale:1.85, opacity:0.58, duration:1, ease:'power2.inOut' }, 2.25)
      .to('#wp-gear-escape',{x:-238, y:-218, scale:1.55, opacity:0.52, duration:1, ease:'power2.inOut' }, 2.3)
      .to('#wp-balance',   { x: 228, y: 218, opacity:0.48, duration:1, ease:'power2.inOut' }, 2.3)
      .to('#wp-rotor',     { x:15, y:278, rotation:'-=305', opacity:0.42, duration:1, ease:'power2.inOut' }, 2.3);

    startClock();
  }

  return { init };
})();

// ──────────────────────────────────────────────────────────────
// 5. CATALOG MODULE — $200 para todos
// ──────────────────────────────────────────────────────────────
const CatalogModule = (() => {

  const IMG = {
    cartier_santos: 'imagenes Beamount/36mm-cartier-santos-white-montre-stainless-bijoux-medusa-homme-quebec-canada-119-removebg-preview (1).png',
    rolex_daytona:  'imagenes Beamount/m126518ln-0014-8-removebg-preview.png',
    omega_speed:    'imagenes Beamount/31030425001001_1_1200x-removebg-preview.png',
    omega_aqua:     'imagenes Beamount/29525933_58480091_600-removebg-preview.png',
    patek_nautilus: 'imagenes Beamount/images__1_-removebg-preview.png',
    iwc_port:       'imagenes Beamount/IW545901-removebg-preview (1).png',
    ap_royal_oak:   'imagenes Beamount/images-removebg-preview.png'
  };

  const WATCHES = [
    { 
      id:0, brand:'Cartier', name:'Santos de Cartier', ref:'WSSA0018', price:'$200', status:'available', size:'39.8mm', material:'Acero Cepillado', movement:'Auto · Cal. 1847 MC', power:'40 horas', water:'100m', function:'time-only', matGroup:'steel', tag:null, 
      desc:'Un ícono atemporal que redefinió la relojería de muñeca. Creado originalmente en 1904 para el aviador Alberto Santos-Dumont, esta iteración moderna mantiene sus característicos tornillos expuestos y bisel cuadrado. Su revolucionario sistema QuickSwitch permite intercambiar correas sin herramientas, adaptando su lujo geométrico a cualquier ocasión.', 
      img: IMG.cartier_santos 
    },
    { 
      id:1, brand:'Rolex', name:'Cosmograph Daytona', ref:'116500LN', price:'$200', status:'limited', size:'40mm', material:'Oystersteel', movement:'Auto · Cal. 4130', power:'72 horas', water:'100m', function:'chronograph', matGroup:'steel', tag:'Edición Limitada', 
      desc:'La leyenda viva del automovilismo. Con su emblemático bisel Cerachrom negro irrayable y escala taquimétrica, este cronógrafo está concebido para la velocidad. Su calibre 4130, desarrollado íntegramente por Rolex, garantiza una precisión Superlative Chronometer de ±2 segundos al día, haciéndolo uno de los relojes más cotizados del planeta.', 
      img: IMG.rolex_daytona  
    },
    { 
      id:2, brand:'Omega', name:'Speedmaster Moonwatch', ref:'310.30.42.50.01.001', price:'$200', status:'available', size:'42mm', material:'Acero Inoxidable', movement:'Manual · Cal. 3861', power:'50 horas', water:'30m', function:'chronograph', matGroup:'steel', tag:null, 
      desc:'El reloj que conquistó las estrellas. El Speedmaster Professional es el único guardatiempos certificado por la NASA para todas sub misiones tripuladas desde 1965. Esta versión actualiza su legado con el calibre Master Chronometer 3861, resistente a la fuerza magnética extrema, mientras conserva su puro cristal Hesalite original de los viajes a la Luna.', 
      img: IMG.omega_speed    
    },
    { 
      id:3, brand:'Patek Philippe', name:'Nautilus', ref:'5711/1A-010', price:'$200', status:'limited', size:'40mm', material:'Acero Inoxidable', movement:'Auto · Cal. 26-330', power:'45 horas', water:'120m', function:'time-only', matGroup:'steel', tag:'Edición Limitada', 
      desc:'La obra cumbre de Gérald Genta y el pináculo insuperable del lujo deportivo. Introducido en 1976 con la forma de una escotilla de navío, el Nautilus rompió las reglas al demostrar que el acero podía ser más preciado que el oro. Su esfera nervada azul degrada es posiblemente la textura visual más demandada en la actual alta relojería.', 
      img: IMG.patek_nautilus 
    },
    { 
      id:4, brand:'Omega', name:'Seamaster Aqua Terra', ref:'220.10.41.21.01.001', price:'$200', status:'available', size:'41mm', material:'Acero Inoxidable', movement:'Auto · Cal. 8900', power:'60 horas', water:'150m', function:'time-only', matGroup:'steel', tag:null, 
      desc:'La perfecta transición entre la elegancia náutica y el poderío urbano. La esfera azul con líneas de teca horizontales evoca la cubierta de los yates de lujo. Internamente, es un bloque de absoluta precisión blindada: su escape Co-Axial certificado por METAS lo hace impenetrable a campos magnéticos de hasta 15,000 gauss.', 
      img: IMG.omega_aqua     
    },
    { 
      id:5, brand:'IWC', name:'Portugieser Tourbillon', ref:'IW504601', price:'$200', status:'limited', size:'42.3mm', material:'Oro Rojo', movement:'Manual · Cal. 98900', power:'7 días', water:'30m', function:'tourbillon', matGroup:'gold', tag:'Edición Limitada', 
      desc:'Alta complicación con una legibilidad suprema. La asombrosa jaula del tourbillon volador orbita en la posición de las 12, anulando los efectos de la gravedad. Su mecanismo masivo no solo es hipnótico a la vista, sino que aloja unos impresionantes 7 días de reserva de marcha ininterrumpida engranados en una gloriosa caja de Oro Rojo.', 
      img: IMG.iwc_port       
    },
    { 
      id:6, brand:'Audemars Piguet', name:'Royal Oak Chronograph', ref:'26320OR.OO.1220OR', price:'$200', status:'available', size:'41mm', material:'Oro Rosa', movement:'Auto · Cal. 2385', power:'40 horas', water:'50m', function:'chronograph', matGroup:'gold', tag:null, 
      desc:'El rey irrefutable de la opulencia arquitectónica brutalista. Su característico bisel octagonal asegurado con ocho tornillos hexagonales expuestos y su hipnótica esfera decorada con el patrón "Grande Tapisserie" están aquí bañados en Oro Rosa macizo de 18 quilates, fusionando la maestría artesanal centenaria con presencia abrumadora.', 
      img: IMG.ap_royal_oak   
    },
    { 
      id:7, brand:'Rolex', name:'Daytona Oysterflex', ref:'116518LN', price:'$200', status:'available', size:'40mm', material:'Oro Amarillo', movement:'Auto · Cal. 4130', power:'72 horas', water:'100m', function:'chronograph', matGroup:'gold', tag:null, 
      desc:'Puro dinamismo fundido en Oro Amarillo macizo. Esta variante extremadamente cotizada del Daytona incorpora la innovadora pulsera Oysterflex, que contiene láminas metálicas flexibles recubiertas de elastómero de alto rendimiento. Un contraste magistral entre la esfera dorada, los subdiales negros y la majestuosidad de su metal noble.', 
      img: IMG.rolex_daytona  
    },
    { 
      id:8, brand:'Omega', name:'Seamaster Diver 007', ref:'210.90.42.20.01.001', price:'$200', status:'available', size:'42mm', material:'Titanio', movement:'Auto · Cal. 8806', power:'55 horas', water:'300m', function:'time-only', matGroup:'titanium', tag:null, 
      desc:'El reloj de acción táctico definitivo, exactamente el mismo utilizado por James Bond en "No Time To Die". Construido en aleación de Titanio Grado 2 para ligereza letal, presenta un bisel y esfera tropicales avejentados en tono marrón. Su impresionante válvula de helio y red de acero trenzado aseguran su función como herramienta subacuática.', 
      img: IMG.omega_speed    }
  ];

  window.BEAUMONT_WATCHES = WATCHES;

  const activeFilters = { function: 'all', material: 'all' };

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), (Number(e.target.dataset.idx)||0)*55);
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.04 });

  function renderGrid(watches) {
    const grid = document.getElementById('watch-grid');
    if (!grid) return;
    grid.innerHTML = watches.map((w, i) => `
      <div class="watch-card glass-card" role="listitem"
           onclick="ProductModule && ProductModule.open(${w.id})"
           data-idx="${i}" tabindex="0"
           aria-label="${w.brand} ${w.name}">
        ${w.tag ? `<div class="watch-card-tag tag-${w.status==='sold'?'sold':'limited'}">${w.tag}</div>` : ''}
        <div class="watch-card-stage">
          <img class="watch-card-img" src="${w.img}" alt="${w.brand} ${w.name}" loading="lazy"/>
          <div class="watch-card-num">0${i+1}</div>
        </div>
        <div class="watch-card-info">
          <div class="watch-card-meta">
            <div class="watch-card-brand">${w.brand}</div>
            <div class="watch-card-ref">${w.ref}</div>
          </div>
          <div class="watch-card-name">${w.name}</div>
          <div class="watch-card-row">
            <div class="watch-card-price">${w.price}</div>
            <div class="watch-card-cta">Ver pieza <span class="mso" style="font-size:14px;">arrow_forward</span></div>
          </div>
          <div class="watch-card-line"></div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.watch-card').forEach((el, i) => {
      el.dataset.idx = i;
      cardObs.observe(el);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });
  }

  function applyFilters() {
    const filtered = WATCHES.filter(w => {
      const okFn  = activeFilters.function === 'all' || w.function  === activeFilters.function;
      const okMat = activeFilters.material === 'all' || w.matGroup  === activeFilters.material;
      return okFn && okMat;
    });
    renderGrid(filtered);
  }

  function init() {
    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter, val = btn.dataset.value;
        activeFilters[cat] = val;
        document.querySelectorAll(`.filter-pill[data-filter="${cat}"]`)
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      });
    });
    renderGrid(WATCHES);
  }

  return { init, WATCHES };
})();

// ──────────────────────────────────────────────────────────────
// 6. PRODUCT MODULE
// ──────────────────────────────────────────────────────────────
const ProductModule = (() => {
  const WA_NUMBER = '573001234567';

  function open(id) {
    const WATCHES = window.BEAUMONT_WATCHES || [];
    const w = WATCHES.find(x => x.id === id);
    if (!w) return;

    document.getElementById('pd-ref').textContent          = 'REF. ' + (w.ref||'N/A');
    document.getElementById('pd-brand-label').textContent  = w.brand;
    document.getElementById('pd-name').textContent         = w.name;
    document.getElementById('pd-price').textContent        = w.price;
    document.getElementById('pd-desc').textContent         = w.desc;
    document.getElementById('pd-size').textContent         = w.size;
    document.getElementById('pd-material').textContent     = w.material;
    document.getElementById('pd-movement').textContent     = w.movement;
    document.getElementById('pd-power').textContent        = w.power;
    document.getElementById('pd-water').textContent        = w.water;

    const img = document.getElementById('pd-watch-img');
    img.style.opacity = '0';
    img.src = w.img;
    img.alt = `${w.brand} ${w.name}`;
    img.onload = () => { img.style.transition='opacity 0.55s ease'; img.style.opacity='1'; };

    const statusMap = { available:'Disponible', limited:'Edición Limitada', sold:'Agotado' };
    const statusEl  = document.getElementById('pd-status');
    statusEl.textContent = statusMap[w.status] || w.status;
    statusEl.className   = 'pd-status ' + w.status;

    document.getElementById('pd-tag-movement').textContent = w.movement;
    document.getElementById('pd-tag-water').textContent    = 'WR '  + w.water;
    document.getElementById('pd-tag-power').textContent    = 'PR '  + w.power;
    document.getElementById('pd-scrubber-ref').textContent = w.ref || '—';

    const msg = encodeURIComponent(`Hola Beaumont, me interesa el ${w.brand} ${w.name} (${w.price}). ¿Está disponible?`);
    document.getElementById('pd-whatsapp-btn').href = `https://wa.me/${WA_NUMBER}?text=${msg}`;

    const others = WATCHES.filter(x => x.id !== id).slice(0, 6);
    document.getElementById('pd-others-grid').innerHTML = others.map(o => `
      <div class="pd-other-card" onclick="ProductModule.open(${o.id})"
           role="button" tabindex="0" aria-label="${o.brand} ${o.name}">
        <img src="${o.img}" alt="${o.name}" loading="lazy"/>
        <div class="pd-other-name">${o.brand}<br/>${o.name}</div>
        <div class="pd-other-price">${o.price}</div>
      </div>
    `).join('');
    document.querySelectorAll('#pd-others-grid .pd-other-card').forEach(el =>
      el.addEventListener('keydown', e => { if (e.key==='Enter') el.click(); })
    );

    const pd = document.getElementById('product-detail');
    pd.classList.add('open');
    pd.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    const wi = document.getElementById('pd-wish-btn')?.querySelector('.mso');
    if (wi) { wi.textContent='favorite_border'; wi.style.color=''; }
  }

  function close() {
    document.getElementById('product-detail')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function init() {
    document.getElementById('pd-wish-btn')?.addEventListener('click', function() {
      const icon = this.querySelector('.mso');
      if (!icon) return;
      const liked = icon.textContent === 'favorite';
      icon.textContent = liked ? 'favorite_border' : 'favorite';
      icon.style.color = liked ? '' : '#f2ca50';
    });
    window.openProduct = open;
  }

  return { init, open, close };
})();

// ──────────────────────────────────────────────────────────────
// 7. MODAL MODULE
// ──────────────────────────────────────────────────────────────
const ModalModule = (() => {
  function open(title, sub) {
    document.getElementById('modal-title').textContent = title || 'Consulta';
    document.getElementById('modal-sub').textContent   = sub   || 'Completa el formulario o contáctanos';
    ['modal-name','modal-email','modal-phone','modal-msg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value=''; el.style.borderBottomColor=''; }
    });
    const btn = document.getElementById('modal-btn');
    if (btn) { btn.textContent='Enviar Consulta — @Beaumont.club'; btn.disabled=false; btn.style.opacity='1'; }
    document.getElementById('modal-overlay')?.classList.add('open');
  }

  function close() {
    document.getElementById('modal-overlay')?.classList.remove('open');
  }

  function submit() {
    const name  = document.getElementById('modal-name')?.value.trim();
    const email = document.getElementById('modal-email')?.value.trim();
    let valid = true;
    if (!name)                       { document.getElementById('modal-name').style.borderBottomColor  = '#f2ca50'; valid=false; }
    if (!email||!email.includes('@')){ document.getElementById('modal-email').style.borderBottomColor = '#f2ca50'; valid=false; }
    if (!valid) return;
    const btn = document.getElementById('modal-btn');
    if (btn) { btn.textContent='✓ Consulta Recibida — Te Contactaremos Pronto'; btn.disabled=true; btn.style.opacity='0.7'; }
    setTimeout(close, 2600);
  }

  function init() {
    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) close();
    });
    window.openModal    = open;
    window.closeModal   = close;
    window.submitModal  = submit;
    window.closeProduct = ProductModule.close;
  }

  return { init, open, close, submit };
})();

// ──────────────────────────────────────────────────────────────
// 8. REVEAL OBSERVER
// ──────────────────────────────────────────────────────────────
const RevealObserver = (() => {
  function init() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.s-reveal').forEach(el => obs.observe(el));
  }
  return { init };
})();

// ──────────────────────────────────────────────────────────────
// 9. TEXT REVEAL MODULE (Scroll-driven Word Masking)
// ──────────────────────────────────────────────────────────────
const TextRevealModule = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    // Find all paragraphs/titles designated for scroll reveal
    const targets = document.querySelectorAll('.text-reveal-scroll');
    
    targets.forEach(el => {
      // Wrap words
      const words = el.innerText.split(/\s+/).map(w => 
        `<span style="display:inline-block; overflow:hidden; vertical-align:top; padding-bottom: 2px;"><span class="tr-word" style="display:inline-block; opacity: 0; transform: translateY(100%) rotate(4deg); filter: blur(6px);">${w}</span></span>`
      ).join(' ');
      
      el.innerHTML = words;
      
      const spans = el.querySelectorAll('.tr-word');
      gsap.to(spans, {
        opacity: 1,
        y: '0%',
        rotation: 0,
        filter: 'blur(0px)',
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'bottom 55%',
          scrub: 0.8
        }
      });
    });
  }
  return { init };
})();

// ──────────────────────────────────────────────────────────────
// 10. PRELOADER MODULE (Cinematic Entry)
// ──────────────────────────────────────────────────────────────
const PreloaderModule = (() => {
  function init() {
    if (typeof gsap === 'undefined') return;
    const preloader = document.getElementById('preloader');
    const counterNum= document.getElementById('pl-counter-num');
    const metaText  = document.getElementById('pl-meta');
    if (!preloader || !counterNum) return;

    document.body.style.overflow = 'hidden';

    let progress = { val: 0 };
    const tl = gsap.timeline();

    // 1. Roll up the huge percentage
    tl.to(progress, {
      val: 100,
      duration: 2.0,
      ease: "power3.inOut",
      onUpdate: () => {
        counterNum.textContent = Math.floor(progress.val) + '%';
      }
    })
    // 2. Slide the typography up
    .to([counterNum, metaText], {
      y: -150,
      opacity: 0,
      duration: 0.8,
      ease: "power3.in",
      stagger: 0.05
    }, "+=0.2")
    // 3. Slide the entire preloader background up like a minimalist curtain
    .to(preloader, {
      y: '-100%',
      duration: 1.2,
      ease: "power4.inOut",
      onComplete: () => {
        preloader.remove(); 
        document.body.style.overflow = ''; 
        gsap.fromTo('.hero-h1', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.6, ease: "power4.out" });
      }
    }, "-=0.3"); 
  }
  return { init };
})();

// ──────────────────────────────────────────────────────────────
// BOOTSTRAP
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AmbientSystem.init();
  ParticleCanvas.init();
  NavigationModule.init();
  CatalogModule.init();
  ProductModule.init();
  ModalModule.init();
  RevealObserver.init();
  AnatomyModule.init();
  TextRevealModule.init();
  PreloaderModule.init();

  window.ProductModule = ProductModule;
  window.ModalModule   = ModalModule;
});
