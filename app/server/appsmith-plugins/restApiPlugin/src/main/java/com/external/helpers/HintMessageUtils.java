package com.external.helpers;

import com.appsmith.external.models.ActionConfiguration;
import com.appsmith.external.models.ApiKeyAuth;
import com.appsmith.external.models.DatasourceConfiguration;
import com.appsmith.external.models.Property;
import org.apache.commons.lang.StringUtils;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.appsmith.external.constants.Authentication.API_KEY;
import static com.appsmith.external.constants.Authentication.AUTHORIZATION_HEADER;
import static com.appsmith.external.constants.Authentication.BASIC;
import static com.appsmith.external.constants.Authentication.BEARER_TOKEN;
import static com.appsmith.external.models.ApiKeyAuth.Type.HEADER;
import static com.appsmith.external.models.ApiKeyAuth.Type.QUERY_PARAM;

public class HintMessageUtils {

    public static Set<String> getAllDuplicateHeaders(ActionConfiguration actionConfiguration,
                                               DatasourceConfiguration datasourceConfiguration) {
        List allHeaders = getAllHeaders(actionConfiguration, datasourceConfiguration);
        return findDuplicates(allHeaders);
    }

    // Find all duplicate items in a list
    private static Set findDuplicates(List allItems) {
        Set duplicateItems = new HashSet<String>();
        Set uniqueItems = new HashSet<String>();

        allItems.stream()
                .forEach(item -> {
                    if (uniqueItems.contains(item)) {
                        duplicateItems.add(item);
                    }

                    uniqueItems.add(item);
                });

        return duplicateItems;
    }

    private static List getAllHeaders(ActionConfiguration actionConfiguration,
                                      DatasourceConfiguration datasourceConfiguration) {
        List allHeaders = new ArrayList<String>();

        // Get all headers defined in API query editor page.
        allHeaders.addAll(getActionHeaders(actionConfiguration));

        // Get all headers defined in datasource editor page in the headers field.
        allHeaders.addAll(getDatasourceHeaders(datasourceConfiguration));

        // Get all headers defined implicitly via authentication config for API.
        allHeaders.addAll(getAuthenticationHeaders(datasourceConfiguration));

        return allHeaders;
    }

    // Get all headers defined in API query editor page.
    private static List getActionHeaders(ActionConfiguration actionConfiguration) {
        List headers = new ArrayList<String>();
        if (actionConfiguration != null && !CollectionUtils.isEmpty(actionConfiguration.getHeaders())) {
            headers.addAll(getKeyList(actionConfiguration.getHeaders()));
        }

        return headers;
    }

    // Get all headers defined in datasource editor page in the headers field.
    private static List getDatasourceHeaders(DatasourceConfiguration datasourceConfiguration) {
        List headers = new ArrayList<String>();
        if (datasourceConfiguration != null && !CollectionUtils.isEmpty(datasourceConfiguration.getHeaders())) {
            headers.addAll(getKeyList(datasourceConfiguration.getHeaders()));
        }

        return headers;
    }

    // Get all headers defined implicitly via authentication config for API.
    private static Set<String> getAuthenticationHeaders(DatasourceConfiguration datasourceConfiguration) {

        if (datasourceConfiguration == null || datasourceConfiguration.getAuthentication() == null) {
            return new HashSet<>();
        }

        Set<String> headers = new HashSet<>();

        // Basic auth or bearer token auth adds a header `Authorization`
        if (BASIC.equals(datasourceConfiguration.getAuthentication().getAuthenticationType()) ||
                BEARER_TOKEN.equals(datasourceConfiguration.getAuthentication().getAuthenticationType())) {
            headers.add(AUTHORIZATION_HEADER);
        }

        // Api key based auth where key is supplied via header
        if (API_KEY.equals(datasourceConfiguration.getAuthentication().getAuthenticationType()) &&
                HEADER.equals(((ApiKeyAuth) datasourceConfiguration.getAuthentication()).getAddTo())) {
            headers.add(((ApiKeyAuth) datasourceConfiguration.getAuthentication()).getLabel());
        }

        return headers;
    }

    public static Set<String> getAllDuplicateParams(ActionConfiguration actionConfiguration,
                                              DatasourceConfiguration datasourceConfiguration) {
        List allParams = getAllParams(actionConfiguration, datasourceConfiguration);
        return findDuplicates(allParams);
    }

    private static List getKeyList(List<Property> propertyList) {
        return propertyList.stream()
                .map(item -> item.getKey())
                .filter(key -> StringUtils.isNotEmpty(key))
                .collect(Collectors.toList());
    }

    private static List getAllParams(ActionConfiguration actionConfiguration,
                                     DatasourceConfiguration datasourceConfiguration) {
        List allParams = new ArrayList<String>();

        // Get all params defined in API query editor page.
        allParams.addAll(getActionParams(actionConfiguration));

        // Get all params defined in datasource editor page in the headers field.
        allParams.addAll(getDatasourceParams(datasourceConfiguration));

        // Get all params defined implicitly via authentication config for API.
        allParams.addAll(getAuthenticationParams(datasourceConfiguration));

        return allParams;
    }

    private static List getActionParams(ActionConfiguration actionConfiguration) {
        List<String> params = new ArrayList<>();

        if (actionConfiguration != null && !CollectionUtils.isEmpty(actionConfiguration.getQueryParameters())) {
            params.addAll(getKeyList(actionConfiguration.getQueryParameters()));
        }

        return params;
    }

    private static List getDatasourceParams(DatasourceConfiguration datasourceConfiguration) {
        List<String> params = new ArrayList<>();

        if (datasourceConfiguration != null &&
                !CollectionUtils.isEmpty(datasourceConfiguration.getQueryParameters())) {
            params.addAll(getKeyList(datasourceConfiguration.getQueryParameters()));
        }

        return params;
    }

    private static Set getAuthenticationParams(DatasourceConfiguration datasourceConfiguration) {

        if (datasourceConfiguration == null || datasourceConfiguration.getAuthentication() == null) {
            return new HashSet<>();
        }

        Set<String> params = new HashSet<>();

        // Api key based auth where key is supplied via query param
        if (API_KEY.equals(datasourceConfiguration.getAuthentication().getAuthenticationType()) &&
                QUERY_PARAM.equals(((ApiKeyAuth) datasourceConfiguration.getAuthentication()).getAddTo())) {
            params.add(((ApiKeyAuth) datasourceConfiguration.getAuthentication()).getLabel());
        }

        return params;
    }
}
