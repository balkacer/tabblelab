import { api } from './client'

export async function fetchTables(connectionId: string) {
    const res = await api.get(`/connections/${connectionId}/tables`)
    return res.data as { schema: string; name: string }[]
}

export async function fetchColumns(connectionId: string, schema: string, table: string) {
    const res = await api.get(`/connections/${connectionId}/tables/${schema}/${table}/columns`)
    return res.data as { name: string; dataType: string; isNullable: boolean; isPrimaryKey: boolean; isForeignKey: boolean }[]
}