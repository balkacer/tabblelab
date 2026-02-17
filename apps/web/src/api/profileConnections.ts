import { CreateConnectionDto } from '../types/connections.type'
import { ProfileConnection } from '../types/profileConnections.type'
import { api } from './client'

export async function getProfileConnections() {
    const { data } = await api.get(`/profiles-connections`)
    return data as ProfileConnection[]
}

export async function createProfileConnection(body: CreateConnectionDto & { name: string }) {
    const { data } = await api.post(`/profile-connections`, body)
    return data as { id: string }
}

export async function deleteProfileConnection(profileId: string) {
    await api.delete(`/profile-connections/${profileId}`)
}