import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import { EncryptedData } from './encryption.types'

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly key: Buffer

  constructor(private readonly configService: ConfigService) {
    const masterKey = this.configService.get<string>('TABBLELAB_MASTER_KEY')

    if (!masterKey) {
      throw new Error('TABBLELAB_MASTER_KEY is not defined')
    }

    this.key = Buffer.from(masterKey, 'base64')

    if (this.key.length !== 32) {
      throw new Error(
        'TABBLELAB_MASTER_KEY must be 32 bytes (base64 encoded)',
      )
    }
  }

  encrypt(plainText: string): EncryptedData {
    const iv = randomBytes(12)
    const cipher = createCipheriv(this.algorithm, this.key, iv)

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ])

    const authTag = cipher.getAuthTag()

    return {
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    }
  }

  decrypt(encryptedData: EncryptedData): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'base64'),
    )

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'))

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData.ciphertext, 'base64')),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  }
}