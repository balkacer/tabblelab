import { IsString, IsOptional, IsNumber } from 'class-validator'

export class QueryDto {
    @IsString()
    sql!: string

    @IsOptional()
    @IsNumber()
    timeoutMs?: number

    @IsOptional()
    @IsNumber()
    rowLimit?: number
}