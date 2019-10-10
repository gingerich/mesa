export function fallback(fallbackResponse) {
  return (ctx, next) => {
    const result = next(ctx)

    if (!fallbackResponse) {
      return result
    }

    return result.catch(error => {
      if (typeof fallbackResponse !== 'function') {
        return fallbackResponse
      }

      return fallbackResponse(ctx, error)
    })
  }
}
