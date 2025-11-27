import { MongoClient } from 'mongodb';
import { IsNotEmpty, Length, NotEquals, validateOrReject } from "class-validator";
import type { Match, User } from '../common/models/model.ts';
import { plainToInstance } from 'class-transformer';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

const uri = "mongodb://localhost:27017";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
    throw new Error('Please add your Mongo URI to .env');
}

client = new MongoClient(uri, options);
clientPromise = client.connect();

export async function getDatabase() {
    const client = await clientPromise;
    return client.db('ludo');
}

export async function saveVideo(username: string, matchId: number, location: string) {
    const db = await getDatabase()

    const result = await db.collection<User>('users').updateOne({ username }, {
        $push: {
            videos: {
                matchId,
                location
            }
        }
    })

    return result
}

export async function getLatestMatchId() {
    const db = await getDatabase()
    const match = await db.collection<Match>('matches')
        .find({})
        .sort({ id: -1 })
        .limit(1)
        .toArray();
    
    if (match.length > 0) {
        return match[0]!.id
    }

    return 0
}

export async function getMatches() {
    const db = await getDatabase()
    const matches = await db.collection<Match>('matches').find({}).toArray()
    return matches
}

export async function getUsers() {
    const db = await getDatabase()
    const users = await db.collection<User>('users').find({}, { projection: { password: 0 } }).toArray()
    return users
}

export async function getUserByName(username: string) {
    const db = await getDatabase()
    const users = db.collection<User>('users')
    const user = await users.find({ username }, { projection: { password: 0 } }).limit(1).next()
    return user
}

export class LoginUser {
    @IsNotEmpty()
    @Length(3, 20)
    username: string;

    @IsNotEmpty()
    password: string;
}

export async function loginUser(plainCredentials: object) {
    const db = await getDatabase()
    const users = db.collection<User>('users')

    const credentials = plainToInstance(LoginUser, plainCredentials)
    await validateOrReject(credentials)

    const user = await users.find({ username: credentials.username }).limit(1).next()

    if (user === null) {
        throw [{
            message: "Invalid username or password"
        }]
    }

    const matches = await compare(credentials.password, user.password)

    if (!matches) {
        throw [{
            message: "Invalid username or password"
        }]
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        "INE5646",
        { expiresIn: '6h' }
    )

    return token
}

export class CreateUser {
    @IsNotEmpty()
    @Length(3, 20)
    @NotEquals("BOT")
    username: string;

    @IsNotEmpty()
    @Length(2, 2)
    country: string;

    @IsNotEmpty()
    @Length(2, 2)
    state: string;

    @IsNotEmpty()
    city: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    repeatedPassword: string;

    image: string;
}

export async function createUser(plainUser: User) {
    const db = await getDatabase()
    const users = db.collection<User>('users')

    const createUser = plainToInstance(CreateUser, plainUser)
    await validateOrReject(createUser)

    const passwordMatch = createUser.password === createUser.repeatedPassword
    if (!passwordMatch) {
        throw [
            {
                message: "Password does not match"
            }
        ]
    }

    const exists = await users.find({ username: createUser.username }).hasNext()
    if (exists) {
        throw [
            {
                message: "Username already exists"
            }
        ]
    }

    const hashedPassword = await hash(createUser.password, 10)

    const result = await users.insertOne({
        username: createUser.username,
        country: createUser.country,
        state: createUser.state,
        city: createUser.city,
        password: hashedPassword,
        image: undefined,
        videos: [],
        score: 0
    })

    return result
}
