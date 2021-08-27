"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[935],{3905:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return m}});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},c=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=p(r),m=a,f=d["".concat(l,".").concat(m)]||d[m]||u[m]||i;return r?n.createElement(f,s(s({ref:t},c),{},{components:r})):n.createElement(f,s({ref:t},c))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,s=new Array(i);s[0]=d;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o.mdxType="string"==typeof e?e:a,s[1]=o;for(var p=2;p<i;p++)s[p]=r[p];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},2606:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return o},contentTitle:function(){return l},metadata:function(){return p},toc:function(){return c},default:function(){return d}});var n=r(7462),a=r(3366),i=(r(7294),r(3905)),s=["components"],o={sidebar_position:2,title:"Persist & Serialize API"},l=void 0,p={unversionedId:"API/serial_persist",id:"API/serial_persist",isDocsHomePage:!1,title:"Persist & Serialize API",description:"Persist ##",source:"@site/docs/API/serial_persist.md",sourceDirName:"API",slug:"/API/serial_persist",permalink:"/docs/API/serial_persist",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/API/serial_persist.md",version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,title:"Persist & Serialize API"},sidebar:"tutorialSidebar",previous:{title:"Observable API",permalink:"/docs/API/observable"},next:{title:"Sagas API",permalink:"/docs/API/async"}},c=[{value:"Persist",id:"persist",children:[]},{value:"Serialize",id:"serialize",children:[]},{value:"Deserialize",id:"deserialize",children:[]}],u={toc:c};function d(e){var t=e.components,r=(0,a.Z)(e,s);return(0,i.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"persist"},"Persist"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"persist")," will integrate state with localStorage, sessionStorage or any storage system that supports getItem and setItem"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"export interface PersistConfig {\n    key?: string,\n    storageEngine?: StorageEngine,\n    classes? : Array<any>;\n    classHandlers? : ClassHandlers;\n    migrate?: (persistIn : any, initialIn : any) => any;\n}\n\npersist<T>(initialState: T, config : PersistConfig) : T\n")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"persist")," will:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"restore any saved state from storage"),(0,i.kt)("li",{parentName:"ul"},"make the returned state observable"),(0,i.kt)("li",{parentName:"ul"},"save your state to storage each time it is mutated (at most once per tick)")),(0,i.kt)("p",null,"The first parameter to ",(0,i.kt)("strong",{parentName:"p"},"persist")," is the initial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration options described bellow:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Option"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"storageEngine"),(0,i.kt)("td",{parentName:"tr",align:null},"Any storage engine that supports getItem and setItem. Defaults to localStorage")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"classes"),(0,i.kt)("td",{parentName:"tr",align:null},"An array of classes used in your state.  This allows class-based state to be reconstituted properly")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"migrate"),(0,i.kt)("td",{parentName:"tr",align:null},"A function which is passed the persisted state and the initial state.  It should return the merged state.")))),(0,i.kt)("p",null,"The default migration logic will merge initial and persistent states giving preference to the persistent state.  It will merge multiple levels up to but not including properties of built-in objects or Arrays. "),(0,i.kt)("p",null,"Note that if you use classes you don't need to worry about adding new properties to state as the initial value of the new property will be present when the Class is reconstituted."),(0,i.kt)("h2",{id:"serialize"},"Serialize"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"serialize(rootObj : any) : string\n")),(0,i.kt)("p",null,"Serializes any observable object returning a string that can be deserialized.  While the string can be parsed with JSON.parse it will parse into an internal format that has types and id's and so really is only useful for processing by deserialize.  See the ",(0,i.kt)("a",{parentName:"p",href:"../Features/persistence#restrictions"},"restrictions")," on the data that can be processed in this fashion."),(0,i.kt)("h2",{id:"deserialize"},"Deserialize"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"type ClassHandlers = {[index: string] : (obj: any)=>any};\n\ndeserialize(json : string, classes? : Array<any>, classHandlers? : ClassHandlers)\n")),(0,i.kt)("p",null,"Restores an object from a string returned from ",(0,i.kt)("strong",{parentName:"p"},"serialize"),".  If classes were used in the deserialized data, the classes must be passed in so serialize can create the objects based on them.",(0,i.kt)("br",{parentName:"p"}),"\n","Tracks usage of any properties of objects made observable through ",(0,i.kt)("strong",{parentName:"p"},"makeObservable"),".  If any properties referenced during the course of the render are changed the component will be re-rendered.  It will also re-render the component if any child properties of a referenced property are modified.  This is to conform with the immutable conventions for re-rendering when state changes.  Properties that referenced directly in the render code or in any synchronous functions called by the render code are tracked."))}d.isMDXComponent=!0}}]);