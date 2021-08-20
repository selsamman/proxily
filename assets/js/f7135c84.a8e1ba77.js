"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[655],{3905:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return d}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var u=n.createContext({}),l=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=l(e.components);return n.createElement(u.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,u=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),f=l(r),d=o,m=f["".concat(u,".").concat(d)]||f[d]||p[d]||a;return r?n.createElement(m,i(i({ref:t},c),{},{components:r})):n.createElement(m,i({ref:t},c))}));function d(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=f;var s={};for(var u in t)hasOwnProperty.call(t,u)&&(s[u]=t[u]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var l=2;l<a;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},8624:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return s},contentTitle:function(){return u},metadata:function(){return l},toc:function(){return c},default:function(){return f}});var n=r(7462),o=r(3366),a=(r(7294),r(3905)),i=["components"],s={title:"Action Helpers",sidebar_position:2},u=void 0,l={unversionedId:"Features/default_actions",id:"Features/default_actions",isDocsHomePage:!1,title:"Action Helpers",description:"Default Setters",source:"@site/docs/Features/default_actions.md",sourceDirName:"Features",slug:"/Features/default_actions",permalink:"/proxily/docs/Features/default_actions",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/Features/default_actions.md",version:"current",sidebarPosition:2,frontMatter:{title:"Action Helpers",sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Memoization",permalink:"/proxily/docs/Features/memoization"},next:{title:"Serialization",permalink:"/proxily/docs/Features/serialization"}},c=[{value:"Default Setters",id:"default-setters",children:[]}],p={toc:c};function f(e){var t=e.components,r=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h2",{id:"default-setters"},"Default Setters"),(0,a.kt)("p",null,"Sometimes you have a large collection of properties in your state that you want to render in a component and modify in response to a user interaction.  Proxily contains a useful helper for this case.  ",(0,a.kt)("strong",{parentName:"p"},"useObservableProp")," will return a getter and a setter for a given property."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"const counter = makeObservable({\n  value: 0\n});\n\nfunction App() {\n  useObservables();\n  const [value, setValue] = useObservableProp(counter.value)\n  return (\n    <div>\n      <span>Count: {value}</span>\n      <button onClick={() => setValue(value + 1)}>Increment</button>\n    </div>\n  );\n\n}\n")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"useObservableProp")," will create return the value of the prop as well as function that can be used to set the prop.  The specific prop is the last prop referenced which by convention is the argument to ",(0,a.kt)("strong",{parentName:"p"},"useObservableProp"),".  Be sure to also include ",(0,a.kt)("strong",{parentName:"p"},"useObservables")," before calling ",(0,a.kt)("strong",{parentName:"p"},"useObservableProp"),"."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"setValue"))," will be considered an action for tooling such as redux-devtools."))}f.isMDXComponent=!0}}]);