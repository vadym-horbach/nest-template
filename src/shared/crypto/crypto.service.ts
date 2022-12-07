import { Injectable, InternalServerErrorException } from '@nestjs/common'
import crypto from 'crypto'
import _ from 'lodash'
import { T_Algorithm } from './types'

@Injectable()
export class CryptoService {
  private static readonly ALGORITHM: T_Algorithm = 'aes-128-cbc'

  private static readonly KEY = crypto.scryptSync('1q3we4a8sd798qwe5a1dwq654', 'salt', 16)

  static textEncrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(CryptoService.ALGORITHM, CryptoService.KEY, iv)
    const encrypted = cipher.update(text, 'utf8', 'base64url') + cipher.final('base64url')
    const ivString = Buffer.from(iv).toString('base64url')

    return `${encrypted}.${ivString}`
  }

  static textDecrypt(encryptedText: string): string | null {
    try {
      const [encrypted, iv] = encryptedText.split('.')
      if (!encrypted || !iv) return null
      const ivBuffer = Buffer.from(iv, 'base64url')
      const decipher = crypto.createDecipheriv(CryptoService.ALGORITHM, CryptoService.KEY, ivBuffer)

      return decipher.update(encrypted, 'base64url', 'utf8') + decipher.final('utf8')
    } catch {
      return null
    }
  }

  static objectEncrypt(object: Record<string, any>): string {
    return CryptoService.textEncrypt(JSON.stringify(object))
  }

  static objectDecrypt<T extends Record<string, any>>(encryptedObject: string): T | null {
    const text = CryptoService.textDecrypt(encryptedObject)

    return text ? JSON.parse(text) : text
  }

  static textHash(text: string): string {
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
  }

  private static sortObjectKeys(object: Record<string, any>): Record<string, any> {
    if (_.isObjectLike(object)) {
      if (_.isArray(object)) return object.map(this.sortObjectKeys)

      return Object.keys(object)
        .sort()
        .reduce((o, key) => ({ ...o, [key]: this.sortObjectKeys(object[key]) }), {})
    }

    return object
  }

  static hashObject(object: Record<string, any>): string {
    return CryptoService.textHash(JSON.stringify(CryptoService.sortObjectKeys(object)))
  }

  static randomString(length = 10) {
    const list = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'
    const a = list.charAt(Math.floor(Math.random() * list.length))
    const b = list.charAt(Math.floor(Math.random() * list.length))

    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length - 2)
      .concat(a + b)
  }

  static sha512(password: string, salt: string) {
    return {
      salt,
      hash: crypto.createHmac('sha512', salt).update(password).digest('hex'),
    }
  }

  static hashPassword(password: string) {
    const identifier = 6
    const passwordData = this.sha512(password, CryptoService.randomString())

    return `$${identifier}$${passwordData.salt}$${passwordData.hash}`
  }

  static comparePassword(encryptedPassword: string = '', password = '') {
    const [, salt, hash] = encryptedPassword.split('$').filter((v) => !!v)
    if (!salt || !hash) throw new InternalServerErrorException('Invalid encrypted password')

    return hash === this.sha512(password, salt).hash
  }

  static uuid() {
    return crypto.randomUUID()
  }

  static verifyMessage(
    algorithm: string,
    publicKey: string,
    message: string,
    signature: string,
  ): boolean {
    const verifier = crypto.createVerify(algorithm)
    verifier.write(message)
    verifier.end()

    return verifier.verify(publicKey, signature, 'base64')
  }
}
