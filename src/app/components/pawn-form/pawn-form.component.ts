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

  pawnItem = signal<any>(ITEM_DATA);
  seletedCar = signal<boolean>(false);
  seleted = signal<any>(null);
  text = signal<string>('')
  constructor(
    private ds: DataService, 
    private fb: FormBuilder,
    private auth: AuthStore
  ){}
 

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  pawnForm = new FormGroup({
    fullName: new FormControl<any>(null, [Validators.required]),
    gender: new FormControl<GenderOption | null>(null, Validators.required),
    phoneNum: new FormControl<number | null>(null,[Validators.required, Validators.pattern('^[0-9]*$')]),
    idCard: new FormControl<number | null>(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
    address: new FormControl(''),
    pawnItem: new FormControl<any>(null, [Validators.required]),
    description: new FormControl(''),
    dateCreated: new FormControl<Date | null>(null, Validators.required),
    dateExpired: new FormControl<Date | null>(null, [Validators.required]),
    image: new FormControl<string | null>(null),
    phone: new FormControl<any>(null),
    car: new FormControl<any>(null),
    phoneId: new FormControl<any>(null, [Validators.required]),
    motor:new FormControl<any>(null),
    jewelry: new FormControl<any>(null),
    others: new FormControl<any>(null),
    plateNum: new FormControl<any>(null, [Validators.required]),
    brandName: new FormControl<any>(null, [Validators.required]),
    pawnPrice: new FormControl<string | null>(null, [Validators.required]),
    monthlyInterest: new FormControl<string | null>(null, [Validators.required]),

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
    const {
      fullName
    } = this.pawnForm.getRawValue();
    const toDay = new Date();
    
    const data: any = {
      key: this.ds.createKey(),
      created_at: serverTimestamp(),
      created_by: mapUser(this.auth?.profile),
      updated_at: serverTimestamp(),
      updated_by: mapUser(this.auth?.profile),
      date_key: toDateKey(toDay),
      status: STATUS_OBJ.ACTIVE,
      keywords: generateKeywords([fullName]),
      isDeleted: false,

      full_name: fullName,

    }
    console.log(data, 'data')

   
    }
  }
  
