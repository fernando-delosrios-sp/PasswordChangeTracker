import { ConnectorError, StdTestConnectionOutput } from "@sailpoint/connector-sdk";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export class IDNClient {
    private readonly idnUrl?: string;
    private readonly patId?: string;
    private readonly patSecret?: string;
    private readonly period?: string;
    private accessToken?: string;

    constructor(config: any) {
        this.idnUrl = config.idnUrl;
        this.patId = config.patId;
        this.patSecret = config.patSecret;
        this.period = config.period;
    }

    async getAccessToken(): Promise<string | undefined> {
        const url: string = `${this.idnUrl}/oauth/token`;
        console.log(url);

        if (! this.accessToken) {
            const request: AxiosRequestConfig = {
                method: 'post',
                baseURL: url,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                params: {
                    client_id: this.patId,
                    client_secret: this.patSecret,
                    grant_type: 'client_credentials'
                }
            }
            const response: AxiosResponse = await axios(request);
            this.accessToken = response.data.access_token;
        } 
        
        return this.accessToken;
    }

    async testConnection(): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken();
        const url: string = `${this.idnUrl}/beta/public-identities-config`;

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: url,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }

        return axios(request);
    }

    async getPasswordChanges(): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken();
        const url: string = `${this.idnUrl}/v3/search`;

        let request: AxiosRequestConfig = {
            method: 'post',
            baseURL: url,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
                'query': {
                    'query': `technicalName:PASSWORD_ACTION_CHANGE_PASSED AND created:[now-${this.period} TO now]`
                },
                'indices': [
                    'events'
                ],
                'sort': [
                    'created'
                ],
                'includeNested': false,
                'queryResultFilter': {
                    'includes': [
                        'attributes.accountName', 'attributes.sourceName', 'created', 'target', 'id', 'technicalName'
                    ]
                }
            }
        }

        return await axios(request);
    }

    async getAccountCreations(): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken();
        const url: string = `${this.idnUrl}/v3/search`;

        let request: AxiosRequestConfig = {
            method: 'post',
            baseURL: url,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
                'query': {
                    'query': `technicalName:ACCOUNT_CREATE_PASSED AND created:[now-${this.period} TO now]`
                },
                'indices': [
                    'events'
                ],
                'sort': [
                    'created'
                ],
                'includeNested': false,
                'queryResultFilter': {
                    'includes': [
                        'attributes.accountName', 'attributes.sourceName', 'created', 'target', 'id', 'technicalName'
                    ]
                }
            }
        }

        return await axios(request);
    }
}