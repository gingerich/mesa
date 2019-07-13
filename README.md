# Mesa

A sensible microservice framework

## A Quick Example

```js
class Greetings extends Mesa.Component {
  compose() {
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

Plug-and-play transport layer keeps your service transport independent.

```js
const layer = Transport.createLayer()
  .protocol('tcp', TCP.transport())
  .use(Serializers.JSON())

const transport = layer.transport(connect => {
  connect.ingress.at('tcp://localhost:3000')
})

Mesa.createService()
  .plugin(transport.plugin())
  .action('greet', Greetings.spec({ greeting: 'Hello' }))

transport.connect()
  .then(() => console.log('connected!'))
```
