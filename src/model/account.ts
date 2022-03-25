
import { Attributes, StdAccountReadOutput } from "@sailpoint/connector-sdk";
import { Tracking } from "./tracking";


export class Account {
    identity: string;
    uuid: string;
    attributes: Attributes;

    constructor(object: any) {
        this.identity = object.target.name;
        this.uuid = object.target.name;
        this.attributes = {
            name : object.target.name,
            tracking: [object.id]
        };
    }

    addTracking(object: any) {
        let tracking: string[] = this.attributes.tracking as string[];
        tracking.push(object.id);
    }
}