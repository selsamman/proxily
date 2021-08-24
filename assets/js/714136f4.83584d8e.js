"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[692],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return d}});var a=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=a.createContext({}),c=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},u=function(e){var t=c(e.components);return a.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),m=c(n),d=o,h=m["".concat(l,".").concat(d)]||m[d]||p[d]||r;return n?a.createElement(h,s(s({ref:t},u),{},{components:n})):a.createElement(h,s({ref:t},u))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,s=new Array(r);s[0]=m;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:o,s[1]=i;for(var c=2;c<r;c++)s[c]=n[c];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},5927:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return i},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return u},default:function(){return m}});var a=n(7462),o=n(3366),r=(n(7294),n(3905)),s=["components"],i={sidebar_position:2,title:"Core Concepts",id:"core"},l=void 0,c={unversionedId:"Introduction/core",id:"Introduction/core",isDocsHomePage:!1,title:"Core Concepts",description:"Observables",source:"@site/docs/Introduction/core.md",sourceDirName:"Introduction",slug:"/Introduction/core",permalink:"/proxily/docs/Introduction/core",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/Introduction/core.md",version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2,title:"Core Concepts",id:"core"},sidebar:"tutorialSidebar",previous:{title:"Usage",permalink:"/proxily/docs/Introduction/intro"},next:{title:"Why Proxily?",permalink:"/proxily/docs/Introduction/how"}},u=[{value:"Observables",id:"observables",children:[]},{value:"Stores, Actions, Selectors",id:"stores-actions-selectors",children:[{value:"POJOs",id:"pojos",children:[]},{value:"Classes",id:"classes",children:[]},{value:"Your App, Your Choice",id:"your-app-your-choice",children:[]}]}],p={toc:u};function m(e){var t=e.components,n=(0,o.Z)(e,s);return(0,r.kt)("wrapper",(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"observables"},"Observables"),(0,r.kt)("p",null,'Proxily tracks references to state while your component renders.  It then ensures that your component is re-rendered anytime the referenced state properties change.  You make your state "observable" with ',(0,r.kt)("a",{parentName:"p",href:"../API/observable#makeobservable"},(0,r.kt)("strong",{parentName:"a"},"makeObservable"))," and then ask Proxily to track references with ",(0,r.kt)("a",{parentName:"p",href:"../API/observable#useObservable"},(0,r.kt)("strong",{parentName:"a"},"useObservables")),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-javascript"},"class CounterState {  // Your State\n    value = 0;  \n    increment () {this.value++}\n}\n\nconst state = makeObservable({  // Make it observable\n    counter: new CounterState()\n});\n\nfunction Counter({counter} : {counter : CounterState}) {\n    useObservables(); // Track references\n    const {value, increment} = counter;\n    return (\n        <div>\n            <span>Count: {value}</span>\n            <button onClick={increment}>Increment</button>\n        </div>\n    );\n}\n\nfunction App () {\n    return (\n        <Counter counter={state.counter}/>\n    );\n}\n")),(0,r.kt)("p",null,"These two calls, ",(0,r.kt)("strong",{parentName:"p"},"makeObservable")," and ",(0,r.kt)("strong",{parentName:"p"},"useObservables")," are really all you need for basic state management with React.  If you want to see a more complete exampled, head over to the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/selsamman/proxily_react_todo_classic"},"classic redux-style Todo app"),".  Otherwise, continue on."),(0,r.kt)("h2",{id:"stores-actions-selectors"},"Stores, Actions, Selectors"),(0,r.kt)("p",null,"Proxily uses standard Javascript language features to define the traditional elements of state management:  "),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("strong",{parentName:"p"},"Stores")," - A store in Proxily is simply an object that you have made observable and is usually the root object in your state.  It may contain cyclic references, and you may have multiple observable root objects.  You can create global stores or local stores that are only needed for a single component or small group of components. You can pass around the root of the store or any part of the store to your components as properties, contexts or simply import it.")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("strong",{parentName:"p"},"Actions")," - Actions are usually responses to users interacting with your component. Any function that is a member of an observable object can be an action.  Proxily tracks the nesting of calls such that the top level function you call is considered to be the action for purposes of tooling and batching of reactions. You may also spin off asynchronous actions that use promises or that schedule tasks using redux-sagas. ")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("strong",{parentName:"p"},"Selectors")," - A selector is simply a Javascript ",(0,r.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get"},"getter")," method on an observable object.  You may optionally ",(0,r.kt)("a",{parentName:"p",href:"../Features/observables#memoization"},"memoize")," the selector for better performance on expensive calculations (e.g. sorts and filters)."))),(0,r.kt)("p",null,"While the proxily doesn't have a fixed opinion on how you set these up, you should pick a pattern and stick to it so that you have a consistent approach to managing state throughout your application.  The two main options are using POJOs for state, with separate actions and selectors or classes which combine them all together."),(0,r.kt)("h3",{id:"pojos"},"POJOs"),(0,r.kt)("p",null,'With traditional state management systems such as Redux you create your state using "plane old javascript objects" (POJOs), define reducers to generate a new state, and actions which are dispatched to invoke the reducers.  In Proxily you don\'t need reducers as your actions simply modify state directly.  You can, however, keep your state as POJOs and define your actions and selectors separately thus keeping a more traditional taxonomy:'),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript",metastring:"jsx",jsx:!0},"    const store = persist({\n        counter: {\n            value: 0\n        }\n    }, {});\n    const actions = makeObservable({\n        increment () {\n            store.counter.value++\n        }\n    })\n    const selectors = makeObservable({\n        get value () {\n            return store.counter.value;\n        }\n    })\n    function App() {\n        useObservables();\n        const {value} = selectors;\n        const {increment} = actions;\n        return (\n            <div>\n                <span>Count: {value}</span>\n                <button onClick={increment}>Increment</button>\n            </div>\n        );\n    }\n")),(0,r.kt)("p",null,"Notice that we added ",(0,r.kt)("strong",{parentName:"p"},"persist")," here to save and restore the state to local storage.  In addition to saving and restoring your state to local or session storage, ",(0,r.kt)("strong",{parentName:"p"},"persist")," also makes the object observable."),(0,r.kt)("h3",{id:"classes"},"Classes"),(0,r.kt)("p",null,"Classes, as we saw at the start of the chapter, offer a more compact way of expressing the problem domain. They are not popular in React, simply because no framework, thus far, has made them easy to work with.  In Redux, they are a non-starter and in other frameworks such as mobx they are welcomed but still come with some limitations:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"You can't easily persist them since the framework does not know how to reconstitute them."),(0,r.kt)("li",{parentName:"ul"},'Referencing member functions always requires an object reference to make "this" function correctly.')),(0,r.kt)("p",null,"Proxily takes care of both issues.  Hopefully you spent some time wondering how the class-based example at the start could actually work?  "),(0,r.kt)("p",null,"After all we just destructured ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"increment"))," from ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("em",{parentName:"strong"},"counter"))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"const {value, increment} = counter;\n")),(0,r.kt)("p",null,"and then used it without an object in the  reference (e.g. counter.increment())"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript",metastring:"jsx",jsx:!0},"<button onClick={increment}>Increment</button>\n")),(0,r.kt)("p",null,"You would expect this to fail and might decide, as many have, that classes are just evil and should be avoided.  It won't fail, however.  That is because ",(0,r.kt)("strong",{parentName:"p"},"Proxily binds all members of an observable object to the target"),". This takes away one of the key pain-points of using classes."),(0,r.kt)("p",null,"The other issue, serializing and deserializing object graphs with classes, is also tackled by Proxily. Just provide a list of the classes you use:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"    const state = persist({\n        counter: new CounterState()\n    }, {classes: [CounterState]});\n")),(0,r.kt)("p",null,"When serializing, Proxily will record the name of the class from the constructor and use that name to find the class you provided to reconstitute the object when serializing."),(0,r.kt)("h3",{id:"your-app-your-choice"},"Your App, Your Choice"),(0,r.kt)("p",null,"The choice of using POJOs or classes for your state is yours to make and Proxily works equally well with both.  Given that Proxily makes classes more seamless you are free to reap the tangible benefits they provide:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"State and the code to modify that state are bound together, so it is clear which code is mutating your state.  This can be enforced using private properties.")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Classes are the most compact way to define types in Typescript because you are defining both the types and the initial state values together.  Classes are more of a standard feature than using Typescript interfaces which would otherwise be needed to accurately type your state.")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Because initial values are defined with the class you are assured that all new state objects have the correct initial state no matter how deeply they are nested.")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"There is one single interface for both consuming and modifying any object in your state so there is no need to import a separate interface with actions and selectors. ")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"You don't usually need to pass in instance identifiers as parameters to your actions, making for tidier JSX  ",(0,r.kt)("inlineCode",{parentName:"p"},"onClick={toggleTodo}")," vs ",(0,r.kt)("inlineCode",{parentName:"p"},"onClick={()=>toggleTodo(toDo)}"),". In deeply nested structures with multiple levels of arrays you may have to pass in multiple levels of identifiers. ")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Class names travels with the data making it possible to ",(0,r.kt)("a",{parentName:"p",href:"../Features/tools#logging"},"log")," both the class and method when state is mutated. Same for redux-devtools integration."))),(0,r.kt)("p",null,"Needless to say, used improperly, classes can be a burden.  Unless you are an experienced OO programmer you may want to leave inheritance out of the picture and just uses classes as convenient containers for organizing your state and the code that modifies your state."))}m.isMDXComponent=!0}}]);