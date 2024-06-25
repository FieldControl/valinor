# Este projeto Angular contém dentro um projeto Nest.js (ver a pasta projectfield). Mas será explicada a situação dos dois projetos.



## Projeto Angular

### Ao colocar o projeto angular no ambiente de desenvolvimento que desejar, será necessário fazer dois procedimentos:

### 1- Abrir um terminal no arquivo raiz do projeto e digitar o comando "ng serve". Ele irá rodar o projeto em localhost:4200/listColumns

![alt text](/images/7240C70C-5FAC-4D9B-9395-8DCCEBB823BC_4_5005_c.jpeg)

### 2- Abrir um segundo terminal e entrar na pasta de backend com "cd backend" no segundo terminal aberto. Em seguida, digite no mesmo terminal o comando "npm start". Isso irá rodar o backend da aplicação.

![alt text](/images/4885AE20-C250-466F-AD80-B550FDD8DF3D_4_5005_c.jpeg)


## Projeto Nest.js

### Infelizmente, não pude dominar o framework Nest.js a tempo para conseguir aplicar no projeto Angular. Então decidi fazer o trabalho como pude saber e fazer. Mas deixei o projeto Nest.js que comecei neste trabalho para que mostre que eu realmente me interessei em tentar algo novo e desafiador no projeto. 

# Em resumo, tanto a parte back-end como front-end serão parte do projeto Angular. Pelo fato do tempo curto para aprender um framework novo, não consegui ter o domínio ideal para aplicar no projeto Angular.

### Descrição do projeto

    Este é um projeto bem simples, é um Kanban devidamente funcional que adiciona colunas e cards nessas colunas. Ainda precisa de muitas melhorias, como um funcionamento melhor do botão de excluir coluna e adicionar um botão de editar o nome da coluna. Assim como botões de remover e editar dos cards também.


### Modo de Uso

    Ao executar as instruções na parte do projeto Angular (executar os comandos "ng serve" e "npm start"), você irá para a página que lista as colunas em um quadro negro que talvez possa estar vazio (http://localhost:4200/listColumns). 

  ![alt text](/images/F77EAA6F-CC63-4164-AFBF-FF4F50C65D37.jpeg)

    Para a adicionar uma coluna, aperte o botão azul que se encontra acima do quadro negro escrito "Adicionar coluna".
    
  ![alt text](/images/FDBCD232-E5C7-4493-BCB8-9ED85286288A_4_5005_c.jpeg)
    
    Isso o(a) encaminhará para uma página com um formulário que pedirá para digitar um nome para a coluna. 
    
    Ao digitar, no contêiner branco abaixo do espaço de escrita, irá aparecer o que a pessoa digitou no input instantaneamente, mostrando como ficará o nome da coluna com a fonte que irá aparecer na coluna. 
    
  ![alt text](/images/26070810-17D1-4069-BAF0-D3E037F7AC02.jpeg)
  
    
    Ao terminar de digitar, aperte o botão salvar ou cancelar. Se apertar salvar, você será encaminhado(a) para a página inicial, com a coluna criada no quadro negro inicial. Se apertar cancelar, será encaminhado(a) para a página inicial também, mas a coluna não será criada.

  ![alt text](/images/552B812F-1415-401A-A6DB-962A63529CA8_4_5005_c.jpeg)
  
    Coluna Salva!

  ![alt text](/images/4A705DA1-D827-4E91-ADDC-0384EEF93262.jpeg)
  

    Para adicionar um card na coluna, aperte o botão circular com um símbolo de "+" na base da coluna. 
    
  ![alt text](/images/2191A92D-971F-4CA5-A4E1-7875E4DBC9E1.jpeg)
  
    
    Isso encaminhará você para um formulário parecido com o de criar colunas. Mas ao fazer o mesmo procedimento de salvar coluna, você salvará o nome do card e será encaminhado(a) para a tela inicial, com um card na coluna que você apertou o botão.

  ![alt text](/images/655A041F-78F4-4807-9897-42480F23D2F9.jpeg)


    O botão escrito "Excluir coluna" funciona, mas não instantaneamente. Ao apertar esse botão, será necessário reiniciar a página para que a coluna suma (pressione F5).

  ![alt text](/images/EF861612-BA13-4C0A-862D-17CE4E925A64_4_5005_c.jpeg)
