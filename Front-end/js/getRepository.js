
import { api } from '../services/api.js';
import { displayInput } from '../js/elements.js';

export default function getRepo(){
    const nameRepository = displayInput.value

    api.get(nameRepository).then(async response =>{
        const data = response.data.items
        JSON.stringify(data)

        const list = {
            create(item){
                const div = document.createElement('div')
                div.classList.add('repositories')
                div.innerHTML = 
                `
                <div id="repository">
                    <div class="content-repository">
                    <a href="${item.html_url}" target="blank">${item.full_name}</a>
                    <p>${item.description}</p>
                    <ul class="languages">
                        <li class="language">${item.language}</li>
                    </ul>

                    <span>&#9734; ${item.stargazers_count}</span>
                    <span>Watchers: ${item.watchers_count} </span>
                    <span>Create: ${item.created_at} </span>
                    <span>Update: ${item.updated_at} </span>

                    </div>
                </div>
            `
                console.log(item)

                html.get('#list').appendChild(div)
            },
            update(){
                html.get('#list').innerHTML = ""
                
                console.log(data)

                let page = state.page - 1
                let start = page * state.perPage
                let end = start + state.perPage
                
                const paginatedItems = data.slice(start, end)
                paginatedItems.forEach(list.create)
            }
        }

        let perPage = 10

        const state = {
            page: 1,
            perPage,
            totalPage: Math.ceil(data.length/ perPage),
            maxVisbileButtons: 3
        }

        const html = {
            get(element){
                return document.querySelector(element)
            }
        }

        const controls = {
            next() {
                state.page++
        
                const lastPage = state.page > state.totalPage
                if(lastPage){
                    state.page--
                }
            },

            prev(){
                state.page --
        
                if(state.page < 1){
                    state.page++
                }
            },

            goTo(page){
                if(page < 1){
                    page = 1
                }
        
                state.page = +page
        
                if(page > state.totalPage){
                    state.page = state.totalPage
                }
            },

            createListeners(){
                html.get('.first').addEventListener('click', () => {
                    controls.goTo(1)
                    update()
                })
        
                html.get('.last').addEventListener('click', () => {
                    controls.goTo(state.totalPage)
                    update()
                })
        
                html.get('.next').addEventListener('click', () => {
                    controls.next()
                    update()
                })
        
                html.get('.prev').addEventListener('click', () => {
                    controls.prev()
                    update()
                })
            }
        }

        const buttons = {
            element: html.get('#paginate .numbers'),
            create(number){
                const button = document.createElement('div')

                button.innerHTML = number;

                if(state.page == number){
                    button.classList.add('active')
                }

                button.addEventListener('click', (e) => {
                    const page = e.target.innerText
                    
                    controls.goTo(page)
                    update()
                })

                buttons.element.appendChild(button)
            },
            update(){
                buttons.element.innerHTML = ""
                const { maxLeft, maxRight } = buttons.calculateMaxVisible()

                for(let page = maxLeft; page <= maxRight; page++){
                    buttons.create(page)
                }
            },
            calculateMaxVisible(){
                const { maxVisbileButtons } = state
                let maxLeft = (state.page - Math.floor(maxVisbileButtons / 2))
                let maxRight = (state.page + Math.floor(maxVisbileButtons / 2))

                if(maxLeft < 1){
                    maxLeft = 1
                    maxRight = maxVisbileButtons
                }

                if(maxRight > state.totalPage){
                    maxLeft = state.totalPage - (maxVisbileButtons - 1)
                    maxRight = state.totalPage

                    if(maxLeft < 1) maxLeft = 1
                }

                return { maxLeft, maxRight }
            }
        }
        
        function update(){
            list.update()
            buttons.update()
        }
        
        function init (){
            update()
            controls.createListeners()
        }
        
        init()
    })

}