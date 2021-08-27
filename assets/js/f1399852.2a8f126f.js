"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[453],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return b}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},u=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),m=c(n),b=a,d=m["".concat(l,".").concat(b)]||m[b]||p[b]||o;return n?r.createElement(d,s(s({ref:t},u),{},{components:n})):r.createElement(d,s({ref:t},u))}));function b(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,s=new Array(o);s[0]=m;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:a,s[1]=i;for(var c=2;c<o;c++)s[c]=n[c];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},2809:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return i},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return u},default:function(){return m}});var r=n(7462),a=n(3366),o=(n(7294),n(3905)),s=["components"],i={title:"Observables",sidebar_position:1},l=void 0,c={unversionedId:"Features/observables",id:"Features/observables",isDocsHomePage:!1,title:"Observables",description:"Observing state changes and reacting to them is the core of how Proxily manages state.  The process involves two pieces:",source:"@site/docs/Features/observables.md",sourceDirName:"Features",slug:"/Features/observables",permalink:"/docs/Features/observables",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/Features/observables.md",version:"current",sidebarPosition:1,frontMatter:{title:"Observables",sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Why Proxily?",permalink:"/docs/Introduction/how"},next:{title:"Persist & Serialize",permalink:"/docs/Features/persistence"}},u=[{value:"Observable Objects",id:"observable-objects",children:[]},{value:"Setter Actions",id:"setter-actions",children:[]},{value:"Function Binding",id:"function-binding",children:[]},{value:"Memoization",id:"memoization",children:[]},{value:"Batching of Reactions",id:"batching-of-reactions",children:[]},{value:"Class Components",id:"class-components",children:[]}],p={toc:u};function m(e){var t=e.components,n=(0,a.Z)(e,s);return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Observing state changes and reacting to them is the core of how Proxily manages state.  The process involves two pieces:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"Observable")," objects, created by ",(0,o.kt)("a",{parentName:"li",href:"../API/observable#makeobservable"},(0,o.kt)("strong",{parentName:"a"},"makeObservable")),", are ES6 proxies that monitor both references to and mutations of state properties of the original object. The proxy effect cascades automatically as you reference properties that contain other objects, such that all objects you reference from an observable object also become observable."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"Observers")," are created for each component that uses ",(0,o.kt)("a",{parentName:"li",href:"../API/observable#useObservable"},(0,o.kt)("strong",{parentName:"a"},"useObservables")),".  The observer is notified about both references to and mutations of all observable properties.  When a property is mutated and that same property has been referenced a reaction occurs.  In the case of ",(0,o.kt)("strong",{parentName:"li"},"useObservables")," that reaction is to re-render the component.")),(0,o.kt)("p",null,"Obsevers may also be created outside of components using ",(0,o.kt)("a",{parentName:"p",href:"../API/observable#observe"},(0,o.kt)("strong",{parentName:"a"},"observe")),' so that other parts of your application can leverage this feature.  For example, you could implement an observer that keeps a "last modified" date current or that transmits partial form updates to  server.  Internally ',(0,o.kt)("a",{parentName:"p",href:"persistence"},(0,o.kt)("strong",{parentName:"a"},"persist"))," uses observers to know when your state must be saved to local storage."),(0,o.kt)("h2",{id:"observable-objects"},"Observable Objects"),(0,o.kt)("p",null,"Observable objects may contain:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Strings, numbers"),(0,o.kt)("li",{parentName:"ul"},"References to other objects (POJOs or classes)"),(0,o.kt)("li",{parentName:"ul"},"Sets, Maps and Arrays"),(0,o.kt)("li",{parentName:"ul"},"Normal functions, generators and async functions"),(0,o.kt)("li",{parentName:"ul"},"Built in objects provided that you make them ",(0,o.kt)("a",{parentName:"li",href:"../API/utility#nonobservable"},(0,o.kt)("strong",{parentName:"a"},"nonObservable"))),(0,o.kt)("li",{parentName:"ul"},"Cyclic references")),(0,o.kt)("p",null,"In addition to providing the mutation detection observable objects also:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Handling the memoization of getters and other functions you declare as ",(0,o.kt)("a",{parentName:"li",href:"#memoization"},"memoized"),"."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"#function-binding"},"Binding member functions")," to the target so than be used without an object reference")),(0,o.kt)("h2",{id:"setter-actions"},"Setter Actions"),(0,o.kt)("p",null,"To get the value of a property in a component you need only reference it.  While you could mutate the property directly in the component this is considered an anti-pattern.  Instead, one should always use an action to mutate data.  ",(0,o.kt)("a",{parentName:"p",href:"../API/observable#useobservableprop"},(0,o.kt)("strong",{parentName:"a"},"useObservableProp"))," will automatically create such an action for any property reference. It returns a array with a getter as the first element and a setter as the second, much like Reacts useState.  "),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const counter = makeObservable({\n  value: 0\n});\n\nfunction App() {\n    \n  useObservables();\n  \n  const [value, setValue] = useObservableProp(counter.value)\n  \n  return (\n    <div>\n      <span>Count: {value}</span>\n      <button onClick={() => setValue(value + 1)}>Increment</button>\n    </div>\n  );\n\n}\n")),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"The argument must be an actually references the property rather than just the value.")),(0,o.kt)("h2",{id:"function-binding"},"Function Binding"),(0,o.kt)("p",null,'Proxily automatically binds functions to their target object to ensure that "this." will always point to the correct object.'),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"const {increment} = counter;\nincrement(); \n")),(0,o.kt)("p",null,"is equivalent to."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"counter.increment()\n")),(0,o.kt)("p",null,"This makes classes far more intuitive to consume since you don't have to know about the implementation of functions. "),(0,o.kt)("h2",{id:"memoization"},"Memoization"),(0,o.kt)("p",null,"Memoization reduces costly recalculations of computed values based on your state by saving the result and only re-running the calculation when dependent state is changed.  Both getters and functions with arguments are supported:  "),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"const state = {\n    counters: [counter1, counter2],\n    sortedCounters: function () {\n        return this.counters.slice(0).sort( (a,b) =>\n            a.value - b.value);\n    }\n};\nmemoize(state, 'sortedCounters'); \n")),(0,o.kt)("p",null,"You need only annotate an object function with ",(0,o.kt)("strong",{parentName:"p"},"memoize")," or annotate a class method:\nor to memoize a method within a class:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"class State {\n    constructor () {\n        this.counters = [new CounterClass(), new CounterClass()];\n    }\n    counters : Array<CounterClass> = [];\n    sortedCounters () {\n        return this.counters.slice(0).sort( (a,b) => \n            a.value - b.value);\n    }\n};\nmemoize(State, 'sortedCounters');\n")),(0,o.kt)("p",null,'With Typescript decorators ("experimentalDecorators": true in your tsconfig file) you can use ',(0,o.kt)("strong",{parentName:"p"},"memoize")," as a decorator:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"class State {\n    constructor () {\n        this.counters = [new CounterClass(), new CounterClass()];\n    }\n    counters : Array<CounterClass> = [];\n    \n    @memoize()\n    sortedCounters () {\n        return this.counters.slice(0).sort( (a,b) => \n            a.value - b.value);\n    }\n};\n")),(0,o.kt)("h2",{id:"batching-of-reactions"},"Batching of Reactions"),(0,o.kt)("p",null,"React avoids excessive renders in response to state changes by batching the changes together. If your onClick handler updates state many times it will result in only one render.  This applies to state only to state changes in event handlers.  In React 18 batching applies to all state changes."),(0,o.kt)("p",null,"With Proxily all state mutations are synchronous and never batched.  Instead, the re-renders, themselves are batched. The way that redundant renders are eliminated is to defer the reaction to the state change (e.g. the render itself) and batch them:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"A reaction only occurs when the top level call to a method in an observable component completes avoiding incomplete state updates."),(0,o.kt)("li",{parentName:"ul"},"Since asynchronous methods return a promise in response to the first await, all reactions to state changes cannot be batched. Either make state changes in asynchronous functions part a deeper method call or group them with ",(0,o.kt)("a",{parentName:"li",href:"../API/utility#groupupdates"},(0,o.kt)("strong",{parentName:"a"},"groupUpdate")))),(0,o.kt)("h2",{id:"class-components"},"Class Components"),(0,o.kt)("p",null,"If you have class based components you can wrap them in a high order component (HOC) that calls ",(0,o.kt)("strong",{parentName:"p"},"useObservables")," and passes through properties to the class.  Proxily provides a handy function ",(0,o.kt)("a",{parentName:"p",href:"../API/observable#bindobservables"},(0,o.kt)("strong",{parentName:"a"},"bindObservables"))," that does this for you:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript",metastring:"jsx",jsx:!0},"  class CounterState { // Your state\n        private _value = 0;\n        get value () {\n            return this._value\n        }\n        increment () {this._value++}\n  }\n    \n  const state = makeObservable({  // Your Observable state\n        counter: new CounterState()\n  });\n    \n  // Class Based Component\n  class CounterClass extends React.Component<{counter : CounterState}> {\n        render () {\n            const {value, increment} = this.props.counter;\n            return (\n                <div>\n                    <span>Count: {value}</span>\n                    <button onClick={increment}>Increment</button>2\n                </div>\n            );\n        }\n    }\n\n  // Wrap class-based component to make properties observable\n  const Counter = bindObservables(CounterClass);\n    \n  function App () {\n        return (\n            <Counter counter={state.counter}/>\n        );\n  }\n")))}m.isMDXComponent=!0}}]);