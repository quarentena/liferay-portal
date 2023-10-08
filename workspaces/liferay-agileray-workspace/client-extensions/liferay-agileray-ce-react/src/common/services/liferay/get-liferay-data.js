/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import { baseFetch } from './api.js';
import {Liferay} from './liferay.js';

export async function getIssueTransitions(){
    let oAuth2Client;

    try {
        oAuth2Client = Liferay.OAuth2Client.FromUserAgentApplication(
            'liferay-agileray-oauth-user-agent'
        );
    }
    catch (error) {
        console.error(error);
    }

    if (Liferay.ThemeDisplay.isSignedIn()) {                    
        const reportId = Liferay.ThemeDisplay.getLayoutURL().substring(Liferay.ThemeDisplay.getLayoutURL().lastIndexOf('/') + 1);
        return await baseFetch("o/c/jiraintegrationrequests/?fields=id&filter=r_agileReportToJiraIntegrationRequest_c_agileReportId eq '" + reportId + "'&page=1&pageSize=1&sort=dateCreated:desc")
                .then((response) => response.json())
                .then((response) => {
                if (response.totalCount > 0){
                    return baseFetch("o/c/jiraissuetransitions/?aggregationTerms=transitionTo&Fields=id&filter=r_requestToIssueTransition_c_jiraIntegrationRequestId eq '" + response.items[0].id + "'")
                        .then((response) => response.json())
                        .then((response) => {
                        if (response?.totalCount > 0){                            
                            return response.facets[0].facetValues;
                        }
                    }).catch((error) => console.log(error));
                }
            }).catch((error) => console.log(error));
    }
}

export default '';
