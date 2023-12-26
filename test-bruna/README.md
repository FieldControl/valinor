# Teste Field - Angular App
Este é um projeto Angular desenvolvido como parte do teste da Field. Ele utiliza a API do GitHub para buscar e exibir informações de repositórios.

## Como Rodar o Projeto
Siga as instruções abaixo para rodar o projeto em sua máquina:

### Pré-requisitos
- Certifique-se de ter o Node.js instalado em sua máquina. Você pode baixá-lo [aqui](https://nodejs.org/en).
- Angular CLI é necessário para executar o projeto. Caso não tenha instalado, utilize o seguinte comando para instalar globalmente:
```bash
npm install -g @angular/cli
```
### Clonar o Repositório
Clone este repositório em sua máquina local. Abra o terminal e execute o seguinte comando:

```bash
git clone https://github.com/brunaporato/valinor.git
```
### Instalar Dependências
Navegue até o diretório do projeto e instale as dependências usando o seguinte comando:

```bash
cd test-bruna
npm install
```
### Rodar o Servidor de Desenvolvimento
Execute o seguinte comando para iniciar o servidor de desenvolvimento:

```
ng serve
```
Aguarde até que o processo seja concluído.<br />
Após a conclusão, abra seu navegador e acesse http://localhost:4200/. <br />
Você verá a aplicação Angular em execução.

### Como Usar
- Ao abrir na página inicial você verá repositórios que correspondem pelo termo pesquisado: 'field control'.
- Digite qualquer termo para pesquisar repositórios no github.
- Aperte 'Enter' para visualizar os repositórios relacionados ao termo inserido.
- Ao clicar nos cards de repositórios você acessará o repositório no github.

### Executar Testes
Para executar os testes unitários, utilize o seguinte comando:

```bash
ng test
```
### Build do Projeto
Se desejar realizar o build do projeto para produção, utilize o seguinte comando:

```bash
ng build --prod
```
Isso criará uma pasta dist/ com os artefatos de produção.

Espero que essas instruções ajudem a configurar e executar o projeto em sua máquina local. Se houver algum problema ou dúvida, sinta-se à vontade para entrar em contato. 😊