import { GraphQLScalarType, Kind } from 'graphql';

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar type',
  
  // Quando recebemos um valor do cliente
  parseValue(value: any) {
    if (typeof value === 'string') {
      try {
        return new Date(value); // Converte string para Date
      } catch (error) {
        throw new Error(`Invalid date format`);
      }
    }
    
    if (value && typeof value === 'object') {
      // Tentar converter objetos conhecidos
      try {
        // Firebase Timestamp
        if ('toDate' in value && typeof value.toDate === 'function') {
          return value.toDate();
        }
        // Objeto com seconds
        if ('seconds' in value && typeof value.seconds === 'number') {
          return new Date(value.seconds * 1000);
        }
      } catch (error) {
        throw new Error(`Cannot parse object date`);
      }
    }
    
    throw new Error(`Cannot parse date`);
  },
  
  // Quando o valor é enviado no AST GraphQL
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return new Date(ast.value); // Converte string para Date
      } catch (error) {
        throw new Error(`Invalid date format`);
      }
    }
    
    throw new Error(`Cannot parse date from this format`);
  },
  
  // Quando enviamos o valor para o cliente
  serialize(value: any) {
    // Caso 1: Objeto Date
    if (value instanceof Date) {
      return value.toISOString(); // Converte Date para string ISO
    }
    
    // Caso 2: String
    if (typeof value === 'string') {
      try {
        return new Date(value).toISOString(); // Se for string, tenta converter para Date e depois para ISO
      } catch (error) {
        throw new Error(`Invalid date value`);
      }
    }
    
    // Caso 3: Objeto (possivelmente Firebase Timestamp ou outro objeto com data)
    if (value && typeof value === 'object') {
      try {
        // Verifica se é um objeto de data do Firebase Firestore
        if ('toDate' in value && typeof value.toDate === 'function') {
          return value.toDate().toISOString();
        }
        
        // Verifica se é um timestamp com seconds (formato Firebase Realtime)
        if ('seconds' in value && typeof value.seconds === 'number') {
          return new Date(value.seconds * 1000).toISOString();
        }
        
        // Verifica se tem outras propriedades que podem indicar um objeto de data
        if ('getTime' in value && typeof value.getTime === 'function') {
          return new Date(value.getTime()).toISOString();
        }
        
        // Tenta converter outros tipos de objetos para data
        const dateString = value.toString();
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString();
        }
        
        throw new Error(`Cannot serialize date object`);
      } catch (error) {
        throw new Error(`Cannot serialize date object`);
      }
    }
    
    // Caso 4: Valor não reconhecido
    throw new Error(`Cannot serialize date`);
  }
}); 