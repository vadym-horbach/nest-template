import cluster from 'cluster'
import os from 'os'
import { Injectable } from '@nestjs/common'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppConfigService } from '../config/config.service'
import { AppLoggerService } from '../logger/logger.service'

const totalCPUs = os.cpus().length

@Injectable()
export class ClusterService {
  private static instance: ClusterService

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(ClusterService.name)
  }

  static getInstance() {
    if (!ClusterService.instance) {
      ClusterService.instance = new ClusterService(
        AppConfigService.getInstance(),
        AppLoggerService.getTransientInstance(),
      )
    }

    return ClusterService.instance
  }

  async register(bootstrap: () => Promise<NestFastifyApplication>): Promise<void> {
    this.logger.verbose(`Number of CPUs is ${totalCPUs}`)

    if (!this.configService.isClusterEnabled || totalCPUs <= 1) {
      this.logger.verbose(`Single server started on ${process.pid}`)
      await bootstrap()

      return
    }

    if (cluster.isPrimary) {
      this.logger.verbose(`Master server started on ${process.pid}`)

      for (let i = 0; i < totalCPUs; i += 1) {
        cluster.fork()
      }

      cluster.on('exit', (worker) => {
        this.logger.verbose(`Worker ${worker.process.pid} died. Restarting`)
        cluster.fork()
      })
    } else {
      this.logger.verbose(`Cluster server started on ${process.pid}`)
      await bootstrap()
    }
  }
}
