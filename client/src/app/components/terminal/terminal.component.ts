import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {
  audio;
  terminalData;
  interestsKeys: string[];
  message: string;

  commands = [
    { label: 'Begrüßung: <passenger2>', value: 'Herzlich Willkommen an Bord des Autonomen Shattels <passenger2>. Mein Name ist CASI. In Kürze wird ein neuer Fahrgast hinzusteigen. Bei der Fahrt über den Campus wünschen wir dir eine angenehme Fahrt.' },
    { label: 'Begrüßung: <passenger1>', value: 'Herzlich Willkommen an Bord des Autonomen Shattels <passenger1>. Dein Mitfahrer für die nächsten Minuten ist <passenger2>. Ich bin Casi, die Sprachsteuerung und werde euch bei der Fahrt begleiten und versuchen sie so angenehm wie möglich zu gestalten.' },
    { label: 'Verabschiedung', value: 'Wir sind gleich am Ziel angekommen und ich hoffe ihr hattet eine angenehme Fahrt. Herzlichen Dank für eure Mitfahrt. Beim Ausstieg werden wir euch noch einige Fragen stellen und hoffen, dass Ihr euch dafür die Zeit nehmt. Auf Wiedersehen!' }
  ];
  instagram_interests = [
    { label: 'Natur', value: 'Was sind eure liebsten Fotomotive, wenn ihr euch in der Natur aufhaltet? Vielleicht könnt ihr euch gegenseitig inspirieren, wenn ihr euch darüber austauscht.' },
    { label: 'Städtereisen', value: 'Kennt ihr schon den Killesbergpark, den Birkenkopf oder die Grabkapelle auf dem Württemberg? Erzählt euch doch gegenseitig mal von euren Geheimtipps und Erlebnisse über Stuttgart und andere Städte.' },
    { label: 'Landschaftsreisen', value: 'Wo wart ihr schon so auf der Welt unterwegs? Erzählt euch doch gegenseitig mal von euren Reisen und was ihr dort tolles erlebt habt.' },
    {
      label: 'Food',
      value: `Was esst ihr denn gerne und wozu geht ihr dazu hin? Könnt ihr euch gegenseitig Empfehlungen geben?
Falls ihr Lust auf gute Burger habt, kann ich euch Hemingway’s Diner & Bar in Hemmingen,
Trible B - Beef Burger Brothers in Zuffenhausen und Daily Burger in Vaihingen empfehlen.`
    },
    { label: 'Soziales', value: 'Manche haben das Problem, dass sie in Stuttgart keine coolen Bars oder Clubs finden. Vielleicht könnt ihr euch ja gegenseitig Tipps für coole Locations geben.' },
    { label: 'Selfie/Beauty', value: 'Thermalbäder, Massagen, Bad Cannstatter Kureinrichtungen...Was macht ihr denn um euch zu entspannen? Gebt euch doch gegenseitig Entspannungstipps.' },
    { label: 'Photograpie/Kunst', value: 'Im Landesmuseum Württemberg findet zurzeit die Veranstaltung “Mord im Museum” statt. Welche Kunstformen interessieren euch denn?' },
  ];
  activities = [
    { label: 'Quiz', value: 'Ich habe ein spannendes Quiz für euch im Angebot. Ihr spielt zusammen gegen eine andere Gruppe. Wenn ihr gut abschneidet, bekommt ihr am Ende der Fahrt eine Belohnung von uns. Die Antworten könnt ihr auf dem Touch Bildschirm vor euch direkt antippen. Viel Spaß!' },
    { label: 'Gaming', value: 'Unser Shattel hat eine Konsole mit tollen Spielen zur Auswahl. Habt ihr Lust zusammen eine Runde zu zocken? Dafür müsst ihr den Pauwer-Schalter bei der Konsole auf Onn schalten. Das Spiel, für das ihr euch entschieden habt, wählt ihr mit Start aus. Wir haben zum Beispiel Mario Kart.' }
  ];

  common_interests = [];
  diverse_interests = [];

  commonInterestTexts = {
    animals: { label: 'Tiere: <animal>', value: 'Ihr habt beide angegeben, dass ihr <animal> nicht mögt. Erzählt euch doch gegenseitig mal eure schlimmsten Horrorgeschichten von diesen Tieren.' },
    technology: { label: 'Technik: <technology>', value: 'Ihr kennt euch beide mit <technology> aus. <passenger2> erzähl doch deinem Mitfahrer mal welches Modell du verwendest und was dir daran so gut gefällt.' },
    movies: { label: 'Serien/Filme: <movie>', value: 'Ihr interessiert euch beide für <movie>. <passenger1>, welchen Film oder welche Serie in diesem Genre kannst du <passenger2> empfehlen und warum.' },
    vacations: { label: 'Urlaub: <vacation>', value: 'Ihr macht gerne <vacation>. Habt ihr für den anderen Tipps für tolle Urlaubsziele oder Unternehmungen?' },
    sports: { label: 'Sport: <sport>', value: 'Ihr mögt beide <sport>. Erzählt euch doch gegenseitig ob ihr die Sportart nur gerne anschaut, oder ob ihr euch in dieser auch aktiv betätigt.' }
  }
  diverseInterestsTexts = {
    vacations: { label: 'Urlaub', value: 'Ihr seid beide völlig unterschiedliche Urlaubstypen. Erzählt euch doch was euch an eurer Art des Urlaubs so gut gefällt.' },
    sports: { label: 'Sport', value: 'Ihr interessiert euch beide für unterschiedliche Sportarten. Erzählt euch doch, was euch an eurer Sportart so gut gefällt und ob ihr sie nur anschaut oder auch selber betreibt.' },
  };

  passengerPlaceholders;

  text = 'Bitte einen Text auswählen/verfassen...';

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  getPassengerInterests(i, interestKey) {
    return this.terminalData.passengers[i].interests[interestKey];
  }

  getMatchedInterests(interestKey) {
    return this.terminalData.interests[interestKey];
  }

  populateCommonInterests(property: string, placeholder: string) {
    if (this.terminalData.interests[property] && this.terminalData.interests[property].length) {
      this.terminalData.interests[property].forEach((el) => {
        let a = Object.assign({}, this.commonInterestTexts[property]);
        if (a.label.indexOf(placeholder) !== -1) {
          a.label = a.label.replace(placeholder, el);
        }
        this.passengerPlaceholders.forEach((pp) => {
          if (a.value.indexOf(pp.value) !== -1) {
            a.value = a.value.replace(pp.value, pp.replace);
          }
        })
        if (a.value.indexOf(placeholder) !== -1) {
          a.value = a.value.replace(placeholder, el);
          this.common_interests.push(a);
        }
      });
    }
  }

  ngOnInit() {
    this.route.params
      .subscribe((params) => {
        this.http.get('https://casi.one:3000/terminal/get/' + params['ids'], { withCredentials: true })
          .subscribe((res: any) => {
            this.terminalData = res;
            console.log('terminalData', this.terminalData);
            this.interestsKeys = Object.keys(res.interests);
            this.passengerPlaceholders = [
              { value: '<passenger1>', replace: this.terminalData.passengers[0].name.split(' ')[0] },
              { value: '<passenger2>', replace: this.terminalData.passengers[1].name.split(' ')[0] }
            ];
            this.passengerPlaceholders.forEach((placeholder) => {
              this.commands.forEach((command, i) => {
                let index = command.label.indexOf(placeholder.value);
                if (index !== -1) {
                  this.commands[i].label = command.label.replace(placeholder.value, placeholder.replace);
                }
                index = command.value.indexOf(placeholder.value);
                if (index !== -1) {
                  this.commands[i].value = command.value.replace(placeholder.value, placeholder.replace);
                }
              });
            });
            let commonInterestsPlaceholders = [
              { placeholder: '<animal>', property: 'animals' },
              { placeholder: '<technology>', property: 'technology' },
              { placeholder: '<movie>', property: 'movies' },
              { placeholder: '<vacation>', property: 'vacations' },
              { placeholder: '<sport>', property: 'sports' }
            ];
            commonInterestsPlaceholders.forEach((el) => {
              this.populateCommonInterests(el.property, el.placeholder);
            });
            if (!this.terminalData.interests.vacations.length) {
              this.diverse_interests.push(this.diverseInterestsTexts.vacations);
            }
            if (!this.terminalData.interests.sports.length) {
              this.diverse_interests.push(this.diverseInterestsTexts.sports);
            }
          },
          (err) => {
          });
      });
  }

  onSelect(text: string) {
    this.text = text;
  }

  synthesize() {
    let headerJson = {
      'Content-Type': 'application/json'
    };
    let headers = new HttpHeaders(headerJson);
    let options = { headers: headers, withCredentials: true };
    this.http.post('https://casi.one:3000/tts/', { message: this.text }, options)
      .subscribe((audio: any) => {
        this.audio = audio.stream;
      });
  }

}
