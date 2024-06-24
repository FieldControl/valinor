import { format } from 'url';
export function urlForHttpServer(httpServer) {
    const { address, port } = httpServer.address();
    const hostname = address === '' || address === '::' ? 'localhost' : address;
    return format({
        protocol: 'http',
        hostname,
        port,
        pathname: '/',
    });
}
//# sourceMappingURL=urlForHttpServer.js.map