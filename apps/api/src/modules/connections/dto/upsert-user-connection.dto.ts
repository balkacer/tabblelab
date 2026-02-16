import { SupportedDatabase, supportedDrivers } from "@tabblelab/database-core"
import { IsOptional, IsString, IsIn, IsNumber, IsBoolean, IsEnum } from "class-validator"

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