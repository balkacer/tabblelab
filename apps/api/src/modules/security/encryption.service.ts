import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly key: Buffer

  constructor(private readonly configService: ConfigService) {
    const masterKey = this.configService.get<string>('TABBLELAB_MASTER_KEY')

    if (!masterKey) {
      throw new InternalServerErrorException('TABBLELAB_MASTER_KEY is not defined')
    }

    this.key = Buffer.from(masterKey, 'base64')

    if (this.key.length !== 32) {
      throw new InternalServerErrorException(
        'TABBLELAB_MASTER_KEY must be 32 bytes (base64 encoded)',
      )
    }
  }

  encryptSecret(plain: string): string {
    const iv = randomBytes(12)
    const cipher = createCipheriv(this.algorithm, this.key, iv)

    const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
  }

  decryptSecret(payload: string): string {
    const [v, ivB64, tagB64, ctB64] = payload.split(':')
    if (v !== 'v1' || !ivB64 || !tagB64 || !ctB64) {
      throw new Error('Invalid encrypted payload format')
    }

    const iv = Buffer.from(ivB64, 'base64')
    const tag = Buffer.from(tagB64, 'base64')
    const ciphertext = Buffer.from(ctB64, 'base64')

    const decipher = createDecipheriv(this.algorithm, this.key, iv)
    decipher.setAuthTag(tag)

    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return plain.toString('utf8')
  }
}