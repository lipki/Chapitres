(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function r(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(i){if(i.ep)return;i.ep=!0;const l=r(i);fetch(i.href,l)}})();const yt=!1;var kt=Array.isArray,ee=Array.prototype.indexOf,re=Array.from,ne=Object.defineProperty,W=Object.getOwnPropertyDescriptor,le=Object.getOwnPropertyDescriptors,ie=Object.prototype,ae=Array.prototype,Ct=Object.getPrototypeOf,Et=Object.isExtensible;const S=2,Dt=4,pt=8,ht=16,q=32,K=64,tt=128,T=256,et=512,N=1024,D=2048,$=4096,rt=8192,at=16384,ue=32768,fe=65536,oe=1<<19,Lt=1<<20,vt=1<<21,ct=Symbol("$state");function Pt(t){return t===this.v}function se(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function ce(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function ve(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function _e(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let gt=!1,de=!1;function pe(){gt=!0}const he=2,m=Symbol(),ge="http://www.w3.org/1999/xhtml";let E=null;function bt(t){E=t}function we(t,e=!1,r){var n=E={p:E,c:null,d:!1,e:null,m:!1,s:t,x:null,l:null};gt&&!e&&(E.l={s:null,u:null,r1:[],r2:It(!1)}),Oe(()=>{n.d=!0})}function me(t){const e=E;if(e!==null){const c=e.e;if(c!==null){var r=p,n=d;e.e=null;try{for(var i=0;i<c.length;i++){var l=c[i];H(l.effect),C(l.reaction),Fe(l.fn)}}finally{H(r),C(n)}}E=e.p,e.m=!0}return{}}function ut(){return!gt||E!==null&&E.l===null}function U(t,e){if(typeof t!="object"||t===null||ct in t)return t;const r=Ct(t);if(r!==ie&&r!==ae)return t;var n=new Map,i=kt(t),l=O(0),c=d,v=f=>{var a=d;C(c);var s;return s=f(),C(a),s};return i&&n.set("length",O(t.length)),new Proxy(t,{defineProperty(f,a,s){(!("value"in s)||s.configurable===!1||s.enumerable===!1||s.writable===!1)&&ce();var o=n.get(a);return o===void 0?(o=v(()=>O(s.value)),n.set(a,o)):A(o,v(()=>U(s.value))),!0},deleteProperty(f,a){var s=n.get(a);if(s===void 0)a in f&&n.set(a,v(()=>O(m)));else{if(i&&typeof a=="string"){var o=n.get("length"),u=Number(a);Number.isInteger(u)&&u<o.v&&A(o,u)}A(s,m),xt(l)}return!0},get(f,a,s){var h;if(a===ct)return t;var o=n.get(a),u=a in f;if(o===void 0&&(!u||(h=W(f,a))!=null&&h.writable)&&(o=v(()=>O(U(u?f[a]:m))),n.set(a,o)),o!==void 0){var _=I(o);return _===m?void 0:_}return Reflect.get(f,a,s)},getOwnPropertyDescriptor(f,a){var s=Reflect.getOwnPropertyDescriptor(f,a);if(s&&"value"in s){var o=n.get(a);o&&(s.value=I(o))}else if(s===void 0){var u=n.get(a),_=u==null?void 0:u.v;if(u!==void 0&&_!==m)return{enumerable:!0,configurable:!0,value:_,writable:!0}}return s},has(f,a){var _;if(a===ct)return!0;var s=n.get(a),o=s!==void 0&&s.v!==m||Reflect.has(f,a);if(s!==void 0||p!==null&&(!o||(_=W(f,a))!=null&&_.writable)){s===void 0&&(s=v(()=>O(o?U(f[a]):m)),n.set(a,s));var u=I(s);if(u===m)return!1}return o},set(f,a,s,o){var L;var u=n.get(a),_=a in f;if(i&&a==="length")for(var h=s;h<u.v;h+=1){var b=n.get(h+"");b!==void 0?A(b,m):h in f&&(b=v(()=>O(m)),n.set(h+"",b))}u===void 0?(!_||(L=W(f,a))!=null&&L.writable)&&(u=v(()=>O(void 0)),A(u,v(()=>U(s))),n.set(a,u)):(_=u.v!==m,A(u,v(()=>U(s))));var V=Reflect.getOwnPropertyDescriptor(f,a);if(V!=null&&V.set&&V.set.call(o,s),!_){if(i&&typeof a=="string"){var z=n.get("length"),j=Number(a);Number.isInteger(j)&&j>=z.v&&A(z,j+1)}xt(l)}return!0},ownKeys(f){I(l);var a=Reflect.ownKeys(f).filter(u=>{var _=n.get(u);return _===void 0||_.v!==m});for(var[s,o]of n)o.v!==m&&!(s in f)&&a.push(s);return a},setPrototypeOf(){ve()}})}function xt(t,e=1){A(t,t.v+e)}const G=new Map;function It(t,e){var r={f:0,v:t,reactions:null,equals:Pt,rv:0,wv:0};return r}function O(t,e){const r=It(t);return Re(r),r}function A(t,e,r=!1){d!==null&&!P&&ut()&&(d.f&(S|ht))!==0&&!(w!=null&&w.includes(t))&&_e();let n=r?U(e):e;return ye(t,n)}function ye(t,e){if(!t.equals(e)){var r=t.v;ft?G.set(t,e):G.set(t,r),t.v=e,t.wv=Zt(),Mt(t,D),ut()&&p!==null&&(p.f&N)!==0&&(p.f&(q|K))===0&&(x===null?qe([t]):x.push(t))}return e}function Mt(t,e){var r=t.reactions;if(r!==null)for(var n=ut(),i=r.length,l=0;l<i;l++){var c=r[l],v=c.f;(v&D)===0&&(!n&&c===p||(F(c,e),(v&(N|T))!==0&&((v&S)!==0?Mt(c,$):mt(c))))}}var Tt,Rt,qt,Vt;function Ee(){if(Tt===void 0){Tt=window,Rt=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,r=Text.prototype;qt=W(e,"firstChild").get,Vt=W(e,"nextSibling").get,Et(t)&&(t.__click=void 0,t.__className=void 0,t.__attributes=null,t.__style=void 0,t.__e=void 0),Et(r)&&(r.__t=void 0)}}function be(t=""){return document.createTextNode(t)}function jt(t){return qt.call(t)}function Bt(t){return Vt.call(t)}function Y(t,e){return jt(t)}function Nt(t,e=1,r=!1){let n=t;for(;e--;)n=Bt(n);return n}function xe(t){var e=S|D,r=d!==null&&(d.f&S)!==0?d:null;return p===null||r!==null&&(r.f&T)!==0?e|=T:p.f|=Lt,{ctx:E,deps:null,effects:null,equals:Pt,f:e,fn:t,reactions:null,rv:0,v:null,wv:0,parent:r??p}}function Ut(t){var e=t.effects;if(e!==null){t.effects=null;for(var r=0;r<e.length;r+=1)R(e[r])}}function Te(t){for(var e=t.parent;e!==null;){if((e.f&S)===0)return e;e=e.parent}return null}function Ne(t){var e,r=p;H(Te(t));try{Ut(t),e=Jt(t)}finally{H(r)}return e}function Yt(t){var e=Ne(t),r=(k||(t.f&T)!==0)&&t.deps!==null?$:N;F(t,r),t.equals(e)||(t.v=e,t.wv=Zt())}function Se(t,e){var r=e.last;r===null?e.last=e.first=t:(r.next=t,t.prev=r,e.last=t)}function Z(t,e,r,n=!0){var i=p,l={ctx:E,deps:null,nodes_start:null,nodes_end:null,f:t|D,first:null,fn:e,last:null,next:null,parent:i,prev:null,teardown:null,transitions:null,wv:0};if(r)try{wt(l),l.f|=ue}catch(f){throw R(l),f}else e!==null&&mt(l);var c=r&&l.deps===null&&l.first===null&&l.nodes_start===null&&l.teardown===null&&(l.f&(Lt|tt))===0;if(!c&&n&&(i!==null&&Se(l,i),d!==null&&(d.f&S)!==0)){var v=d;(v.effects??(v.effects=[])).push(l)}return l}function Oe(t){const e=Z(pt,null,!1);return F(e,N),e.teardown=t,e}function Ae(t){const e=Z(K,t,!0);return(r={})=>new Promise(n=>{r.outro?Pe(e,()=>{R(e),n(void 0)}):(R(e),n(void 0))})}function Fe(t){return Z(Dt,t,!1)}function ke(t,e=[],r=xe){const n=e.map(r);return Ce(()=>t(...n.map(I)))}function Ce(t,e=0){return Z(pt|ht|e,t,!0)}function De(t,e=!0){return Z(pt|q,t,!0,e)}function Ht(t){var e=t.teardown;if(e!==null){const r=ft,n=d;St(!0),C(null);try{e.call(null)}finally{St(r),C(n)}}}function Kt(t,e=!1){var r=t.first;for(t.first=t.last=null;r!==null;){var n=r.next;(r.f&K)!==0?r.parent=null:R(r,e),r=n}}function Le(t){for(var e=t.first;e!==null;){var r=e.next;(e.f&q)===0&&R(e),e=r}}function R(t,e=!0){var r=!1;if((e||(t.f&oe)!==0)&&t.nodes_start!==null){for(var n=t.nodes_start,i=t.nodes_end;n!==null;){var l=n===i?null:Bt(n);n.remove(),n=l}r=!0}Kt(t,e&&!r),it(t,0),F(t,at);var c=t.transitions;if(c!==null)for(const f of c)f.stop();Ht(t);var v=t.parent;v!==null&&v.first!==null&&$t(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function $t(t){var e=t.parent,r=t.prev,n=t.next;r!==null&&(r.next=n),n!==null&&(n.prev=r),e!==null&&(e.first===t&&(e.first=n),e.last===t&&(e.last=r))}function Pe(t,e){var r=[];Wt(t,r,!0),Ie(r,()=>{R(t),e&&e()})}function Ie(t,e){var r=t.length;if(r>0){var n=()=>--r||e();for(var i of t)i.out(n)}else e()}function Wt(t,e,r){if((t.f&rt)===0){if(t.f^=rt,t.transitions!==null)for(const c of t.transitions)(c.is_global||r)&&e.push(c);for(var n=t.first;n!==null;){var i=n.next,l=(n.f&fe)!==0||(n.f&q)!==0;Wt(n,e,l?r:!1),n=i}}}let Q=!1,_t=!1,nt=null,M=!1,ft=!1;function St(t){ft=t}let X=[];let d=null,P=!1;function C(t){d=t}let p=null;function H(t){p=t}let w=null;function Me(t){w=t}function Re(t){d!==null&&d.f&vt&&(w===null?Me([t]):w.push(t))}let g=null,y=0,x=null;function qe(t){x=t}let Gt=1,lt=0,k=!1;function Zt(){return++Gt}function ot(t){var o;var e=t.f;if((e&D)!==0)return!0;if((e&$)!==0){var r=t.deps,n=(e&T)!==0;if(r!==null){var i,l,c=(e&et)!==0,v=n&&p!==null&&!k,f=r.length;if(c||v){var a=t,s=a.parent;for(i=0;i<f;i++)l=r[i],(c||!((o=l==null?void 0:l.reactions)!=null&&o.includes(a)))&&(l.reactions??(l.reactions=[])).push(a);c&&(a.f^=et),v&&s!==null&&(s.f&T)===0&&(a.f^=T)}for(i=0;i<f;i++)if(l=r[i],ot(l)&&Yt(l),l.wv>t.wv)return!0}(!n||p!==null&&!k)&&F(t,N)}return!1}function Ve(t,e){for(var r=e;r!==null;){if((r.f&tt)!==0)try{r.fn(t);return}catch{r.f^=tt}r=r.parent}throw Q=!1,t}function je(t){return(t.f&at)===0&&(t.parent===null||(t.parent.f&tt)===0)}function st(t,e,r,n){if(Q){if(r===null&&(Q=!1),je(e))throw t;return}r!==null&&(Q=!0);{Ve(t,e);return}}function zt(t,e,r=!0){var n=t.reactions;if(n!==null)for(var i=0;i<n.length;i++){var l=n[i];w!=null&&w.includes(t)||((l.f&S)!==0?zt(l,e,!1):e===l&&(r?F(l,D):(l.f&N)!==0&&F(l,$),mt(l)))}}function Jt(t){var _;var e=g,r=y,n=x,i=d,l=k,c=w,v=E,f=P,a=t.f;g=null,y=0,x=null,k=(a&T)!==0&&(P||!M||d===null),d=(a&(q|K))===0?t:null,w=null,bt(t.ctx),P=!1,lt++,t.f|=vt;try{var s=(0,t.fn)(),o=t.deps;if(g!==null){var u;if(it(t,y),o!==null&&y>0)for(o.length=y+g.length,u=0;u<g.length;u++)o[y+u]=g[u];else t.deps=o=g;if(!k)for(u=y;u<o.length;u++)((_=o[u]).reactions??(_.reactions=[])).push(t)}else o!==null&&y<o.length&&(it(t,y),o.length=y);if(ut()&&x!==null&&!P&&o!==null&&(t.f&(S|$|D))===0)for(u=0;u<x.length;u++)zt(x[u],t);return i!==null&&(lt++,x!==null&&(n===null?n=x:n.push(...x))),s}finally{g=e,y=r,x=n,d=i,k=l,w=c,bt(v),P=f,t.f^=vt}}function Be(t,e){let r=e.reactions;if(r!==null){var n=ee.call(r,t);if(n!==-1){var i=r.length-1;i===0?r=e.reactions=null:(r[n]=r[i],r.pop())}}r===null&&(e.f&S)!==0&&(g===null||!g.includes(e))&&(F(e,$),(e.f&(T|et))===0&&(e.f^=et),Ut(e),it(e,0))}function it(t,e){var r=t.deps;if(r!==null)for(var n=e;n<r.length;n++)Be(t,r[n])}function wt(t){var e=t.f;if((e&at)===0){F(t,N);var r=p,n=E,i=M;p=t,M=!0;try{(e&ht)!==0?Le(t):Kt(t),Ht(t);var l=Jt(t);t.teardown=typeof l=="function"?l:null,t.wv=Gt;var c=t.deps,v;yt&&de&&t.f&D}catch(f){st(f,t,r,n||t.ctx)}finally{M=i,p=r}}}function Ue(){try{se()}catch(t){if(nt!==null)st(t,nt,null);else throw t}}function Ye(){var t=M;try{var e=0;for(M=!0;X.length>0;){e++>1e3&&Ue();var r=X,n=r.length;X=[];for(var i=0;i<n;i++){var l=Ke(r[i]);He(l)}}}finally{_t=!1,M=t,nt=null,G.clear()}}function He(t){var e=t.length;if(e!==0)for(var r=0;r<e;r++){var n=t[r];if((n.f&(at|rt))===0)try{ot(n)&&(wt(n),n.deps===null&&n.first===null&&n.nodes_start===null&&(n.teardown===null?$t(n):n.fn=null))}catch(i){st(i,n,null,n.ctx)}}}function mt(t){_t||(_t=!0,queueMicrotask(Ye));for(var e=nt=t;e.parent!==null;){e=e.parent;var r=e.f;if((r&(K|q))!==0){if((r&N)===0)return;e.f^=N}}X.push(e)}function Ke(t){for(var e=[],r=t;r!==null;){var n=r.f,i=(n&(q|K))!==0,l=i&&(n&N)!==0;if(!l&&(n&rt)===0){if((n&Dt)!==0)e.push(r);else if(i)r.f^=N;else{var c=d;try{d=r,ot(r)&&wt(r)}catch(a){st(a,r,null,r.ctx)}finally{d=c}}var v=r.first;if(v!==null){r=v;continue}}var f=r.parent;for(r=r.next;r===null&&f!==null;)r=f.next,f=f.parent}return e}function I(t){var e=t.f,r=(e&S)!==0;if(d!==null&&!P){if(!(w!=null&&w.includes(t))){var n=d.deps;t.rv<lt&&(t.rv=lt,g===null&&n!==null&&n[y]===t?y++:g===null?g=[t]:(!k||!g.includes(t))&&g.push(t))}}else if(r&&t.deps===null&&t.effects===null){var i=t,l=i.parent;l!==null&&(l.f&T)===0&&(i.f^=T)}return r&&(i=t,ot(i)&&Yt(i)),ft&&G.has(t)?G.get(t):t.v}const $e=-7169;function F(t,e){t.f=t.f&$e|e}const We=["touchstart","touchmove"];function Ge(t){return We.includes(t)}const Qt=new Set,dt=new Set;function Ze(t){for(var e=0;e<t.length;e++)Qt.add(t[e]);for(var r of dt)r(t)}function J(t){var j;var e=this,r=e.ownerDocument,n=t.type,i=((j=t.composedPath)==null?void 0:j.call(t))||[],l=i[0]||t.target,c=0,v=t.__root;if(v){var f=i.indexOf(v);if(f!==-1&&(e===document||e===window)){t.__root=e;return}var a=i.indexOf(e);if(a===-1)return;f<=a&&(c=f)}if(l=i[c]||t.target,l!==e){ne(t,"currentTarget",{configurable:!0,get(){return l||r}});var s=d,o=p;C(null),H(null);try{for(var u,_=[];l!==null;){var h=l.assignedSlot||l.parentNode||l.host||null;try{var b=l["__"+n];if(b!=null&&(!l.disabled||t.target===l))if(kt(b)){var[V,...z]=b;V.apply(l,[t,...z])}else b.call(l,t)}catch(L){u?_.push(L):u=L}if(t.cancelBubble||h===e||h===null)break;l=h}if(u){for(let L of _)queueMicrotask(()=>{throw L});throw u}}finally{t.__root=e,delete t.currentTarget,C(s),H(o)}}}function ze(t){var e=document.createElement("template");return e.innerHTML=t,e.content}function Je(t,e){var r=p;r.nodes_start===null&&(r.nodes_start=t,r.nodes_end=e)}function Xt(t,e){var r=(e&he)!==0,n,i=!t.startsWith("<!>");return()=>{n===void 0&&(n=ze(i?t:"<!>"+t),n=jt(n));var l=r||Rt?document.importNode(n,!0):n.cloneNode(!0);return Je(l,l),l}}function te(t,e){t!==null&&t.before(e)}function Qe(t,e){var r=e==null?"":typeof e=="object"?e+"":e;r!==(t.__t??(t.__t=t.nodeValue))&&(t.__t=r,t.nodeValue=r+"")}function Xe(t,e){return tr(t,e)}const B=new Map;function tr(t,{target:e,anchor:r,props:n={},events:i,context:l,intro:c=!0}){Ee();var v=new Set,f=o=>{for(var u=0;u<o.length;u++){var _=o[u];if(!v.has(_)){v.add(_);var h=Ge(_);e.addEventListener(_,J,{passive:h});var b=B.get(_);b===void 0?(document.addEventListener(_,J,{passive:h}),B.set(_,1)):B.set(_,b+1)}}};f(re(Qt)),dt.add(f);var a=void 0,s=Ae(()=>{var o=r??e.appendChild(be());return De(()=>{if(l){we({});var u=E;u.c=l}i&&(n.$$events=i),a=t(o,n)||{},l&&me()}),()=>{var h;for(var u of v){e.removeEventListener(u,J);var _=B.get(u);--_===0?(document.removeEventListener(u,J),B.delete(u)):B.set(u,_)}dt.delete(f),o!==r&&((h=o.parentNode)==null||h.removeChild(o))}});return er.set(a,s),a}let er=new WeakMap;const rr=Symbol("is custom element"),nr=Symbol("is html");function Ot(t,e,r,n){var i=lr(t);i[e]!==(i[e]=r)&&(r==null?t.removeAttribute(e):typeof r!="string"&&ir(t).includes(e)?t[e]=r:t.setAttribute(e,r))}function lr(t){return t.__attributes??(t.__attributes={[rr]:t.nodeName.includes("-"),[nr]:t.namespaceURI===ge})}var At=new Map;function ir(t){var e=At.get(t.nodeName);if(e)return e;At.set(t.nodeName,e=[]);for(var r,n=t,i=Element.prototype;i!==n;){r=le(n);for(var l in r)r[l].set&&e.push(l);n=Ct(n)}return e}const ar="5";var Ft;typeof window<"u"&&((Ft=window.__svelte??(window.__svelte={})).v??(Ft.v=new Set)).add(ar);pe();const ur="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20aria-hidden='true'%20role='img'%20class='iconify%20iconify--logos'%20width='26.6'%20height='32'%20preserveAspectRatio='xMidYMid%20meet'%20viewBox='0%200%20256%20308'%3e%3cpath%20fill='%23FF3E00'%20d='M239.682%2040.707C211.113-.182%20154.69-12.301%20113.895%2013.69L42.247%2059.356a82.198%2082.198%200%200%200-37.135%2055.056a86.566%2086.566%200%200%200%208.536%2055.576a82.425%2082.425%200%200%200-12.296%2030.719a87.596%2087.596%200%200%200%2014.964%2066.244c28.574%2040.893%2084.997%2053.007%20125.787%2027.016l71.648-45.664a82.182%2082.182%200%200%200%2037.135-55.057a86.601%2086.601%200%200%200-8.53-55.577a82.409%2082.409%200%200%200%2012.29-30.718a87.573%2087.573%200%200%200-14.963-66.244'%3e%3c/path%3e%3cpath%20fill='%23FFF'%20d='M106.889%20270.841c-23.102%206.007-47.497-3.036-61.103-22.648a52.685%2052.685%200%200%201-9.003-39.85a49.978%2049.978%200%200%201%201.713-6.693l1.35-4.115l3.671%202.697a92.447%2092.447%200%200%200%2028.036%2014.007l2.663.808l-.245%202.659a16.067%2016.067%200%200%200%202.89%2010.656a17.143%2017.143%200%200%200%2018.397%206.828a15.786%2015.786%200%200%200%204.403-1.935l71.67-45.672a14.922%2014.922%200%200%200%206.734-9.977a15.923%2015.923%200%200%200-2.713-12.011a17.156%2017.156%200%200%200-18.404-6.832a15.78%2015.78%200%200%200-4.396%201.933l-27.35%2017.434a52.298%2052.298%200%200%201-14.553%206.391c-23.101%206.007-47.497-3.036-61.101-22.649a52.681%2052.681%200%200%201-9.004-39.849a49.428%2049.428%200%200%201%2022.34-33.114l71.664-45.677a52.218%2052.218%200%200%201%2014.563-6.398c23.101-6.007%2047.497%203.036%2061.101%2022.648a52.685%2052.685%200%200%201%209.004%2039.85a50.559%2050.559%200%200%201-1.713%206.692l-1.35%204.116l-3.67-2.693a92.373%2092.373%200%200%200-28.037-14.013l-2.664-.809l.246-2.658a16.099%2016.099%200%200%200-2.89-10.656a17.143%2017.143%200%200%200-18.398-6.828a15.786%2015.786%200%200%200-4.402%201.935l-71.67%2045.674a14.898%2014.898%200%200%200-6.73%209.975a15.9%2015.9%200%200%200%202.709%2012.012a17.156%2017.156%200%200%200%2018.404%206.832a15.841%2015.841%200%200%200%204.402-1.935l27.345-17.427a52.147%2052.147%200%200%201%2014.552-6.397c23.101-6.006%2047.497%203.037%2061.102%2022.65a52.681%2052.681%200%200%201%209.003%2039.848a49.453%2049.453%200%200%201-22.34%2033.12l-71.664%2045.673a52.218%2052.218%200%200%201-14.563%206.398'%3e%3c/path%3e%3c/svg%3e",fr="/vite.svg",or=(t,e)=>{A(e,I(e)+1)};var sr=Xt("<button> </button>");function cr(t){let e=O(0);var r=sr();r.__click=[or,e];var n=Y(r);ke(()=>Qe(n,`count is ${I(e)??""}`)),te(t,r)}Ze(["click"]);var vr=Xt('<main><div><a href="https://vite.dev" target="_blank" rel="noreferrer"><img class="logo svelte-11cv5lq" alt="Vite Logo"></a> <a href="https://svelte.dev" target="_blank" rel="noreferrer"><img class="logo svelte svelte-11cv5lq" alt="Svelte Logo"></a></div> <h1>Vite + Svelte</h1> <div class="card"><!></div> <p>Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!</p> <p class="read-the-docs svelte-11cv5lq">Click on the Vite and Svelte logos to learn more</p></main>');function _r(t){var e=vr(),r=Y(e),n=Y(r),i=Y(n);Ot(i,"src",fr);var l=Nt(n,2),c=Y(l);Ot(c,"src",ur);var v=Nt(r,4),f=Y(v);cr(f),te(t,e)}Xe(_r,{target:document.getElementById("app")});
