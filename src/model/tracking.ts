import { Attributes, StdEntitlementReadOutput } from "@sailpoint/connector-sdk";

export class Tracking {
    identity: string;
    uuid: string;
    //type: string = "tracking";
    attributes: Attributes;

    constructor(object: any) {
        this.identity = object.id;
        this.uuid = `${object.attributes.accountName} (${object.attributes.sourceName})`;
        let date: string = '';
        let operation: string = '';

        this.attributes = {
            id : object.id,
            name : `${object.attributes.accountName} (${object.attributes.sourceName})`,
            sourceName : object.attributes.sourceName,
            accountName : object.attributes.accountName,
            lastPasswordChange : object.created,
            operation : 'password'
        };
    }
}