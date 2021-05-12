import { KeyValue } from "../models/models";

export class DefinitionParser {

    static parseNumber(definition: string, member: KeyValue): number {
        try {
            return parseFloat(DefinitionParser.parse(`${definition}`, member));
        } catch (e) {
            return 0;
        }
    }

    static parse(definition: string, member: KeyValue): string {
        return definition.trim().replace(/\[([^\]]+)\]/g, (_substring, propertyDef) => this.extractProperty(propertyDef, member));
    }

    private static extractProperty(propertyDef: string, member: KeyValue): any {
        if (/.+\?\:.+/.test(propertyDef)) {
            const res = /(.+)\?\:(.+)/.exec(propertyDef);
            return this.oneOrOther(res[1].trim(), res[2].trim(), member);
        } else {
            return member[propertyDef.trim()];
        }
    }

    private static oneOrOther(prop1: string, prop2: string, member: KeyValue) {
        return member[prop1] ? member[prop1] : member[prop2];
    }
}