import { serverTimestamp } from '@angular/fire/firestore';
import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter} from '@angular/material/core';
import { MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { GENDER_DATA, ITEM_DATA, STATUS_OBJ } from '../../shared/dummy/config';
import { DataService } from '../../shared/services/data.service';
import { sign } from 'crypto';
import { generateKeywords, toDateKey } from '../../shared/services/convert.service';
import { mapUser } from '../../shared/services/mapping.service';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import {MatSnackBar} from '@angular/material/snack-bar';

interface GenderOption {
  key: number;
  text: string;
  en_name: string;

}
@Component({
  selector: 'app-pawn-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIcon,
    MatAutocompleteModule
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './pawn-form.component.html',
  styleUrl: './pawn-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class PawnFormComponent {

 

  genders = signal<any>(GENDER_DATA);

  pawn_type = signal<any>(ITEM_DATA);
  seletedCar = signal<boolean>(false);
  seleted = signal<any>(null);
  text = signal<string>('');
  loading = signal<boolean>(false);
  
  constructor(
    private ds: DataService, 
    private fb: FormBuilder,
    private auth: AuthStore,
    private store: PawnStore,
    private snackBar: MatSnackBar
  ){}
 

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  pawnForm = new FormGroup({
    full_name: new FormControl<any>(null, [Validators.required]),
    gender: new FormControl<GenderOption | null>(null, Validators.required),
    phone_number: new FormControl<number | null>(null,[Validators.required, Validators.pattern('^[0-9]*$')]),
    id_card: new FormControl<number | null>(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
    address: new FormControl(''),
    pawn_type: new FormControl<any>(null, [Validators.required]),
    description: new FormControl(''),
    // dateCreated: new FormControl<Date | null>(null, Validators.required),
    date_expired: new FormControl<Date | null>(null, [Validators.required]),
    photo: new FormControl<string | null>(null),
    type_phone: new FormControl<any>(null),
    type_car: new FormControl<any>(null),
    type_phone_id: new FormControl<any>(null, [Validators.required]),
    type_motor: new FormControl<any>(null),
    type_jewelry_name: new FormControl<any>(null),
    others: new FormControl<any>(null),
    plate_number: new FormControl<any>(null, [Validators.required]),
    brand_name: new FormControl<any>(null, [Validators.required]),
    gold_weight: new FormControl<any>(null, [Validators.required]),
    price_pawn: new FormControl<number | null>(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
    price_interest: new FormControl<number | null>(null, [Validators.required, Validators.pattern('^[0-9]*$')]),


  // pawnForm = new FormGroup({
  //   fullName: new FormControl<any>(null, [Validators.required]),
  //   gender: new FormControl<GenderOption | null>(null, Validators.required),
  //   phoneNum: new FormControl<number | null>(null,[Validators.required, Validators.pattern('^[0-9]*$')]),
  //   idCard: new FormControl<number | null>(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
  //   address: new FormControl(''),
  //   pawnItem: new FormControl<any>(null, [Validators.required]),
  //   description: new FormControl(''),
  //   dateCreated: new FormControl<Date | null>(null, Validators.required),
  //   dateExpired: new FormControl<Date | null>(null, [Validators.required]),
  //   image: new FormControl<string | null>(null),
  //   phone: new FormControl<any>(null),
  //   car: new FormControl<any>(null),
  //   phoneId: new FormControl<any>(null, [Validators.required]),
  //   motor:new FormControl<any>(null),
  //   jewelry: new FormControl<any>(null),
  //   others: new FormControl<any>(null),
  //   plateNum: new FormControl<any>(null, [Validators.required]),
  //   brandName: new FormControl<any>(null, [Validators.required]),
  //   pawnPrice: new FormControl<string | null>(null, [Validators.required]),
  //   monthlyInterest: new FormControl<string | null>(null, [Validators.required]),

  });
  

  ngOnInit(){
  }

  selectItem(item: any){
    this.seleted.set(item)
  }

  displayGender = (item: any) => {
    return item?.text;
  };

  displayItem = (item: any) => {
    return item?.text;
  };

  imagePreview: string[] = [];

  onImageUpload(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      // Loop through selected files
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.push(reader.result as string); // Add image preview to array
        };
        reader.readAsDataURL(file); // Read file as DataURL for preview
      }
    }
  }
  clearPreviews() {
    this.imagePreview = []; // Clear image previews
  }

  onSubmit() {
    // if(this.pawnForm.invalid){
    //   alert('សូមបញ្ចូលព័ត៍មាន');
    //   return
    // }
    this.loading.set(true);
    const {
      full_name,
      phone_number,
      gender,
      id_card,
      address,
      pawn_type,
      description,
      date_expired,
      photo,
      type_phone,
      type_phone_id,
      type_car,
      type_motor,
      type_jewelry_name,
      others,
      plate_number,
      brand_name,
      gold_weight,
      price_pawn,
      price_interest,
    } = this.pawnForm.getRawValue();
    const toDay = new Date();
    
    const data: any = {
      key: this.ds.createKey(),
      
      created_at: serverTimestamp() ,
      created_by: mapUser(this.auth?.profile),
      updated_at: serverTimestamp(),
      updated_by: mapUser(this.auth?.profile),
      date_key: toDateKey(toDay),
      status: STATUS_OBJ.ACTIVE,
      keywords: generateKeywords([full_name]),
      isDeleted: false,

      full_name: full_name,
      phone_number: phone_number,
      pawn_type: pawn_type,
      gender: gender,
      id_card: id_card,
      address: address,
      description: description,
      date_expired: date_expired,
      photo: photo,
      type_phone: type_phone,
      type_phone_id:type_phone_id,
      type_car: type_car,
      type_motor: type_motor,
      type_jewelry_name:type_jewelry_name,
      others: others,
      plate_number: plate_number,
      brand_name: brand_name,
      gold_weight: gold_weight,
      price_pawn: price_pawn,
      price_interest: price_interest,
    }
    console.log(data, 'data')

    this.store.createCustomer(data, (success, result) => {
      if (success) {
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានជោគជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.loading.set(false);
      } else {
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានបរាជ័យ`, "ជោគជ័យ", { duration: 3000 });
        this.loading.set(false);
      }
    });

  }
}
