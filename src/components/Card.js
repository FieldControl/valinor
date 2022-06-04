import { StyledCard } from "./styles/Card.styled"


export default function Card ({item: {id, name, description, language, avatar} }) {
    return (
        <StyledCard layout={id % 2 === 0 &&  'row-reverse'}>
            <div> 
                <h2>{name}</h2>
                <p>{description}</p>
                <h4>{language}</h4>
            </div>

            <div> 
                <img src={`${avatar}`} alt="" />
            </div>
        </StyledCard>
    )
}