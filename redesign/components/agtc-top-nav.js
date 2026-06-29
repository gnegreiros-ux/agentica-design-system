(()=>{var M=globalThis,T=M.ShadowRoot&&(M.ShadyCSS===void 0||M.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,R=Symbol(),X=new WeakMap,E=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==R)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(T&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=X.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&X.set(e,t))}return t}toString(){return this.cssText}},Y=i=>new E(typeof i=="string"?i:i+"",void 0,R),L=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,o,n)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+i[n+1],i[0]);return new E(e,i,R)},tt=(i,t)=>{if(T)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),o=M.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)}},D=T?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return Y(e)})(i):i;var{is:$t,defineProperty:vt,getOwnPropertyDescriptor:_t,getOwnPropertyNames:bt,getOwnPropertySymbols:At,getPrototypeOf:yt}=Object,H=globalThis,et=H.trustedTypes,St=et?et.emptyScript:"",Et=H.reactiveElementPolyfillSupport,x=(i,t)=>i,z={toAttribute(i,t){switch(t){case Boolean:i=i?St:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},ot=(i,t)=>!$t(i,t),st={attribute:!0,type:String,converter:z,reflect:!1,useDefault:!1,hasChanged:ot};Symbol.metadata??=Symbol("metadata"),H.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=st){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),o=this.getPropertyDescriptor(t,s,e);o!==void 0&&vt(this.prototype,t,o)}}static getPropertyDescriptor(t,e,s){let{get:o,set:n}=_t(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:o,set(r){let l=o?.call(this);n?.call(this,r),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??st}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;let t=yt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){let e=this.properties,s=[...bt(e),...At(e)];for(let o of s)this.createProperty(o,e[o])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,o]of e)this.elementProperties.set(s,o)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let o=this._$Eu(e,s);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let o of s)e.unshift(D(o))}else t!==void 0&&e.push(D(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return tt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,s);if(o!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:z).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){let s=this.constructor,o=s._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let n=s.getPropertyOptions(o),r=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:z;this._$Em=o;let l=r.fromAttribute(e,n.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(t,e,s,o=!1,n){if(t!==void 0){let r=this.constructor;if(o===!1&&(n=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??ot)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:o,wrapped:n},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),n!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,n]of this._$Ep)this[o]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[o,n]of s){let{wrapped:r}=n,l=this[o];r!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,n,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};g.elementStyles=[],g.shadowRootOptions={mode:"open"},g[x("elementProperties")]=new Map,g[x("finalized")]=new Map,Et?.({ReactiveElement:g}),(H.reactiveElementVersions??=[]).push("2.1.2");var F=globalThis,it=i=>i,N=F.trustedTypes,nt=N?N.createPolicy("lit-html",{createHTML:i=>i}):void 0,pt="$lit$",m=`lit$${Math.random().toFixed(9).slice(2)}$`,dt="?"+m,xt=`<${dt}>`,b=document,C=()=>b.createComment(""),P=i=>i===null||typeof i!="object"&&typeof i!="function",K=Array.isArray,wt=i=>K(i)||typeof i?.[Symbol.iterator]=="function",j=`[ 	
\f\r]`,w=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,rt=/-->/g,at=/>/g,v=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ct=/'/g,ht=/"/g,ut=/^(?:script|style|textarea|title)$/i,J=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),Z=J(1),Ht=J(2),Nt=J(3),A=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),lt=new WeakMap,_=b.createTreeWalker(b,129);function gt(i,t){if(!K(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return nt!==void 0?nt.createHTML(t):t}var Ct=(i,t)=>{let e=i.length-1,s=[],o,n=t===2?"<svg>":t===3?"<math>":"",r=w;for(let l=0;l<e;l++){let a=i[l],p,d,c=-1,u=0;for(;u<a.length&&(r.lastIndex=u,d=r.exec(a),d!==null);)u=r.lastIndex,r===w?d[1]==="!--"?r=rt:d[1]!==void 0?r=at:d[2]!==void 0?(ut.test(d[2])&&(o=RegExp("</"+d[2],"g")),r=v):d[3]!==void 0&&(r=v):r===v?d[0]===">"?(r=o??w,c=-1):d[1]===void 0?c=-2:(c=r.lastIndex-d[2].length,p=d[1],r=d[3]===void 0?v:d[3]==='"'?ht:ct):r===ht||r===ct?r=v:r===rt||r===at?r=w:(r=v,o=void 0);let f=r===v&&i[l+1].startsWith("/>")?" ":"";n+=r===w?a+xt:c>=0?(s.push(p),a.slice(0,c)+pt+a.slice(c)+m+f):a+m+(c===-2?l:f)}return[gt(i,n+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},U=class i{constructor({strings:t,_$litType$:e},s){let o;this.parts=[];let n=0,r=0,l=t.length-1,a=this.parts,[p,d]=Ct(t,e);if(this.el=i.createElement(p,s),_.currentNode=this.el.content,e===2||e===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=_.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let c of o.getAttributeNames())if(c.endsWith(pt)){let u=d[r++],f=o.getAttribute(c).split(m),k=/([.?@])?(.*)/.exec(u);a.push({type:1,index:n,name:k[2],strings:f,ctor:k[1]==="."?I:k[1]==="?"?V:k[1]==="@"?W:S}),o.removeAttribute(c)}else c.startsWith(m)&&(a.push({type:6,index:n}),o.removeAttribute(c));if(ut.test(o.tagName)){let c=o.textContent.split(m),u=c.length-1;if(u>0){o.textContent=N?N.emptyScript:"";for(let f=0;f<u;f++)o.append(c[f],C()),_.nextNode(),a.push({type:2,index:++n});o.append(c[u],C())}}}else if(o.nodeType===8)if(o.data===dt)a.push({type:2,index:n});else{let c=-1;for(;(c=o.data.indexOf(m,c+1))!==-1;)a.push({type:7,index:n}),c+=m.length-1}n++}}static createElement(t,e){let s=b.createElement("template");return s.innerHTML=t,s}};function y(i,t,e=i,s){if(t===A)return t;let o=s!==void 0?e._$Co?.[s]:e._$Cl,n=P(t)?void 0:t._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),n===void 0?o=void 0:(o=new n(i),o._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=o:e._$Cl=o),o!==void 0&&(t=y(i,o._$AS(i,t.values),o,s)),t}var B=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,o=(t?.creationScope??b).importNode(e,!0);_.currentNode=o;let n=_.nextNode(),r=0,l=0,a=s[0];for(;a!==void 0;){if(r===a.index){let p;a.type===2?p=new O(n,n.nextSibling,this,t):a.type===1?p=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(p=new q(n,this,t)),this._$AV.push(p),a=s[++l]}r!==a?.index&&(n=_.nextNode(),r++)}return _.currentNode=b,o}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},O=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,o){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=y(this,t,e),P(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==A&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):wt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(b.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,o=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=U.createElement(gt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(e);else{let n=new B(o,this),r=n.u(this.options);n.p(e),this.T(r),this._$AH=n}}_$AC(t){let e=lt.get(t.strings);return e===void 0&&lt.set(t.strings,e=new U(t)),e}k(t){K(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,o=0;for(let n of t)o===e.length?e.push(s=new i(this.O(C()),this.O(C()),this,this.options)):s=e[o],s._$AI(n),o++;o<e.length&&(this._$AR(s&&s._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=it(t).nextSibling;it(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},S=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,o,n){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=h}_$AI(t,e=this,s,o){let n=this.strings,r=!1;if(n===void 0)t=y(this,t,e,0),r=!P(t)||t!==this._$AH&&t!==A,r&&(this._$AH=t);else{let l=t,a,p;for(t=n[0],a=0;a<n.length-1;a++)p=y(this,l[s+a],e,a),p===A&&(p=this._$AH[a]),r||=!P(p)||p!==this._$AH[a],p===h?t=h:t!==h&&(t+=(p??"")+n[a+1]),this._$AH[a]=p}r&&!o&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},I=class extends S{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},V=class extends S{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},W=class extends S{constructor(t,e,s,o,n){super(t,e,s,o,n),this.type=5}_$AI(t,e=this){if((t=y(this,t,e,0)??h)===A)return;let s=this._$AH,o=t===h&&s!==h||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==h&&(s===h||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},q=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){y(this,t)}};var Pt=F.litHtmlPolyfillSupport;Pt?.(U,O),(F.litHtmlVersions??=[]).push("3.3.3");var ft=(i,t,e)=>{let s=e?.renderBefore??t,o=s._$litPart$;if(o===void 0){let n=e?.renderBefore??null;s._$litPart$=o=new O(t.insertBefore(C(),n),n,void 0,e??{})}return o._$AI(i),o};var G=globalThis,$=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ft(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};$._$litElement$=!0,$.finalized=!0,G.litElementHydrateSupport?.({LitElement:$});var Ut=G.litElementPolyfillSupport;Ut?.({LitElement:$});(G.litElementVersions??=[]).push("4.2.2");var mt=["tokens","components","foundations","decisions","agents","guidelines"],Q=class extends ${static properties={items:{type:Array},current:{type:String},navLabel:{type:String,attribute:"nav-label"},_lang:{type:String,state:!0}};constructor(){super(),this.items=[],this.current="",this.navLabel="Navigation principale",this._lang="fr",this._observer=null}connectedCallback(){super.connectedCallback(),!this.current&&typeof window<"u"&&(this.current=window.location.pathname),typeof document<"u"&&(this._lang=document.documentElement.dataset.lang||"fr",this._observer=new MutationObserver(()=>{this._lang=document.documentElement.dataset.lang||"fr"}),this._observer.observe(document.documentElement,{attributes:!0,attributeFilter:["data-lang"]}))}disconnectedCallback(){super.disconnectedCallback(),this._observer&&(this._observer.disconnect(),this._observer=null)}_label(t){return this._lang==="en"?t.labelEn||t.label||"":t.labelFr||t.label||""}_isActive(t){let e=this.current,s=t.replace(/^(\.\.\/)+/,"/").split("/").filter(Boolean),o=s[s.length-1]||"",n=s.length>1?s[s.length-2]:"";return n&&mt.includes(n)?e.includes("/"+n+"/"):o==="index.html"&&!n?e==="/"||e.endsWith("/index.html")&&mt.every(r=>!e.includes("/"+r+"/")):o?e.endsWith("/"+o):!1}static styles=L`
    :host {
      display: contents;
    }

    nav {
      display: flex;
      align-items: stretch;
      align-self: stretch;
      gap: 0;
      margin-left: auto;
    }

    /* ── Tab links (liens inter-pages) ── */
    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--agtc-component-top-nav-tab-color);
      font-size: var(--agtc-component-top-nav-tab-font-size);
      font-weight: var(--agtc-component-top-nav-tab-font-weight);
      padding: 0 var(--agtc-component-top-nav-tab-padding-x);
      border-radius: 0;
      border-bottom: var(--agtc-component-top-nav-tab-indicator-width) solid transparent;
      white-space: nowrap;
      transition: background .12s, color .12s, border-color .12s;
      -webkit-font-smoothing: antialiased;
    }

    /* :visited neutralisé — ADR-047. Valeur littérale pour Safari (ADR-059). */
    a:visited { color: var(--agtc-component-top-nav-tab-color); }

    a:hover {
      background: var(--agtc-component-top-nav-tab-background-hover);
      color: var(--agtc-component-top-nav-tab-color-hover);
    }

    a:active {
      background: var(--agtc-component-top-nav-tab-background-hover);
      color: var(--agtc-component-top-nav-tab-color-hover);
    }

    a:focus-visible {
      outline: 2px solid var(--agtc-component-top-nav-tab-focus-ring);
      outline-offset: 2px;
    }

    /* Page active — indicateur border-bottom, pas de fond rempli */
    a[aria-current="page"] {
      background: transparent;
      color: var(--agtc-component-top-nav-tab-color-active);
      font-weight: var(--agtc-component-top-nav-tab-font-weight-active);
      border-bottom-color: var(--agtc-component-top-nav-tab-indicator-color);
    }

    /* ── CTA button — sort du pattern tab ── */
    a.cta {
      height: auto;
      align-self: center;
      padding: var(--agtc-component-top-nav-cta-padding-y) var(--agtc-component-top-nav-cta-padding-x);
      border-radius: var(--agtc-component-top-nav-cta-radius);
      border-bottom: none;
      background: var(--agtc-component-top-nav-cta-background);
      color: var(--agtc-component-top-nav-cta-color);
      font-weight: var(--agtc-component-top-nav-tab-font-weight);
      margin-left: var(--agtc-component-top-nav-cta-gap);
    }

    a.cta:visited { color: var(--agtc-component-top-nav-cta-color); }

    a.cta:hover,
    a.cta:active {
      background: var(--agtc-component-top-nav-cta-background-hover);
      color: var(--agtc-component-top-nav-cta-color);
    }

    /* Le CTA ne porte pas d'indicateur tab même s'il est "actif" */
    a.cta[aria-current="page"] {
      background: var(--agtc-component-top-nav-cta-background);
      border-bottom: none;
    }

    /* ── Mobile : drawer vertical ─────────────────────────── */
    @media (max-width: 768px) {
      nav {
        display: none;
        position: fixed;
        top: var(--agtc-header-height, 64px);
        left: 0;
        right: 0;
        flex-direction: column;
        background: var(--agtc-semantic-color-background-surface);
        border-bottom: 1px solid var(--agtc-semantic-color-border-default);
        padding: 8px 0;
        z-index: 99;
        box-shadow: var(--agtc-shadow-md);
        margin-left: 0;
        align-self: auto;
      }

      /* Ouverture via classe .open sur l'hôte */
      :host(.open) nav {
        display: flex;
      }

      a {
        padding: 12px 24px;
        border-bottom: none;
        border-radius: 0;
        font-size: var(--agtc-semantic-typography-label-size);
      }

      a[aria-current="page"] {
        border-bottom: none;
        border-left: 3px solid var(--agtc-component-top-nav-tab-indicator-color);
        padding-left: 21px;
        border-bottom-color: transparent;
      }

      a.cta {
        height: auto;
        align-self: unset;
        margin: 4px 16px;
        border-radius: var(--agtc-semantic-radius-control);
        border-bottom: none;
        padding: 10px 14px;
      }
    }
  `;render(){return Z`
      <nav part="nav" aria-label="${this.navLabel}">
        ${this.items.map(t=>{let e=this._isActive(t.href);return Z`<a
            href="${t.href}"
            class="${t.cta?"cta":""}"
            aria-current="${e?"page":h}"
          >${this._label(t)}</a>`})}
      </nav>
    `}};customElements.define("agtc-top-nav",Q);})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
