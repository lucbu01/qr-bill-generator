import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as XLSX from 'xlsx';
import { KeyValue } from "../models/models";

export class FileUtils {

    static readExcel(file: File): Promise<KeyValue[]> {
        return this.read<string>(reader => reader.readAsBinaryString(file)).pipe(
            map(result => {
                const wb: XLSX.WorkBook = XLSX.read(result, { type: 'binary' });
                
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                /* save data */
                const data: { [key: string]: string }[] = XLSX.utils.sheet_to_json(ws);

                return data;
            })
        ).toPromise();
    }

    static readFileAsDataUrl(file: File): Promise<string> {
        return this.read<string>(reader => reader.readAsDataURL(file)).toPromise();
    }

    private static read<T>(readerFunc: (reader: FileReader) => void): Observable<T> {
        return new Observable<T>((subscriber) => {
            try {
                const reader = new FileReader();

                reader.onload = (e: any) => {
                    subscriber.next(e.target.result);
                    subscriber.complete();
                };

                readerFunc(reader);
            } catch (e) {
                subscriber.error(e);
                subscriber.complete();
            }
        });
    }

}