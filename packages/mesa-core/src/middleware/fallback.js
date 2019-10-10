export function fallback(fallbackResponse) {
  return (ctx, next) => {
    return next(ctx).catch(error => {
      console.error(error)

      // const fallbackResponse =
      //   typeof resolver === 'function' ? resolver(ctx) : resolver

      if (!fallbackResponse) {
        throw error
      }

      if (typeof fallbackResponse !== 'function') {
        return fallbackResponse
      }

      return fallbackResponse(ctx, error)
    })
  }
}
