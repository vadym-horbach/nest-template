import { retryWhen, tap, throwError, defer, iif, Observable, timer, concatMap } from 'rxjs'

export type T_RetryBackoffConfig = {
  /** ms */
  initialInterval: number
  maxRetries?: number
  /** ms */
  maxInterval?: number
  resetOnSuccess?: boolean
  shouldRetry?: (error: any, willRetry: boolean) => boolean
  lastError?: (error: any) => void
  backoffDelay?: (iteration: number, initialInterval: number) => number
}

const getDelay = (backoffDelay: number, maxInterval: number): number => {
  return Math.min(backoffDelay, maxInterval)
}

const exponentialBackoffDelay = (iteration: number, initialInterval: number): number => {
  return 2 ** iteration * initialInterval
}

export const retryBackoff = (
  config: number | T_RetryBackoffConfig,
): (<T>(source: Observable<T>) => Observable<T>) => {
  const {
    initialInterval,
    maxRetries = Infinity,
    maxInterval = Infinity,
    shouldRetry = (): boolean => true,
    lastError = (): void => undefined,
    resetOnSuccess = false,
    backoffDelay = exponentialBackoffDelay,
  } = typeof config === 'number' ? { initialInterval: config } : config

  return <T>(source: Observable<T>): Observable<T> =>
    defer(() => {
      let index = 0

      return source.pipe(
        retryWhen<T>((errors) =>
          errors.pipe(
            tap((error) => {
              if (index === maxRetries && shouldRetry(error, index < maxRetries)) {
                lastError(error)
              }
            }),
            concatMap((error) => {
              index += 1

              return iif(
                () => index < maxRetries && shouldRetry(error, index < maxRetries),
                timer(getDelay(backoffDelay(index, initialInterval), maxInterval)),
                throwError(error),
              )
            }),
          ),
        ),
        tap(() => {
          if (resetOnSuccess) {
            index = 0
          }
        }),
      )
    })
}
