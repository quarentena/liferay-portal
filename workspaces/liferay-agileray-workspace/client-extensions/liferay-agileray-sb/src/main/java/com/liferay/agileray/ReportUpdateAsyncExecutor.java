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

    public void setAgileReportId(String agileReportId) {
        this.agileReportId = agileReportId;
    }

    @Async("asyncRunner")
    public void updateReport(String jwtToken){
        try {
            int issueAmount = 100;
            int startAt = 1;
            JSONArray issues = new JSONArray();

            Thread.sleep(2000);

            JSONObject agileReport = this.getJiraAuthInfo(jwtToken, this.agileReportId);

            Integer jiraFilterId =  agileReport.getInt("jiraFilterId");
            String jiraInstanceURL = agileReport.getString("jiraInstanceURL");
            String jiraAPIToken = agileReport.getString("jiraAPIToken");
            String jiraUser = agileReport.getString("jiraUser");

            while (startAt < issueAmount) {
                JSONObject jiraData = this._getFromJira(
                        jiraUser,
                        jiraAPIToken,
                        jiraInstanceURL,
                        jiraFilterId,
                        UriComponentsBuilder.fromPath("/rest/api/latest/search"
                            ).queryParam("jql", "filter=" + jiraFilterId
                            //).queryParam("expand", "changelog"
                            ).queryParam("startAt", startAt
                            ).queryParam("fields", "key"
                            ).queryParam("maxResults", "100"
                            ).build());

                issueAmount = jiraData.getInt("total");
                startAt+= 100;

                issues.putAll(jiraData.getJSONArray("issues"));
            }

            for (int i = 0; i<issues.length();i++){
                JSONObject issue = issues.getJSONObject(i);
                System.out.println(issue.getString("key"));
            }

        } catch (InterruptedException e) {
            //
        }
    }
    public JSONObject getJiraAuthInfo (String jwtToken, String agileReportId){
        JSONObject responseJSONObject = _getFromLRObjects(
                jwtToken,
                uriBuilder -> uriBuilder.path(
                        "o/c/agilereports/" + agileReportId
                ).build());

        return responseJSONObject;
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

    private void _putInLRObjects(String token, String bodyValue, String path) {
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
                HttpHeaders.AUTHORIZATION,
                "bearer " + token
        ).bodyValue(
                bodyValue
        ).retrieve(
        );
    }

    @Value("${com.liferay.lxc.dxp.mainDomain}")
    private String _lxcDXPMainDomain;

    @Value("${com.liferay.lxc.dxp.server.protocol}")
    private String _lxcDXPServerProtocol;
}