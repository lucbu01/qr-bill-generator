import { Component, OnInit } from '@angular/core';
import { CLIENT_VERSION } from '../../client-version';
import * as moment from 'moment';

@Component({
  selector: 'qr-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  version: string;
  created: string;

  constructor() { }

  ngOnInit(): void {
    this.version = CLIENT_VERSION.version;
    if (moment(CLIENT_VERSION.timestamp).isValid()) {
      this.created = moment(CLIENT_VERSION.timestamp).format('DD.MM.YYYY HH:mm:ss');
    } else {
      this.created = CLIENT_VERSION.timestamp;
    }
  }

}
