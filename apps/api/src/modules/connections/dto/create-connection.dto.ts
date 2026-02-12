import { PostgresConnectionConfig } from '@tabblelab/database-core'
import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsIn,
} from 'class-validator'

export class CreateConnectionDto implements PostgresConnectionConfig {
    @IsIn(['postgres'])
    type!: 'postgres'

    @IsString()
    host!: string

    @IsNumber()
    port!: number

    @IsString()
    database!: string

    @IsString()
    user!: string

    @IsString()
    password!: string

    @IsOptional()
    @IsBoolean()
    ssl?: boolean

    @IsOptional()
    @IsString()
    name?: string
}