/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
import api from '../services/liferay/api.js';
import {Liferay} from '../services/liferay/liferay.js';

import cx from 'clsx';
import { Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

let oAuth2Client;

try {
	oAuth2Client = Liferay.OAuth2Client.FromUserAgentApplication(
		'liferay-agileray-oauth-user-agent'
	);
}
catch (error) {
	console.error(error);
}

function Report() {    
    const [reportData, setReportData] = React.useState(null);
    const [dnd, handlers] = useListState([{term:"",numberOfOccurrences:0}]);

    React.useEffect(() => {               
        if (Liferay.ThemeDisplay.isSignedIn() && !reportData) {            
            api("o/c/jiraintegrationrequests/?fields=id&filter=r_agileReportToJiraIntegrationRequest_c_agileReportId eq '" + document.URL.substring(document.URL.lastIndexOf('/') + 1) + "'&page=1&pageSize=1&sort=dateCreated:desc")
                .then((response) => response.json())
                .then((response) => {
                if (response.totalCount > 0){
                    api("o/c/jiraissuetransitions/?aggregationTerms=transitionTo&Fields=id&filter=r_requestToIssueTransition_c_jiraIntegrationRequestId eq '" + response.items[0].id + "'")                    
                        .then((response) => response.json())
                        .then((response) => {
                        if (response?.totalCount > 0){                                                        
                            handlers.setState(response?.facets[0]?.facetValues);
                        }
                    }).catch((error) => console.log(error));
                }
            }).catch((error) => console.log(error));
        }
    }, []);    
    
    React.useEffect(() => {        
        if (dnd && dnd.length > 1){                    
            try{                                
                const items = dnd.map((item, index) => (
                    <Draggable key={item.term} index={index} draggableId={item.term}>
                    {(provided, snapshot) => (
                        <div className='item itemDragging shadow-lg container' 
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                >
                            <div>
                                <Text className='text-paragraph-lg'>{item.term}</Text>
                            </div>
                            <div>
                                <Text className='text-paragraph-xs'>
                                    Amount of Transitions: {item.numberOfOccurrences}
                                </Text>                            
                            </div>                                                                                    
                        </div>
                    )}
                    </Draggable>
                ));                                          
                        
                console.log("test");
                setReportData(
                    <DragDropContext
                    onDragEnd={({ destination, source }) =>
                        handlers.reorder({ from: source.index, to: destination?.index || 0 })
                    }
                    >
                    <Droppable droppableId="dnd-list" direction="vertical">
                        {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {items}
                            {provided.placeholder}
                        </div>
                        )}
                    </Droppable>
                    </DragDropContext>);
            } catch(error){
                console.error(error);
            }               
        }
    }, [dnd])
    
    if(!reportData){
        return <h1>Loading Data...</h1>;
    }else{
        return reportData;
    }
    
}

export default Report;
