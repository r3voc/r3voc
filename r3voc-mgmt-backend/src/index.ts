import * as commander from 'commander';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import path from 'node:path';

import uploadRouter, { uploadDir } from '@/api/file-upload';
import filesRouter from '@/api/files';
import talksRouter from '@/api/talks';
import userRouter, { tokenCookie } from '@/api/user';
import {
    bootstrapDatabase,
    createUser,
    deleteUser,
    getUploadedFileByImportId,
    getUserByUsername,
    resetRenderingStates,
} from '@/db';
import { checkSetup, renderTalk } from '@/intro-outro-generator-api';
import { fetchSchedule, getSchedule } from '@/schedule-cache';

import '@/uploads';

dotenv.config({
    quiet: true,
});

if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined in environment variables');
}

if (!process.env.R3VOC_REPO_LOCATION) {
    throw new Error(
        'R3VOC_REPO_LOCATION is not defined in environment variables',
    );
}

const { SECRET_KEY } = process.env;

const isCli = process.argv.length > 2;

await bootstrapDatabase({ quiet: isCli });

const app = express();

app.use(morgan('dev'));

const apiRouter = express.Router();

apiRouter.use(cookieParser());

apiRouter.use(express.json());
apiRouter.use(express.urlencoded({ extended: true }));

apiRouter.use('/user', userRouter);

// make /uploads/<uuid>/final.mkv accessible
apiRouter.get('/uploaded-files/:uuid/final.mkv', (req, res) => {
    const { uuid } = req.params;
    const filePath = path.join(uploadDir, uuid, 'final.mkv');
    const absPath = path.resolve(filePath);

    // make sure the resolved path is within the uploads directory
    if (!absPath.startsWith(path.resolve(uploadDir))) {
        res.status(400).json({ error: 'Invalid file path' });
        return;
    }

    res.sendFile(absPath);
});

const authorizedRouter = express.Router();

authorizedRouter.use(async (req, res, next) => {
    const token = req.cookies[tokenCookie];

    if (!token) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { username: string };

    if (!decoded) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }

    const user = await getUserByUsername(decoded.username);

    if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
    }

    (req as any).user = { username: user.username };

    next();
});

authorizedRouter.get('/update_schedule', async (req, res) => {
    try {
        await fetchSchedule();

        res.json({ success: true });
    } catch {
        res.status(500).json({
            success: false,
            error: 'Failed to update schedule',
        });
    }
});

authorizedRouter.get('/schedule/refresh', async (req, res) => {
    try {
        await fetchSchedule();

        res.json({ success: true, data: getSchedule() });
    } catch {
        res.status(500).json({
            success: false,
            error: 'Failed to refresh schedule',
        });
    }
});

authorizedRouter.get('/schedule', (req, res) => {
    res.json({ success: true, data: getSchedule() });
});

authorizedRouter.use(uploadRouter);

authorizedRouter.use('/files', filesRouter);

authorizedRouter.use('/talks', talksRouter);

apiRouter.use(authorizedRouter);

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

if (process.env.NODE_ENV !== 'production') {
    app.use(cors());
}

app.use('/api', apiRouter);

// check if there are arguments -- if so, run in cli mode
if (isCli) {
    const program = new commander.Command();

    program
        .name('r3voc-cli')
        .version('1.0.0')
        .description('CLI for r3voc management');

    program
        .command('create-user <username> <password>')
        .description('Create a new user')
        .action((username, password) => {
            program.opts().createUser = true;
            program.args = [username, password];
        });

    program
        .command('delete-user <username>')
        .description('Delete a user')
        .action(username => {
            program.opts().deleteUser = true;
            program.args = [username];
        });

    program
        .command('render-talk <importId>')
        .description('Render a talk by import ID')
        .action(importId => {
            program.opts().renderTalk = true;
            program.args = [importId];
        });

    program.exitOverride();

    try {
        program.parse(process.argv);
    } catch {
        console.log();
        program.outputHelp();
        process.exit(1);
    }

    const options = program.opts();

    if (options.createUser) {
        const [username, password] = program.args;
        if (!username || !password) {
            console.error(
                'Username and password are required to create a user',
            );
            process.exit(1);
        }

        createUser({ username, password })
            .then(() => {
                console.log(`User ${username} created successfully`);
                process.exit(0);
            })
            .catch(error => {
                console.error('Error creating user:', error.message);
                process.exit(1);
            });
    } else if (options.deleteUser) {
        const [username] = program.args;
        if (!username) {
            console.error('Username is required to delete a user');
            process.exit(1);
        }

        getUserByUsername(username)
            .then(user => {
                if (!user) {
                    console.error(`User ${username} does not exist`);
                    process.exit(1);
                }

                deleteUser(username)
                    .then(() => {
                        console.log(`User ${username} deleted successfully`);
                        process.exit(0);
                    })
                    .catch(error => {
                        console.error('Error deleting user:', error.message);
                        process.exit(1);
                    });
            })
            .catch(error => {
                console.error('Error fetching user:', error.message);
                process.exit(1);
            });
    } else if (options.renderTalk) {
        const [importId] = program.args;

        if (!importId || Number.isNaN(Number(importId))) {
            console.error(
                'A valid importId is required to render a talk (must be a number)',
            );
            process.exit(1);
        }

        const importIdNum = Number(importId);

        const file = await getUploadedFileByImportId(importIdNum);

        if (!file) {
            console.error(
                `No uploaded file found for import ID ${importIdNum}`,
            );
            process.exit(1);
        }

        await renderTalk({ importId: importIdNum });

        console.log(`Render job for import ID ${importIdNum} completed.`);

        process.exit(0);
    } else {
        program.outputHelp();
        process.exit(1);
    }
} else {
    // Start the server
    checkSetup()
        .then(async () => {
            await resetRenderingStates();
            app.listen(PORT, HOST, async () => {
                console.log(`Server is running at http://${HOST}:${PORT}`);
                await fetchSchedule();
            });
        })
        .catch(error => {
            console.error('Error during setup check:', error);
            process.exit(1);
        });
}
