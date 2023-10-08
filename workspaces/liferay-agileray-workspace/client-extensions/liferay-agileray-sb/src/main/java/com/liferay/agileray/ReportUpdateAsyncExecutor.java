package com.liferay.agileray;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriBuilder;
import org.springframework.web.util.UriBuilderFactory;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.function.Function;
import java.util.concurrent.CompletableFuture;
import java.util.Base64;
@Service
public class ReportUpdateAsyncExecutor{

    private String agileReportId;
    private String integrationRequestERC;
    private String scopeKey;

    public void setAgileReportId (String agileReportId) {
        this.agileReportId = agileReportId;
    }
    public void setIntegrationRequestERC (String integrationRequestERC) {
        this.integrationRequestERC = integrationRequestERC;
    }
    @Async("asyncRunner")
    public void updateReport(Jwt jwt){
        try {
            Thread.sleep(2000);

            JSONObject responseRunning = putUpdateReportStatus(jwt.getTokenValue(),"running","Running");
         
            JSONObject agileReport = this.getJiraAuthInfo(jwt.getTokenValue(), this.agileReportId);

            JSONArray issues = getJiraIssues(agileReport.getString("jiraUser"
                                           ),agileReport.getString("jiraAPIToken"
                                           ),agileReport.getString("jiraInstanceURL"
                                           ),agileReport.getInt("jiraFilterId"));

            JSONObject responseJira = postJiraIssues(jwt.getTokenValue(),issues);
            
            JSONObject responseDone = putUpdateReportStatus(jwt.getTokenValue(),"done","Done");                        

        } catch (InterruptedException e) {
            System.out.println(e.toString());
        }
    }

    public JSONObject getJiraAuthInfo (String jwtToken, String agileReportId){
        return _getFromLRObjects(
                jwtToken,
                uriBuilder -> uriBuilder.path(
                        "o/c/agilereports/" + agileReportId
                ).build());
    }


    public JSONObject putUpdateReportStatus(String jwtToken,String stateKey,String stateName){        
        JSONObject requestPayload = new JSONObject();
        JSONObject requestState = new JSONObject();

        requestState.put("key",stateKey);
        requestState.put("Name",stateName);
        requestPayload.put("requestState", requestState);
        
        return _putInLRObjects(jwtToken,requestPayload.toString(),"/o/c/jiraintegrationrequests/by-external-reference-code/" + this.integrationRequestERC);
    }

    public JSONArray getJiraIssues (String jiraUser, String jiraAPIToken, String jiraInstanceURL, int jiraFilterId){
        int issueAmount = 100;
        int startAt = 1;
        JSONArray issues = new JSONArray();

        while (startAt < issueAmount) {
            JSONObject jiraData = this._getFromJira(
                    jiraUser,
                    jiraAPIToken,
                    jiraInstanceURL,
                    jiraFilterId,
                    UriComponentsBuilder.fromPath("/rest/api/latest/search"
                    ).queryParam("jql", "filter=" + jiraFilterId
                    ).queryParam("expand", "changelog"
                    ).queryParam("startAt", startAt
                    ).queryParam("fields", "status,summary,key,reporter,issuetype,duedate,labels,created,resolution,customfield_10014"
                    ).queryParam("maxResults", "100"
                    ).build());

            issueAmount = jiraData.getInt("total");
            startAt+= 100;

            issues.putAll(jiraData.getJSONArray("issues"));
        }

        return issues;
    }

    public JSONObject postJiraIssues(String jwtToken, JSONArray issues){
        JSONArray batchRequest = new JSONArray();

        for (int idxIssue = 0; idxIssue < issues.length() ; idxIssue++){
            JSONObject issue = new JSONObject();

            String issueERC = this.integrationRequestERC + "." + issues.getJSONObject(idxIssue).getString("key");

            issue.put("key", issues.getJSONObject(idxIssue).getString("key"));
            issue.put("externalReferenceCode", issueERC);
            issue.put("summary", issues.getJSONObject(idxIssue).getJSONObject("fields").getString("summary"));
            issue.put("jiraStatus", issues.getJSONObject(idxIssue).getJSONObject("fields").getJSONObject("status").getString("name"));
            issue.put("issueType", issues.getJSONObject(idxIssue).getJSONObject("fields").getJSONObject("issuetype").getString("name"));
            issue.put("r_requestToIssue_c_jiraIntegrationRequestERC", this.integrationRequestERC);

            JSONArray labels = issues.getJSONObject(idxIssue).getJSONObject("fields").getJSONArray("labels");
            JSONArray issueLabels = new JSONArray();

            for (int idxLabel = 0; idxLabel < labels.length(); idxLabel++) {
                JSONObject issueLabel = new JSONObject();
                issueLabel.put("label",labels.getString(idxLabel));
                issueLabel.put("r_issueToLabel_c_jiraIssueERC",issueERC);
                issueLabel.put("r_requestToIssueLabel_c_jiraIntegrationRequestERC", this.integrationRequestERC);

                issueLabels.put(issueLabel);
            }

            issue.put("issueToLabel", issueLabels);

            JSONArray histories = issues.getJSONObject(idxIssue).getJSONObject("changelog").getJSONArray("histories");

            JSONArray issueTransitions = new JSONArray();
            for (int idxHistory = 0; idxHistory < histories.length();idxHistory++){
                JSONArray historyItems = histories.getJSONObject(idxHistory).getJSONArray("items");
                for (int idxTransitionItem = 0; idxTransitionItem < historyItems.length(); idxTransitionItem++) {
                    if (historyItems.getJSONObject(idxTransitionItem).getString("field").equals(new String("status"))) {
                        JSONObject issueTransition = new JSONObject();
                        issueTransition.put("transitionFrom", historyItems.getJSONObject(idxTransitionItem).getString("fromString"));
                        issueTransition.put("transitionTo", historyItems.getJSONObject(idxTransitionItem).getString("toString"));
                        issueTransition.put("when", new String(histories.getJSONObject(idxHistory).getString("created")).substring(0,10));
                        issueTransition.put("who", histories.getJSONObject(idxHistory).getJSONObject("author").getString("displayName"));
                        issueTransition.put("r_issueToTransition_c_jiraIssueERC", issueERC);
                        issueTransition.put("r_requestToIssueTransition_c_jiraIntegrationRequestERC", this.integrationRequestERC);

                        issueTransitions.put(issueTransition);
                    }
                }
            }

            issue.put("issueToTransition", issueTransitions);

            batchRequest.put(issue);
        }

        return _postInLRObjects(jwtToken,batchRequest.toString(),"/o/c/jiraissues/batch");
    }

    private JSONObject _getFromJira(String jiraUser,String jiraApiToken, String jiraInstanceURL, int jiraFilterId, UriComponents uriComp) {
        byte[] authStringBase64 = Base64.getEncoder().encode((jiraUser + ":" + jiraApiToken).getBytes());

        return new JSONObject (WebClient.builder(
                            ).baseUrl(jiraInstanceURL
                            ).exchangeStrategies(
                                ExchangeStrategies.builder(
                                    ).codecs(
                                        configurer -> configurer.defaultCodecs(
                                        ).maxInMemorySize(10 * 1024 * 1024
                                        )).build()
                            ).build(
                            ).get(
                            ).uri(uriComp.toUriString()
                            ).accept(
                                    MediaType.APPLICATION_JSON
                            ).header(
                                    "Authorization", "Basic " + new String(authStringBase64)
                            ).retrieve(
                            ).bodyToMono(
                                    String.class
                            ).block());
    }

    private JSONObject _getFromLRObjects(String token, Function<UriBuilder, URI> uriFunction) {
        return new JSONObject(
                WebClient.create(_lxcDXPServerProtocol + "://" + _lxcDXPMainDomain
                ).get(
                ).uri(
                        uriBuilder -> uriFunction.apply(uriBuilder)
                ).accept(
                        MediaType.APPLICATION_JSON
                ).header(
                        "Authorization","Bearer " + token
                ).retrieve(
                ).bodyToMono(
                        String.class
                ).block());
    }

    private JSONObject _postInLRObjects(String token, String bodyValue, String path) {
        return new JSONObject(
                WebClient.create(
                    _lxcDXPServerProtocol + "://" + _lxcDXPMainDomain
                ).post(
                ).uri(
                        uriBuilder -> uriBuilder.path(
                                path
                        ).build()
                ).accept(
                        MediaType.APPLICATION_JSON
                ).contentType(
                        MediaType.APPLICATION_JSON
                ).header(
                        "Authorization","Bearer " + token
                ).bodyValue(
                        bodyValue
                ).retrieve(
                ).bodyToMono(
                        String.class
                ).block());
    }

    private JSONObject _putInLRObjects(String token, String bodyValue, String path) {
        return new JSONObject(
                WebClient.create(
                    _lxcDXPServerProtocol + "://" + _lxcDXPMainDomain
                ).put(
                ).uri(
                        uriBuilder -> uriBuilder.path(
                                path
                        ).build()
                ).accept(
                        MediaType.APPLICATION_JSON
                ).contentType(
                        MediaType.APPLICATION_JSON
                ).header(
                        "Authorization","Bearer " + token
                ).bodyValue(
                        bodyValue
                ).retrieve(
                ).bodyToMono(
                        String.class
                ).block());
    }

    @Value("${com.liferay.lxc.dxp.mainDomain}")
    private String _lxcDXPMainDomain;

    @Value("${com.liferay.lxc.dxp.server.protocol}")
    private String _lxcDXPServerProtocol;
}