import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
    ConnectorError,
    Context,
    createConnector,
    readConfig,
    Response,
    StdAccountListOutput,
    StdEntitlementListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdTestConnectionOutput,
    StdEntitlementListInput,
} from '@sailpoint/connector-sdk'
import { IDNClient } from './idn-client'
import { Account } from "./model/account";
import { Tracking } from "./model/tracking";

// Connector must be exported as module property named connector
export const connector = async () => {

    // Get connector source config
    const config = await readConfig()

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const client = new IDNClient(config)

    return createConnector()
        .stdTestConnection(async (context: Context, input: undefined, res: Response<StdTestConnectionOutput>) => {
            const response: AxiosResponse = await client.testConnection();
            if (response.status != 200) {
                throw new ConnectorError('Unable to connect to IdentityNow');
            } else {
                res.send({});
            }
        })
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            const response1: AxiosResponse = await client.getAccountCreations();
            const response2: AxiosResponse = await client.getPasswordChanges();
            
            let accounts: Map<string,Account> = new Map<string,Account>();
            for (const ac of response1.data) {
                if(accounts.has(ac.target.name)) {
                    accounts.get(ac.target.name)?.addTracking(ac);
                } else {
                    accounts.set(ac.target.name, new Account(ac));
                }
            }

            for (const pc of response2.data) {
                if(accounts.has(pc.target.name)) {
                    accounts.get(pc.target.name)?.addTracking(pc);
                } else {
                    accounts.set(pc.target.name, new Account(pc));
                }
            }

            for(const account of accounts.values()) {
                res.send(account);
            }
        })
        .stdEntitlementList(async (context: Context, input: StdEntitlementListInput, res: Response<StdEntitlementListOutput>) => {
            const response1: AxiosResponse = await client.getAccountCreations();
            const response2: AxiosResponse = await client.getPasswordChanges();
            
            let trackings: Map<string,Tracking> = new Map<string,Tracking>();
            for (const ac of response1.data) {
                trackings.set(ac.id, new Tracking(ac, config.period));
            }
            for (const pc of response2.data) {
                trackings.set(pc.id, new Tracking(pc, config.period));
            }

            for(const tracking of trackings.values()) {
                res.send(tracking as StdEntitlementListOutput);
            }
        })
}
