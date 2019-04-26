import React from 'react'
import Modal from '../utils/Modal'

const ModalCharacter = ({character, onHide}) => {
    return(
        <Modal title={character && character.name} isShow={character} onHide={onHide}>
            {character && (
                <div>
                    <img src={character.thumbnail.path+'.'+character.thumbnail.extension} alt={character.name} className="img-fluid mb-3"/>
                    {character.description && (
                        <>
                            <h4>Description:</h4>
                            <p>{character.description}</p>
                        </>
                    )}
                    <ul className="list-unstyled d-flex flex-wrap">
                        <li className="mr-2 text-center"><small className="d-block text-uppercase">comics</small> <strong className="d-block lead">{character.comics.available}</strong></li>
                        <li className="mr-2 text-center"><small className="d-block text-uppercase">series</small> <strong className="d-block lead">{character.series.available}</strong></li>
                        <li className="mr-2 text-center"><small className="d-block text-uppercase">stories</small> <strong className="d-block lead">{character.stories.available}</strong></li>
                        <li className="mr-2 text-center"><small className="d-block text-uppercase">events</small> <strong className="d-block lead">{character.events.available}</strong></li>
                    </ul>
                </div>
            )}
        </Modal>
    )
}

export default ModalCharacter