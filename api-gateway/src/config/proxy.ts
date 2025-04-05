import { createProxyMiddleware } from 'http-proxy-middleware';

export const proxyConfig = [
    {
        path: '/api/auth',
        target: 'http://auth-service:3002',
        middleware: createProxyMiddleware({
            target: 'http://auth-service:3002',
            changeOrigin: true,
            pathRewrite: { '^/api/auth': '' },
        }),
    },
    {
        path: '/api/events',
        target: 'http://event-service:3001',
        middleware: createProxyMiddleware({
            target: 'http://event-service:3001',
            changeOrigin: true,
            pathRewrite: { '^/api/events': '' },
        }),
    },
    {
        path: '/api/users',
        target: 'http://user-service:3003',
        middleware: createProxyMiddleware({
            target: 'http://user-service:3003',
            changeOrigin: true,
            pathRewrite: { '^/api/users': '' },
        }),
    },
    {
        path: '/api/tickets',
        target: 'http://ticket-service:3004',
        middleware: createProxyMiddleware({
            target: 'http://ticket-service:3004',
            changeOrigin: true,
            pathRewrite: { '^/api/tickets': '' },
        }),
    },
];