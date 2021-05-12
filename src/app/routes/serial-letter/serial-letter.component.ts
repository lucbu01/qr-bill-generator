import { Component } from '@angular/core';
import SwissQRBill from 'swissqrbill/lib/browser';
import moment from 'moment';
import {
  Debtor,
  Form,
  FormInvoice,
  Position,
  KeyValue,
} from 'src/app/models/models';
import { FileUtils } from 'src/app/utils/file';
import { DefinitionParser } from 'src/app/utils/definition-parser';
import { MatDialog } from '@angular/material/dialog';
import { ViewPdfDialogComponent } from './view-pdf-dialog/view-pdf-dialog.component';

@Component({
  selector: 'qr-serial-letter',
  templateUrl: './serial-letter.component.html',
  styleUrls: ['./serial-letter.component.scss'],
})
export class SerialLetterComponent {
  debtors: Debtor[];
  form: Form;

  constructor(private dialog: MatDialog) {
    this.new();
  }

  new() {
    this.form = {
      logo: undefined,
      letterHead:
        'Pfadi Muster\nMax Muster\nMusterstrasse\n6000 Luzern\n\nmax@muster.ch\n+41 79 123 45 67',
      title: 'Jahresbeitrag Pfadi Muster',
      textBeforeInvoice: 'Liebe Familie [Nachname]',
      textAfterInvoice: 'Zahlbar innert 14 Tagen.\n\nHerzliche Grüsse',
      creditorName: 'Pfadi Muster',
      creditorAddress: 'Postfach',
      creditorZipCode: '6000',
      creditorCity: 'Luzern',
      creditorIban: 'CH5204835012345671000',
      debtorNameDefinition: 'Familie [Nachname]',
      debtorAddressDefinition: '[Adresse]',
      debtorZipCodeDefinition: '[PLZ]',
      debtorCityDefinition: '[Ort]',
      qrMessageDefinition: 'Jahresbeitraege',
      invoiceHeaders: [
        { name: 'Rechnung', type: 'text' },
        { name: 'Betrag', type: 'amount', mm: 30 },
      ],
      invoices: [
        {
          positions: [
            {
              Rechnung: 'Jahresbeitrag [Pfadiname ?: Vorname]',
              Betrag: 60,
              discountAtSecondMember: '0',
            },
          ],
          members: undefined,
        },
      ],
    };
  }

  addPosition(invoice: FormInvoice) {
    const position = { discountAtSecondMember: '0' };
    this.form.invoiceHeaders.forEach((header) => {
      if (header.type === 'text') {
        position[header.name] = 'Rechnungsposition';
      } else {
        position[header.name] = 0;
      }
    });
    invoice.positions.push(position);
  }

  deletePosition(invoice: FormInvoice, position: Position) {
    invoice.positions.splice(invoice.positions.indexOf(position), 1);
  }

  addInvoice() {
    const invoice = { members: undefined, positions: [] };
    this.addPosition(invoice);
    this.form.invoices.push(invoice);
  }

  deleteInvoice(invoice: FormInvoice) {
    this.form.invoices.splice(this.form.invoices.indexOf(invoice), 1);
  }

  logo: string;

  async readFiles() {
    this.debtors = [];

    for (let index = 0; index < this.form.invoices.length; index++) {
      const invoice = this.form.invoices[index];
      if (invoice.members && invoice.positions.length) {
        const listFile: File = <File>invoice.members;
        const data: { [key: string]: string }[] = await FileUtils.readExcel(
          listFile
        );

        data.forEach((member) => {
          const debtor: SwissQRBill.debtor = {
            name: DefinitionParser.parse(
              this.form.debtorNameDefinition,
              member
            ),
            address: DefinitionParser.parse(
              this.form.debtorAddressDefinition,
              member
            ),
            zip: DefinitionParser.parse(
              this.form.debtorZipCodeDefinition,
              member
            ),
            city: DefinitionParser.parse(
              this.form.debtorCityDefinition,
              member
            ),
            country: 'CH',
          };
          const stringified = JSON.stringify(debtor);
          const foundDebtor = this.debtors.find(
            (item) => JSON.stringify(item.debtor) === stringified
          );
          if (foundDebtor) {
            const foundInvoice = foundDebtor.invoices[index];
            if (foundInvoice) {
              foundInvoice.members.push(member);
            } else {
              foundDebtor.invoices.push({
                positions: invoice.positions,
                members: [member],
              });
            }
          } else {
            this.debtors.push({
              debtor,
              invoices: [{ positions: invoice.positions, members: [member] }],
            });
          }
        });
      }
    }

    if (this.form.logo) {
      const logoFile: File = <File>this.form.logo;
      this.logo = await FileUtils.readFileAsDataUrl(logoFile);
      this.generatePdf();
    } else {
      this.generatePdf();
    }
  }

  generatePdf(): void {
    const data: SwissQRBill.data = {
      currency: 'CHF',
      amount: 60,
      message: 'Message',
      additionalInformation: 'Message',
      creditor: {
        name: this.form.creditorName,
        zip: this.form.creditorZipCode,
        city: this.form.creditorCity,
        address: this.form.creditorAddress,
        account: this.form.creditorIban,
        country: 'CH',
      },
      debtor: {
        name: 'Deb',
        address: 'Adr',
        zip: 6000,
        city: 'Luzern',
        country: 'CH',
      },
    };

    const stream = new SwissQRBill.BlobStream();

    const pdf = new SwissQRBill.PDF(data, stream, {
      autoGenerate: false,
      size: 'A4',
    });

    pdf.info.Author = this.form.creditorName;
    pdf.info.Creator = this.form.creditorName;
    pdf.info.Producer = this.form.creditorName;
    pdf.info.Title = this.form.title;

    this.debtors.forEach((debtor, index) => {
      this.addDebtor(debtor, pdf, data, index === 0);
    });

    pdf.end();

    pdf.on('finish', () => {
      this.dialog.open(ViewPdfDialogComponent, { data: stream });
    });
  }

  async addDebtor(
    debtor: Debtor,
    pdf: SwissQRBill.PDF,
    data: SwissQRBill.data,
    first: boolean = false
  ) {
    if (!first) {
      pdf.addPage();
    }

    data.additionalInformation = DefinitionParser.parse(
      this.form.qrMessageDefinition,
      debtor.invoices[0].members[0]
    );
    data.message = data.additionalInformation;

    data.debtor = debtor.debtor;

    let amount: number = 0;
    const amountHeader = this.form.invoiceHeaders.find(
      (h) => h.type === 'amount'
    );
    const positionRows: SwissQRBill.PDFRow[] = [];
    debtor.invoices.forEach((invoice) => {
      invoice.positions.forEach((position) => {
        invoice.members.forEach((member, memberIndex) => {
          let posAmount = DefinitionParser.parseNumber(
            position[amountHeader.name],
            member
          );
          if (memberIndex > 0) {
            posAmount -= DefinitionParser.parseNumber(
              position.discountAtSecondMember,
              member
            );
          }
          amount += posAmount;
          positionRows.push(this.printPosition(position, member, memberIndex));
        });
      });
    });

    data.amount = amount;

    if (this.logo) {
      pdf.image(
        this.logo,
        SwissQRBill.utils.mmToPoints(155),
        SwissQRBill.utils.mmToPoints(15),
        {
          align: 'right',
          fit: [
            SwissQRBill.utils.mmToPoints(35),
            SwissQRBill.utils.mmToPoints(35),
          ],
        }
      );
    }

    pdf.fontSize(10);
    pdf.fillColor('black');
    pdf.font('Helvetica');
    pdf.text(
      'Pfadi Rain\nLuca Bucher\nScheid 1\n6026 Rain\n\n+41 79 664 10 72\nlucbu01@bluewin.ch',
      SwissQRBill.utils.mmToPoints(20),
      SwissQRBill.utils.mmToPoints(15),
      {
        width: SwissQRBill.utils.mmToPoints(100),
        align: 'left',
      }
    );

    pdf.fontSize(11);
    pdf.text(
      data.debtor.name +
        '\n' +
        data.debtor.address +
        '\n' +
        data.debtor.zip +
        ' ' +
        data.debtor.city,
      SwissQRBill.utils.mmToPoints(130),
      SwissQRBill.utils.mmToPoints(60),
      {
        width: SwissQRBill.utils.mmToPoints(70),
        align: 'left',
      }
    );

    pdf.text(
      moment().locale('de').format(`[${this.form.creditorCity},] D. MMMM YYYY`),
      SwissQRBill.utils.mmToPoints(20),
      SwissQRBill.utils.mmToPoints(80),
      {
        width: SwissQRBill.utils.mmToPoints(170),
        align: 'left',
      }
    );
    pdf.text('\n');

    pdf.fontSize(12);
    pdf.font('Helvetica-Bold');
    pdf.text(
      DefinitionParser.parse(this.form.title, debtor.invoices[0].members[0]),
      {
        width: SwissQRBill.utils.mmToPoints(170),
      }
    );

    pdf.fontSize(11);
    pdf.font('Helvetica');
    pdf.text('\n');

    pdf.text(
      DefinitionParser.parse(
        this.form.textBeforeInvoice,
        debtor.invoices[0].members[0]
      ),
      {
        width: SwissQRBill.utils.mmToPoints(170),
      }
    );

    pdf.text('\n');

    const table: SwissQRBill.PDFTable = {
      font: 'Helvetica',
      padding: 0,
      width: SwissQRBill.utils.mmToPoints(170),
      lineWidth: 0,
      rows: [this.printHeader(), ...positionRows, this.printFooter(amount)],
    };

    pdf.addTable(table);

    pdf.font('Helvetica');
    pdf.fontSize(11);

    pdf.text('\n');

    pdf.text(
      DefinitionParser.parse(
        this.form.textAfterInvoice,
        debtor.invoices[0].members[0]
      ),
      SwissQRBill.utils.mmToPoints(20),
      undefined,
      {
        width: SwissQRBill.utils.mmToPoints(170),
      }
    );

    if (pdf.y > SwissQRBill.utils.mmToPoints(190)) {
      pdf.addPage();
    }

    pdf.addQRBill();
  }

  printHeader(): SwissQRBill.PDFRow {
    const amount = this.form.invoiceHeaders.find((h) => h.type === 'amount');
    const columns: SwissQRBill.PDFColumn[] = this.form.invoiceHeaders
      .filter((h) => h.type !== 'amount')
      .map((header) => {
        return {
          text: header.name,
          width: header.mm
            ? SwissQRBill.utils.mmToPoints(header.mm)
            : undefined,
          textOptions: {
            align: header.type === 'text' ? undefined : 'right',
          },
        };
      });
    columns.push({
      text: amount.name,
      width: amount.mm ? SwissQRBill.utils.mmToPoints(amount.mm) : undefined,
      textOptions: {
        align: 'right',
      },
    });
    return {
      font: 'Helvetica-Bold',
      columns,
    };
  }

  printPosition(
    position: Position,
    member: KeyValue,
    memberIndex: number
  ): SwissQRBill.PDFRow {
    const amount = this.form.invoiceHeaders.find((h) => h.type === 'amount');
    const columns: SwissQRBill.PDFColumn[] = this.form.invoiceHeaders
      .filter((h) => h.type !== 'amount')
      .map((header) => {
        return {
          text:
            header.type === 'text'
              ? DefinitionParser.parse(position[header.name], member)
              : SwissQRBill.utils.formatAmount(
                  DefinitionParser.parseNumber(position[header.name], member)
                ),
          width: header.mm
            ? SwissQRBill.utils.mmToPoints(header.mm)
            : undefined,
          textOptions: {
            align: header.type === 'text' ? undefined : 'right',
          },
        };
      });
    columns.push({
      text: SwissQRBill.utils.formatAmount(
        memberIndex > 0
          ? DefinitionParser.parseNumber(position[amount.name], member) -
              DefinitionParser.parseNumber(
                position.discountAtSecondMember,
                member
              )
          : DefinitionParser.parseNumber(position[amount.name], member)
      ),
      width: amount.mm ? SwissQRBill.utils.mmToPoints(amount.mm) : undefined,
      textOptions: {
        align: 'right',
      },
    });
    return {
      font: 'Helvetica',
      columns,
    };
  }

  printFooter(amount: number): SwissQRBill.PDFRow {
    const amountHeader = this.form.invoiceHeaders.find(
      (h) => h.type === 'amount'
    );

    return {
      font: 'Helvetica-Bold',
      columns: [
        {
          text: 'TOTAL',
        },
        {
          text: SwissQRBill.utils.formatAmount(amount),
          width: amountHeader.mm
            ? SwissQRBill.utils.mmToPoints(amountHeader.mm)
            : undefined,
          textOptions: {
            align: 'right',
          },
        },
      ],
    };
  }
}
