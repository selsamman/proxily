"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[454],{3905:function(e,t,a){a.d(t,{Zo:function(){return u},kt:function(){return k}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function s(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?s(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):s(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},s=Object.keys(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var o=n.createContext({}),c=function(e){var t=n.useContext(o),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},u=function(e){var t=c(e.components);return n.createElement(o.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,s=e.originalType,o=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),d=c(a),k=r,m=d["".concat(o,".").concat(k)]||d[k]||p[k]||s;return a?n.createElement(m,l(l({ref:t},u),{},{components:a})):n.createElement(m,l({ref:t},u))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var s=a.length,l=new Array(s);l[0]=d;var i={};for(var o in t)hasOwnProperty.call(t,o)&&(i[o]=t[o]);i.originalType=e,i.mdxType="string"==typeof e?e:r,l[1]=i;for(var c=2;c<s;c++)l[c]=a[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},1584:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return i},contentTitle:function(){return o},metadata:function(){return c},toc:function(){return u},default:function(){return d}});var n=a(7462),r=a(3366),s=(a(7294),a(3905)),l=["components"],i={title:"Sagas API",sidebar_position:3},o=void 0,c={unversionedId:"API/async",id:"API/async",isDocsHomePage:!1,title:"Sagas API",description:"scheduleTask",source:"@site/docs/API/async.md",sourceDirName:"API",slug:"/API/async",permalink:"/docs/API/async",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/API/async.md",version:"current",sidebarPosition:3,frontMatter:{title:"Sagas API",sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"Persist & Serialize API",permalink:"/docs/API/serial_persist"},next:{title:"Transaction API",permalink:"/docs/API/transactions"}},u=[{value:"scheduleTask",id:"scheduletask",children:[]},{value:"cancelTask",id:"canceltask",children:[]}],p={toc:u};function d(e){var t=e.components,a=(0,r.Z)(e,l);return(0,s.kt)("wrapper",(0,n.Z)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h2",{id:"scheduletask"},"scheduleTask"),(0,s.kt)("p",null,"Schedule a task using redux-sagas and it's channel interface"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-typescript"},"scheduleTask<T> (task : (parameter: T)=>void, parameter? : T, taker?: any, ...takerArgs : any) : void \n")),(0,s.kt)("table",null,(0,s.kt)("thead",{parentName:"table"},(0,s.kt)("tr",{parentName:"thead"},(0,s.kt)("th",{parentName:"tr",align:null},"Item"),(0,s.kt)("th",{parentName:"tr",align:null},"Description"))),(0,s.kt)("tbody",{parentName:"table"},(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:null},"task"),(0,s.kt)("td",{parentName:"tr",align:null},"a generator function")),(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:null},"parameter"),(0,s.kt)("td",{parentName:"tr",align:null},"An object with parameters your generator may consume")),(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:null},"taker"),(0,s.kt)("td",{parentName:"tr",align:null},"A scheduling generator usually from redux-sagas - see below")))),(0,s.kt)("p",null,'Thee standard takers can be imported from "@redux-saga/core/effects"'),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("strong",{parentName:"li"},"takeEvery")," - Allow concurrent execution of the task as it scheduled"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("strong",{parentName:"li"},"takeLeading")," - Ignore requests to schedule the task while first instance of the task is in process"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("strong",{parentName:"li"},"takeLatest")," - Cancel any running task instance of the task when a new instance is scheduled"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("strong",{parentName:"li"},"debounce")," - Wait x milliseconds before running ignoring any others scheduled in that interval\n",(0,s.kt)("strong",{parentName:"li"},"scheduleTask")," just uses redux-saga functions to schedule a task")),(0,s.kt)("p",null,"Scheduling tasks uses redux-sagas under the covers.  It consists of:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},"Calling runSaga on a dispatching saga, provided by Proxily for your task"),(0,s.kt)("li",{parentName:"ul"},"The dispatching saga then yields on the take helper passing it your generator task."),(0,s.kt)("li",{parentName:"ul"},"The dispatching sage then yields waiting to be cancelled."),(0,s.kt)("li",{parentName:"ul"},"There is one dispatching saga for each generator function and effect combination."),(0,s.kt)("li",{parentName:"ul"},"The dispatching saga will run until it is cancelled by calling ",(0,s.kt)("strong",{parentName:"li"},"cancelTask")),(0,s.kt)("li",{parentName:"ul"},"The dispatching saga takes from a channel rather than taking an action pattern."),(0,s.kt)("li",{parentName:"ul"},"The dispatching saga uses Channels and EventEmitters to feed the take helper")),(0,s.kt)("p",null,"You can also provide a custom taker for more complex interactions:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-typescript"},'const takeLeadingCustom = (patternOrChannel:any, saga:any, ...args:any) => \n    fork(function*() {\n        while (true) {\n            const action : any = yield take(patternOrChannel);\n            yield call(saga, ...args.concat(action));\n            console.log("dispatched");\n    }\n})\n...\nscheduleTask(this.task, {interval: 1000}, takeLeadingCustom);\n\n')),(0,s.kt)("h2",{id:"canceltask"},"cancelTask"),(0,s.kt)("p",null,"You can cancel a task if you don't want it to run for the duration of your application.  You must pass the same take helper since this is used to locate the task:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-typescript"}," cancelTask (task : any, taker?: any) : void\n")),(0,s.kt)("p",null,"The parameters must be the same first two parameters you passed to ",(0,s.kt)("strong",{parentName:"p"},"scheduleTask"),"."),(0,s.kt)("p",null,"###Important Notes on Usage:\nProxily does not have redux-saga as a dependency.  Therefore, you must:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("p",{parentName:"li"},"Add redux-saga to your project"),(0,s.kt)("p",{parentName:"li"},(0,s.kt)("inlineCode",{parentName:"p"}," yarn add redux-saga"))),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("p",{parentName:"li"},"Import scheduleTask and cancelTask from proxily/lib/cjs/sagas."),(0,s.kt)("p",{parentName:"li"},(0,s.kt)("inlineCode",{parentName:"p"},'import {scheduleTask, cancelTask} from proxily/lib/cjs/sagas";'))),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("p",{parentName:"li"},"With react-native you may also need to install events"),(0,s.kt)("p",{parentName:"li"},"  ",(0,s.kt)("inlineCode",{parentName:"p"},"yarn install events"),"\n``"))))}d.isMDXComponent=!0}}]);