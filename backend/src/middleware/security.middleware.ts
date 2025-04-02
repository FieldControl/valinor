import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';

/**
 * Configura os middlewares de segurança para o servidor Express
 * @param app Instância do Express
 */
export const setupSecurityMiddleware = (app: Express) => {
  // Adicionar Helmet para proteção de cabeçalhos HTTP com configuração modificada para GraphQL Playground
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apollo-server-landing-page.cdn.apollographql.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://apollo-server-landing-page.cdn.apollographql.com"],
        imgSrc: ["'self'", "data:", "https://apollo-server-landing-page.cdn.apollographql.com"],
        connectSrc: ["'self'", "https://apollo-server-landing-page.cdn.apollographql.com"],
        fontSrc: ["'self'", "https://apollo-server-landing-page.cdn.apollographql.com"],
        objectSrc: ["'self'"],
        manifestSrc: ["'self'", "https://apollo-server-landing-page.cdn.apollographql.com"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // Configuração CORS mais restritiva
  app.use(cors({
    origin: true, // Permitir qualquer origem com credenciais
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
    credentials: true,
    maxAge: 86400, // 24 horas em segundos
  }));

  // Obter valores de variáveis de ambiente para rate limiting
  const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10);
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (
    process.env.NODE_ENV === 'production' ? '100' : '1000'
  ), 10);

  // Configurar rate limit para prevenir ataques de força bruta
  const apiLimiter = rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Converter minutos para milissegundos
    max: maxRequests, // Usar valor da variável de ambiente
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições deste IP, por favor tente novamente após alguns minutos'
  });
  app.use('/api/', apiLimiter);
  app.use('/graphql', apiLimiter);

  // Middleware para remover informações sensíveis de header
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  // Middleware para prevenir exposição de informações do servidor nos erros
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message
    });
  });
};

/**
 * Middleware para sanitizar entradas e prevenir ataques de injeção
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  // Implementar sanitização de entradas aqui
  // Exemplo simples - na prática, usar uma biblioteca como express-validator
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Sanitização básica - remover scripts e caracteres perigosos
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
    });
  }
  next();
}; 