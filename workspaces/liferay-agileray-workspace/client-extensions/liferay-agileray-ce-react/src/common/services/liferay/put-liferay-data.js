/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {basePut } from './api.js';
import {Liferay} from './liferay.js';

export async function putReportState(reportName,status){
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
        const reportId = Liferay.ThemeDisplay.getLayoutURL().substring(Liferay.ThemeDisplay.getLayoutURL().lastIndexOf('/') + 1)
        
        const requestReportState = {
            agileReportState: reportName,
            jiraStatus: status.join(',')            
          }
        
        return await baseFetch('o/c/agilereportstates/',{method:'PUT'}, requestReportState)
            .then((response) => response.json())
            .then((response) => {
                console.log(response);
            return response;
        }).catch((error) => console.log(error));
    }
}

export default '';
