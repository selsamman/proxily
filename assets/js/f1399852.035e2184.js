"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[453],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return d}});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=a.createContext({}),c=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},u=function(e){var t=c(e.components);return a.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),m=c(n),d=r,b=m["".concat(l,".").concat(d)]||m[d]||p[d]||o;return n?a.createElement(b,s(s({ref:t},u),{},{components:n})):a.createElement(b,s({ref:t},u))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,s=new Array(o);s[0]=m;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:r,s[1]=i;for(var c=2;c<o;c++)s[c]=n[c];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},2809:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return i},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return u},default:function(){return m}});var a=n(7462),r=n(3366),o=(n(7294),n(3905)),s=["components"],i={title:"Observables",sidebar_position:1},l=void 0,c={unversionedId:"Features/observables",id:"Features/observables",isDocsHomePage:!1,title:"Observables",description:"Observing state changes and reacting to them is the core of how Proxily manages state.  The process involves two pieces:",source:"@site/docs/Features/observables.md",sourceDirName:"Features",slug:"/Features/observables",permalink:"/docs/Features/observables",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/Features/observables.md",version:"current",sidebarPosition:1,frontMatter:{title:"Observables",sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Why Proxily?",permalink:"/docs/Introduction/how"},next:{title:"Persist & Serialize",permalink:"/docs/Features/persistence"}},u=[{value:"Observable Objects",id:"observable-objects",children:[]},{value:"Setter Actions",id:"setter-actions",children:[]},{value:"Function Binding",id:"function-binding",children:[]},{value:"Memoization",id:"memoization",children:[{value:"Memoize object property functions",id:"memoize-object-property-functions",children:[]},{value:"Memoize class member functions",id:"memoize-class-member-functions",children:[]}]},{value:"Batching of Reactions",id:"batching-of-reactions",children:[]},{value:"Immutable as Needed",id:"immutable-as-needed",children:[]}],p={toc:u};function m(e){var t=e.components,n=(0,r.Z)(e,s);return(0,o.kt)("wrapper",(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Observing state changes and reacting to them is the core of how Proxily manages state.  The process involves two pieces:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("strong",{parentName:"p"},"Observable")," objects, wrapped by ",(0,o.kt)("a",{parentName:"p",href:"../API/observable#observable"},(0,o.kt)("strong",{parentName:"a"},"observable")),". That monitor both references to and mutations of state properties of the original object. The monitoring effect cascades automatically as you reference properties that contain other objects, such that all objects you reference from an observable object also become observable."),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},'const state = observable({value1: "foo", value2: "bar"});\n'))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("strong",{parentName:"p"},"Observers")," are notified about both references and mutations of observable objects and their properties.  This enables them to track the specific properties referenced and react a referenced property is mutated."),(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"Components become observers when wrapped in ",(0,o.kt)("strong",{parentName:"p"},"observer"),"."),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript",metastring:"jsx",jsx:!0},"function Value1 () {  // Render if value1 changes\n    return (<div>{state.value1}</div>);\n}\nexport default observer(Value1)\n"))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"Observers may be setup outside a component using ",(0,o.kt)("a",{parentName:"p",href:"../API/observable#observe"},(0,o.kt)("strong",{parentName:"a"},"observe")),". "),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-typescript",metastring:"jsx",jsx:!0},"observe(\n    state, // Object to be observe\n    () => console.log('Value1 changed'),  // Reaction \n    (state) => state.value1 // Only if value1 changes\n);\n")))))),(0,o.kt)("h2",{id:"observable-objects"},"Observable Objects"),(0,o.kt)("p",null,"Observable objects may contain:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Strings, numbers"),(0,o.kt)("li",{parentName:"ul"},"References to other objects (POJOs or classes)"),(0,o.kt)("li",{parentName:"ul"},"Sets, Maps and Arrays"),(0,o.kt)("li",{parentName:"ul"},"Normal functions, generators and async functions"),(0,o.kt)("li",{parentName:"ul"},"Built in objects provided that you make them ",(0,o.kt)("a",{parentName:"li",href:"../API/observable#nonobservable"},(0,o.kt)("strong",{parentName:"a"},"nonObservable"))),(0,o.kt)("li",{parentName:"ul"},"Cyclic references")),(0,o.kt)("p",null,"In addition to providing the mutation detection observable objects also:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Handling the memoization of getters and other functions you declare as ",(0,o.kt)("a",{parentName:"li",href:"#memoization"},"memoized"),"."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#function-binding"},"Binding member functions")," to the target so than be used without an object reference")),(0,o.kt)("h2",{id:"setter-actions"},"Setter Actions"),(0,o.kt)("p",null,"To get the value of a property in a component you need only reference it.  While you could mutate the property directly in the component this is considered an anti-pattern.  Instead, one should always use an action to mutate data.  ",(0,o.kt)("a",{parentName:"p",href:"../API/observable#useobservableprop"},(0,o.kt)("strong",{parentName:"a"},"useObservableProp"))," will automatically create such an action for any property reference. It returns an array with a getter as the first element and a setter as the second, much like Reacts useState.  "),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const counter = observable({\n  value: 0\n});\n\nfunction App() {\n\n  const [value, setValue] = useObservableProp(counter.value)\n  \n  return (\n    <div>\n      <span>\n          Count: {value}\n      </span>\n      <button onClick={() => setValue(value + 1)}>\n          Increment\n      </button>\n    </div>\n  );\n\n}\n\nexport default observable(App);\n")),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},(0,o.kt)("strong",{parentName:"p"},"useObservableProp")," must be passed an actually reference to the property rather than just the value.   ",(0,o.kt)("inlineCode",{parentName:"p"},"useObservableProp(counterValue)")," won't work.")),(0,o.kt)("h2",{id:"function-binding"},"Function Binding"),(0,o.kt)("p",null,'Proxily automatically binds functions to their target object to ensure that "this." will always point to the correct object.'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"const {increment} = counter;\nincrement(); \n")),(0,o.kt)("p",null,"can be used in addition to"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"counter.increment()\n")),(0,o.kt)("p",null,"This makes classes far more intuitive to consume. "),(0,o.kt)("h2",{id:"memoization"},"Memoization"),(0,o.kt)("p",null,"Memoization reduces costly recalculations of computed values based on your state by saving the result and only re-running the calculation when dependent state is changed.  Both getters and functions with arguments are supported"),(0,o.kt)("h3",{id:"memoize-object-property-functions"},"Memoize object property functions"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"const state = {\n    counters: [counter1, counter2],\n    sortedCounters: function () {\n        return this.counters.slice(0).sort( (a,b) =>\n            a.value - b.value);\n    }\n};\n")),(0,o.kt)("p",null,"You can memoize by property name"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"memoize(state, 'sortedCounters'); \n")),(0,o.kt)("p",null,"or using a callback so that you can refactor the property name"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"memoize(state, s => s.sortedCounters); \n")),(0,o.kt)("h3",{id:"memoize-class-member-functions"},"Memoize class member functions"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"class State {\n    constructor () {\n        this.counters = [new CounterClass(), new CounterClass()];\n    }\n    counters : Array<CounterClass> = [];\n    sortedCounters () {\n        return this.counters.slice(0).sort( (a,b) => \n            a.value - b.value);\n    }\n};\n")),(0,o.kt)("p",null,"You can memoize by property name"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"memoize(State, 'sortedCounters');\n")),(0,o.kt)("p",null,"or using a callback so that you can refactor the property name"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"memoize(State, s => s.sortedCounters);\n")),(0,o.kt)("p",null,'or with Typescript decorators ("experimentalDecorators": true} in your tsconfig file you can use ',(0,o.kt)("strong",{parentName:"p"},"memoize")," as a decorator:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"class State {\n    constructor () {\n        this.counters = [new CounterClass(), new CounterClass()];\n    }\n    counters : Array<CounterClass> = [];\n    \n    @memoize()\n    sortedCounters () {\n        return this.counters.slice(0).sort( (a,b) => \n            a.value - b.value);\n    }\n};\n")),(0,o.kt)("h2",{id:"batching-of-reactions"},"Batching of Reactions"),(0,o.kt)("p",null,"React avoids excessive renders in response to state changes by batching the changes together. If your onClick handler updates state many times it will result in only one render.  This applies to state only to state changes in event handlers.  In React 18 batching applies to all state changes."),(0,o.kt)("p",null,"With Proxily all state mutations are synchronous and never batched.  Instead, the re-renders, themselves are batched. The way that redundant renders are eliminated is to defer the reaction to the state change (e.g. the render itself) and batch them:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"A reaction only occurs when the top level call to a method in an observable component completes avoiding incomplete state updates."),(0,o.kt)("li",{parentName:"ul"},"Since asynchronous methods return a promise in response to the first await, all reactions to state changes cannot be batched. Either make state changes in asynchronous functions part a deeper method call or group them with ",(0,o.kt)("a",{parentName:"li",href:"../API/observable#groupupdates"},(0,o.kt)("strong",{parentName:"a"},"groupUpdate")))),(0,o.kt)("h2",{id:"immutable-as-needed"},"Immutable as Needed"),(0,o.kt)("p",null,"There are times when you may need the equivalent of immutable data.  This is when the recipient of an object expects that the reference to the object will change when any of the properties of the object change.  Examples include:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"useEffect dependencies"),(0,o.kt)("li",{parentName:"ul"},"useCallback dependencies"),(0,o.kt)("li",{parentName:"ul"},"useMemo dependencies"),(0,o.kt)("li",{parentName:"ul"},"3rd Components that react to property changes"),(0,o.kt)("li",{parentName:"ul"},"Class-based components")),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("em",{parentName:"strong"},"useAsImmutable"))," will provide a reference to an object that will change when the object's properties change.  This is the same behaviour as with immutable state and what React expects in order to detect changes.  "),(0,o.kt)("p",null,"Consider passing an array as a dependency to ",(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("em",{parentName:"strong"},"useEffect")),".  Wrap the array reference in ",(0,o.kt)("strong",{parentName:"p"},(0,o.kt)("em",{parentName:"strong"},"useAsImmutable"))," will cause effect run everytime one of the array elements change:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},'const news = observable({  \n    topics: ["politics", "tech", "cooking"],\n    results: {}\n});\n\nfunction MyComponent {\n\n    // topics will change when it\'s elements change\n    const topics = useAsImmutable(news.topics);  \n    \n    useEffect( () => {\n        axios.get(\'/getStories?topics=\' + topics.join(\',\'))\n             .then((r) => news.results = r.toJSON());\n    }, [topics]);  \n    // Render news.results\n}\nexport default observable(MyComponent);\n')))}m.isMDXComponent=!0}}]);