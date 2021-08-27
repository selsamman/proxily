"use strict";(self.webpackChunkproxily_doc=self.webpackChunkproxily_doc||[]).push([[699],{3905:function(t,e,a){a.d(e,{Zo:function(){return p},kt:function(){return m}});var n=a(7294);function r(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}function o(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,n)}return a}function l(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?o(Object(a),!0).forEach((function(e){r(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function i(t,e){if(null==t)return{};var a,n,r=function(t,e){if(null==t)return{};var a,n,r={},o=Object.keys(t);for(n=0;n<o.length;n++)a=o[n],e.indexOf(a)>=0||(r[a]=t[a]);return r}(t,e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(n=0;n<o.length;n++)a=o[n],e.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(t,a)&&(r[a]=t[a])}return r}var s=n.createContext({}),c=function(t){var e=n.useContext(s),a=e;return t&&(a="function"==typeof t?t(e):l(l({},e),t)),a},p=function(t){var e=c(t.components);return n.createElement(s.Provider,{value:e},t.children)},u={inlineCode:"code",wrapper:function(t){var e=t.children;return n.createElement(n.Fragment,{},e)}},d=n.forwardRef((function(t,e){var a=t.components,r=t.mdxType,o=t.originalType,s=t.parentName,p=i(t,["components","mdxType","originalType","parentName"]),d=c(a),m=r,k=d["".concat(s,".").concat(m)]||d[m]||u[m]||o;return a?n.createElement(k,l(l({ref:e},p),{},{components:a})):n.createElement(k,l({ref:e},p))}));function m(t,e){var a=arguments,r=e&&e.mdxType;if("string"==typeof t||r){var o=a.length,l=new Array(o);l[0]=d;var i={};for(var s in e)hasOwnProperty.call(e,s)&&(i[s]=e[s]);i.originalType=t,i.mdxType="string"==typeof t?t:r,l[1]=i;for(var c=2;c<o;c++)l[c]=a[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},3747:function(t,e,a){a.r(e),a.d(e,{frontMatter:function(){return i},contentTitle:function(){return s},metadata:function(){return c},toc:function(){return p},default:function(){return d}});var n=a(7462),r=a(3366),o=(a(7294),a(3905)),l=["components"],i={sidebar_position:4,title:"Transaction API"},s=void 0,c={unversionedId:"API/transactions",id:"API/transactions",isDocsHomePage:!1,title:"Transaction API",description:"A transaction is a context for state.  There is a default transaction that is automatically created.  Additional transactions may be created to create a copy of the state so that state may be mutated independently and then committed back to the default transaction. There are several ways to create a transaction:",source:"@site/docs/API/transactions.md",sourceDirName:"API",slug:"/API/transactions",permalink:"/docs/API/transactions",editUrl:"https://github.com/selsamman/proxily-doc/edit/master/website/docs/API/transactions.md",version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4,title:"Transaction API"},sidebar:"tutorialSidebar",previous:{title:"Sagas API",permalink:"/docs/API/async"},next:{title:"Tools API",permalink:"/docs/API/tools"}},p=[{value:"Transaction",id:"transaction",children:[]},{value:"useTransaction",id:"usetransaction",children:[]},{value:"useTransactable",id:"usetransactable",children:[]},{value:"makeObservable",id:"makeobservable",children:[]}],u={toc:p};function d(t){var e=t.components,a=(0,r.Z)(t,l);return(0,o.kt)("wrapper",(0,n.Z)({},u,a,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"A transaction is a context for state.  There is a default transaction that is automatically created.  Additional transactions may be created to create a copy of the state so that state may be mutated independently and then committed back to the default transaction. There are several ways to create a transaction:"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:null}),(0,o.kt)("th",{parentName:"tr",align:null},"Component"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"creation"),(0,o.kt)("td",{parentName:"tr",align:null},"TransactionProvider")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"usage"),(0,o.kt)("td",{parentName:"tr",align:null},"useTransactable")))),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"new Transaction"),"  in code outside a component"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"useTransaction")," with a component"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("strong",{parentName:"li"},"TransactionProvider")," create a transaction using jsx and place it in a context")),(0,o.kt)("h2",{id:"transaction"},"Transaction"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"new Transaction(options? : Partial<TransactionOptions>)\n\ninterface TransactionOptions {\n    timePositioning: boolean\n}\n")),(0,o.kt)("p",null,"The transaction object has these properties and methods:"),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:null},"Property / Method"),(0,o.kt)("th",{parentName:"tr",align:null},"Description"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"cleanup()"),(0,o.kt)("td",{parentName:"tr",align:null},"Cleanup any resources used by the transaction. Recommended when creating a transaction manually via ",(0,o.kt)("strong",{parentName:"td"},"new Transaction"))),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"updateSequence : number"),(0,o.kt)("td",{parentName:"tr",align:null},"a number assigned to each state update that can be saved and then useed in a ",(0,o.kt)("strong",{parentName:"td"},"rollTo")," called to time travel to that state")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"rollTo(sequence : number)"),(0,o.kt)("td",{parentName:"tr",align:null},"Time travel to a particular state")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"undo()"),(0,o.kt)("td",{parentName:"tr",align:null},"Go back to the last state prior to the last top level method call")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"redo()"),(0,o.kt)("td",{parentName:"tr",align:null},"After having gone backward, redo() can go forward to the state after the next top level method call")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"canUndo : boolean"),(0,o.kt)("td",{parentName:"tr",align:null},"True if there is a prior state than can be travelled to via undo()")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"canRedo : boolean"),(0,o.kt)("td",{parentName:"tr",align:null},"True if there is a next state that can be travelled to via redo()")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"commit()"),(0,o.kt)("td",{parentName:"tr",align:null},"Commit any changes in state related to the transaction back to main state associated with the default transaction")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"rollback()"),(0,o.kt)("td",{parentName:"tr",align:null},"Restore state associated with this transaction from the main state associated with the default transaction")))),(0,o.kt)("p",null,"Additionally, there is a static method for applying options (timeTravel) to your original state"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"Transaction.createDefaultTransaction(options? : Partial<TransactionOptions>)\n")),(0,o.kt)("p",null,"If called prior to making any observables can be used to set options for the default transaction(primarily timePositioning) which allows undo/redo to be used for main state."),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Commit and Rollback work at the object level.  This means that were you to make changes to the same object outside of the transaction and inside the transaction, the object in the transaction will take precidence when you commit.  This includes Arrays, Sets and Maps which are replaced as a whole.")),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"Commit only creates the copy of the state as you reference objects and so it is best to reference all the data you need immediately after creating the transaction.")),(0,o.kt)("h2",{id:"usetransaction"},"useTransaction"),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"useTransaction")," can be used in a functional component to create a transaction"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"useTransaction(options? : Partial<TransactionOptions>)\n")),(0,o.kt)("p",null,"It has the benefit that it will automatically cleanup the transaction when the component dismounts.  The transaction can then be used in calls to ",(0,o.kt)("strong",{parentName:"p"},"useTransactable")),(0,o.kt)("h2",{id:"usetransactable"},"useTransactable"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"useTransactable<A>(targetIn: A, transaction : Transaction) : A\n")),(0,o.kt)("p",null,"Creates a copy of a part of the state tree that can be mutated independently as part of a transaction."),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:null},"Item"),(0,o.kt)("th",{parentName:"tr",align:null},"Description"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"targetIn"),(0,o.kt)("td",{parentName:"tr",align:null},"An observable object")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:null},"transaction"),(0,o.kt)("td",{parentName:"tr",align:null},"A transaction created by ",(0,o.kt)("strong",{parentName:"td"},"new Transaction"),", ",(0,o.kt)("strong",{parentName:"td"},"useTransaction")," or ",(0,o.kt)("strong",{parentName:"td"},"TransactionProvider"))))),(0,o.kt)("h2",{id:"makeobservable"},"makeObservable"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"observable#makeobservable"},(0,o.kt)("strong",{parentName:"a"},"makeObservable"))," also accepts a transaction and is used as the equivalent of useTransactable outside of a functional component."))}d.isMDXComponent=!0}}]);