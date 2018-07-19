# Mesa
A sensible microservice framework

## A Quick Example
```js
class Greetings extends Mesa.Component {
  compose () {
    return ({ msg }) => `${this.config.greeting} ${msg.name}!`
  }
}

const greetingService = Mesa.createService()
  .action({ cmd: 'greet' }, Greetings.spec({ greeting: 'Hello' }))
  
greetingService.call({ cmd: 'greet', name: 'World' })
  .then(res => console.log(res))
  
// 'Hello World!'
```

## Transport Layer
```js
const transports = Transport.createLayer()
  .use('tcp', TCP.transport())

const transportPlugin = transports.makePlugin()

greetingService.plugin(transportPlugin())
  
transportPlugin.start(({ tcp }) => {
  tcp.listen(3000)
})
```
