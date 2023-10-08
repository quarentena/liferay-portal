import React, { useEffect, useState, useRef, useCallback } from 'react';
import ClayAlert from '@clayui/alert';
import {Draggable, Droppable, DragDropContext} from '@hello-pangea/dnd'
import { getIssueTransitions } from '../../common/services/liferay/get-liferay-data.js'
import { IoPencilOutline,         
         IoTrashOutline,                  
         IoAddCircleOutline} from 'react-icons/io5/index.esm.js'
import Card from './workflow/card.jsx'
import {postNewReportState} from '../../common/services/liferay/post-liferay-data.js';
import { deleteReportState } from '../../common/services/liferay/delete-liferay-data.js';

export default function WorkflowSettings() {    
    const [lists, setLists] = useState([{title:"Unmapped Status", status: [], custom: false},
                                        {title: '+',status:[],custom: false}]);

    const [isloading, setisloading] = useState(null);
    const [editmode, seteditmode] = useState();

    const error = useRef(null);    
                    
    useEffect(() => {                
        const LRIssueTransitions = getLRData().then((result) => {            
            const issueTransitions = {title:"Unmapped Status", status: result, custom: false, index:0}
            
            return issueTransitions;
        });
                        
        Promise.all([LRIssueTransitions]).then((transitions) => {            
            UpdateLists(transitions)
        });
    },[])

    const onDragEnd = ({ draggableId, destination, source }) => {            
            if (!destination) return;            
            const idxSource = lists.map(list => list.title).indexOf(source.droppableId);
            const idxDestination = lists.map(list => list.title).indexOf(destination.droppableId);
            const draggable = lists[idxSource].status[source.index]
            lists[idxSource].status.splice(source.index, 1);            
            lists[idxDestination].status.splice(destination?.index, 0, draggable);

            setLists([...lists])
          }

    async function getLRData(){
        
        const response = await getIssueTransitions().then((response) => {
            return response;            
        })
               
        return response;
    }

    

    function onCloseAlert(){
        return (() =>
            {error.current = null
             setLists([...lists])}
        )        
    }

    function AddList(newList){          
        if (lists.some(list => list.title == newList.title)) {
            error.current='You cant have two states with the same name.';
        }else{
            const addList = lists[lists.length-1]
            lists.splice(lists.length-1,1,newList,addList);
        }
        postNewReportState(newList.title);
        setLists([...lists]);
    }
    
    function RemoveList(index){                                                          
        const unmappedList = [{title: lists[0].title, status: [...lists[0].status, ...lists[index].status], custom: false, index:0}]
        
        lists.splice(index,1);
        deleteReportState(lists[index]?.title)
        
        UpdateLists(unmappedList)
    }

    function UpdateLists(updatedLists){        
        let newList = [...lists];
        error.current = null;
                                
        //if (newList.map(list => list.title).indexOf(updatedLists[0].title) > -1){
        if (false){
            error.current='You cant have two states with the same name.';
            setLists([...lists]); 
        }else{     
            updatedLists.map((list) => {                
                newList[list.index].title = list.title
                newList[list.index].status = list.status
                newList[list.index].custom = list.custom
            })
            
        }
        
        setLists(newList);
    }  

    function RenderLists(){        
        console.log('render')                      
        return (    
            <>                
                <div className='workflownotification'>
                    {error.current && <ClayAlert.ToastContainer>                              
                                        <ClayAlert title='Error' displayType='danger' autoClose='3000' onClose={onCloseAlert()}>
                                            {error.current}
                                        </ClayAlert>
                                      </ClayAlert.ToastContainer>}
                </div>
                <DragDropContext
                    onDragEnd={onDragEnd}>
                    <div className='workflowassembler'>
                        
                        {lists.map((column, index) => {                                  
                            return (        
                                column.title!="+" ?                                                                                                    
                                    <ul className="workflowlist" key={column.title}>
                                        <header className='workflowlistheader'> 
                                            {column.custom ?
                                            <div className='workflowlistheaderdiv'>
                                                <h6 className="listtitle" contentEditable suppressContentEditableWarning onInput={(updatedList) => UpdateLists([{title: updatedList.currentTarget.textContent,status: column.status, custom: column.custom, index:index}])}>{column.title}</h6>
                                                <a className='editbtn' onClick={() => EditMode(index)}>
                                                    <IoPencilOutline size='18'/>
                                                </a>
                                                <a className='rembtn' onClick={() => RemoveList(index)}>
                                                    <IoTrashOutline size='18'/>
                                                </a>
                                            </div>
                                            :<h6 className="listtitle">{column.title}</h6>}
                                            
                                        </header>
                                        <Droppable droppableId = {column.title} key={column.title} className="workflowdroppable">
                                            {(provided, snapshot) => (                                                
                                                <div className= {snapshot.isDraggingOver ? 'workflowlistcontent dragging' : 'workflowlistcontent'} key={column.title}
                                                    ref={provided.innerRef}
                                                    //style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}
                                                    {...provided.droppableProps}>
                                                        {column.status?.map((card, idx) => <Card card={card} index={idx} key={card.term}/>)}
                                                        {provided.placeholder}
                                                </div>)}
                                        </Droppable>
                                    </ul>
                                :
                                    <ul className="workflowlist" key={column.title}>
                                        <header id='addBt' className= 'workflowlistheader clickable' onClick={() => {AddList({title: 'New Status',status:[],custom:true})}}>
                                                <IoAddCircleOutline size={25}/>
                                        </header>                                                                                                                                                            
                                    </ul>
                            )})}
                    </div>
                </DragDropContext>
            </>          
        )
    }
                                                
    return (         
        <RenderLists />
    )
}