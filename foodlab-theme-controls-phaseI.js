/* Phase N: independent compact theme and back controls on standalone tool pages. */
(function(){
  'use strict';
  var KEY='qc-theme';
  var EMBEDDED=(window.self!==window.top);
  var themeGlyph=function(mode){return mode==='dark'?'☀':'☾';};
  function readTheme(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light';}catch(e){return 'light';}}
  function setTheme(mode,persist){
    mode=mode==='dark'?'dark':'light';
    document.documentElement.setAttribute('data-theme',mode);
    document.documentElement.style.colorScheme=mode;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',mode==='dark'?'#101c25':'#e8f0f3');
    if(persist){try{localStorage.setItem(KEY,mode);}catch(e){}}
    document.querySelectorAll('.qc-standalone-theme').forEach(function(el){
      el.textContent=themeGlyph(mode);
      el.setAttribute('aria-label',mode==='dark'?'حالت روشن':'حالت شب');
      el.title=mode==='dark'?'فعال کردن حالت روشن':'فعال کردن حالت شب';
      el.setAttribute('aria-pressed',String(mode==='dark'));
    });
    document.querySelectorAll('iframe').forEach(function(f){try{f.contentWindow.postMessage({type:'qc-theme',mode:mode},location.origin);}catch(e){}});
  }
  setTheme(readTheme(),false);
  window.addEventListener('storage',function(e){if(e.key===KEY)setTheme(readTheme(),false);});
  window.addEventListener('message',function(e){if(e.origin===location.origin&&e.data&&e.data.type==='qc-theme')setTheme(e.data.mode,false);});
  document.addEventListener('DOMContentLoaded',function(){
    if(document.body.classList.contains('qc-is-index'))return;
    if(EMBEDDED){document.body.classList.add('qc-embedded-tool');return;}
    var controls=document.createElement('div');
    controls.className='qc-corner-actions';
    controls.setAttribute('role','navigation');
    controls.setAttribute('aria-label','بازگشت و تنظیم حالت نمایش');
    var back=document.createElement('a');
    back.className='qc-corner-btn qc-standalone-back';
    back.href=document.body.classList.contains('print-preview-page')?'./qc-dairy-v2.html':'./index.html';
    back.textContent='→';
    back.setAttribute('aria-label',document.body.classList.contains('print-preview-page')?'بازگشت به تولید و انقضا':'بازگشت به صفحه اصلی');
    back.title='بازگشت';
    var theme=document.createElement('button');
    theme.type='button';theme.className='qc-corner-btn qc-standalone-theme';
    theme.addEventListener('click',function(){setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark',true);});
    controls.appendChild(back);controls.appendChild(theme);
    document.body.insertBefore(controls,document.body.firstChild);
    setTheme(readTheme(),false);
  });
})();
