
// ===== Hero Swiper coverflow carousel =====
(function initHeroSwiper(){
  let currentSwiper = null;
  let currentEl = null;

  function start(){
    const el = document.getElementById('heroSwiper');
    if(!el) return;
    if(!window.Swiper){ setTimeout(start, 200); return; }   // wait for CDN
    if(el === currentEl && currentSwiper) return;            // already attached

    // tear down previous instance if the SPA re-rendered the carousel
    if(currentSwiper){
      try { currentSwiper.destroy(true, true); } catch(e){}
      currentSwiper = null;
    }
    currentEl = el;

    currentSwiper = new Swiper(el, {
      effect:'coverflow',
      grabCursor:true,
      centeredSlides:true,
      slidesPerView:'auto',
      loop:true,
      speed:850,
      spaceBetween:0,
      autoplay:{
        delay:3000,
        disableOnInteraction:false,
        pauseOnMouseEnter:true,
      },
      coverflowEffect:{
        rotate:32,
        stretch:0,
        depth:160,
        modifier:1,
        slideShadows:false,
      },
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => setTimeout(start, 200));
  }else{
    setTimeout(start, 200);
  }
  window.addEventListener('hashchange', () => setTimeout(start, 350));
  if(window.MutationObserver){
    const mo = new MutationObserver(() => {
      // if the carousel element was replaced by an SPA render, re-init
      const el = document.getElementById('heroSwiper');
      if(el && el !== currentEl) start();
    });
    document.addEventListener('DOMContentLoaded', () => {
      mo.observe(document.body, {childList:true, subtree:true});
    });
  }
})();
