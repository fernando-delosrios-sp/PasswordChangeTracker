import { Attributes, StdEntitlementReadOutput } from "@sailpoint/connector-sdk";
import "@elastic/datemath";


export class Tracking {
    identity: string;
    uuid: string;
    //type: string = "tracking";
    attributes: Attributes;

    constructor(object: any, period: string) {
        const PASSWORDS: string = 'PASSWORD_ACTION_CHANGE_PASSED';
        const ACCOUNTS: string = 'ACCOUNT_CREATE_PASSED';
        this.identity = object.id;
        this.uuid = `${object.attributes.accountName} (${object.attributes.sourceName})`;
        let date: string = '';
        let operation: string = '';

        if (object.technicalName == PASSWORDS) {
            date = object.created;
            operation = 'password';
        }

        if (object.technicalName == ACCOUNTS) {
            const datemath = require('@elastic/datemath');
            date = datemath.parse(`now-${period}`, {forceNow: new Date(object.created)});
            operation = 'account';
        }

        this.attributes = {
            id : object.id,
            name : `${object.attributes.accountName} (${object.attributes.sourceName})`,
            sourceName : object.attributes.sourceName,
            accountName : object.attributes.accountName,
            lastPasswordChange : date,
            operation: operation
        };
    }
}