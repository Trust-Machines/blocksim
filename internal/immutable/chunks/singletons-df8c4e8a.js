import{w as u}from"./index-879bd656.js";let f="",b="";function p(n){f=n.base,b=n.assets||f}function m(n){let e=n.baseURI;if(!e){const t=n.getElementsByTagName("base");e=t.length?t[0].href:n.URL}return e}function _(){return{x:pageXOffset,y:pageYOffset}}function w(n){let e,t=null,r=null,a=null;for(const s of n.composedPath())s instanceof Element&&(!e&&s.nodeName.toUpperCase()==="A"&&(e=s),t===null&&(t=i(s,"data-sveltekit-noscroll")),r===null&&(r=i(s,"data-sveltekit-prefetch")),a===null&&(a=i(s,"data-sveltekit-reload")));const o=e&&new URL(e instanceof SVGAElement?e.href.baseVal:e.href,document.baseURI);return{a:e,url:o,options:{noscroll:t,prefetch:r,reload:a},has:e?{rel_external:(e.getAttribute("rel")||"").split(/\s+/).includes("external"),download:e.hasAttribute("download"),target:!!(e instanceof SVGAElement?e.target.baseVal:e.target)}:{}}}function i(n,e){const t=n.getAttribute(e);return t===null?t:t===""?!0:(t==="off",!1)}function d(n){const e=u(n);let t=!0;function r(){t=!0,e.update(s=>s)}function a(s){t=!1,e.set(s)}function o(s){let l;return e.subscribe(c=>{(l===void 0||t&&c!==l)&&s(l=c)})}return{notify:r,set:a,subscribe:o}}function g(){const{set:n,subscribe:e}=u(!1);let t;async function r(){clearTimeout(t);const a=await fetch(`${b}/internal/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(a.ok){const{version:o}=await a.json(),s=o!=="1673455561752";return s&&(n(!0),clearTimeout(t)),s}else throw new Error(`Version check failed: ${a.status}`)}return{subscribe:e,check:r}}function k(n){n.client}const v={url:d({}),page:d({}),navigating:u(null),updated:g()};export{_ as a,p as b,w as f,m as g,k as i,v as s};
