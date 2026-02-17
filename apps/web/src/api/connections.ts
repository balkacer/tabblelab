import { CreateConnectionDto } from '../types/connections.type'
import { api } from './client'

export async function openConnectionFromLocal(body: CreateConnectionDto) {
    const { data } = await api.post(`/connections`, body)
    return data as { connectionId: string }
}

export async function openConnectionFromProfile(profileConnectionId: string) {
    const { data } = await api.post(`/connections`, { profileConnectionId })
    return data as { connectionId: string }
}

export async function deleteConnection(connectionId: string) {
    await api.delete(`/connections/${connectionId}`)
}