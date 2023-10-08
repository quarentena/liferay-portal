package com.liferay.agileray;

import org.json.JSONArray;
import org.json.JSONObject;

import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import org.apache.http.HttpHost;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestClientBuilder.HttpClientConfigCallback;



import java.io.IOException;

import org.apache.http.Header;
import org.apache.http.message.BasicHeader;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;

public class ElasticsearchDataController{
    public static void sendCycleTime(JSONArray cycletime){                        
        try{
            for (int i = 0; i < cycletime; i++) {
                ElasticsearchClient esClient = createESClient();
            
                IndexResponse response = esClient.index(i -> i
                    .index("cycletime")
                    .id(cycletimeDocument.getString("Date"))
                    .document(cycletime[i])         
                );
            }            
        }catch (IOException e){           
            System.out.println(e);
        }
    }

    public static ElasticsearchClient createESClient(){
        // URL and API key
        String serverUrl = "http://172.18.0.5:9200";
        String apiKey = "eUstQjhJb0IxOXZPZ2VHSTJGY0c6RzhrbzlmNEFRVXV1bUNNdEZyMTVYUQ==";

        /*
        final CredentialsProvider credentialsProvider =
            new BasicCredentialsProvider();
        credentialsProvider.setCredentials(AuthScope.ANY,
            new UsernamePasswordCredentials("elastic", "N0T2=VuusxfYY_eQ-7ui"));

        RestClientBuilder builder = RestClient.builder(
            new HttpHost("172.18.0.5", 9200))
            .setHttpClientConfigCallback(new HttpClientConfigCallback() {
                @Override
                public HttpAsyncClientBuilder customizeHttpClient(
                        HttpAsyncClientBuilder httpClientBuilder) {
                    return httpClientBuilder
                        .setDefaultCredentialsProvider(credentialsProvider);
                }
            });
        */    
        // Create the low-level client

        RestClient restClient = RestClient
            .builder(HttpHost.create(serverUrl))
            .setDefaultHeaders(new Header[]{
                new BasicHeader("Authorization", "ApiKey " + apiKey)
            })
            .build();        

        // Create the transport with a Jackson mapper
        ElasticsearchTransport transport = new RestClientTransport(
            restClient, new JacksonJsonpMapper());

        // And create the API client
        ElasticsearchClient esClient = new ElasticsearchClient(transport);

        return esClient;
    }
}