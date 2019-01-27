import { substitutes } from '../passengers/passengers';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-terminal-table',
  templateUrl: './terminal-table.component.html',
  styleUrls: ['./terminal-table.component.scss']
})
export class TerminalTableComponent implements OnInit {
  bookingError: boolean = false;
  substitutes;
  sub: any
  modalRef: BsModalRef;
  index1: number;
  index2: number;
  datetime: number;
  station: string;

  timeslots = [];

  @ViewChild('bookingModal') bookingModal: ModalDirective;
  @ViewChild('completeModal') completeModal: ModalDirective;
  @ViewChild('errorModal') errorModal: ModalDirective;
  public isBookingModalShown: boolean;
  public isCompleteModalShown: boolean;
  public isErrorModalShown: boolean;

  bookingModalConfig = {
    show: true,
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };

  modalConfig = {
    show: true,
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };

  constructor(private router: Router, private http: HttpClient, private modalService: BsModalService) {
    this.substitutes = substitutes;
  }

  openBookingModal() {
    this.isBookingModalShown = true;
  }

  closeBookingModal() {
    this.bookingModal.hide();
  }

  onBookingModalHidden() {
    this.isBookingModalShown = false;
  }

  openCompleteModal() {
    this.isCompleteModalShown = true;
  }

  closeCompleteModal() {
    this.completeModal.hide();
  }

  onCompleteModalHidden() {
    this.isCompleteModalShown = false;
    this.reloadComponent();
  }

  openErrorModal() {
    this.isErrorModalShown = true;
  }

  closeErrorModal() {
    this.errorModal.hide();
  }

  onErrorModalHidden() {
    this.isErrorModalShown = false;
  }

  reloadComponent() {
    location.reload();
  }

  ngOnInit() {
    console.log('substitutes', this.substitutes);
    this.http.get('https://casi.one:3000/terminal/timeslots', { withCredentials: true })
      .subscribe((res: any) => {
        this.timeslots = res;
      },
      (err) => {
      });
  }

  loadTimeslot(t1: string, t2: string) {
    this.router.navigate(['/terminal', [t1, t2].join('-')]);
  }

  openModal(template: TemplateRef<any>, datetime: number, station: string, i: number, j: number) {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
    this.datetime = datetime;
    this.station = station;
    this.index1 = i;
    this.index2 = j;
  }

  confirmDelete() {
    let headerJson = { 'Content-Type': 'application/json' };
    let headers = new HttpHeaders(headerJson);
    let options = { headers: headers, body: { "datetime": this.datetime, "station": this.station }, withCredentials: true };
    this.http.request('delete', 'https://casi.one:3000/booking/', options)
      .subscribe((res: any) => {
        this.timeslots[this.index1][this.index2].activity = null;
        this.timeslots[this.index1][this.index2].passenger.name = null;
        this.hideModal();
      },
      (err) => {
        if (err.status === 200) {
          this.timeslots[this.index1][this.index2].activity = null;
          this.timeslots[this.index1][this.index2].passenger.name = null;
          this.hideModal();
        }
      });
  }

  declineDelete() {
    this.hideModal();
  }

  hideModal() {
    this.index1 = null;
    this.index2 = null;
    this.datetime = null;
    this.station = null;
    this.modalRef.hide();
  }

  onSubstitute(form: any, timeslot: Array<any>) {
    this.openBookingModal();
    form = JSON.parse(form);
    let data = timeslot.filter((t) => t.passenger.name === null)[0];
    form.station = data.station;
    form.datetime = data.datetime;
    let headerJson = {
      'Content-Type': 'application/json'
    };
    let headers = new HttpHeaders(headerJson);
    let options = { headers: headers, withCredentials: true };
    this.http.post('https://casi.one:3000/booking/', form, options)
      .subscribe((res) => {
        this.closeBookingModal();
        this.openCompleteModal();
      },
      (err) => {
        if (err.status === 200) {
          this.closeBookingModal();
          this.openCompleteModal();
        } else {
          this.closeBookingModal();
          this.openErrorModal();
        }
      });
  }


}
