# Proxily 
[![Build Status](https://app.travis-ci.com/selsamman/proxily.svg?branch=master)](https://app.travis-ci.com/selsamman/proxily)
[![codecov](https://codecov.io/gh/selsamman/proxily/branch/master/graph/badge.svg?token=XBX5M2EQDS)](https://codecov.io/gh/selsamman/proxily)
[![npm version](https://badge.fury.io/js/proxily.svg)](https://badge.fury.io/js/proxily)

Proxily is a library for managing state in a non-prescriptive way. It re-renders components as state changes. While Proxily does not use immutable state it provides many of the same benefits. There is no need to annotate or describe the state shape as Proxily will discover it as it navigates through the state hierarchy. Core features include:

* Serialization and deserialization including complex state (cyclic data and classes)
* Persist state to localStorage, sessionStorage or other storage systems
* Asynchronous semantics through redux-sagas
* Time travel (undo, redo) in applications and with redux-devtools
* Transactions that allow asynchronous changes to be committed or rolled back
* Rich support for Typescript, classes and objects including automatic function binding

## Install

> Note:  This project is as an alpha because it has specific features relating to React 18 which at this time is in alpha.
> 
```javascript
yarn add proxily
```
or
```
npm install proxily
```


## Import & Use

```typescript
import {observable, observer} from 'proxily';

const counter = observable({value: 0});

function App() {
    return (
        <div>
            <span>Count: {counter.value}</span>
            <button onClick={()=>counter.value++}>
                Increment
            </button>
        </div>
    );
}
export default observer(App); 
```

## Documentation

See [proxilyjs.com](https://proxilyjs.com) for the complete documentation

## Compatability
Because of it's use of ES6 Proxies, Proxily does not support Internet Explorer and requires 0.69 or higher of React-Native.  Proxily is written in Typescript and targets ES6. Therefore, it is advisable to target ES6 in your applications and enjoy the smaller code size.

## Dependencies
Aside from React and React-dom, Proxily has no dependencies.  If you make use of redux-sagas integration then you must add redux-saga to your project and additionally events in react-native.
 Proxily is written in Typescript and targets ES6. Therefore, it is advisable to target ES6 in your applications that use ES6 and enjoy the smaller code size.

