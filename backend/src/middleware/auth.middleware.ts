import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface RequestWithUser extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Registrar todos os cabeçalhos para depuração
    console.log('Todos os cabeçalhos recebidos:', req.headers);
    console.log('Caminho da requisição:', req.path);
    console.log('Método da requisição:', req.method);
    
    if (!authHeader || authHeader === '') {
      console.log('Nenhum cabeçalho de autorização presente na requisição ou vazio');
      req.user = null; // Definir explicitamente como null
      return next();
    }

    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    } else {
      token = authHeader; // Tenta usar o header diretamente se não começar com 'Bearer '
    }
    
    if (!token || token === '') {
      console.log('Token vazio ou inválido');
      req.user = null; // Definir explicitamente como null
      return next();
    }

    try {
      // Tentar verificar o token
      console.log('Tentando verificar token com Firebase Auth...');
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      console.log(`Usuário autenticado com sucesso: ID=${decodedToken.uid}, Email=${decodedToken.email || 'Não disponível'}`);
      next();
    } catch (tokenError) {
      console.error('Erro ao verificar token:', tokenError);
      console.error('Token inválido ou expirado:', token.substring(0, 20) + '...');
      req.user = null; // Definir explicitamente como null
      next();
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    req.user = null; // Definir explicitamente como null
    next();
  }
}; 