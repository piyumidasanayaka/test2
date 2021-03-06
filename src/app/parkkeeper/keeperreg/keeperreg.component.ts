import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { RegserviceService } from '../../servers/regservice.service';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import { FormControl } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { google } from '@google/maps';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ValidateService } from '../../servers/validate.service';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';

declare var google: any;
@Component({
  selector: 'app-keeperreg',
  templateUrl: './keeperreg.component.html',
  styleUrls: ['./keeperreg.component.scss']
})


export class KeeperregComponent implements OnInit {
  model = {
    url: "",
    PicUrl: ""

  }
  isloading=false
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  downloadURL: Observable<string>;
  profileUrl: Observable<string>;
  constructor(private validateService: ValidateService,
    private flashMessage: FlashMessagesService, public service: RegserviceService, public router: Router, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private afStorage: AngularFireStorage) { }

  name: String;
  username: String;
  email: String;
  password: String;
  mobileNum: String;
  NICnumber: String;
  parkName: String;
  numberOfSlots:Number
  openHours: String;
  alocatedSlots1: Number;
  hourCharge1: String;
  alocatedSlots2: Number;
  hourCharge2: String;
  alocatedSlots3: Number;
  hourCharge3: String;
  alocatedSlots4: Number;
  hourCharge4: String;
  alocatedSlots5: Number;
  hourCharge5: String;
  MaximumWeight: String;
  MaximumHeight: String;
  lat: String;
  lng: String;
  city: String;
  country: String;
  confirmPassword: String;
  zip: String;
  address: String
  docUrl: String


  iserror: boolean = false;
  res = '';
  serverErrorMessages = '';
  laat: number = null;
  lnng: number = null;
  zoom: number = 4;
  origin = { lat: this.laat, lng: this.lnng };
  destination = { lat: null, lng: null };
  public searchControl: FormControl;

  @ViewChild("search")
  public searchElementRef: ElementRef;


  ngOnInit() {
    this.searchControl = new FormControl();
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          types: [],
          componentRestrictions: { country: "LK" }
        }
      );
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.destination.lat = place.geometry.location.lat();
          this.destination.lng = place.geometry.location.lng();
          console.log(this.destination);
          this.lat = this.destination.lat;
          this.lng = this.destination.lng;
          // console.log(this.reg.lat)
        });
      });
    });
  }
  register() {
    const user = {
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password,
      mobileNum: this.mobileNum,
      NICnumber: this.NICnumber,
      parkName: this.parkName,
      numberOfSlots: this.numberOfSlots,
      openHours: this.openHours,
      alocatedSlots1: this.alocatedSlots1,
      hourCharge1: this.hourCharge1,
      alocatedSlots2: this.alocatedSlots2,
      hourCharge2: this.hourCharge2,
      alocatedSlots3: this.alocatedSlots3,
      hourCharge3: this.hourCharge3,
      alocatedSlots4: this.alocatedSlots4,
      hourCharge4: this.hourCharge4,
      alocatedSlots5: this.alocatedSlots5,
      hourCharge5: this.hourCharge5,
      MaximumWeight: this.MaximumWeight,
      MaximumHeight: this.MaximumHeight,
      role: "keeper",
      lat: this.lat,
      lng: this.lng,
      docUrl: this.docUrl
    }
    console.log(user)
    if (!this.validateService.validateRegister(user)) {
      this.flashMessage.show('Please fill in all fields', { cssClass: 'alert-danger', timeout: 3000 });
      return false;

    }



    ///Validate Email
    if (!this.validateService.validateEmail(user.email)) {

      this.flashMessage.show('Please use a valid email', { cssClass: 'alert-danger', timeout: 3000 });
      return false;

    }
    const token = this.service.getToken();
    const tokenPayload = decode(token);
    this.service.regkeeper(user, tokenPayload._id)
      .subscribe(
        (response) => {
          if (response) {
            this.res = response['status'];
            console.log(response)
            if (!this.res) {
              this.serverErrorMessages = 'Your email is already exists'
            } else {
              console.log(response)
              this.serverErrorMessages = "Registration Succsesfull";
              this.router.navigateByUrl('/user-profile/myparks');
            }
          }

        }
        ,
        (error) => {
          console.log(error); this.iserror = true;
          { if (error) this.serverErrorMessages = 'Your email is already exists'; }
        }
      );
  }


  public closeAlert() {
    this.iserror = false;
  }

  id = '';
  upload(event) {
    this.isloading=true
    const id = Math.random().toString(36).substring(2);
    this.ref = this.afStorage.ref(id);
    this.task = this.ref.put(event.target.files[0]);
    this.task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = this.ref.getDownloadURL())
    )
      .subscribe(
      );
    this.task.snapshotChanges().pipe(
      finalize(() => {
        this.ref.getDownloadURL().subscribe(PicUrl => {
          this.docUrl = PicUrl;
          console.log(this.docUrl)
          this.isloading=false
          // console.log(url); // <-- do what ever you want with the url..
          // const token = this.service.getToken();
          // const tokenPayload = decode(token);
          // this.id = tokenPayload._id;
          
          // this.pic=url;
        });
      })
    ).subscribe();
  }
message1=""
 validateNIC() 
{
    var nic = document.getElementById('NICnumber');
    var mesg = document.getElementById('message1');

     if (this.NICnumber.length != 14) {
       mesg.innerHTML="Length must be 14 characters";
    } else{
        mesg.innerHTML="Length is good";
    }
    }
}
