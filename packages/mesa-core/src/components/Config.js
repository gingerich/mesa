import { Component } from '@mesa/component';
import { Stack } from './common';

export class Config extends Component {
  compose() {
    return Stack.spec()
      .use((ctx, next) => {
        ctx.configure(this.config);
        return next(ctx);
      })
      .use(this.config.subcomponents);
  }
}
