/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import './css/custom.css';
import {createRoot} from 'react-dom/client';
import Navbar from './pages/navbar/index.js';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import {Liferay} from './common/services/liferay/liferay.js';
import WorkflowSettings from './pages/settings/workflow.jsx';
import BacklogSettings from './pages/settings/backlog.js';

function backHome(){		
	window.location.href = '/web/agile01'	
}

const Report = () => {				
	if ((window.location.href.includes('#') == false) && (!document.URL.includes('edit'))){		
		window.location.href += '/#/report';
	}
	
	return (						
		<div className='agileray'>
			<Router basename='/report'>
				<Navbar	 />				
				<div className='content'>
					<Routes>						
						<Route path='/' />
						<Route path='Back' Component={backHome}/>
						<Route path='/settings/workflow' element={<WorkflowSettings />} />
						<Route path='/settings/backlog' element={<BacklogSettings />}/>						
					</Routes>
				</div>
			</Router>			
		</div>
	);
}

class WebComponent extends HTMLElement {		
	connectedCallback() {												
		createRoot(this).render(			
			<Report />
		)		
	}
}


const ELEMENT_ID = 'liferay-agileray-ce-react';

if (!customElements.get(ELEMENT_ID)) {	
	customElements.define(ELEMENT_ID, WebComponent);
}
