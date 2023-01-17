import IORedis from 'ioredis'
import {
  catchError,
  defer,
  finalize,
  Observable,
  of,
  Subject,
  throwError,
  tap,
  share,
  timer,
  repeatWhen,
  delay,
  takeWhile,
  takeLast,
} from 'rxjs'
import { Injectable } from '@nestjs/common'
import { AppConfigService, AppLoggerService } from '../../core'

@Injectable()
export class PubSubManager {
  private readonly pubClient: IORedis

  private readonly subClient: IORedis

  private readonly subjectsMaps: Map<string, Subject<any>> = new Map()

  private readonly observablesMaps: Map<string, Observable<any>> = new Map()

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(PubSubManager.name)
    this.pubClient = new IORedis({
      host: this.config.cacheConfig.host,
      port: this.config.cacheConfig.port,
      password: this.config.cacheConfig.password,
      db: this.config.cacheConfig.db,
    })
    this.subClient = this.pubClient.duplicate()
    this.subClient.on('message', (channel, message) => {
      const subject$ = this.subjectsMaps.get(channel)

      if (subject$) {
        subject$.next(JSON.parse(message))
      } else {
        this.unsubscribe(channel, true)
      }
    })
  }

  publish(
    channel: string,
    message: string | any[] | Record<string, any>,
    retry: number = 5,
  ): Observable<number> {
    return defer(() => {
      let condition = false
      let count = 0

      return defer(async () => this.pubClient.publish(channel, JSON.stringify(message))).pipe(
        repeatWhen((notifications) =>
          notifications.pipe(
            delay(500),
            takeWhile(() => !condition),
          ),
        ),
        tap((numberOfChannels) => {
          count += 1
          condition = numberOfChannels > 0 || count === retry
        }),
        takeLast(1),
        catchError((err) => {
          this.logger.error(err)

          return of(0)
        }),
      )
    })
  }

  consume<T>(channel: string): Observable<T> {
    return defer(() => {
      if (!this.subjectsMaps.has(channel)) {
        const observable$ = new Subject<T>()
        void this.subClient.subscribe(channel, (err, numberOfChannels) => {
          if (err) {
            this.logger.error(err)
            observable$.error(err)
          } else {
            this.logger.log(
              `Subscribed to new channel: "${channel}", number of channels: ${numberOfChannels}`,
            )
          }
        })
        this.subjectsMaps.set(channel, observable$)
        this.observablesMaps.set(
          channel,
          observable$.asObservable().pipe(
            finalize(() => {
              this.unsubscribe(channel, true).subscribe()
            }),
            share({ resetOnRefCountZero: () => timer(1000) }),
          ),
        )
      }

      return <Observable<T>>this.observablesMaps.get(channel)
    })
  }

  // TODO fix return type
  unsubscribe(channel: string, ignoreErr: boolean = false): Observable<unknown> {
    return defer(async () => this.subClient.unsubscribe(channel)).pipe(
      catchError((err) => {
        this.logger.error(err)

        if (!ignoreErr) {
          return throwError(err)
        }

        return of(0)
      }),
      tap((numberOfChannels) => {
        this.logger.log(
          `Unsubscribed from channel: "${channel}", number of channels: ${numberOfChannels}`,
        )
      }),
      finalize(() => {
        this.subjectsMaps.delete(channel)
        this.observablesMaps.delete(channel)
      }),
    )
  }
}
