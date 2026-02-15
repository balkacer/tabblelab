import { api } from './client'

export async function deleteConnection(connectionId: string) {
    await api.delete(`/connections/${connectionId}`)
}