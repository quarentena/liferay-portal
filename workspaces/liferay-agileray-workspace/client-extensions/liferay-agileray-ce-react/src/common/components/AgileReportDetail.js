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
    const [reportData, setReportData] = React.useState(null);
    React.useEffect(() => {
        console.log("Not signed to liferay");
        if (Liferay.ThemeDisplay.isSignedIn()) {
            console.log("Signed to liferay");
            api("o/c/jiraintegrationrequests/?fields=id&filter=r_agileReportToJiraIntegrationRequest_c_agileReportId eq '" + document.URL.substring(document.URL.lastIndexOf('/') + 1) + "'&page=1&pageSize=1&sort=dateCreated:desc")
                .then((response) => response.json())
                .then((response) => {
                console.log(response);
                if (response.totalCount > 0){
                    api("o/c/jiraissues/?fields=id,key,summary&filter=r_requestToIssue_c_jiraIntegrationRequestId eq '" + response.items[0].id + "'")
                        .then((response) => response.json())
                        .then((response) => {
                        console.log(response);
                        if (response.totalCount > 0){
                            for (let idxItem in response.items){
                                setReportData([
                                ...reportData,
                                {
                                    id: response.items[idxItem].id,
                                    key: response.items[idxItem].key,
                                    summary: response.items[idxItem].summary
                                }]);
                            }
                        }
                    }).catch((error) => console.log(error));
                }
            }).catch((error) => console.log(error));
        }
    }, []);

    console.log(reportData);

    for (let idxData in reportData.items) {
        console.log(reportData);
        result += (<div>
            <h2>{reportData.items[idxData].id} - {reportData.items[idxData].key} - {reportData.items[idxData].summary}</h2>
        </div>)
    }

    return !reportData ? (
        <div>Loading...</div>
    ) : result;
}

export default Report;
