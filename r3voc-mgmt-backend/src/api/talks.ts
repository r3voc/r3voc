import express from 'express';
import child_process from 'node:child_process';

const talksRouter = express.Router();

talksRouter.post('/render', async (req, res) => {
    const { importId } = req.body;

    if (!importId || typeof importId !== 'number') {
        res.status(400).json({
            success: false,
            error: 'Please provide a valid importId.',
        });
        return;
    }

    try {
        // run "yarn render-talk <importId>" in a separate process to not block the main thread
        child_process.spawn('yarn', ['render-talk', importId.toString()], {
            stdio: 'inherit',
            shell: true,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error rendering talk:', error);
        res.status(500).json({
            success: false,
            error: `Failed to render talk, ${(error as Error).message}`,
        });
    }
});

export default talksRouter;
