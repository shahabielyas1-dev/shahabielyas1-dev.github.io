/* QC Toolbox Phase I: shared theme + explicit homepage navigation; no business data changes. */
(function(){
  'use strict';
  var KEY='qc-theme';
  function readTheme(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return 'light'}}
  function setTheme(mode, persist){
    mode=mode==='dark'?'dark':'light';
    document.documentElement.setAttribute('data-theme',mode);
    document.documentElement.style.colorScheme=mode;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',mode==='dark'?'#101c25':'#e8f0f3');
    if(persist){try{localStorage.setItem(KEY,mode)}catch(e){}}
    var toggle=document.getElementById('qcGlobalThemeToggle');
    if(toggle){toggle.textContent=mode==='dark'?'☀ حالت روشن':'☾ حالت شب';toggle.setAttribute('aria-pressed',String(mode==='dark'))}
    document.querySelectorAll('iframe').forEach(function(f){try{f.contentWindow.postMessage({type:'qc-theme',mode:mode},location.origin)}catch(e){}});
  }
  setTheme(readTheme(),false);
  window.addEventListener('storage',function(e){if(e.key===KEY)setTheme(readTheme(),false)});
  window.addEventListener('message',function(e){if(e.origin!==location.origin)return;if(e.data&&e.data.type==='qc-theme')setTheme(e.data.mode,false)});
  document.addEventListener('DOMContentLoaded',function(){
    if(document.body.classList.contains('qc-is-index'))return;
    var bar=document.createElement('nav');bar.className='qc-quick-actions';bar.setAttribute('aria-label','ناوبری و تنظیم نمایش');
    var home=document.createElement('a');home.href='./index.html';home.innerHTML='<img src="qc-toolbox-logo-symbol.webp" alt="" class="qc-nav-brand-icon" width="32" height="24"> <span>صفحه اصلی</span>';home.setAttribute('aria-label','بازگشت به صفحه اصلی QC Toolbox');bar.appendChild(home);
    var btn=document.createElement('button');btn.type='button';btn.id='qcGlobalThemeToggle';btn.addEventListener('click',function(){setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark',true)});bar.appendChild(btn);
    document.body.insertBefore(bar,document.body.firstChild);
    setTheme(readTheme(),false);
  });
})();
