import Mesa, { Match } from '@mesa/core'
import pathToRegexp from 'path-to-regexp'

const debug = require('debug')('mesa-http:path')

export class Path extends Mesa.Component {
  constructor (config, context) {
    super(config, context)
    this.params = []
    this.regex = pathToRegexp(config.path, this.params, config.options)
  }

  match (ctx) {
    const { consumeMatched = true } = this.config
    // const match = this.trie.match(ctx.path)
    const match = this.regex.exec(ctx.path)

    if (match) {
      // Optionally consume matched path so downstream components need not know path hierarchy
      if (consumeMatched) {
        ctx.path = ctx.path.replace(match[0], '') || '/'
      }

      debug(`match path ${match[0]} -> ${ctx.path}`)

      // ctx.params = match.param
      const args = match.slice(1).map(decode)

      ctx.params = {}
      args.forEach((arg, i) => {
        ctx.params[i] = arg
      })

      // This is probably incorrect: test with "zero-or-more" feature
      this.params.forEach((param, i) => {
        ctx.params[param.name] = args[i]
      })

      ctx.parsedPath = { match, params: this.params, args }

      return true
    }

    return false
  }

  compose () {
    return Match.accept(ctx => this.match(ctx))
      .use(this.config.subcomponents)
  }
}

function decode (val) {
  return val ? decodeURIComponent(val) : null
}

export default Path
