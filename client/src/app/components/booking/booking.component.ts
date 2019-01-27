import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ViewChild, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit, AfterViewInit {
  // Questions
  questionAnimals = 'Vor welchem Tier hast du (panische) Angst?'
  questionTechnologies = 'Bist du technikaffin? Wenn ja, mit welchen Geräten kennst du dich aus?'
  questionMovies = 'Welches Serien- oder Filmgenre magst du?'
  questionVacation = 'Welche Art des Urlaubs machst du gerne?'
  questionSports = 'Für welche Sportarten interessierst du dich?'

  // interests
  animals;
  technologies;
  movies;
  vacations;
  sports;

  selectedAnimals = [];
  selectedTechnologies = [];
  selectedMovies = [];
  selectedVacations = [];
  selectedSports = [];

  customAnimal;
  customTechnology;
  customMovie;
  customVacation;
  customSport;

  departureStation = [
    { value: 'HdM', label: 'Hochschule der Medien Eingang' },
    { value: 'Pavillon', label: 'Pavillon' },
  ];

  registerForm: FormGroup;
  finalForm: any;
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

  // camera properties
  isCameraMode = false;
  isDisclaimer = false;
  isBookingActive = false;
  imgData: any;
  @ViewChild('videoplayer') videoPlayer: any;
  @ViewChild('canvas') canvas: any;
  showVideo = false;
  context: any;
  @Input() width: number;
  @Input() height: number;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { }

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
    this.reloadComponent();
  }

  ngOnInit() {
    this.isBookingModalShown = false;
    this.isCompleteModalShown = false;
    this.isErrorModalShown = false;
    this.initInterests();

    this.width = 960;
    this.height = 540;

    this.registerForm = this.fb.group({
      datetime: ['', Validators.required],
      station: ['', Validators.required],
      passenger: this.fb.group({
        name: ['', Validators.required],
        instagram_profile: [''],
        image: ''
      })
    });
  }

  onStationChanged(station) {
    this.http.get('https://casi.one:3000/timeslot/' + station, { withCredentials: true })
      .subscribe((res) => {
        if (res instanceof Array) {
          this.timeslots = res.map((time) => {
            return time.datetime;
          });
        }
      },
      (err) => {
        this.timeslots = [];
      });
  }

  toggleCamera(post: FormGroup) {
    this.isCameraMode = !this.isCameraMode;
    this.populateCustomInterests();
    // this.isDisclaimer =  !this.isDisclaimer;
  }

  populateCustomInterests() {
    if (this.customAnimal && this.customAnimal.length) {
      this.selectedAnimals.push({ value: this.customAnimal, selected: true });
    }
    if (this.customTechnology && this.customTechnology.length) {
      this.selectedTechnologies.push({ value: this.customTechnology, selected: true });
    }
    if (this.customMovie && this.customMovie.length) {
      this.selectedMovies.push({ value: this.customMovie, selected: true });
    }
    if (this.customVacation && this.customVacation.length) {
      this.selectedVacations.push({ value: this.customVacation, selected: true });
    }
    if (this.customSport && this.customSport.length) {
      this.selectedSports.push({ value: this.customSport, selected: true });
    }
  }

  btnBook() {
    this.openBookingModal();
    let headerJson = {
      'Content-Type': 'application/json'
    };
    let headers = new HttpHeaders(headerJson);
    // // let headers = new HttpHeaders()
    // //   .set('Content-Type', 'application/json');
    let options = { headers: headers, withCredentials: true };
    this.http.post('https://casi.one:3000/booking/', this.finalForm, options)
      .subscribe((res) => {
        this.closeBookingModal();
        this.openCompleteModal();
      },
      (err) => {
        if (err.status === 200) {
          this.closeBookingModal();
          this.openCompleteModal();
        } else {
          let datetime = this.registerForm.get('datetime').value;
          let station = this.registerForm.get('station').value;
          let headerJson = { 'Content-Type': 'application/json' };
          let headers = new HttpHeaders(headerJson);
          let options = { headers: headers, body: { "datetime": datetime, "station": station }, withCredentials: true };
          this.http.request('delete', 'https://casi.one:3000/booking/', options)
            .subscribe((res: any) => {
              this.closeBookingModal();
              this.openErrorModal();
            },
            (err) => {
              if (err.status === 200) {
                this.closeBookingModal();
                this.openErrorModal();
              }
            });
        }
      });
  }

  cancelDisclaimer() {
    this.reloadComponent();
    this.isBookingActive = false;
  }

  openCameraView() {
    //this.isCameraMode = false;
    this.isBookingActive = true;
  }
  reloadComponent() {
    this.showVideo = !this.showVideo;
    this.isCameraMode = !this.isCameraMode;
    this.isBookingActive = !this.isBookingActive;
    // this.isDisclaimer =  !this.isDisclaimer;
    this.registerForm.reset();
    this.finalForm = null;
    this.initInterests();

    this.timeslots = [];
  }

  // Interests functions
  public handleAnimal(animal, i) {
    if (animal.selected) {
      this.selectedAnimals.splice(i, 1);
    } else {
      animal.selected = true;
      this.selectedAnimals.push(animal);
    }
  }

  public handleTechnologies(technology, i) {
    if (technology.selected) {
      this.selectedTechnologies.splice(i, 1);
    } else {
      technology.selected = true;
      this.selectedTechnologies.push(technology);
    }
  }

  public handleMovies(movies, i) {
    if (movies.selected) {
      this.selectedMovies.splice(i, 1);
    } else {
      movies.selected = true;
      this.selectedMovies.push(movies);
    }
  }

  public handleVacations(vacation, i) {
    if (vacation.selected) {
      this.selectedVacations.splice(i, 1);
    } else {
      vacation.selected = true;
      this.selectedVacations.push(vacation);
    }
  }

  public handleSports(sports, i) {
    if (sports.selected) {
      this.selectedSports.splice(i, 1);
    } else {
      sports.selected = true;
      this.selectedSports.push(sports);
    }
  }

  private initInterests() {
    this.animals = [
      { value: 'Spinne', selected: false },
      { value: 'Maus', selected: false },
      { value: 'Schlange', selected: false },
      { value: 'Kakerlaken', selected: false },
    ];
    this.technologies = [
      { value: 'Handy', selected: false },
      { value: 'Laptop', selected: false },
      { value: 'TV', selected: false },
      { value: 'Tablet', selected: false },
      { value: 'Foto', selected: false },
    ];
    this.movies = [
      { value: 'Thriller', selected: false },
      { value: 'Komödie', selected: false },
      { value: 'Sitcom', selected: false },
      { value: 'Anime', selected: false },
      { value: 'Action', selected: false },
      { value: 'Romanze', selected: false },
      { value: 'Horror', selected: false },
    ];
    this.vacations = [
      { value: 'Abenteuerurlaub', selected: false },
      { value: 'Strandurlaub', selected: false },
      { value: 'Partyurlaub', selected: false },
      { value: 'Sightseeing', selected: false },
      { value: 'Skiurlaub', selected: false },
    ];
    this.sports = [
      { value: 'Fußball', selected: false },
      { value: 'Leichtathletik', selected: false },
      { value: 'Motorsport', selected: false },
      { value: 'Basketball', selected: false },
      { value: 'Handball', selected: false },
      { value: 'Ski', selected: false },
    ];

    this.selectedAnimals = [];
    this.selectedTechnologies = [];
    this.selectedMovies = [];
    this.selectedVacations = [];
    this.selectedSports = [];

    this.customAnimal = null;
    this.customTechnology = null;
    this.customMovie = null;
    this.customVacation = null;
    this.customSport = null;
  }

  // Camera functions
  capture() {
    this.context.drawImage(this.videoPlayer.nativeElement, 0, 0);
    this.showVideo = true;
    this.imgData = this.canvas.nativeElement.toDataURL('image/jpeg');
    this.registerForm.get('passenger').get('image').setValue(this.imgData);
    this.isBookingActive = this.registerForm.get('passenger').get('image').valid;
    this.finalForm = this.registerForm.value;
    this.finalForm.passenger.interests = {
      animals: this.selectedAnimals.map((animal) => {
        return animal.value;
      }),
      technology: this.selectedTechnologies.map((animal) => {
        return animal.value;
      }),
      movies: this.selectedMovies.map((animal) => {
        return animal.value;
      }),
      vacations: this.selectedVacations.map((animal) => {
        return animal.value;
      }),
      sports: this.selectedSports.map((animal) => {
        return animal.value;
      })
    }
  }

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 540 }, audio: false })
        .then(stream => {
          // var video = document.querySelector('video');
          this.videoPlayer.nativeElement.srcObject = stream;
          this.videoPlayer.nativeElement.onloadedmetadata = (e) => {
            this.videoPlayer.nativeElement.play();
          };
          // this.videoPlayer.nativeElement.src = window.URL.createObjectURL(stream);
          // this.videoPlayer.nativeElement.play();
        });
    }
  }
}
