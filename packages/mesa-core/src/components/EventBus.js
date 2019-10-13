import EventEmitter from 'eventemitter3'
import { Component } from '@mesa/component'

export class EventBus extends Component {
  constructor(config) {
    super(config)
    this.bus = new EventEmitter()
  }

  compose() {
    return (ctx, next) => {
      return next(ctx)
    }
  }
}
