import{S as k,i as q,d as j,s as C,n as b,x as h,c as H,p as g,q as E,y as $,l as p,f as R,w,g as d,L as S,z as x,O as y,G as z,H as B,v as D}from"../chunks/index-5ed75e4c.js";import{s as G}from"../chunks/singletons-065f03a3.js";const L=()=>{const s=G;return{page:{subscribe:s.page.subscribe},navigating:{subscribe:s.navigating.subscribe},updated:s.updated}},m={subscribe(s){return L().page.subscribe(s)}},O="node_modules/@sveltejs/kit/src/runtime/components/error.svelte";function _(s){let e,i=s[0].status+"",o,l,n,c=s[0].error?.message+"",a;const f={c:function(){e=b("h1"),o=h(i),l=H(),n=b("p"),a=h(c),this.h()},l:function(t){e=g(t,"H1",{});var r=E(e);o=$(r,i),r.forEach(p),l=R(t),n=g(t,"P",{});var v=E(n);a=$(v,c),v.forEach(p),this.h()},h:function(){w(e,O,4,0,57),w(n,O,5,0,81)},m:function(t,r){d(t,e,r),S(e,o),d(t,l,r),d(t,n,r),S(n,a)},p:function(t,[r]){r&1&&i!==(i=t[0].status+"")&&x(o,i),r&1&&c!==(c=t[0].error?.message+"")&&x(a,c)},i:y,o:y,d:function(t){t&&p(e),t&&p(l),t&&p(n)}};return j("SvelteRegisterBlock",{block:f,id:_.name,type:"component",source:"",ctx:s}),f}function N(s,e,i){let o;z(m,"page"),B(s,m,a=>i(0,o=a));let{$$slots:l={},$$scope:n}=e;D("Error",l,[]);const c=[];return Object.keys(e).forEach(a=>{!~c.indexOf(a)&&a.slice(0,2)!=="$$"&&a!=="slot"&&console.warn(`<Error> was created with unknown prop '${a}'`)}),s.$capture_state=()=>({page:m,$page:o}),[o]}let F=class extends k{constructor(e){super(e),q(this,e,N,_,C,{}),j("SvelteRegisterComponent",{component:this,tagName:"Error",options:e,id:_.name})}};export{F as default};
