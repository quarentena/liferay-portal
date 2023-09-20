/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';
import api from '../services/liferay/api.js';
import {Liferay} from '../services/liferay/liferay.js';

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
    const [reportData, setReportData] = React.useState();

    React.useEffect(() => {
        if (Liferay.ThemeDisplay.isSignedIn()) {
            api("o/c/jiraintegrationrequests/?fields=id&filter=r_agileReportToJiraIntegrationRequest_c_agileReportId eq '" + document.URL.substring(document.URL.lastIndexOf('/') + 1) + "'&page=1&pageSize=1&sort=dateCreated:desc")
                .then((response) => response.json())
                .then((response) => {
                if (response.totalCount > 0){
                    api("o/c/jiraissues/?fields=id,key,summary&filter=r_requestToIssue_c_jiraIntegrationRequestId eq '" + response.items[0].id + "'")
                        .then((response) => response.json())
                        .then((response) => {
                        if (response?.totalCount > 0){
                            setReportData(response);
                        }
                    }).catch((error) => console.log(error));
                }
            }).catch((error) => console.log(error));
        }
    }, []);

    return !reportData ? (
        <div>Loading...</div>
    ) : reportData.items?.map((item) => (<div draggable>
                                         <h6>{item.id} - {item.key} - {item.summary}</h6>
                                         </div>));
}

export default Report;
