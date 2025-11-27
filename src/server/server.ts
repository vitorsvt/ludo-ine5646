import getCountries, { getCitiesOfState, getStatesOfCountry } from '@countrystatecity/countries';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import type { JwtPayload } from '../common/models/model.ts';
import { createUser, getLatestMatchId, getUserByName, getUsers, loginUser } from './database.ts';
import { Manager } from './manager.ts';
import { PeerServer } from 'peer';
import cors from 'cors'

const app = express();

const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.APP_URL || `http://localhost:${PORT}`

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin === ORIGIN) {
            callback(null, true)
        } else {
            callback(new Error('CORS blocked...'))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, "INE5646") as JwtPayload;

        const user = await getUserByName(decoded.username)

        if (user != null) {
            req.user = decoded
        } else {
            res.status(401).json({ message: "Unauthorized" })
        }

    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    next();
}

app.get('/api/users', async (req: Request, res: Response) => {
    const users = await getUsers()
    res.json({ count: users.length, items: users });
});

app.get('/api/countries', async (req: Request, res: Response) => {
    const countries = await getCountries();
    res.json(countries);
})

app.get('/api/states', async (req: Request, res: Response) => {
    const { country } = req.query
    const states = await getStatesOfCountry(country as string);
    res.json(states);
})

app.get('/api/cities', async (req: Request, res: Response) => {
    const { country, state } = req.query
    const cities = await getCitiesOfState(country as string, state as string);
    res.json(cities);
})

app.post('/api/register', async (req: Request, res: Response) => {
    try {
        const createdUser = await createUser(req.body)
        res.status(201).json(createdUser)
    } catch (error) {
        res.status(400).json({ error })
    }
});

app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const token = await loginUser(req.body)
        res.status(201).json({ token })
    } catch (error) {
        res.status(400).json({ error })
    }
});

app.get('/api/user', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user !== undefined) {
        try {
            const user = await getUserByName(req.user.username)
            res.status(200).json(user)
        } catch (err) {
            res.status(401).json({ message: "User not found" })
        }
    } else {
        res.status(401).json({ message: "Unauthorized" })
    }
})

const publicPath = path.join(dirname, '../public');
app.use(express.static(publicPath));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const matchId = await getLatestMatchId()

new Manager({ nextId: matchId + 1, port: 3001 });

const peerServer = PeerServer({
    port: 9000,
    path: "/ludo",
    allow_discovery: true
});

peerServer.on('connection', (client) => {
    console.log(`[peer] client connected: ${client.getId()}`);
});