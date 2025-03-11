import { docData, serverTimestamp } from '@angular/fire/firestore';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FireStorageService } from '../../shared/services/fire-storage.service';

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
    MatAutocompleteModule,
    NgClass,
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
  routeUnSubscribe = signal<any>(Subscription);
  data = signal<any>(null);

  message: string = '';
  preview: string = '';
  progress: number = 0;
  selectedFiles: any;
  currentFile: any;
  upload = true;
  image = false;
  dragOver:boolean = false;

  @ViewChild('inputFile') inputFile!: ElementRef;
  
  constructor(
    private ds: DataService, 
    private fb: FormBuilder,
    private auth: AuthStore,
    private store: PawnStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private storage: FireStorageService
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
    address: new FormControl<any>(null, [Validators.required]),
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

    file: new FormControl<any>(null),
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
    
    this.routeUnSubscribe.set(
        this.route.params.subscribe(async (param) => {
          let paramKey = param['id'];
          const getData = await this.store.getCustomer(paramKey);
          this.data.set(getData);
          if(this.data()){
            this.pawnForm.patchValue({
              full_name: getData?.full_name,
              phone_number: getData?.phone_number,
              gender: getData?.gender,
              id_card: getData?.id_card,
              address: getData?.address,

              pawn_type: getData?.pawn_type,

              type_phone: this.seleted(),
              type_phone_id: this.seleted(),
              type_car: this.seleted(),
              type_motor: this.seleted(),
              type_jewelry_name: this.seleted(),
              gold_weight: this.seleted(),
              others: this.seleted(),

              plate_number: getData?.plate_number,
              brand_name: getData?.brand_name,
              price_pawn: getData?.price_pawn,
              price_interest: getData?.price_interest,
              description: getData?. description,
              date_expired: getData?.date_expired,

              
            })
          }
          if (this.data()?.photo) {
            const currentValidators = this.pawnForm.controls.file.validator
              ? this.pawnForm.controls.file.validator({} as AbstractControl)?.['validatorFn'] || []
              : [];
            const filteredValidators = currentValidators.filter(
              (v: any) => v !== Validators.required
            );
            this.pawnForm.controls.file.setValidators(filteredValidators);
            this.pawnForm.controls.file.updateValueAndValidity();
          }
          
          this.preview = this.data()?.photo?.downloadUrl;
          this.image = !!this.preview;
          this.upload = !this.image;
        }
      )
    )

 
  }

  onFileDrop(event: any): void {
    event.preventDefSault();

    this.selectedFiles = event?.dataTransfer?.files;
    this.selectFile({ target: { files: this.selectedFiles } });
    this.dragOver = false;
  }

  onDragOver(event: any): void {
    event.preventDefault();
    this.dragOver = event;
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    this.dragOver = false; 
  }

  closeImage() {
    this.image = false;
    this.preview = '';
    this.selectedFiles = null;
    this.upload = true;
  }

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    this.progress = 0;
    this.selectedFiles = event?.target?.files;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles[0];

      if (file) {
        this.preview = '';
        this.currentFile = file;

        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.preview = e.target.result;
          if (this.preview != '') {
            this.upload = false;
            this.image = true;
          }
        };

        reader.readAsDataURL(this.currentFile);
        this.pawnForm.get('file')?.setValue(file);
      }
    }
  }


  selectItem(item: any){
    this.seleted.set(item)
    const weightControl = this.pawnForm.get("gold_weight");
    const typePhoneIdControl = this.pawnForm.get("type_phone_id");
    
    if (item.key === 3) {
      weightControl?.setValidators(Validators.required);
      typePhoneIdControl?.clearValidators();
    } else if (item.key === 1) {
      typePhoneIdControl?.setValidators(Validators.required);
      weightControl?.clearValidators();
    } else {
      weightControl?.clearValidators();
      typePhoneIdControl?.clearValidators();
    }
    
    weightControl?.updateValueAndValidity();
    typePhoneIdControl?.updateValueAndValidity();
    
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

  deleteItem(data: any){
    this.store.deleteCustomer(data?.key)
  }

  async onSubmit() {
    // if(this.pawnForm.invalid){
    //   alert('សូមបញ្ចូលព័ត៍មាន');
    //   return
    // }
    
    this.loading.set(true);
    let photo = null;
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      photo = await this.storage.uploadSelectedFile(
          this.selectedFiles[0],
          'image-thumnail'
      );
    }else if(this.data()?.photo){
      photo = this.data()?.photo;
    }


    const {
      full_name,
      phone_number,
      gender,
      id_card,
      address,

      pawn_type,
      type_phone,
      type_phone_id,
      type_car,
      type_motor,
      type_jewelry_name,
      gold_weight,
      others,

      plate_number,
      brand_name,
      price_pawn,
      price_interest,
      description,
      date_expired,
      
      
    } = this.pawnForm.getRawValue();
    const toDay = new Date();

    
    
    const data: any = {
      key: this.data()?.key || this.ds.createKey(),
      
      created_at: serverTimestamp() ,
      created_by: mapUser(this.auth?.profile),
      updated_at: serverTimestamp(),
      updated_by: mapUser(this.auth?.profile),
      date_key: toDateKey(toDay),
      status: STATUS_OBJ.ACTIVE,
      keywords: generateKeywords([full_name]),
      isDeleted: false,

      full_name: full_name || null,
      phone_number: phone_number || null,
      gender: gender || null,
      id_card: id_card || null,
      address: address || null,

      pawn_type: pawn_type || null,
      
      type_phone: type_phone || null,
      type_phone_id:type_phone_id || null,
      type_motor: type_motor || null,
      type_jewelry_name:type_jewelry_name || null,
      gold_weight: gold_weight || null,
      others: others || null,

      plate_number: plate_number || null,
      brand_name: brand_name || null,
      price_pawn: price_pawn || null,
      price_interest: price_interest || null,
      description: description || null,
      date_expired: date_expired || null,
      photo: photo,
    }

    let dataToSubmit: any = {
    };

if (pawn_type.text === 'Phone') {
      dataToSubmit = { 
        type_phone:this.seleted(),
        type_phone_id,
        brand_name,
        price_pawn,
        price_interest,
        description,
        date_expired,
        photo,};

    } else if (pawn_type.text === 'Car') {
      dataToSubmit = {
        type_car:this.seleted(), 
        plate_number, 
        brand_name,
        price_pawn,
        price_interest,
        description,
        date_expired,
        photo, };

    } else if (pawn_type.text === 'Motor') {
      dataToSubmit = {
        type_motor:this.seleted(), 
        plate_number, 
        brand_name,
        price_pawn,
        price_interest,
        description,
        date_expired,
        photo, };

    } else if (pawn_type.text === 'Jewelry') {
      dataToSubmit = {
        type_jewelry_name:this.seleted(), 
        gold_weight,
        price_pawn,
        price_interest,
        description,
        date_expired,
        photo, };

    } else if (pawn_type.text === 'Others') {
      dataToSubmit = {
        others:this.seleted(),
        price_pawn,
        price_interest,
        description,
        date_expired,
        photo, };

    } else {
      console.error('Invalid pawn_type selected.');
      this.loading.set(false);
      return;
    }

    console.log(data, 'data')
    dataToSubmit.key = dataToSubmit?.key
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
