/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
import {createRoot} from 'react-dom/client';

import AgileReportStateAssembler from './common/components/AgileReportStateAssembler.jsx';
import {Liferay} from './common/services/liferay/liferay.js';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  /** Put your mantine theme override here */
});

const App = () => {	
	if (Liferay.ThemeDisplay.isSignedIn()){
		return (			
			<MantineProvider theme={theme}>
      			<AgileReportStateAssembler />
    		</MantineProvider>											
		);
	}else{
		return (<h1>Not at liferay</h1>);
	}	
}

class WebComponent extends HTMLElement {
	connectedCallback() {
		createRoot(this).render(
			<App />
		);
	}
}

const ELEMENT_ID = 'liferay-agileray-ce-react';

if (!customElements.get(ELEMENT_ID)) {
	customElements.define(ELEMENT_ID, WebComponent);
}
