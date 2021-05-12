import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import SwissQRBill from 'swissqrbill/lib/browser';

@Component({
  selector: 'qr-view-pdf-dialog',
  templateUrl: './view-pdf-dialog.component.html',
  styleUrls: ['./view-pdf-dialog.component.scss']
})
export class ViewPdfDialogComponent implements AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: SwissQRBill.BlobStream) {}

  ngAfterViewInit(): void {
    const iframe = document.getElementById('view-pdf-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = this.data.toBlobURL('application/pdf');
      console.log('PDF has been successfully created.');
    }
  }

}
