export interface Match {
    id: number,
    timestamp: number
}

export interface SavedVideo {
    matchId: number,
    location: string,
}

export interface User {
    username: string,
    country: string,
    state: string,
    city: string,
    password: string
    image: string | undefined,
    videos: SavedVideo[],
    score: number
}

export interface JwtPayload {
    id: string,
    username: string,
    iat: number,
    exp: number,
}