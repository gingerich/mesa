# Mesa
A component-based microservice framework

## A Quick Example
```js
class GreetingComponent extends Mesa.Component {
  compose () {
    return msg => `${this.config.greeting} ${msg.name}!`
  }
}

Mesa.create()
  .accept({ cmd: 'greet' }, GreetingComponent.spec({ greeting: 'Hello' }))
  .call({ cmd: 'greet', name: 'World' })
  .then(res => console.log(res))
  
// 'Hello World!'
```
