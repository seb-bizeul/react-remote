# React-Remote [WIP]
React component that renders RemoteData monad

## How to use
```javascript
// @flow
import React from 'react'
import { remoteData, type RemoteData } from '@sbizeul/fp-flow'
import ReactRemote from '@sbizeul/react-remote'
```

We define the two types needed by RemoteData type. We get a ServerError in case of failure or the server gives back a list of Foo.  
```javascript
type ServerError = {| status: number, message: string |}
type Foo = {| id: string, name: string |}
```

### The simplest example
Here, we gives a RemoteData instance to ReactRemote using the data prop. The other mandatories props are `loading`, `failure` and `children render props` which will be rendered in case of success.
```javascript
type Props = {
  foos: RemoteData<ServerError, Foo[]>
}

const FooList = (props: Props) => {
  return (
    <ReactRemote
      data={props.foos}
      loading={() => <div>Loading...</div>}
      failure={error => <div>oops...{error.message}</div>}
    >
      {
        foos => foos.map(foo => <div>{foo.name}</div>)
      }
    </ReactRemote>
  )
}
```
`notAsked` just returns `null` by default and can be overwritten. 
```javascript
<ReactRemote
  data={props.foos}
  notAsked={() => <div>🤔🤔🤔...</div>}
  loading={() => <div>Loading...</div>}
  failure={error => <div>oops...{error.message}</div>}
>
  {
    foos => foos.map(foo => <div>{foo.name}</div>)
  }
</ReactRemote>
```


### didMount prop
You can easily apply some optimisation by checking the resource status with the `didMount` prop.
```javascript
const FooList = (props: Props) => {

  const didMount = (foos) => remoteData.isNotAsked(foos) && fetchFoos()

  return (
    <ReactRemote
      data={props.foos}
      loading={() => <div>Loading...</div>}
      failure={error => <div>oops...{error.message}</div>}
      didMount={didMount}
    >
      {
        foos => foos.map(foo => <div>{foo.name}</div>)
      }
    </ReactRemote>
  )
}
```

### delay prop
Like in Suspense, we can differ Loading render phase with the `delay` prop
```javascript
<ReactRemote
  data={props.foos}
  loading={() => <div>Loading...</div>}
  failure={error => <div>oops...{error.message}</div>}
  delay={400}
>
  {
    foos => foos.map(foo => <div>{foo.name}</div>)
  }
</ReactRemote>
```

### All together
```javascript
const FooList = (props: Props) => {

  const didMount = (foos) => remoteData.isNotAsked(foos) && fetchFoos()

  return (
    <ReactRemote
      data={props.foos}
      notAsked={() => <div>🤔🤔🤔...</div>}
      loading={() => <div>Loading...</div>}
      failure={error => <div>oops...{error.message}</div>}
      didMount={didMount}
      delay={400}
    >
      {
        foos => foos.map(foo => <div>{foo.name}</div>)
      }
    </ReactRemote>
  )
}
```

## Props API
```javascript
type Props<E, A> = $ReadOnly<{|
  data: RemoteData<E, A>,
  children: A => React.Node,
  failure: E => React.Node,
  loading: void => React.Node,
  notAsked?: void => React.Node,
  didMount?: RemoteData<E, A> => mixed,
  delay?: number
|}>
```
### data: RemoteData<E, A>
Required parameter, an instance of RemoteData
### children: A => React.Node
Required parameter, a function that renders a React Node. Gives back `Success` case as the first and only argument.
### failure: E => React.Node
Required parameter, a function that renders a React Node. Gives back `Failure` case as the first and only argument.
### loading: void => React.Node
Required parameter, a function that renders a React Node
### notAsked?: void => React.Node
Optional parameter, a function that renders a React Node
### didMount?: RemoteData<E, A> => mixed
Optional parameter, triggers by `componentDidMount` lifecycle method. Gives back the remoteData as the first and only argument.
### delay?: number
Optional parameter, delays `Loading` render phase.
