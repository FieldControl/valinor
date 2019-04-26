//noinspection JSUnresolvedVariable
import React, { Component } from 'react'
import range from 'lodash/range'
import PropTypes from 'prop-types'

class PaginatorContainer extends Component {
    static propTypes = {
        initialPage: props => {
            if (typeof props.initialPage !== 'number') {
                return new Error('initialPage should be a number')
            }
            if (props.initialPage < 1) {
                return new Error('initialPage should be greater than or equal to 1')
            }
            if (props.initialPage > props.numberOfPages) {
                return new Error(
                    `initialPage should be less than or equal to ${props.numberOfPages}`
                )
            }
        },
        numberOfPages: PropTypes.number.isRequired,
        onPageChange: PropTypes.func,
        children: PropTypes.func.isRequired
    }

    static defaultProps = { initialPage: 1 }

    state = { currentPage: this.props.initialPage }

    setPage = page => {
        if (typeof page !== 'number') {
            throw new Error('page should be a number')
        }
        if (page < 1) {
            throw new Error('page should be greater than or equal to 1')
        }
        if (page > this.props.numberOfPages) {
            throw new Error(
                `page should be less than or equal to ${this.props.numberOfPages}`
            )
        }
        this.setState({ currentPage: page }, () => {
            if (this.props.onPageChange) {
                this.props.onPageChange(page)
            }
        })
    }

    incrementPage = () => {
        if (this.state.currentPage === this.props.numberOfPages) {
            return
        }
        this.setPage(this.state.currentPage + 1)
    }

    decrementPage = () => {
        if (this.state.currentPage === 1) {
            return
        }
        this.setPage(this.state.currentPage - 1)
    }

    render() {
        return this.props.children({
            currentPage: this.state.currentPage,
            numberOfPages: this.props.numberOfPages,
            setPage: this.setPage,
            incrementPage: this.incrementPage,
            decrementPage: this.decrementPage
        })
    }
}

const Paginator = ({ numberOfPages, onPageChange, initialPage }) => {
    return (
        <PaginatorContainer initialPage={initialPage} numberOfPages={numberOfPages} onPageChange={onPageChange}>
            {({ currentPage, setPage, incrementPage, decrementPage }) => (
                <button className="ml-auto mr-auto btn btn-group">
                    <button className="btn btn-outline-primary" disabled={currentPage === 1} onClick={e => { e.preventDefault(); decrementPage() }}>
                        &laquo;
                    </button>
                    {range(currentPage - 3, currentPage + 3 + 1).map(page => {
                        if (page < 1 || page > numberOfPages) {
                            return null
                        }
                        return (
                            <button key={page} className={`btn ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'}`} onClick={e => { e.preventDefault(); setPage(page) }}>
                                {page}
                            </button>
                        )
                    })}
                    <button className="btn btn-outline-primary" disabled={currentPage === numberOfPages} onClick={e => { e.preventDefault(); incrementPage() }}>
                        &raquo;
                    </button>
                </button>
            )}
        </PaginatorContainer>
    )
}
Paginator.propTypes = {
    numberOfPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    initialPage: PropTypes.number.isRequired
}

export default Paginator