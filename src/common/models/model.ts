export interface User {
    username: string,
    country: string,
    state: string,
    city: string,
    password: string
    image: string | undefined,
}

export interface JwtPayload {
    id: string,
    username: string,
    iat: number,
    exp: number,
}