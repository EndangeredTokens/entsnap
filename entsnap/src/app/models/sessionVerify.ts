import { User } from "./userShort";

export interface SessionVerifyReason {
    message: string,
    code: number
}

export interface SessionVerify {
    exp: number,
    user: User|null,
    authorized: boolean,
    reason: SessionVerifyReason
}