/* ============================================================================
   VERA template generator — layout archetypes
   Twelve genuinely different page structures. Each carries its own CSS so no
   two generated stores share a hero, a product grid or a navigation style.
   ========================================================================== */
"use strict";

/* Shared foundation every generated stylesheet starts from. */
const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
  font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img,svg{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button,input,select{font:inherit;color:inherit}
h1,h2,h3,h4{font-family:var(--display);font-weight:var(--hweight);line-height:1.08;
  letter-spacing:var(--htrack);margin:0;text-wrap:balance}
p{margin:0 0 1rem}
::selection{background:var(--ac);color:var(--ack)}
:focus-visible{outline:2px solid var(--ac-t);outline-offset:3px;border-radius:4px}

.container{width:min(var(--w),92%);margin-inline:auto}
.container--narrow{width:min(860px,92%);margin-inline:auto}
.skip{position:absolute;left:-9999px}
.skip:focus{left:12px;top:12px;z-index:99;background:var(--ac);color:var(--ack);padding:10px 16px;border-radius:8px}

/* ---------- type ---------- */
.eyebrow{display:inline-block;font-family:var(--sans);font-size:.7rem;font-weight:600;
  letter-spacing:.2em;text-transform:uppercase;color:var(--ac-t);margin:0 0 14px}
.lead{font-size:clamp(1rem,1.6vw,1.16rem);color:var(--mut);max-width:60ch}
.muted{color:var(--mut)}
h1{font-size:clamp(2.3rem,6vw,4.4rem)}
h2{font-size:clamp(1.75rem,3.6vw,2.9rem)}
h3{font-size:clamp(1.1rem,1.8vw,1.35rem)}
.sec{padding:clamp(56px,7vw,104px) 0;position:relative}
.sec--tint{background:var(--sf)}
.sec-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;
  flex-wrap:wrap;margin-bottom:clamp(28px,4vw,52px)}
.sec-head p{margin:.6rem 0 0;color:var(--mut);max-width:52ch}

/* ---------- buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;
  padding:14px 26px;border-radius:var(--r);border:1px solid var(--ac);background:var(--ac);
  color:var(--ack);font-weight:600;font-size:.95rem;cursor:pointer;line-height:1;
  transition:transform .18s ease,box-shadow .18s ease,background .18s ease,border-color .18s ease}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px -14px var(--ac)}
.btn--ghost{background:transparent;color:var(--ink);border-color:var(--ln)}
.btn--ghost:hover{border-color:var(--ac-t);color:var(--ac-t);box-shadow:none}
.btn--sm{padding:10px 16px;font-size:.85rem}
.btn--block{width:100%}
.btn--line{background:transparent;color:var(--ac-t);border-color:var(--ac-t)}
.link-arrow{font-weight:600;font-size:.92rem;color:var(--ac-t);display:inline-flex;gap:7px;align-items:center}
.link-arrow:hover span{transform:translateX(5px)}
.link-arrow span{transition:transform .2s}

/* ---------- topbar + nav ---------- */
.topbar{background:var(--ac);color:var(--ack);font-size:.78rem;letter-spacing:.05em;
  text-align:center;padding:9px 16px;font-weight:500}
.topbar a{text-decoration:underline;font-weight:700}
.nav{position:sticky;top:0;z-index:60;background:color-mix(in srgb,var(--bg) 88%,transparent);
  backdrop-filter:saturate(160%) blur(14px);border-bottom:1px solid var(--ln)}
.nav__inner{display:flex;align-items:center;gap:22px;min-height:70px}
.brand{display:flex;align-items:baseline;gap:7px;font-family:var(--display);
  font-size:1.3rem;letter-spacing:-.01em;white-space:nowrap}
.brand b{font-weight:700}
.brand small{font-family:var(--sans);font-size:.66rem;letter-spacing:.24em;
  text-transform:uppercase;color:var(--mut);font-weight:600}
.nav__links{display:flex;gap:26px;margin-left:auto;font-size:.92rem;font-weight:500}
.nav__links a{position:relative;padding:4px 0;color:var(--mut);transition:color .16s}
.nav__links a:hover,.nav__links a.is-active{color:var(--ink)}
.nav__tools{display:flex;gap:10px;align-items:center}
.nav__toggle{display:none;background:none;border:0;padding:8px;cursor:pointer;flex-direction:column;gap:5px}
.nav__toggle span{display:block;width:22px;height:2px;background:var(--ink);transition:.22s}
.nav.is-open .nav__toggle span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav.is-open .nav__toggle span:nth-child(2){opacity:0}
.nav.is-open .nav__toggle span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.bag-btn{background:var(--bg);border:1px solid var(--ln);border-radius:999px;padding:7px 14px;
  font-size:.82rem;font-weight:600;cursor:pointer;display:inline-flex;gap:7px;align-items:center}
.bag-count{background:var(--ac);color:var(--ack);border-radius:999px;min-width:19px;height:19px;
  display:grid;place-items:center;font-size:.7rem;padding:0 5px}
@media(max-width:900px){
  .nav__toggle{display:flex}
  .nav__links{position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;
    background:var(--bg);border-bottom:1px solid var(--ln);padding:8px 0;
    max-height:0;overflow:hidden;transition:max-height .3s ease}
  .nav.is-open .nav__links{max-height:340px}
  .nav__links a{padding:13px 6%;border-bottom:1px solid var(--ln)}
  .bag-btn{margin-left:auto}
  .nav__tools{order:3}
}

/* ---------- product cards (layouts restyle) ---------- */
.grid{display:grid;gap:var(--gap);grid-template-columns:repeat(var(--cols,3),1fr)}
@media(max-width:980px){.grid{grid-template-columns:repeat(min(var(--cols,3),2),1fr)}}
@media(max-width:620px){.grid{grid-template-columns:1fr}}
.prod{position:relative;display:flex;flex-direction:column;background:var(--card);
  border:1px solid var(--line);border-radius:var(--cr);overflow:hidden;transition:.24s}
.prod:hover{transform:translateY(-6px);box-shadow:var(--sh)}
.prod__media{position:relative;aspect-ratio:var(--ar,4/5);background:var(--sf2);overflow:hidden}
.prod__media img{width:100%;height:100%;object-fit:cover;transition:transform .55s cubic-bezier(.2,.7,.3,1)}
.prod:hover .prod__media img{transform:scale(1.06)}
.prod__badge{position:absolute;top:12px;left:12px;background:var(--ac);color:var(--ack);
  font-size:.66rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  padding:6px 11px;border-radius:999px}
.prod__body{padding:18px 18px 20px;display:flex;flex-direction:column;gap:7px;flex:1}
.prod__cat{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--mut);font-weight:600}
.prod__name{font-family:var(--display);font-size:1.1rem;font-weight:600;line-height:1.25;margin:0}
.prod__desc{font-size:.87rem;color:var(--mut);margin:0;flex:1}
.prod__foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px}
.prod__price{font-weight:700;font-size:1.05rem;font-variant-numeric:tabular-nums}
.prod__price s{color:var(--mut);font-weight:400;font-size:.84rem;margin-right:6px}
.prod__cta{font-size:.83rem;font-weight:600;color:var(--ac-t);border-bottom:1px solid currentColor;
  padding-bottom:2px;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer}

/* ---------- usp ---------- */
.usp{display:grid;gap:16px;grid-template-columns:repeat(4,1fr)}
@media(max-width:900px){.usp{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.usp{grid-template-columns:1fr}}
.usp__item{padding:20px;border:1px solid var(--line);border-radius:var(--cr);background:var(--card)}
.usp__item b{display:block;font-family:var(--display);font-size:1.6rem;margin-bottom:4px}
.usp__item span{font-size:.86rem;color:var(--mut);line-height:1.5}

/* ---------- editorial / story ---------- */
.split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,64px);align-items:center}
@media(max-width:860px){.split{grid-template-columns:1fr}}
.split__media{position:relative;border-radius:var(--cr);overflow:hidden;background:var(--sf2)}
.split__media img{width:100%;aspect-ratio:4/3;object-fit:cover}
.tick{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:11px}
.tick li{position:relative;padding-left:28px;font-size:.94rem;color:var(--mut)}
.tick li::before{content:"";position:absolute;left:0;top:.55em;width:13px;height:13px;
  border-radius:50%;background:color-mix(in srgb,var(--ac) 22%,transparent);
  box-shadow:inset 0 0 0 4px var(--ac)}
.stats{display:flex;gap:clamp(20px,4vw,52px);flex-wrap:wrap;margin-top:30px}
.stats b{display:block;font-family:var(--display);font-size:clamp(1.8rem,4vw,2.6rem);line-height:1}
.stats span{font-size:.78rem;letter-spacing:.13em;text-transform:uppercase;color:var(--mut)}

/* ---------- marquee ---------- */
.marquee{overflow:hidden;border-block:1px solid var(--line);padding:16px 0;background:var(--sf)}
.marquee__track{display:flex;gap:44px;width:max-content;animation:slide 34s linear infinite}
.marquee:hover .marquee__track{animation-play-state:paused}
.marquee__track span{font-family:var(--display);font-size:clamp(1.1rem,2.4vw,1.7rem);
  white-space:nowrap;color:var(--ink);opacity:.85}
.marquee__track span::after{content:"✦";margin-left:44px;color:var(--ac-t)}
@keyframes slide{to{transform:translateX(-50%)}}

/* ---------- reviews ---------- */
.reviews{display:grid;gap:20px;grid-template-columns:repeat(3,1fr)}
@media(max-width:860px){.reviews{grid-template-columns:1fr}}
.review{background:var(--card);border:1px solid var(--line);border-radius:var(--cr);padding:26px}
.review p{font-size:.98rem;margin:14px 0 18px;color:var(--ink)}
.review footer{display:flex;gap:11px;align-items:center;font-size:.84rem;color:var(--mut)}
.review .who{width:36px;height:36px;border-radius:50%;background:color-mix(in srgb,var(--ac) 18%,transparent);
  display:grid;place-items:center;font-weight:700;color:var(--ac-t);font-family:var(--display)}
.stars{color:var(--ac-t);letter-spacing:2px;font-size:.9rem}

/* ---------- faq ---------- */
.faq{display:grid;gap:10px}
.faq details{border:1px solid var(--line);border-radius:var(--cr);background:var(--card);padding:2px 20px}
.faq summary{cursor:pointer;font-weight:600;padding:16px 0;list-style:none;
  display:flex;justify-content:space-between;gap:16px;font-size:1rem}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";color:var(--ac-t);font-size:1.4rem;line-height:1;font-weight:400}
.faq details[open] summary::after{content:"–"}
.faq p{color:var(--mut);font-size:.93rem;margin:0 0 18px;max-width:70ch}

/* ---------- cta ---------- */
.cta{background:var(--ac);color:var(--ack);border-radius:calc(var(--cr) + 6px);
  padding:clamp(34px,5vw,64px);display:grid;grid-template-columns:1.15fr .85fr;
  gap:clamp(24px,4vw,50px);align-items:center}
@media(max-width:820px){.cta{grid-template-columns:1fr}}
.cta h2{color:var(--ack)}
.cta p{color:var(--ack);margin-top:12px}
.cta__form{display:flex;gap:10px;flex-wrap:wrap}
.cta__form input{flex:1;min-width:190px;padding:14px 16px;border-radius:var(--r);
  border:1px solid color-mix(in srgb,var(--ink) 32%,transparent);
  background:var(--bg);color:var(--ink)}
.cta__form input::placeholder{color:var(--mut)}
.cta__form .btn{background:var(--ack);color:var(--ac);border-color:var(--ack)}

/* ---------- footer ---------- */
.footer{background:var(--sf);border-top:1px solid var(--line);padding:clamp(44px,6vw,72px) 0 28px;
  font-size:.9rem}
.footer__grid{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:30px}
@media(max-width:860px){.footer__grid{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.footer__grid{grid-template-columns:1fr}}
.footer h3{font-family:var(--sans);font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--mut);margin:0 0 14px;font-weight:700}
.footer ul{list-style:none;padding:0;margin:0;display:grid;gap:9px;color:var(--mut)}
.footer a:hover{color:var(--ac-t)}
.footer__about{color:var(--mut);max-width:38ch;margin-top:14px}
.footer__bottom{margin-top:38px;padding-top:20px;border-top:1px solid var(--line);
  display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:var(--mut);font-size:.82rem}

/* ---------- reveal ----------
   The hidden state is scoped to html.js so the page is fully readable when
   scripting is off or fails. script.js also force-shows anything an
   IntersectionObserver never reaches. */
.js .reveal{opacity:0;transform:translateY(22px);transition:opacity .6s ease,transform .6s ease}
.js .reveal.is-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.js .reveal{opacity:1;transform:none}}

/* ---------- toast ---------- */
.toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,140%);z-index:90;
  background:var(--ink);color:var(--bg);padding:13px 22px;border-radius:999px;
  font-size:.88rem;font-weight:600;transition:transform .3s ease;box-shadow:0 16px 40px -18px #000}
.toast.is-on{transform:translate(-50%,0)}
`;

/* ---------------------------------------------------------------------------
   Layouts. Each owns a hero renderer, an ordered section list and its CSS.
   --------------------------------------------------------------------------- */
const LAYOUTS = [
  {
    id: "split", hero: "split", nav: "underline",
    sections: ["usp", "products", "editorial", "reviews", "cta"],
    gridCols: 3, gap: 26,
    css: `
.hero{padding:clamp(48px,7vw,96px) 0 clamp(40px,5vw,72px)}
.hero__grid{display:grid;grid-template-columns:1.02fr .98fr;gap:clamp(30px,5vw,68px);align-items:center}
@media(max-width:900px){.hero__grid{grid-template-columns:1fr}}
.hero h1 em{font-style:italic;color:var(--ac-t)}
.hero__cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.hero__stats{list-style:none;padding:0;margin:36px 0 0;display:flex;gap:clamp(18px,3vw,40px);
  flex-wrap:wrap;border-top:1px solid var(--line);padding-top:22px}
.hero__stats b{display:block;font-family:var(--display);font-size:1.55rem;line-height:1.1}
.hero__stats span{font-size:.72rem;letter-spacing:.13em;text-transform:uppercase;color:var(--mut)}
.hero__media{position:relative}
.hero__media .frame{border-radius:calc(var(--cr) + 8px);overflow:hidden;background:var(--sf2)}
.hero__media .frame img{width:100%;aspect-ratio:4/5;object-fit:cover}
.hero__float{position:absolute;right:-6px;bottom:-18px;background:var(--card);
  border:1px solid var(--line);border-radius:var(--cr);padding:16px 20px;
  box-shadow:0 22px 50px -30px rgba(0,0,0,.5);max-width:230px}
.hero__float b{font-family:var(--display);font-size:1.05rem;display:block}
.hero__float span{font-size:.78rem;color:var(--mut)}
.nav__links a.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;background:var(--ac-t)}
@media(max-width:900px){.hero__float{position:static;margin-top:16px;max-width:none}}
`,
  },
  {
    id: "fullbleed", hero: "fullbleed", nav: "overlay",
    sections: ["marquee", "categories", "products", "journal", "reviews", "cta"],
    gridCols: 4, gap: 20, dark: 1,
    css: `
.hero{position:relative;min-height:min(88vh,760px);display:grid;align-items:end;
  background:var(--ink);overflow:hidden}
.hero__bg{position:absolute;inset:0;opacity:.62}
.hero__bg img{width:100%;height:100%;object-fit:cover}
.hero::after{content:"";position:absolute;inset:0;
  background:linear-gradient(180deg,color-mix(in srgb,var(--bg) 78%,transparent) 0%,color-mix(in srgb,var(--bg) 30%,transparent) 42%,var(--bg) 100%)}
.hero__inner{position:relative;z-index:2;padding:clamp(60px,9vw,120px) 0 clamp(38px,5vw,64px);color:#fff}
.hero h1{font-size:clamp(2.6rem,8vw,6rem);letter-spacing:-.03em;color:#fff}
.hero h1 em{font-style:normal;display:block;color:var(--ac-t)}
.hero .lead{color:rgba(255,255,255,.86);margin-top:18px}
.hero__cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.hero__meta{display:flex;gap:clamp(20px,4vw,54px);flex-wrap:wrap;margin-top:38px;
  border-top:1px solid rgba(255,255,255,.24);padding-top:22px;color:rgba(255,255,255,.8);font-size:.82rem}
.nav{position:absolute;top:0;left:0;right:0;background:transparent;border-bottom-color:rgba(255,255,255,.2)}
.nav .brand,.nav__links a,.bag-btn{color:#fff}
.nav .brand small{color:rgba(255,255,255,.7)}
.nav .nav__toggle span{background:#fff}
.nav .bag-btn{background:transparent;border-color:rgba(255,255,255,.35)}
@media(max-width:900px){.nav__links{background:var(--ink)}.nav__links a{color:#fff;border-bottom-color:rgba(255,255,255,.14)}
  .nav.is-open .nav__links{background:var(--ink)}}
`,
  },
  {
    id: "centered", hero: "centered", nav: "underline",
    sections: ["usp", "products", "story", "reviews", "cta"],
    gridCols: 2, gap: 34,
    css: `
.hero{text-align:center;padding:clamp(56px,8vw,110px) 0}
.hero__rule{width:64px;height:1px;background:var(--ac-t);margin:0 auto 26px}
.hero__rule--b{margin:30px auto 0}
.hero h1{max-width:16ch;margin-inline:auto}
.hero h1 em{font-style:italic;color:var(--ac-t)}
.hero .lead{margin:22px auto 0;text-align:center}
.hero__cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px}
.hero__price{margin-top:34px;font-size:.86rem;letter-spacing:.16em;text-transform:uppercase;color:var(--mut)}
.hero__price b{font-family:var(--display);font-size:1.5rem;color:var(--ink);letter-spacing:0;text-transform:none}
.hero__thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:46px}
@media(max-width:700px){.hero__thumbs{grid-template-columns:1fr 1fr}}
.hero__thumbs img{aspect-ratio:1/1;object-fit:cover;border-radius:var(--cr);width:100%}
.nav__links a.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;background:var(--ac-t)}
`,
  },
  {
    id: "index", hero: "index", nav: "minimal",
    sections: ["categories", "products", "editorial", "faq", "cta"],
    gridCols: 3, gap: 40, hairline: 1,
    css: `
.hero{padding:clamp(44px,6vw,88px) 0 clamp(30px,4vw,56px);border-bottom:1px solid var(--line)}
.hero__grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(28px,5vw,64px)}
@media(max-width:860px){.hero__grid{grid-template-columns:1fr}}
.hero h1{font-size:clamp(2.1rem,5vw,3.6rem)}
.hero h1 em{font-style:normal;color:var(--ac-t)}
.hero__list{list-style:none;padding:0;margin:34px 0 0;border-top:1px solid var(--line)}
.hero__list li{display:flex;justify-content:space-between;gap:14px;align-items:baseline;
  padding:15px 0;border-bottom:1px solid var(--line);font-size:.95rem}
.hero__list li span:last-child{color:var(--mut);font-size:.8rem;letter-spacing:.1em;
  text-transform:uppercase;font-family:var(--sans)}
.hero__list li:hover{color:var(--ac-t)}
.hero__media img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:2px}
.prod{border-radius:2px;background:transparent;border:0;border-top:1px solid var(--ink);
  padding-top:16px;overflow:visible}
.prod:hover{transform:none;box-shadow:none}
.prod__media{border-radius:2px}
.prod__name{font-family:var(--sans);font-weight:600;font-size:1rem;letter-spacing:-.01em}
.prod__foot{border-top:1px solid var(--line);padding-top:12px}
`,
  },
  {
    id: "overlap", hero: "overlap", nav: "underline",
    sections: ["lookbook", "products", "story", "reviews", "cta"],
    gridCols: 3, gap: 28,
    css: `
.hero{padding:clamp(50px,7vw,100px) 0}
.hero__grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,70px);align-items:center}
@media(max-width:900px){.hero__grid{grid-template-columns:1fr}}
.hero h1 em{font-style:italic;color:var(--ac-t)}
.hero__cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.stack{position:relative;min-height:440px}
@media(max-width:520px){.stack{min-height:340px}}
.stack img{position:absolute;border-radius:var(--cr);object-fit:cover;
  box-shadow:0 30px 70px -40px rgba(0,0,0,.62);border:5px solid var(--bg)}
.stack .a{width:66%;aspect-ratio:3/4;top:0;left:0;z-index:1}
.stack .b{width:54%;aspect-ratio:4/5;right:0;bottom:0;z-index:2}
.stack .c{width:34%;aspect-ratio:1/1;right:6%;top:6%;z-index:3}
.lookbook{display:grid;grid-auto-flow:column;grid-auto-columns:min(74vw,380px);
  gap:18px;overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory;
  scrollbar-width:thin}
.lookbook img{aspect-ratio:3/4;object-fit:cover;border-radius:var(--cr);scroll-snap-align:start;width:100%}
.lookbook figure{margin:0;scroll-snap-align:start}
.lookbook figcaption{font-size:.8rem;color:var(--mut);margin-top:10px;letter-spacing:.06em;text-transform:uppercase}
.nav__links a.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;background:var(--ac-t)}
`,
  },
  {
    id: "spec", hero: "spec", nav: "mono",
    sections: ["usp", "products", "spec", "reviews", "faq", "cta"],
    gridCols: 3, gap: 22,
    css: `
.hero{padding:clamp(46px,6vw,92px) 0;border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,var(--sf),var(--bg))}
.hero__grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,60px)}
@media(max-width:900px){.hero__grid{grid-template-columns:1fr}}
.hero__label{font-family:var(--mono);font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;
  color:var(--ac-t);display:flex;gap:14px;align-items:center;margin-bottom:22px}
.hero__label::after{content:"";flex:1;height:1px;background:var(--line)}
.hero h1{font-family:var(--sans);font-weight:700;letter-spacing:-.035em;
  font-size:clamp(2.2rem,5.6vw,4rem);text-transform:uppercase}
.hero h1 em{font-style:normal;color:var(--ac-t)}
.hero__cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.spec-table{border:1px solid var(--line);border-radius:var(--cr);overflow:hidden;font-family:var(--mono);font-size:.84rem}
.spec-table div{display:grid;grid-template-columns:1fr 1.4fr;border-bottom:1px solid var(--line)}
.spec-table div:last-child{border-bottom:0}
.spec-table dt,.spec-table dd{margin:0;padding:13px 16px}
.spec-table dt{background:var(--sf);color:var(--mut);text-transform:uppercase;font-size:.7rem;letter-spacing:.1em}
.spec-table dd{background:var(--card)}
.spec-grid{display:grid;gap:18px;grid-template-columns:repeat(3,1fr)}
@media(max-width:860px){.spec-grid{grid-template-columns:1fr}}
.spec-card{border:1px solid var(--line);border-radius:var(--cr);background:var(--card);padding:24px}
.spec-card .num{font-family:var(--mono);font-size:.72rem;color:var(--ac-t);letter-spacing:.2em}
.spec-card h3{font-family:var(--sans);font-weight:700;margin:12px 0 8px;text-transform:uppercase;font-size:1rem}
.spec-card p{font-size:.9rem;color:var(--mut);margin:0}
.prod__name{font-family:var(--sans);font-weight:600}
`,
  },
  {
    id: "brutal", hero: "brutal", nav: "block",
    sections: ["marquee", "products", "story", "reviews", "cta"],
    gridCols: 3, gap: 0, fatline: 1,
    css: `
.hero{border-bottom:3px solid var(--ink);padding:clamp(40px,6vw,84px) 0}
.hero__grid{display:grid;grid-template-columns:1.3fr .7fr;gap:0}
@media(max-width:900px){.hero__grid{grid-template-columns:1fr}}
.hero__text{padding-right:clamp(20px,4vw,56px)}
.hero h1{font-size:clamp(2.6rem,7vw,5.2rem);text-transform:uppercase;letter-spacing:-.04em;line-height:.95}
.hero h1 em{font-style:normal;background:var(--ac);color:var(--ack);padding:0 .12em;display:inline-block}
.hero .lead{margin-top:22px}
.hero__cta{display:flex;gap:0;margin-top:30px;flex-wrap:wrap}
.hero__cta .btn{border-radius:0;border-width:2px;padding:17px 30px}
.hero__side{border-left:3px solid var(--ink);padding-left:clamp(18px,3vw,36px);
  display:grid;gap:18px;align-content:start}
@media(max-width:900px){.hero__side{border-left:0;border-top:3px solid var(--ink);padding:24px 0 0;margin-top:26px}}
.hero__side div b{display:block;font-family:var(--display);font-size:2.1rem;line-height:1}
.hero__side div span{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--mut)}
.grid{border-top:1px solid var(--ink);border-left:1px solid var(--ink)}
.prod{border-radius:0;border:0;border-right:1px solid var(--ink);border-bottom:1px solid var(--ink)}
.prod:hover{transform:none;box-shadow:none;background:color-mix(in srgb,var(--ac) 9%,var(--card))}
.prod__badge{border-radius:0}
.prod__body{padding:20px}
.story__box{border:3px solid var(--ink);padding:clamp(24px,4vw,46px);background:var(--card)}
`,
  },
  {
    id: "lookbook", hero: "lookbook", nav: "index",
    sections: ["products", "editorial", "reviews", "cta"],
    gridCols: 2, gap: 30, ar: "3/4",
    css: `
.hero{padding:clamp(44px,6vw,84px) 0 0}
.hero__strip{display:grid;grid-auto-flow:column;grid-auto-columns:min(64vw,340px);gap:16px;
  overflow-x:auto;padding-bottom:22px;scroll-snap-type:x mandatory}
.hero__strip img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--cr);scroll-snap-align:start}
.hero__head{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;margin-bottom:34px}
@media(max-width:760px){.hero__head{grid-template-columns:1fr}}
.hero h1{font-size:clamp(2.2rem,5.4vw,4rem)}
.hero h1 em{font-style:italic;color:var(--ac-t)}
.hero__no{font-family:var(--mono);font-size:.78rem;letter-spacing:.2em;color:var(--mut);text-transform:uppercase}
.prod__media{aspect-ratio:3/4}
.prod__body{padding:20px 4px 4px;background:transparent}
.prod{background:transparent;border:0;overflow:visible}
.prod:hover{transform:none;box-shadow:none}
.prod__name{font-size:1.25rem}
.prod__foot{border-top:1px solid var(--line);margin-top:12px;padding-top:12px}
`,
  },
  {
    id: "retro", hero: "retro", nav: "mast",
    sections: ["categories", "products", "journal", "reviews", "cta"],
    gridCols: 3, gap: 32,
    css: `
.hero{padding:clamp(36px,5vw,72px) 0;border-bottom:4px double var(--ink)}
.hero__kicker{display:flex;justify-content:space-between;gap:16px;font-family:var(--mono);
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--mut);
  border-bottom:1px solid var(--line);padding-bottom:12px;flex-wrap:wrap}
.hero h1{font-size:clamp(2.6rem,7.5vw,5.4rem);text-align:center;margin:26px 0 18px;
  letter-spacing:-.02em}
.hero h1 em{font-style:italic}
.hero__dek{text-align:center;max-width:60ch;margin:0 auto;font-size:1.06rem;color:var(--mut)}
.hero__cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:28px}
.hero__figs{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:40px;
  border:1px solid var(--ink)}
@media(max-width:760px){.hero__figs{grid-template-columns:1fr}}
.hero__figs img{aspect-ratio:4/3;object-fit:cover;width:100%;border-right:1px solid var(--ink)}
.hero__figs img:last-child{border-right:0}
.dropcap::first-letter{font-family:var(--display);font-size:3.4em;line-height:.78;
  float:left;padding:.06em .12em 0 0;font-weight:700;color:var(--ac-t)}
.prod{border-radius:0;background:transparent;border:0;padding-bottom:22px;
  border-bottom:1px solid var(--line);overflow:visible}
.prod:hover{transform:none;box-shadow:none}
.prod__media{border:1px solid var(--line)}
.prod__price{font-family:var(--mono)}
`,
  },
  {
    id: "catalog", hero: "catalog", nav: "shop",
    sections: ["usp", "categories", "products", "faq", "cta"],
    gridCols: 4, gap: 22, ar: "1/1",
    css: `
.hero{padding:clamp(36px,5vw,68px) 0;background:var(--sf);border-bottom:1px solid var(--line)}
.hero h1{font-size:clamp(2rem,4.6vw,3.3rem)}
.hero h1 em{font-style:normal;color:var(--ac-t)}
.hero__bar{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:26px}
.search{flex:1;min-width:230px;display:flex;align-items:center;gap:10px;background:var(--card);
  border:1px solid var(--line);border-radius:var(--r);padding:13px 16px}
.search input{border:0;background:none;outline:0;width:100%;font-size:.95rem}
.chips{display:flex;gap:9px;flex-wrap:wrap;margin-top:22px}
.chip{background:var(--card);border:1px solid var(--line);border-radius:999px;
  padding:9px 17px;font-size:.83rem;font-weight:600;cursor:pointer;transition:.16s}
.chip:hover{border-color:var(--ac-t);color:var(--ac-t)}
.chip.is-on{background:var(--ac);color:var(--ack);border-color:var(--ac)}
.toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;
  flex-wrap:wrap;margin-bottom:24px;font-size:.88rem;color:var(--mut)}
.toolbar select{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:9px 12px}
.prod.is-hidden{display:none}
.prod__media{aspect-ratio:1/1}
`,
  },
  {
    id: "boutique", hero: "boutique", nav: "underline",
    sections: ["usp", "products", "lookbook", "reviews", "cta"],
    gridCols: 4, gap: 22, r: 24,
    css: `
.hero{padding:clamp(46px,7vw,96px) 0}
.hero__panel{background:linear-gradient(135deg,var(--sf),var(--card));
  border:1px solid var(--line);border-radius:calc(var(--r) + 14px);
  padding:clamp(28px,5vw,60px);display:grid;grid-template-columns:1.05fr .95fr;
  gap:clamp(26px,4vw,54px);align-items:center;box-shadow:var(--sh)}
@media(max-width:900px){.hero__panel{grid-template-columns:1fr}}
.hero h1 em{font-style:italic;color:var(--ac-t)}
.hero__cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.hero__cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.hero__cards img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--r)}
.hero__cards img:nth-child(1){grid-column:span 2;aspect-ratio:16/9}
.hero__pills{display:flex;gap:9px;flex-wrap:wrap;margin-top:24px}
.hero__pills span{background:color-mix(in srgb,var(--ac) 12%,transparent);color:var(--ac-t);
  font-size:.76rem;font-weight:600;padding:7px 14px;border-radius:999px}
.prod{border-radius:var(--r);box-shadow:0 2px 8px -4px rgba(0,0,0,.14)}
.prod:hover{box-shadow:0 26px 50px -28px rgba(0,0,0,.42)}
.prod__body{padding:20px 20px 22px}
`,
  },
  {
    id: "street", hero: "street", nav: "street",
    sections: ["marquee", "drop", "products", "reviews", "cta"],
    gridCols: 3, gap: 0,
    css: `
.hero{padding:clamp(40px,6vw,86px) 0 clamp(30px,4vw,56px);position:relative;overflow:hidden}
.hero h1{font-family:var(--sans);font-weight:800;text-transform:uppercase;
  font-size:clamp(3rem,13vw,9rem);line-height:.86;letter-spacing:-.045em}
.hero h1 em{font-style:normal;display:block;color:var(--ac-t);-webkit-text-stroke:2px var(--ac-t);
  color:transparent}
.hero__meta{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;
  margin-top:30px;padding-top:20px;border-top:2px solid var(--ink);font-family:var(--mono);
  font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.hero__cta{display:flex;gap:0;margin-top:26px;flex-wrap:wrap}
.hero__cta .btn{border-radius:0;padding:17px 32px;text-transform:uppercase;letter-spacing:.06em;font-size:.86rem}
.hero__num{position:absolute;right:-2%;top:8%;font-family:var(--display);font-size:clamp(7rem,22vw,17rem);
  line-height:1;color:color-mix(in srgb,var(--ac) 14%,transparent);z-index:-1;font-weight:800}
.drop{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:2px solid var(--ink)}
@media(max-width:820px){.drop{grid-template-columns:1fr 1fr}}
.drop div{padding:24px 20px;border-right:2px solid var(--ink);background:var(--card)}
.drop div:last-child{border-right:0}
@media(max-width:820px){.drop div:nth-child(2n){border-right:0}
  .drop div:nth-child(-n+2){border-bottom:2px solid var(--ink)}}
.drop b{display:block;font-family:var(--sans);font-weight:800;font-size:1.9rem;text-transform:uppercase;line-height:1}
.drop span{font-family:var(--mono);font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--mut)}
.grid{border-top:2px solid var(--ink);border-left:2px solid var(--ink)}
.prod{border-radius:0;border:0;border-right:2px solid var(--ink);border-bottom:2px solid var(--ink)}
.prod:hover{transform:none;box-shadow:none}
.prod__badge{border-radius:0;background:var(--ink);color:var(--bg)}
.prod__name{text-transform:uppercase;font-family:var(--sans);font-weight:700;letter-spacing:-.01em}
`,
  },
];

const LAYOUT_BY_ID = Object.fromEntries(LAYOUTS.map(l => [l.id, l]));

module.exports = { BASE_CSS, LAYOUTS, LAYOUT_BY_ID };
