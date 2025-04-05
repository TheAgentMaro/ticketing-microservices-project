import { Express } from 'express';
import { proxyConfig } from './config/proxy';

export const setupRoutes = (app: Express) => {
    proxyConfig.forEach(({ path, middleware }) => {
        app.use(path, middleware);
    });

    // Fallback
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
};