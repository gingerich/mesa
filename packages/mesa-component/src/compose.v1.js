import koaCompose from 'koa-compose'
import Component from './Component'

/*
* Reduces a spec to its functional representation
* Returns a middleware function composition representative of the given spec
*/
export function compose(spec, context, parent) {
  // We already have a function so just return it
  if (typeof spec === 'function') {
    return spec
  }

  // Use the spec to instantiate the component it defines
  const component = spec.make(context)

  // Ensure a component instance was created
  if (!(component instanceof Component)) {
    throw new TypeError('Expected spec to generate Component type')
  }

  // context = component.getChildContext()

  // Build a function that performs composition on the subcomponents
  const middleware = function middleware() {
    return this.config.subcomponents.map(s =>
      compose(
        s,
        this.getChildContext(),
        this
      )
    )
  }.bind(component)

  // Convenience method calls koa-compose on the result of subcomponent composition
  middleware.compose = function() {
    return koaCompose(middleware())
  }

  // Trigger component lifecycle hook
  component.componentWillMount()

  /*
  * Let the component define its composition by calling its compose() method
  * The component can optionally call the middleware function to produce a function representing its subcomponents
  * Reduce the result to its functional composition by making a recursive call
  */
  const fn = compose(
    component.compose(middleware),
    context,
    component
  )

  // Trigger component lifecycle hook
  component.componentDidMount(parent)

  // Ensure function contains reference to the spec that produced it
  return Object.assign(fn, spec)
}

export default compose
