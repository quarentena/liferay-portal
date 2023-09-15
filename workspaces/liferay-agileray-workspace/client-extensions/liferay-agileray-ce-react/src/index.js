/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
import {createRoot} from 'react-dom/client';

import AgileReportDetail from './common/components/AgileReportDetail.js';
import api from './common/services/liferay/api.js';
import {Liferay} from './common/services/liferay/liferay.js';
import HelloWorld from './routes/hello-world/pages/HelloWorld.js';

import './common/styles/index.scss';

const App = ({report}) => {
	return (
		<div>
			{Liferay.ThemeDisplay.isSignedIn() && (
				<div>
					<AgileReportDetail />
				</div>
			)}
		</div>
	);
};

class WebComponent extends HTMLElement {
	connectedCallback() {
		createRoot(this).render(
			<App route={this.getAttribute('report')} />,
			this
		);
	}
}

const ELEMENT_ID = 'liferay-agileray-ce-react';

if (!customElements.get(ELEMENT_ID)) {
	customElements.define(ELEMENT_ID, WebComponent);
}
