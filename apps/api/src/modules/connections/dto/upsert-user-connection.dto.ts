import { SupportedDatabase, supportedDrivers } from '../../../common/types/connection.types'
import { IsOptional, IsString, IsIn, IsNumber, IsBoolean } from "class-validator"

export class UpsertUserConnectionDto {
    @IsOptional()
    @IsString()
    id?: string

    @IsIn(supportedDrivers)
    driver!: SupportedDatabase

    @IsString()
    name!: string

    @IsString()
    host!: string

    @IsNumber()
    port!: number

    @IsString()
    database!: string

    @IsString()
    user!: string

    @IsString()
    password?: string

    @IsOptional()
    @IsBoolean()
    ssl?: boolean
}