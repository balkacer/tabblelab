import { PostgresConnectionConfig, SupportedDatabase, supportedDrivers } from '../../../common/types/connection.types'
import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsIn,
} from 'class-validator'

export class CreateConnectionDto implements PostgresConnectionConfig {
    @IsIn(supportedDrivers)
    driver!: SupportedDatabase

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
}

export class CreateConnectionFromProfileDto {
    @IsString()
    profileConnectionId!: string

    @IsOptional()
    @IsString()
    password?: string
}

export type CreateConnectionRequestDto = CreateConnectionDto | CreateConnectionFromProfileDto