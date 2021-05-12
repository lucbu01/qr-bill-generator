import SwissQRBill from 'swissqrbill/lib/browser';

export interface KeyValue {
    [key: string]: any
}

export interface Position extends KeyValue {
    discountAtSecondMember: string;
}

export interface InvoiceHeader {
    name: string;
    type: 'text' | 'number' | 'amount';
    mm?: number;
}

export interface Invoice {
    positions: Position[];
    members: KeyValue[];
}

export interface Debtor {
    debtor: SwissQRBill.debtor;
    invoices: Invoice[];
}

export interface FormInvoice {
    positions: Position[];
    members: File;
}

export interface Form {
    logo?: File;
    letterHead: string;
    title: string;

    textBeforeInvoice: string;
    textAfterInvoice: string;

    creditorName: string;
    creditorAddress: string;
    creditorZipCode: string;
    creditorCity: string;
    creditorIban: string;

    debtorNameDefinition: string;
    debtorAddressDefinition: string;
    debtorZipCodeDefinition: string;
    debtorCityDefinition: string;

    qrMessageDefinition: string;

    invoiceHeaders: InvoiceHeader[];

    invoices: FormInvoice[];
}
