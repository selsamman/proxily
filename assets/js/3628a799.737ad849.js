"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[144],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return h}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),l=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=l(e.components);return r.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),d=l(n),h=a,m=d["".concat(c,".").concat(h)]||d[h]||p[h]||o;return n?r.createElement(m,i(i({ref:t},u),{},{components:n})):r.createElement(m,i({ref:t},u))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var l=2;l<o;l++)i[l]=n[l];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},8521:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return s},contentTitle:function(){return c},metadata:function(){return l},toc:function(){return u},default:function(){return d}});var r=n(7462),a=n(3366),o=(n(7294),n(3905)),i=["components"],s={title:"Batching Reactions",sidebar_position:6},c=void 0,l={unversionedId:"Features/batching",id:"Features/batching",isDocsHomePage:!1,title:"Batching Reactions",description:"React contains a mechanism to avoid excessive renders in response to state changes.  Basically it schedules state updates which cause renders after user-initiated events complete.  If your onClick handler updates state many times in that code it will result in only one render.",source:"@site/docs/Features/batching.md",sourceDirName:"Features",slug:"/Features/batching",permalink:"/proxily/docs/Features/batching",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/Features/batching.md",version:"current",sidebarPosition:6,frontMatter:{title:"Batching Reactions",sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"Transactions",permalink:"/proxily/docs/Features/transactions"},next:{title:"Asynchronous",permalink:"/proxily/docs/Features/async"}},u=[],p={toc:u};function d(e){var t=e.components,n=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"React contains a mechanism to avoid excessive renders in response to state changes.  Basically it schedules state updates which cause renders after user-initiated events complete.  If your onClick handler updates state many times in that code it will result in only one render."),(0,o.kt)("p",null,"In asynchronous situations this is not the case (prior to React 18) since there is no event that React knows about that can be used determine create a boundary around a sequence of state updates.  React 18 will batch and schedule all state updates so for the case of rendering this will no longer be an issue."),(0,o.kt)("p",null,"With Proxily all state mutations are synchronous and never batched.  The way that redundant renders are eliminated is to defer the reaction to the state change (e.g. the render itself) and batch them.    Renders, however, are not the only possible reaction to state change.  Proxily also supports reactions to changes in state through the ",(0,o.kt)("strong",{parentName:"p"},"observe")," call.  This is used internally in the ",(0,o.kt)("strong",{parentName:"p"},"persist")," call to update local storage with state changes."),(0,o.kt)("p",null,"This are the rules for batching reactions to state changes:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"A reaction only occurs when the top level call to a method in an observable component completes such that a reaction will never occur while a series of potentially related state updates complete."),(0,o.kt)("li",{parentName:"ul"},"This batching of nested reactions only applies to synchronous methods.  Asynchronous methods return a promise in response to an await or return after scheduling a callback.  The promise fulfillment or callback is no longer nested within the outer asynchronous function.  Therefore multiple state updates occuring after an await, in the promise fulfillment or in a callback do not cause reactions to be batched. "),(0,o.kt)("li",{parentName:"ul"},"To ensure batching of reactions in asyncronous calls you simply need to wrap them in a method call or use ",(0,o.kt)("strong",{parentName:"li"},"groupUpdate"))))}d.isMDXComponent=!0}}]);