import express from 'express';
import { setupRoutes } from './routes';
import { requestLogger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(requestLogger);

// Setup routes
setupRoutes(app);

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});