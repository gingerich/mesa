import koaCompose from 'koa-compose'
import purpose from 'purposejs'
import Component from './Component'
import Spec from './Spec'

/*
* Reconcile a spec to its functional representation
* Returns a middleware function composition representative of the given spec
*/
export function compose (root, context) {
  let handler

  return function (data, next) {

    function defer (data) {
      if (!next) return Promise.resolve(data)
      return next(data)
    }

    if (!handler) {

      function innerCompose (spec, context) {

        // if (Array.isArray(spec)) {
        //   return purpose(spec.map(s => innerCompose(s, context, parent)))
        // }

        if (typeof spec === 'function') {
          return function (data, next) {
            next.defer = defer
            return Promise.resolve(spec(data, next))
          }
        }

        // Use the spec to construct a component instance
        const component = Spec.make(spec, context)

        // Ensure a component instance was created
        if (!(component instanceof Component)) {
          throw new TypeError('Expected spec to generate Component type')
        }

        // context = component.getChildContext()

        // Performs composition on a subcomponent array
        function composeSubcomponents (subcomponents) {
          return purpose(subcomponents.map(s => innerCompose(s, context)))
        }

        // Compose this components subcomponents
        function stack () {
          return composeSubcomponents(component.config.subcomponents)
        }

        stack.compose = composeSubcomponents

        // // Build a function that performs composition on the subcomponents
        // function middleware (subcomponents) {
        //   // return innerCompose(subcomponents, component.getChildContext(), component)
        //   return purpose(subcomponents.map(s => innerCompose(s, component.getChildContext(), component)))
        // }

        // // Convenience method calls purpose on the result of subcomponent composition
        // middleware.compose = function () {
        //   return middleware(component.config.subcomponents)
        //   // return purpose(middleware(component.config.subcomponents))
        // }

        // Build a function that performs composition on the subcomponents
        // function subcomponents () {
        //   return component.config.subcomponents.map(s => innerCompose(s, component.getChildContext(), component))
        // }

        // Convenience method calls koa-compose on the result of subcomponent composition
        // subcomponents.compose = function () {
        //   return purpose(subcomponents())
        // }

        // Trigger component lifecycle hook
        // component.componentWillMount()



        /*
        * Let the component define its composition by calling its compose() method
        * The component can optionally call the subcomponents function to produce a function representing its subcomponents
        * Reduce the result to its functional composition by making a recursive call
        */
        const fn = innerCompose(component.compose(stack), context)

        // Trigger component lifecycle hook
        // component.componentDidMount(parent)

        // Ensure function contains reference to the spec that produced it
        return Object.assign(fn, spec)
      }

      handler = innerCompose(root, context)
    }

    return handler(data, defer)
  }
}

export default compose
