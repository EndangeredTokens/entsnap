export interface Comment {
    id: number,
    UserId: number,
    ReportId: number,
    user_name: string,
    user_avatar: string,
    createdAt: Date,
    description: string
}