const ADMIN_PWD = 'edecl2026';
let ARTICLES = [];
let isAdmin = false;

function getToday() {
  const d = new Date();
  const m = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
  return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderArticleCard(a, i, adminMode) {
  const isGold = a.cat.indexOf('IA') !== -1;
  const del = adminMode ? '<button class="delete-btn" onclick="deleteArticle('+i+')">Supprimer</button>' : '';
  const idx = ARTICLES.indexOf(a);
  const liUrl = encodeURIComponent('https://www.edeclaration.fr/actualites.html');
  const liText = encodeURIComponent('>>> ' + a.title + '\n\n' + a.body.substring(0,500) + (a.body.length>500?'...':'') + '\n\n#Formalites #GuichetUnique #eDéclaration #DématFacile');
  return '<div class="article-card">'
    + '<div class="article-meta">'
    + '<span class="article-cat ' + (isGold?'gold':'') + '">' + esc(a.cat) + '</span>'
    + '<span class="article-date">' + esc(a.date) + '</span>'
    + del
    + '</div>'
    + '<h2>' + esc(a.title) + '</h2>'
    + '<p>' + esc(a.body) + '</p>'
    + '<div class="article-actions">'
    + '<button class="btn-copy" onclick="copyLinkedin(this,' + i + ')">Copier pour LinkedIn</button>'
    + '<p class="copy-hint" id="hint-'+i+'"></p>'
    + '</div>'
    + '</div>';
}

function copyLinkedin(btn, idx) {
  const a = ARTICLES[idx] || ARTICLES[ARTICLES.length - 1 - idx];
  if (!a) return;
  const text = '>>> ' + a.title + '\n\n' + a.body.substring(0,500) + (a.body.length>500?'...':'') + '\n\nRetrouvez nos articles sur edeclaration.fr\n\n#Formalites #GuichetUnique #eDéclaration #DématFacile';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      btn.textContent = 'Copie OK !';
      btn.classList.add('copied');
      setTimeout(function(){ btn.textContent='Copier pour LinkedIn'; btn.classList.remove('copied'); }, 3000);
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = 'Copie OK !';
    setTimeout(function(){ btn.textContent='Copier pour LinkedIn'; }, 3000);
  }
}

function renderAll() {
  const rev = ARTICLES.slice().reverse();
  const pub = document.getElementById('articles-public');
  const empPub = document.getElementById('empty-public');
  if (!pub) return;
  if (ARTICLES.length === 0) { pub.innerHTML=''; if(empPub) empPub.style.display='block'; }
  else {
    if(empPub) empPub.style.display='none';
    pub.innerHTML = rev.map(function(a,ri){ return renderArticleCard(a, ARTICLES.length-1-ri, false); }).join('');
  }
  const adm = document.getElementById('articles-admin');
  const empAdm = document.getElementById('empty-admin');
  if (!adm) return;
  if (ARTICLES.length === 0) { adm.innerHTML=''; if(empAdm) empAdm.style.display='block'; }
  else {
    if(empAdm) empAdm.style.display='none';
    adm.innerHTML = rev.map(function(a,ri){ return renderArticleCard(a, ARTICLES.length-1-ri, true); }).join('');
  }
}

function addArticle() {
  var title = document.getElementById('art-title').value.trim();
  var body  = document.getElementById('art-body').value.trim();
  var cat   = document.getElementById('art-cat').value;
  var date  = document.getElementById('art-date').value.trim() || getToday();
  if (!title) { alert('Veuillez saisir un titre.'); return; }
  if (!body)  { alert('Veuillez saisir le contenu.'); return; }
  ARTICLES.push({title:title, body:body, cat:cat, date:date});
  renderAll();
  clearForm();
  var msg = document.getElementById('success-msg');
  if (msg) { msg.style.display='block'; setTimeout(function(){msg.style.display='none';}, 2500); }
}

function deleteArticle(idx) {
  if (!confirm('Supprimer cet article ?')) return;
  ARTICLES.splice(idx, 1);
  renderAll();
}

function clearForm() {
  ['art-title','art-body','art-date'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  var cat = document.getElementById('art-cat');
  if (cat) cat.selectedIndex=0;
}

function downloadPage() {
  if (ARTICLES.length === 0 && !confirm('Aucun article. Telecharger quand meme ?')) return;
  var html = document.documentElement.outerHTML;
  html = html.replace('let ARTICLES = [];', 'let ARTICLES = ' + JSON.stringify(ARTICLES) + ';');
  var blob = new Blob([html], {type:'text/html;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'actualites.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

function showAdmin() {
  isAdmin = true;
  var vp = document.getElementById('view-public');
  var va = document.getElementById('view-admin');
  var ab = document.getElementById('admin-bar');
  if(vp) vp.style.display='none';
  if(va) va.style.display='block';
  if(ab) ab.style.display='flex';
}

function logout() {
  isAdmin = false;
  var vp = document.getElementById('view-public');
  var va = document.getElementById('view-admin');
  var ab = document.getElementById('admin-bar');
  if(vp) vp.style.display='block';
  if(va) va.style.display='none';
  if(ab) ab.style.display='none';
}

// Cookie banner
(function() {
  var consent = localStorage.getItem('cookie_consent');
  var banner = document.getElementById('cookie-banner');
  if (!consent && banner) banner.style.display='flex';
})();

// Acces admin : double-clic sur le titre
window.addEventListener('load', function() {
  var h1 = document.querySelector('.page-hero h1');
  if (h1) {
    h1.addEventListener('dblclick', function() {
      var pwd = prompt('Mot de passe administrateur :');
      if (pwd === ADMIN_PWD) { showAdmin(); }
      else if (pwd !== null) { alert('Mot de passe incorrect.'); }
    });
    h1.title = 'Double-cliquez pour acceder a l administration';
  }
  renderAll();
});