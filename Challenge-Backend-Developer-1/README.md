Instruções de uso
===========================================

Instalação
----------

Para instalar deve ser executado o comando abaixo:
```
npm install -y
```

Para executar, deve se ter um servidor mongodb em execução. Também é necessário configurar as variáveis de ambiente nos arquivos dentro do diretório environment, cada arquivo representa um ambiente (desenvolvimento, teste e produção). Após estar com tudo configurado é necessário executar o comando abaixo para iniciar o servidor em modo produção:
```
npm start
```

Para executar em modo desenvolvimento, executar o comando abaixo:
```
npm run startdev
```

Para executar os testes automatizados de aceitação formal, executar o comando abaixo:
```
npm test
```

Caso deseje acessar a documentação da API, após o servidor estar iniciado, acessar a URL a seguir substituindo o servidor e porta de acordo com a configuração: http://SERVIDOR:PORTA/apidoc

Qualquer dúvida estou à disposição.
Rodolfo Menardi
rodolfomenardi@gmail.com