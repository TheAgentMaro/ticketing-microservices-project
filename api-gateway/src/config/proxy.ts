import { createProxyMiddleware } from 'http-proxy-middleware';

const forwardAuthHeader = (proxyReq: any, req: any) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        proxyReq.setHeader('authorization', authHeader);
    }
};

export const proxyConfig = [
    {
        path: '/api/auth',
        middleware: createProxyMiddleware({
            target: 'http://auth-service:3002',
            changeOrigin: true,
            onProxyReq: forwardAuthHeader,
        }),
    },
    {
        path: '/api/events',
        middleware: createProxyMiddleware({
            target: 'http://event-service:3001',
            changeOrigin: true,
            onProxyReq: forwardAuthHeader,
        }),
    },
    {
        path: '/api/users',
        middleware: createProxyMiddleware({
            target: 'http://user-service:3003',
            changeOrigin: true,
            onProxyReq: forwardAuthHeader,
        }),
    },
    {
        path: '/api/tickets',
        middleware: createProxyMiddleware({
            target: 'http://ticket-service:3004',
            changeOrigin: true,
            onProxyReq: forwardAuthHeader,
        }),
    },
];
