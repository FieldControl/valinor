# Bem-vindo ao GitInspector!

O gitInspector surgiu de uma ideia antiga + Teste de Programação
para empresa FieldControl:  https://github.com/FieldControl .

A ideia e Listar todos os repositório do git,( Nome do usuario, nome do repositório.

Mobile: Funcionalidades a mais : Widget dos commits do usuario


# Como funciona ?

**Components**
	Home 
	
		Vai englobar todos os outros components
   Header

		conter informacoes de header -> apenas visual
LiveSearch	
			
			barra de pesquisa que vai filtrar em tempo real
Card_Git
			
		Vai conter o componente User_Info e componente Git_Infos
		
User_Info
			
			img do usuario e nome do repositorio_Usuario e
			descricao

Git_Infos
				
				quantidade de estrelas, ultima atualizacao
	
	
	
**Web:** 
LiveSearch: Ao pesquisar no SearchBar, ele vai fazer um filtro de pesquisa aonde : 
```mermaid
	graph LR
	
G[Home] --> A
H[CardGit] --> I
H --> J
I[User_Info] 
J[Git_Infos]
A[LiveSerach] -- Get --> B((SearchAllRepository))

B --> D{GetRepositoryUser}
B --> E{GetRepositoryName}
B --> F{GetRepositoryLanguage}
D --> B
E --> B
F --> B
B -- Return Repositories--> H
H --return Lista de Card--> G

```
**Fora do escopo por Enquanto**:
**Mobile**
 Widget View :
```mermaid
	graph LR
W[Page Widget] --> A
A[Config app Widget] -- Get --> B((SearchAllContributors))
B -- Return Object--> W
```

**Links References:**
https://angular.io/guide/what-is-angular
https://angular.io/tutorial/first-app
<instalar bootstrap>
https://www.youtube.com/watch?v=Qv62pYv-FIM

<img src="1280x720-1.png">