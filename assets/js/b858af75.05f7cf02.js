"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[730],{3905:function(e,t,r){r.d(t,{Zo:function(){return p},kt:function(){return m}});var n=r(7294);function s(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){s(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,s=function(e,t){if(null==e)return{};var r,n,s={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(s[r]=e[r]);return s}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(s[r]=e[r])}return s}var l=n.createContext({}),c=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,s=e.mdxType,a=e.originalType,l=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),d=c(r),m=s,y=d["".concat(l,".").concat(m)]||d[m]||u[m]||a;return r?n.createElement(y,o(o({ref:t},p),{},{components:r})):n.createElement(y,o({ref:t},p))}));function m(e,t){var r=arguments,s=t&&t.mdxType;if("string"==typeof e||s){var a=r.length,o=new Array(a);o[0]=d;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:s,o[1]=i;for(var c=2;c<a;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},3511:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return i},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return p},default:function(){return d}});var n=r(7462),s=r(3366),a=(r(7294),r(3905)),o=["components"],i={title:"Persist & Serialize",sidebar_position:2},l=void 0,c={unversionedId:"Features/persistence",id:"Features/persistence",isDocsHomePage:!1,title:"Persist & Serialize",description:"Persist",source:"@site/docs/Features/persistence.md",sourceDirName:"Features",slug:"/Features/persistence",permalink:"/docs/Features/persistence",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/Features/persistence.md",version:"current",sidebarPosition:2,frontMatter:{title:"Persist & Serialize",sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Observables",permalink:"/docs/Features/observables"},next:{title:"Async Functions",permalink:"/docs/Features/async"}},p=[{value:"Persist",id:"persist",children:[]},{value:"Serialization",id:"serialization",children:[]},{value:"Restrictions",id:"restrictions",children:[]}],u={toc:p};function d(e){var t=e.components,r=(0,s.Z)(e,o);return(0,a.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h3",{id:"persist"},"Persist"),(0,a.kt)("p",null,"Proxily will integrate with localStorage, sessionStorage or any storage library that getItem and setItem .  This includes localStorage, sessionStorage and React Native's AsyncStorage.  Use ",(0,a.kt)("strong",{parentName:"p"},"persist")," to integrate your state with storage: "),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import {migrate, persist} from 'proxily';\n\nconst persistedObservableState = persist(state, \n    {classes: [TodoList, TodoListItem]});\n")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"persist")," makes the returned state observable, so you don't need to call makeObservable.  When using classes you need to provide a list of them so that your state can be properly reconstituted. "),(0,a.kt)("p",null,"Persist has a number of ",(0,a.kt)("a",{parentName:"p",href:"../API/serial_persist#persist"},"options")," such as which storage engine to use and how you want to merge your state.  You can provide a function to merge in the saved state with your initial state providing for upgrades to the state shape."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"const persistedObservableState = persist(state,\n    {classes: [TodoList, TodoListItem], migrate: myMigrate});\n    \nfunction myMigrate (persist, initial) {\n    delete persist.description; // unused property\n    return migrate(persist, initial);\n}\n")),(0,a.kt)("p",null,"The benefit of using classes rather than POJOs for your state is that you don't need to provide migration logic simply because you add a new property to your state.  The initial value of that property will be set when the class is instantiated."),(0,a.kt)("p",null,"An easy way to get the list of classes is to re-export them in an index file in your store directory:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},'export {ToDoList} from "./ToDoList";\nexport {ToDoListItem} from "./ToDoListItem";\nexport {TodoListStyle} from "./TodoListStyle";\n')),(0,a.kt)("p",null,"And then get the values from that index file"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"const classes = Object.values(require('./store'));\n")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"There are ",(0,a.kt)("a",{parentName:"strong",href:"#restrictions"},"restrictions")," on what can be in your state in order to persist or serialize it")),(0,a.kt)("h3",{id:"serialization"},"Serialization"),(0,a.kt)("p",null,"Serialization lets you take snapshots of your state.  It is also used internally by ",(0,a.kt)("strong",{parentName:"p"},"persist")," when you want to save and restore your state to local or session storage.  Proxily supports the serialization of complex objects, including cyclic references and classes."),(0,a.kt)("p",null,"Proxily ",(0,a.kt)("strong",{parentName:"p"},"serialize")," converts the object graph to JSON, discovering any objects discovered in the process and noting their constructor in the JSON.  When you call ",(0,a.kt)("strong",{parentName:"p"},"deserialize"),", Proxily does the opposite and re-instantiates the object graph.  It can cover cases where the same object instance is referenced in multiple places and cyclic patterns. Here is an example structure that includes multiple references to the same object"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"class Box {\n    x = 0;\n    y = 0;\n    constructor(x : number, y : number) {\n        this.x = x;\n        this.y = y;\n    }\n}\n\nclass Arrow {\n    from;\n    to;\n    constructor(from : Box, to : Box) {\n        this.from = from;\n        this.to = to;\n    }\n}\n\nclass Drawing {\n    boxes : Array<Box> = [];\n    arrows : Array<Arrow> = [];\n}\n")),(0,a.kt)("p",null,"Assume it is initialized like this:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"    const drawing = new Drawing()\n    const box1 = new Box(20, 40)\n    const box2 = new Box(70, 70)\n    const arrow1 = new Arrow(box1, box2)\n    drawing.boxes.push(box1, box2)\n    drawing.arrows.push(arrow1);\n")),(0,a.kt)("p",null,"To serialize it:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"const json = serialize(drawing);\n")),(0,a.kt)("p",null,"And to deserialize it:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"const newDrawing = deserialize(json, [Box, Arrow, Drawing]);\n")),(0,a.kt)("p",null,"Note that to deserialize you need to provide an array of the Classes so that deserialize can re-instantiate objects from those classes."),(0,a.kt)("h3",{id:"restrictions"},"Restrictions"),(0,a.kt)("p",null,"There are some constraints on the structure:\nYou can serialize anything that JSON.stringify / JSON.parse support plus:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Dates"),(0,a.kt)("li",{parentName:"ul"},"Sets"),(0,a.kt)("li",{parentName:"ul"},"Maps"),(0,a.kt)("li",{parentName:"ul"},"Classes - deserialize will instantiate the class with an empty constructor and then copy over the properties.  Therefore, the class ",(0,a.kt)("strong",{parentName:"li"},"must be creatable with an empty constructor"),".")),(0,a.kt)("p",null,"If you want to manually control the creation of objects or have classes that require specific parameters in the constructor you can pass a hash of class names and an associated function to instantiate the object.  It  will be passed the serialized data from the object and is expected to return the instantiated object.  A hash of custom revivers is the third (optional) parameter."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"deserialize")," cannot reconstitute objects containing functions unless they are part of classes.  Also objects that contain internal objects (e.g. DOM element references, XMLHTTPRequest, Promises) of course will not be reconstituted properly."))}d.isMDXComponent=!0}}]);