import { Global, Module } from '@nestjs/common'
import { FileStorageService } from './file-storage.service'

@Global()
@Module({
  imports: [],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
