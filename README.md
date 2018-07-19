# Mesa
A sensible microservice framework

## A Quick Example
```js
class Greetings extends Mesa.Component {
  compose () {
    return ({ msg }) => `${this.config.greeting} ${msg.name}!`
  }
}

Mesa.createService()
  .action({ cmd: 'greet' }, Greetings.spec({ greeting: 'Hello' }))
  .call({ cmd: 'greet', name: 'World' })
  .then(res => console.log(res))
  
// 'Hello World!'
```

## Transport Layer
```js
const transports = Transport.createLayer()
  .use('tcp', TCP.transport())

const transportPlugin = transports.makePlugin()

Mesa.createService()
  .plugin(transportPlugin())
  .action({ cmd: 'greet' }, Greetings.spec({ greeting: 'Hello' }))
  
transportPlugin.start(({ tcp }) => {
  tcp.listen(3000)
})
```
