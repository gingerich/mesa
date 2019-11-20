export function fallback(fallbackResolver) {
  return (ctx, next) => {
    const result = next(ctx);

    const fallbackResponse = fallbackResolver(ctx);

    if (!fallbackResponse) {
      return result;
    }

    return result.catch(error => {
      // console.error(error)
      if (typeof fallbackResponse !== 'function') {
        return fallbackResponse;
      }

      return fallbackResponse(error, ctx);
    });
  };
}
