import { Report } from './report';

export interface User {
    id: number | undefined,
    uid: string | undefined,
    role: number,
    name: string | undefined,
    email: string | undefined,
    password_hash: string | undefined,
    phone: string | undefined,
    address: string,
    city: string,
    latitude: number,
    longitude: number,
    biography: string,
    notif_dist: number,
    recieve_notif: boolean,
    recieve_comm: boolean,
    is_private: boolean,
    avatar: string,
    is_blocked: boolean
    wallet_address: string,
}