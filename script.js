
(()=>{
document.documentElement.classList.add('js');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

// navigation
const nav=$('#nav'),burger=$('#burger'),top=$('#top');
const onScroll=()=>{nav.classList.toggle('solid',scrollY>60&&!nav.classList.contains('open'));top.classList.toggle('show',scrollY>700)};
addEventListener('scroll',onScroll,{passive:true});onScroll();
burger.addEventListener('click',()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o);nav.classList.remove('solid');if(!o)onScroll()});
$$('#menu a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');burger.setAttribute('aria-expanded',false);onScroll()}));

// hero : affiche la photo entière (fond flouté) si le recadrage couperait trop les personnes
const hero=$('#hero'),slides=$$('.slide');
function fit(){const vw=hero.clientWidth,vh=hero.clientHeight;
 slides.forEach(s=>{const im=$('img',s);if(!im||!im.naturalWidth)return;
  const r=im.naturalWidth/im.naturalHeight,v=vw/vh,crop=1-Math.min(r,v)/Math.max(r,v);
  s.classList.toggle('contain',crop>0.14)})}
slides.forEach(s=>{const im=$('img',s);if(im)im.complete?fit():im.addEventListener('load',fit)});
addEventListener('resize',fit);fit();
let cur=0,timer;const dots=$$('.dot');
function show(i){slides[cur]?.classList.remove('on');dots[cur]?.classList.remove('on');cur=(i+slides.length)%slides.length;slides[cur].classList.add('on');dots[cur]?.classList.add('on')}
function auto(){clearInterval(timer);if(slides.length>1)timer=setInterval(()=>show(cur+1),6500)}
dots.forEach((d,i)=>d.addEventListener('click',()=>{show(i);auto()}));auto();

// ovales adaptés à la forme de chaque portrait
$$('.arch img').forEach(im=>{const f=()=>{im.parentElement.style.aspectRatio=Math.min(.95,Math.max(.66,im.naturalWidth/im.naturalHeight))};im.complete?f():im.addEventListener('load',f)});

// compte à rebours
const cd=$('#cd'),target=new Date(cd.dataset.date);
function tick(){let t=Math.max(0,target-new Date());const d=Math.floor(t/864e5),h=Math.floor(t/36e5%24),m=Math.floor(t/6e4%60),s=Math.floor(t/1e3%60);
 cd.innerHTML=[[d,'jours'],[h,'heures'],[m,'min'],[s,'sec']].map(([v,l])=>`<div><b>${v}</b><small>${l}</small></div>`).join('')}
tick();setInterval(tick,1000);

// apparition de la frise
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});
$$('.chap').forEach(c=>io.observe(c));

// galerie : défilement automatique en boucle, flèches, glisser/toucher
const gt=$('#gal-track');
if(gt){
 const orig=[...gt.children];orig.forEach(f=>gt.appendChild(f.cloneNode(true)));
 const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let paused=false,dragging=false,sx=0,sl=0,acc=0,visible=true;
 const half=()=>gt.scrollWidth/2;
 const wrapLoop=()=>{const h=half();if(gt.scrollLeft>=h)gt.scrollLeft-=h;else if(gt.scrollLeft<=0)gt.scrollLeft+=h};
 new IntersectionObserver(([x])=>visible=x.isIntersecting).observe(gt);
 function step(){if(!paused&&!dragging&&visible&&!reduce){acc+=.6;if(acc>=1){const n=Math.floor(acc);gt.scrollLeft+=n;acc-=n}wrapLoop()}requestAnimationFrame(step)}
 const start=()=>{gt.scrollLeft=1;requestAnimationFrame(step)};
 addEventListener('load',start);
 const by=d=>{paused=true;gt.scrollBy({left:d,behavior:'smooth'});setTimeout(()=>{paused=false;wrapLoop()},900)};
 const w=()=>(gt.querySelector('figure')?.offsetWidth||400)+6;
 $('.gal-btn.prev').onclick=()=>by(-w());$('.gal-btn.next').onclick=()=>by(w());
 gt.addEventListener('mouseenter',()=>paused=true);gt.addEventListener('mouseleave',()=>paused=false);
 gt.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragging=true;sx=e.clientX;sl=gt.scrollLeft;gt.classList.add('drag')});
 addEventListener('pointermove',e=>{if(dragging){gt.scrollLeft=sl-(e.clientX-sx);wrapLoop()}});
 addEventListener('pointerup',()=>{dragging=false;gt.classList.remove('drag')});
 gt.addEventListener('touchstart',()=>paused=true,{passive:true});
 gt.addEventListener('touchend',()=>setTimeout(()=>paused=false,1800),{passive:true});
 gt.addEventListener('scroll',wrapLoop,{passive:true});
}

// musique
const bgm=$('#bgm'),gate=$('#gate'),mute=$('#mute');
if(gate){document.body.style.overflow='hidden';
 const close=play=>{gate.classList.add('out');document.body.style.overflow='';mute.hidden=false;
  if(play){bgm.volume=.6;bgm.play().catch(()=>mute.classList.add('off'))}else mute.classList.add('off')};
 $('#enter').onclick=()=>close(true);$('#skip').onclick=()=>close(false);
 mute.onclick=()=>{if(bgm.paused){bgm.play();mute.classList.remove('off')}else{bgm.pause();mute.classList.add('off')}}}

// copier un numéro
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(b.dataset.copy);const t=b.textContent;b.textContent='Copié';setTimeout(()=>b.textContent=t,1600)}catch{prompt('Copiez le numéro :',b.dataset.copy)}}));

// ajouter au calendrier (.ics)
$$('[data-ics]').forEach(b=>b.addEventListener('click',()=>{
 const p=n=>String(n).padStart(2,'0'),f=d=>`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
 const s=new Date(b.dataset.start),e=new Date(s.getTime()+b.dataset.min*6e4);
 const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mariage//FR','BEGIN:VEVENT','UID:'+f(s)+'@mariage',
  'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z','DTSTART:'+f(s),'DTEND:'+f(e),'SUMMARY:'+b.dataset.title,'LOCATION:'+b.dataset.loc,'END:VEVENT','END:VCALENDAR'].join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='mariage.ics';a.click()}));

// RSVP
const form=$('#rsvp-form');
// fermeture automatique des réponses à la date limite
const closeAt=form.dataset.close?new Date(form.dataset.close):null;
if(closeAt&&!isNaN(closeAt)&&new Date()>=closeAt){
 const p=document.createElement('p');p.className='closed';p.textContent=form.dataset.closed||'Les réponses sont closes.';
 form.replaceWith(p);
 const dl=$('.deadline');if(dl)dl.remove();
}else if(form.dataset.form){
 form.addEventListener('submit',async ev=>{
  ev.preventDefault();
  const E=JSON.parse(form.dataset.entries),v=id=>$('#'+id).value.trim(),note=$('#f-note'),btn=$('button[type=submit]',form);
  const body=new URLSearchParams();
  body.append(E.prenom,v('f-prenom'));body.append(E.nom,v('f-nom'));body.append(E.nb,v('f-nb'));body.append(E.reponse,v('f-part'));
  if(E.message)body.append(E.message,v('f-msg'));
  btn.disabled=true;note.textContent='Envoi en cours...';
  try{await fetch(form.dataset.form,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
   form.reset();note.textContent='Merci ! Votre réponse a bien été enregistrée.'}
  catch(err){note.textContent='Une erreur est survenue. Veuillez réessayer.'}
  btn.disabled=false})
}else{
 form.addEventListener('submit',ev=>{ev.preventDefault();$('#f-note').textContent='Le formulaire n\'est pas encore disponible.'})}
})();
