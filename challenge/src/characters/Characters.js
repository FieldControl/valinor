import React, { Component } from 'react'
import * as service from '../app/service'
import Paginator from '../utils/Paginator'
import ModalCharacter from '../characters/ModalCharacter'

class Characters extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoadingCharacters: false,
            characters: null,
            error: null,
            characterSelected: null
        }
    }

    getCharacters = ({search, offset = 1}) => {
        this.setState(prevState => ({
            ...prevState,
            isLoadingCharacters: true,
            characters: null
        }))

        let params = {}
        if (search) {
            params.nameStartsWith = search 
        }
        if (offset > 1) {
            params.offset = (offset-1)*this.state.limit
        }

        service
            .get('/characters', params)
            .then(response => {
                this.setState(prevState => ({
                    ...prevState,
                    characters: response.data.results,
                    offset: response.data.offset,
                    total: response.data.total,
                    count: response.data.count,
                    limit: response.data.limit,
                    isLoadingCharacters: false
                }))
            })
            .catch(error => {
                console.warn(error)
                this.setState(prevState => ({
                    ...prevState,
                    isLoadingCharacters: false,
                    error: "Error. You're embarrassing me in front of the wizards."
                }))
            })
    }

    searchCharacter = (params) => {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
        this.getCharacters(params)
    }

    timeout = null
    setSearch = (search) => {
        this.setState(prevState => ({
            ...prevState,
            search
        }))

        if (!search) {
            return
        }

        if (this.timeout) {
            clearTimeout(this.timeout)
        }

        this.timeout = setTimeout(() => {
            this.getCharacters({search})
        }, 500)
    }

    selectCharacter = (character) => {
        this.setState(prevState => ({
            ...prevState,
            characterSelected: character
        }))
    }

    render() {
        const { isLoadingCharacters, characterSelected, characters, error, total, offset, limit, search } = this.state

        const page = offset === 0 ? 1 : (offset/limit+1)

        return (
            <div className="Characters">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 col-lg-8 offset-lg-2">
                            <div className="my-4">
                                <div className="text-center">
                                    <h1 className="text-light m-0">Marvel's Characters, Super Heroes & Villians</h1>
                                    <p className="lead text-light mt-0 mb-3">Search and discover all about them</p>
                                </div>
                                <form noValidate onSubmit={(e) => { e.preventDefault(); this.searchCharacter({ search }) }}>
                                    <div className="input-group input-group-lg">
                                        <input autoFocus onChange={event => this.setSearch(event.target.value)} type="text" className="form-control border-right-0" placeholder="Iron man, Hulk..." />
                                        <div className="input-group-append">
                                            <button className="btn btn-outline bg-white"><img className="img-fluid" style={{ height: 20 }} src="https://image.flaticon.com/icons/svg/149/149852.svg" alt="Busca" /></button>
                                        </div>
                                    </div>
                                    <small className="form-text text-muted text-center">Do an empty search to list all characters</small>
                                </form>
                            </div>
                            <div className="lead text-light text-center">
                                {isLoadingCharacters && 'Loading characters...'}

                                {!isLoadingCharacters && error && (<span>{error}</span>)}

                                {!isLoadingCharacters && characters && characters.length === 0 && 'Nothing found'}
                            </div>
                        </div>
                    </div>

                    {!isLoadingCharacters && characters && characters.length > 0 && (
                        <div className="row">
                            <div className="col-12 py-3">
                                <p className="lead text-center text-light">viewing {limit} of {total} characters - (page {page})</p> 
                                <div className="card-columns">
                                    {characters.map((item, index) => (
                                        <div className="Character__item card border-0 mt-1 rounded-0 bg-dark text-white" key={index} onClick={() => this.selectCharacter(item)}>
                                            <img src={item.thumbnail.path + '.' + item.thumbnail.extension} class="rounded-0 card-img-top" alt={item.name} />
                                            <div class="card-body">
                                                <h5 class="card-title Character__name">{item.name}</h5>
                                            </div>
                                            <div className="card-footer">
                                                <ul className="list-unstyled d-flex flex-wrap">
                                                    <li className="w-50 text-center"><small className="d-block text-uppercase">comics</small> <strong className="d-block lead">{item.comics.available}</strong></li>
                                                    <li className="w-50 text-center"><small className="d-block text-uppercase">series</small> <strong className="d-block lead">{item.series.available}</strong></li>
                                                    <li className="w-50 text-center"><small className="d-block text-uppercase">stories</small> <strong className="d-block lead">{item.stories.available}</strong></li>
                                                    <li className="w-50 text-center"><small className="d-block text-uppercase">events</small> <strong className="d-block lead">{item.events.available}</strong></li>
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {total > limit && (
                                    <div className="mx-auto text-center">
                                        <Paginator
                                            numberOfPages={total/limit}
                                            initialPage={page}
                                            onPageChange={(offset) => this.searchCharacter({ offset })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <ModalCharacter character={characterSelected} onHide={() => this.selectCharacter(null)}/>
                </div>
            </div>
        )
    }
}

export default Characters