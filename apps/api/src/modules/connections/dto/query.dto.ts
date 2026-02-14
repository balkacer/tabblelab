import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator'

export class QueryDto {
    @IsString()
    sql!: string

    @IsOptional()
    @IsNumber()
    timeoutMs?: number

    @IsOptional()
    @IsNumber()
    rowLimit?: number

    @IsOptional()
    @IsBoolean()
    safeMode?: boolean
}