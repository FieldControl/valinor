import React, { Fragment, Component } from 'react'

export default class Modal extends Component {
    componentDidUpdate(prevProps){
        if(prevProps.isShow !== this.props.isShow){
            if(this.props.isShow){
                document.body.classList.add('modal-open')
            }else{
                document.body.classList.remove('modal-open') 
            }
        }
    }
    render() {
        const { children, title, isShow, onHide } = this.props
        if (isShow) {
            return (
                <Fragment>
                    <div className="modal show d-block text-light">
                        <div className="modal-dialog" >
                            <div className="modal-content bg-dark">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title">{title}</h5>
                                    <button type="button" className="close text-light" onClick={onHide}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show"></div>
                </Fragment>
            )
        }

        return null
    }
}