const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* name letters */
const nameEl=$('#name');
[...'Charisse'].forEach(c=>nameEl.append(Object.assign(document.createElement('span'),{textContent:c,ariaHidden:'true'})));
nameEl.append(document.createElement('br'));
[...'Toring'].forEach(c=>nameEl.append(Object.assign(document.createElement('span'),{textContent:c,ariaHidden:'true'})));
nameEl.addEventListener('click',e=>{
  if(e.target.tagName==='SPAN'){e.target.classList.remove('pop');void e.target.offsetWidth;e.target.classList.add('pop');burst(e.clientX,e.clientY,12)}
});

/* typewriter */
const lines=['Hi there! 👋 I\'m','Welcome to my corner of the internet. I\'m'];
let li=0,ci=0,del=false;
function type(){
  const t=$('#typed'),s=lines[li];
  if(reduce){t.textContent=lines[0];return}
  t.textContent=s.slice(0,ci);
  if(!del&&ci<s.length){ci++;setTimeout(type,45)}
  else if(!del){del=li===0;if(li===0){setTimeout(type,1400)}}
  else if(ci>0){ci--;setTimeout(type,25)}
  else{del=false;li=1;setTimeout(type,200)}
}
type();

/* theme */
$('#themeBtn').onclick=e=>{
  const n=document.body.classList.toggle('night');
  e.currentTarget.setAttribute('aria-pressed',n);
  e.currentTarget.textContent=n?'☀️ Day mode':'🌙 Night mode';
};

/* facts */
const facts=['I can lose track of time when I\'m designing something.','I\'d pick milk tea over almost any drink.','My happiest place is near the sea.','I believe good design should need zero instructions.','I always hover over buttons to see what they do. You probably do too.','I\'m building this page for an HCI class. Hi, teacher! 👋'];
let fi=-1;
$('#factBtn').onclick=()=>{let n;do{n=Math.floor(Math.random()*facts.length)}while(n===fi);fi=n;$('#factText').textContent=facts[n];burst(innerWidth/2,innerHeight/2,8)};

/* flip cards */
/* music on the Music card (YouTube IFrame API) */
let yt=null,ytApi=null;
function loadYT(){
  if(ytApi)return ytApi;
  ytApi=new Promise(res=>{
    if(window.YT&&YT.Player)return res();
    window.onYouTubeIframeAPIReady=res;
    const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';
    s.onerror=()=>{$('#ytMsg').textContent='Could not load YouTube. Check your internet connection.'};
    document.head.append(s);
  });
  return ytApi;
}
loadYT(); /* preload so playback can start right on the click */
function ytFail(id){
  $('#ytMsg').innerHTML='Could not play it here. <a href="https://www.youtube.com/watch?v='+id+'" target="_blank" rel="noopener" style="text-decoration:underline">Open on YouTube</a>'+(location.protocol==='file:'?'<br>YouTube blocks embeds on pages opened as local files. Put a file named <b>music.mp3</b> next to index.html and it will play offline.':'');
}
let aud=null;
function playYouTube(id){
  $('.ytwrap').style.display='';
  $('#ytMsg').textContent="If it doesn't start, press play on the little player.";
  if(location.protocol==='file:')ytFail(id);
  loadYT().then(()=>{
    if(yt&&yt.playVideo){yt.playVideo();return}
    yt=new YT.Player('ytPlayer',{
      width:220,height:124,videoId:id,
      playerVars:{autoplay:1,playsinline:1,loop:1,playlist:id,rel:0,origin:location.origin==='null'?undefined:location.origin},
      events:{
        onReady:e=>{e.target.unMute();e.target.setVolume(80);e.target.playVideo()},
        onError:()=>ytFail(id)
      }
    });
  });
}
function playMusic(id){
  $('#nowPlaying').classList.add('show');
  /* 1) try a local music.mp3 (works offline), 2) fall back to YouTube */
  aud=aud||Object.assign(new Audio('music.mp3'),{loop:true});
  aud.play().then(()=>{
    $('.ytwrap').style.display='none';
    $('#ytMsg').textContent='Playing music.mp3 🎶';
  }).catch(()=>playYouTube(id));
}
function stopMusic(){
  if(aud)aud.pause();
  if(yt&&yt.pauseVideo)yt.pauseVideo();
  $('#nowPlaying').classList.remove('show');
  $$('.flip[data-music]').forEach(c=>c.classList.remove('on'));
}
$('#stopMusic').onclick=stopMusic;
/* photo slideshows on the back of the cards */
$$('.slides').forEach(sl=>{
  const imgs=[...sl.children];let i=0;imgs[0].classList.add('on');
  if(reduce)return;
  setInterval(()=>{imgs[i].classList.remove('on');i=(i+1)%imgs.length;imgs[i].classList.add('on')},2200);
});
$$('.flip').forEach(b=>b.onclick=()=>{
  const on=b.classList.toggle('on');
  if(b.dataset.music){on?playMusic(b.dataset.music):stopMusic()}
});

/* skills */
const skills=[['HTML and CSS',80,'Making things look right.'],['JavaScript',65,'Making things do stuff.'],['UI and UX thinking',85,'Making things easy to use.'],['Teamwork',90,'Making things happen together.'],['Time management',70,'Work in progress, honestly.']];
$('#skillList').innerHTML=skills.map(s=>`<div class="skill" title="${s[2]}"><div class="row"><span>${s[0]}</span><span>${s[1]}%</span></div><div class="bar"><i data-w="${s[1]}"></i></div></div>`).join('');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.w+'%';io.unobserve(e.target)}}),{threshold:.4});
$$('.bar i').forEach(i=>io.observe(i));

/* mood */
const moods={chill:'Slow playlist, a window seat, and milk tea. Zero notifications.',hype:'Loud music, a long to-do list, and every item getting crossed off by lunch.',focus:'Headphones on, one tab open, and a stubborn bug that is about to lose.',hungry:'Forget the plan. We are finding the best food nearby, and I am ordering extra.'};
$$('.mood').forEach(b=>b.onclick=()=>{
  $$('.mood').forEach(x=>x.setAttribute('aria-pressed',x===b));
  $('#moodOut').textContent=moods[b.dataset.m];
});

/* copy email */
$('#copyBtn').onclick=async()=>{
  try{await navigator.clipboard.writeText('semblantecharisse69@gmail.com');toast('Email copied ✅')}
  catch{toast('Could not copy. Select the email above and copy it.')}
};

/* toast */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200)}

/* stickers */
const found=new Set();
$$('.sticker[data-s]').forEach(b=>b.onclick=e=>{
  const id=b.dataset.s;if(found.has(id))return;
  found.add(id);b.classList.add('got');
  const n=found.size;
  $$('#dots i').forEach((d,i)=>d.classList.toggle('on',i<n));
  $('#count').textContent=n+'/5';
  burst(e.clientX,e.clientY,16);
  if(n===5){toast('All stickers found! Scroll to the bottom 🎉');$('#secret').classList.add('show');setTimeout(()=>{burst(innerWidth/2,innerHeight/3,120)},300)}
  else toast(b.dataset.msg+' ('+(5-n)+' to go)');
});


/* games: tabs */
$$('.tab').forEach(t=>t.onclick=()=>{
  $$('.tab').forEach(x=>x.setAttribute('aria-selected',x===t));
  $$('.game').forEach(g=>g.classList.toggle('show',g.id===t.dataset.g));
});

/* game 1: buy and sell */
const goods=[{e:'🧋',n:'Milk tea',base:20},{e:'🎧',n:'Headphones',base:50},{e:'🍓',n:'Strawberries',base:10}];
let cash=100,mBestCash=0,mLeft=30,mTimer=null,mPlaying=false;
goods.forEach(g=>{g.price=g.base;g.prev=g.base;g.qty=0});
function renderMarket(){
  $('#market').innerHTML=goods.map((g,i)=>{
    const up=g.price>g.prev,down=g.price<g.prev;
    return `<div class="item"><span class="ie">${g.e}</span><div class="in2"><strong>${g.n}</strong><small>You own: ${g.qty}</small></div><span class="price ${up?'up':down?'down':''}">₱${g.price} ${up?'▲':down?'▼':'•'}</span><button class="btn" data-a="buy" data-i="${i}" ${mPlaying&&cash>=g.price?'':'disabled'}>Buy</button><button class="btn pink" data-a="sell" data-i="${i}" ${mPlaying&&g.qty>0?'':'disabled'}>Sell</button></div>`;
  }).join('');
  $('#cash').textContent=cash;
}
function movePrices(){
  goods.forEach(g=>{g.prev=g.price;g.price=Math.max(2,Math.round(g.base*(0.55+Math.random()*0.95)))});
}
$('#market').addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]');if(!b||!mPlaying)return;
  const g=goods[b.dataset.i];
  if(b.dataset.a==='buy'&&cash>=g.price){cash-=g.price;g.qty++}
  else if(b.dataset.a==='sell'&&g.qty>0){cash+=g.price;g.qty--;burst(e.clientX,e.clientY,8)}
  renderMarket();
});
$('#startMkt').onclick=()=>{
  clearInterval(mTimer);cash=100;mLeft=30;mPlaying=true;
  goods.forEach(g=>{g.price=g.base;g.prev=g.base;g.qty=0});
  $('#tm').textContent=mLeft;$('#mktOut').textContent='Market is open! Buy low, sell high.';
  renderMarket();
  mTimer=setInterval(()=>{
    mLeft--;$('#tm').textContent=mLeft;
    if(mLeft<=0){
      clearInterval(mTimer);mPlaying=false;
      goods.forEach(g=>{cash+=g.qty*g.price;g.qty=0});
      const profit=cash-100,nb=cash>mBestCash;
      if(nb){mBestCash=cash;$('#bs').textContent=mBestCash}
      renderMarket();
      $('#mktOut').textContent='Market closed! Everything left was sold. You ended with ₱'+cash+(profit>=0?' (profit ₱'+profit+')':' (loss ₱'+(-profit)+')')+'.'+(nb&&profit>0?' New best!':' Press Start to try again.');
      if(profit>0)burst(innerWidth/2,innerHeight/2,60);
    }else{movePrices();renderMarket()}
  },1000);
};
renderMarket();

/* game 2: memory match */
const faces=['🍓','🎧','🎨','🌴','🎮','🧋','🚀','🌈'];
let first=null,lock=false,moves=0,pairs=0,mbest=null;
function buildMem(){
  const deck=[...faces,...faces].sort(()=>Math.random()-.5);
  const grid=$('#mem');grid.innerHTML='';moves=0;pairs=0;first=null;lock=false;
  $('#mv').textContent=0;$('#memOut').textContent='Flip two cards to find matching pairs.';
  deck.forEach(f=>{
    const b=document.createElement('button');b.className='mcard';b.dataset.f=f;b.setAttribute('aria-label','Hidden card');
    b.innerHTML='<span class="q">?</span>';
    b.onclick=()=>flipCard(b);grid.append(b);
  });
}
function flipCard(b){
  if(lock||b.classList.contains('up')||b.classList.contains('done'))return;
  b.classList.add('up');b.textContent=b.dataset.f;b.setAttribute('aria-label','Card '+b.dataset.f);
  if(!first){first=b;return}
  moves++;$('#mv').textContent=moves;
  if(first.dataset.f===b.dataset.f){
    first.classList.add('done');b.classList.add('done');first=null;pairs++;
    if(pairs===faces.length){
      const nb=mbest===null||moves<mbest;if(nb){mbest=moves;$('#mbest').textContent=mbest}
      $('#memOut').textContent='You matched all pairs in '+moves+' moves!'+(nb?' New best!':'');
      burst(innerWidth/2,innerHeight/2,80);
    }else $('#memOut').textContent='Match! '+(faces.length-pairs)+' pairs left.';
  }else{
    lock=true;$('#memOut').textContent='Not a match. Try again.';
    const a=first;first=null;
    setTimeout(()=>{[a,b].forEach(c=>{c.classList.remove('up');c.innerHTML='<span class="q">?</span>';c.setAttribute('aria-label','Hidden card')});lock=false},750);
  }
}
$('#resetMem').onclick=buildMem;buildMem();

/* game 3: rock paper scissors */
const em={rock:'✊',paper:'✋',scissors:'✌️'},beats={rock:'scissors',paper:'rock',scissors:'paper'};
let w=0,l=0,t=0;
$$('#rps .btn').forEach(b=>b.onclick=()=>{
  const me=b.dataset.c,cpu=Object.keys(em)[Math.floor(Math.random()*3)];
  let r;
  if(me===cpu){t++;r='Tie! We both picked '+em[me]+'.'}
  else if(beats[me]===cpu){w++;r='You win! '+em[me]+' beats '+em[cpu]+'.';burst(b.getBoundingClientRect().left+30,b.getBoundingClientRect().top,18)}
  else{l++;r='I win! '+em[cpu]+' beats '+em[me]+'. Rematch?'}
  $('#rw').textContent=w;$('#rl').textContent=l;$('#rt').textContent=t;$('#rpsOut').textContent=r;
});

/* confetti */
const cv=$('#fx'),cx=cv.getContext('2d');let ps=[];
function size(){cv.width=innerWidth;cv.height=innerHeight}size();addEventListener('resize',size);
function burst(x,y,n){
  if(reduce)return;
  const cols=['#FF4F8B','#FFD84D','#5FD6B0','#6C7BFF','#ffffff'];
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=3+Math.random()*7;
    ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,s:4+Math.random()*6,c:cols[i%cols.length],l:70+Math.random()*30,r:Math.random()*6})}
  if(ps.length===n)loop();
}
function loop(){
  cx.clearRect(0,0,cv.width,cv.height);
  ps=ps.filter(p=>p.l>0);
  ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.25;p.l--;p.r+=.2;cx.save();cx.globalAlpha=Math.min(1,p.l/30);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore()});
  if(ps.length)requestAnimationFrame(loop);else cx.clearRect(0,0,cv.width,cv.height);
}
$('#confettiBtn').onclick=e=>burst(e.clientX,e.clientY,70);
