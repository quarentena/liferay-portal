import {Draggable} from '@hello-pangea/dnd'

export default function Card({card, index}){               
    return (
        <Draggable draggableId={card.term} index={index} key={card.term}>
            {(provided, snapshot) => (
            <li key={card.term}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}>
                <div className='workflowcard' key={card.term}>
                    <p className= 'workflowcardtitle' key={card.term}>{card.term}</p>
                </div>
            </li>)}
        </Draggable>)        
}