import { Report } from './report';
import { UserWallet } from './userWallets';

export interface User {
    id: number | undefined;
    uid: string | undefined;
    role: number;
    name: string | undefined;
    last_name: string | undefined;
    email: string | undefined;
    password_hash: string | undefined;
    phone: string | undefined;
    address: string;
    city: string;
    country_id: number | undefined;
    latitude: number;
    longitude: number;
    biography: string;
    notif_dist: number;
    recieve_notif: boolean;
    recieve_comm: boolean;
    is_private: boolean;
    avatar: string;
    is_blocked: boolean;
    reports: Report[];
    wallet_address: string;
    tag_name: string;
    wallets: UserWallet[];
}
