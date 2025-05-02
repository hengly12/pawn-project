import { arrayUnion, serverTimestamp } from '@angular/fire/firestore';
import { CurrencyPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, signal, ViewChild, } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GENDER_DATA, ITEM_DATA, STATUS_OBJ, Weight_Of_Gold } from '../../shared/dummy/config';
import { DataService } from '../../shared/services/data.service';
import { generateKeywords, toDateKey, } from '../../shared/services/convert.service';
import { mapUser } from '../../shared/services/mapping.service';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FireStorageService } from '../../shared/services/fire-storage.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from '../../shared/pages/alert/alert.component';
import { NgxPrintModule } from 'ngx-print';
import { MatIconModule } from '@angular/material/icon';



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
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIcon,
    MatAutocompleteModule,
    NgClass,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    NgxPrintModule,

  ],
  providers: [provideNativeDateAdapter(), CurrencyPipe],
  templateUrl: './pawn-form.component.html',
  styleUrl: './pawn-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PawnFormComponent {
  currentTitle = 'ទម្រង់បញ្ចាំទ្រព្យ';
  originalTitle = 'ទម្រង់បញ្ចាំទ្រព្យ';
  printTitle = 'វិក័យប័ត្របង្កាន់ដៃ';
  weightOfGold = signal<any>(Weight_Of_Gold);
  genders = signal<any>(GENDER_DATA);
  days_countdown: number | null = null;
  pawn_type = signal<any>(ITEM_DATA);
  seletedCar = signal<boolean>(false);
  seleted = signal<any>(null);
  text = signal<string>('');
  loading = signal<boolean>(false);
  routeUnSubscribe = signal<any>(Subscription);
  data = signal<any>(null);
  param = signal<any>(null);


  displayUSD: string = '';
  displayKHR: string = '';
  message: string = '';
  preview: string = '';
  progress: number = 0;
  selectedFiles: any;
  currentFile: any;
  upload = true;
  image = false;
  dragOver: boolean = false;
  datainfo = signal<any>(null);

  @ViewChild('inputFile') inputFile!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private ds: DataService,
    private fb: FormBuilder,
    private auth: AuthStore,
    private store: PawnStore,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private storage: FireStorageService,
    private currencyPipe: CurrencyPipe,
    private cdr: ChangeDetectorRef,
    private router: Router,

  ) { }

  async getKHRExchangeRate(): Promise<number> {
    const exchangeRate: number = 4000; // Define the exchange rate
    return exchangeRate;
  }


  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  pawnForm = new FormGroup({
    full_name: new FormControl<any>(null, [Validators.required]),
    gender: new FormControl<GenderOption | null>(null, Validators.required),
    phone_number: new FormControl<number | null>(null, [
      Validators.required,
      Validators.pattern(/^\d{6,10}$/),
    ]),
    id_card: new FormControl<number | null>(null, [
      Validators.required,
      Validators.pattern(/^\d{9}$/),
    ]),
    address: new FormControl<any>(null, [Validators.required]),
    pawn_type: new FormControl<any>(null, [Validators.required]),
    description: new FormControl(''),
    created_at: new FormControl<Date | null>(null,),
    date_expired: new FormControl<Date | null>(null, [Validators.required]),

    photo: new FormControl<string | null>(null),
    type_phone: new FormControl<any>(null),
    type_car: new FormControl<any>(null),
    type_phone_id: new FormControl<any>(null,),
    type_motor: new FormControl<any>(null),
    type_jewelry_name: new FormControl<any>(null),
    others: new FormControl<any>(null),
    plate_number: new FormControl<any>(null,),
    brand_name: new FormControl<any>(null,),
    gold_weight: new FormControl<any>(null,),
    price_pawn: new FormControl<number | null>(null, [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
    ]),
    price_interest: new FormControl<number | null>(null, [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
    ]),

    file: new FormControl<any>(null),
  });

  updateFormValidators() {
    const selectedKey = this.seleted()?.key;
    const typePhoneIdControl = this.pawnForm.get('type_phone_id');
    const plateNumberControl = this.pawnForm.get('plate_number');
    const brandNameControl = this.pawnForm.get('brand_name');
    const goldWeightControl = this.pawnForm.get('gold_weight');

    if (selectedKey === 1) {
      typePhoneIdControl?.setValidators(Validators.required);
      brandNameControl?.setValidators(Validators.required);
    } else {
      typePhoneIdControl?.clearValidators();
      if (selectedKey !== 0 && selectedKey !== 2) {
        brandNameControl?.clearValidators();
      }
    }

    if (selectedKey === 0 || selectedKey === 2) {
      plateNumberControl?.setValidators(Validators.required);
      brandNameControl?.setValidators(Validators.required);
    } else {
      plateNumberControl?.clearValidators();
      if (selectedKey !== 1) {
        brandNameControl?.clearValidators();
      }
    }

    if (selectedKey === 3) {
      goldWeightControl?.setValidators(Validators.required);
    } else {
      goldWeightControl?.clearValidators();
    }

    typePhoneIdControl?.updateValueAndValidity();
    plateNumberControl?.updateValueAndValidity();
    brandNameControl?.updateValueAndValidity();
    goldWeightControl?.updateValueAndValidity();
  }

  ngOnInit() {
    this.routeUnSubscribe.set(
      this.route.params.subscribe(async (param) => {
        let paramKey = param['id'];
        this.param.set(paramKey);
        const getData = await this.store.getCustomer(paramKey);

        const getDatainFoCusotmer = await this.store.getCustomerInFo(paramKey);
        this.data.set(getData)
        this.datainfo.set(getDatainFoCusotmer);
        this.checkDisableForm(paramKey);
        if (getData && getDatainFoCusotmer) {
          this.selectItem(this.data()?.pawn_type);
          this.pawnForm.patchValue({
            full_name: getData?.full_name || getDatainFoCusotmer?.full_name,
            phone_number: getData?.phone_number || getDatainFoCusotmer?.phone_number,
            gender: getData?.gender || getDatainFoCusotmer?.gender,
            id_card: getData?.id_card || getDatainFoCusotmer?.id_card,
            address: getData?.address || getDatainFoCusotmer?.address,

            pawn_type: getData?.pawn_type,

            type_phone: getData?.type_phone,
            type_phone_id: getData?.type_phone_id,
            type_car: getData?.type_car,
            type_motor: getData?.type_motor,
            type_jewelry_name: getData?.type_jewelry_name,
            gold_weight: getData?.gold_weight,
            others: getData?.others,

            plate_number: getData?.plate_number,
            brand_name: getData?.brand_name,
            price_pawn: getData?.price_pawn,
            price_interest: getData?.price_interest,
            description: getData?.description,
            created_at: getData?.created_at,
            date_expired: getData?.date_expired?.toDate(),
          });
        }
        if (this.data()?.photo) {
          const currentValidators = this.pawnForm.controls.file.validator
            ? this.pawnForm.controls.file.validator({} as AbstractControl)?.[
            'validatorFn'
            ] || []
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
      })
    );
  }


  calculateDays() {
    const date_expired = this.pawnForm.get('date_expired')?.value;

    if (date_expired) {
      const date_expiredModified = new Date(date_expired);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(date_expiredModified.getTime())) {
        this.days_countdown = null;
        console.error('Invalid date provided.');
        return;
      }

      const Time = date_expiredModified.getTime() - today.getTime();
      this.days_countdown = Math.floor(Time / (1000 * 3600 * 24));
    } else {
      this.days_countdown = null;
    }
  }

  checkDisableForm(param: any) {
    if (param == 'na') {
      this.pawnForm.get('full_name')?.enable();
      this.pawnForm.get('phone_number')?.enable();
      this.pawnForm.get('gender')?.enable();
      this.pawnForm.get('id_card')?.enable();
      this.pawnForm.get('address')?.enable();
      this.pawnForm.get('pawn_type')?.enable();
      this.pawnForm.get('type_phone')?.enable();
      this.pawnForm.get('type_phone_id')?.enable();
      this.pawnForm.get('type_car')?.enable();
      this.pawnForm.get('type_motor')?.enable();
      this.pawnForm.get('type_jewelry_name')?.enable();
      this.pawnForm.get('gold_weight')?.enable();
      this.pawnForm.get('others')?.enable();
      this.pawnForm.get('plate_number')?.enable();
      this.pawnForm.get('brand_name')?.enable();
    } else if (this.datainfo()?.pawnKey) {
      this.pawnForm.get('pawn_type')?.enable();
      this.pawnForm.get('type_phone')?.enable();
      this.pawnForm.get('type_phone_id')?.enable();
      this.pawnForm.get('type_car')?.enable();
      this.pawnForm.get('type_motor')?.enable();
      this.pawnForm.get('type_jewelry_name')?.enable();
      this.pawnForm.get('gold_weight')?.enable();
      this.pawnForm.get('others')?.enable();
      this.pawnForm.get('plate_number')?.enable();
      this.pawnForm.get('brand_name')?.enable();
    } else {
      this.pawnForm.get('full_name')?.disable();
      this.pawnForm.get('phone_number')?.disable();
      this.pawnForm.get('gender')?.disable();
      this.pawnForm.get('id_card')?.disable();
      this.pawnForm.get('address')?.disable();
      this.pawnForm.get('pawn_type')?.disable();
      this.pawnForm.get('type_phone')?.disable();
      this.pawnForm.get('type_phone_id')?.disable();
      this.pawnForm.get('type_car')?.disable();
      this.pawnForm.get('type_motor')?.disable();
      this.pawnForm.get('type_jewelry_name')?.disable();
      this.pawnForm.get('gold_weight')?.disable();
      this.pawnForm.get('others')?.disable();
      this.pawnForm.get('plate_number')?.disable();
      this.pawnForm.get('brand_name')?.disable();
    }
  }

  limitPhoneNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 10) {
      input = input.substring(0, 10);
    }
    event.target.value = input;
    this.pawnForm.controls['phone_number'].setValue(input);
  }

  limitIdCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 9) {
      input = input.substring(0, 9);
    }
    event.target.value = input;
    this.pawnForm.controls['id_card'].setValue(input);
  }


  // formatCurrencyPricePawn(event: any) {
  //  let value = event.target.value;
  //  value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

  //  if (value) {
  //    const numericValue = parseFloat(value);

  //    const formattedValue = this.currencyPipe.transform(numericValue, 'USD');
  //    if (formattedValue) {
  //      this.pawnForm.get('price_pawn')?.setValue(numericValue, {
  //        emitEvent: false,
  //      });

  //      event.target.value = formattedValue;
  //    }
  //  } else {
  //    this.pawnForm.get('price_pawn')?.setValue(0, { emitEvent: false });
  //  }
  // }

  // formatCurrencyPriceInterest(event: any) {
  //  let value = event.target.value;
  //  value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

  //  if (value) {
  //    const numericValue = parseFloat(value);

  //    const formattedValue = this.currencyPipe.transform(numericValue, 'USD');
  //    if (formattedValue) {
  //      this.pawnForm.get('price_interest')?.setValue(numericValue, {
  //        emitEvent: false,
  //      });

  //      event.target.value = formattedValue;
  //    }
  //  } else {
  //    this.pawnForm.get('price_interest')?.setValue(0, { emitEvent: false });
  //  }
  // }

  async formatCurrencyPricePawn(event: any) {
    let value = event.target.value;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

    if (value) {
      const numericValue = parseFloat(value);

      this.pawnForm.get('price_pawn')?.setValue(numericValue, {
        emitEvent: false,
      });


      const formattedUSD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(numericValue);


      const exchangeRate = await this.getKHRExchangeRate();
      const khrValue = numericValue * exchangeRate;
      const formattedKHR = new Intl.NumberFormat('km-KH', {
        style: 'currency',
        currency: 'KHR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(khrValue);


      event.target.value = `${formattedUSD} / ${formattedKHR}`;


      this.displayUSD = formattedUSD;
      this.displayKHR = formattedKHR;

    } else {
      this.pawnForm.get('price_pawn')?.setValue(0, { emitEvent: false });
      event.target.value = '';
      this.displayUSD = '';
      this.displayKHR = '';
    }
  }

  async formatCurrencyPriceInterest(event: any) {
    let value = event.target.value;
    value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    if (value) {
      const numericValue = parseFloat(value);
      this.pawnForm.get('price_interest')?.setValue(numericValue, {
        emitEvent: false,
      });


      const formattedUSD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(numericValue);

      const exchangeRate = await this.getKHRExchangeRate();
      const khrValue = numericValue * exchangeRate;
      const formattedKHR = new Intl.NumberFormat('km-KH', {
        style: 'currency',
        currency: 'KHR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(khrValue);

      event.target.value = `${formattedUSD} / ${formattedKHR}`;
      this.displayUSD = formattedUSD;
      this.displayKHR = formattedKHR;
    } else {
      this.pawnForm.get('price_interest')?.setValue(0, { emitEvent: false });
      event.target.value = '';
      this.displayUSD = '';
      this.displayKHR = '';
    }
  }

  getFormattedPricePawn(): string | null {
    const value = this.pawnForm.get('price_pawn')?.value;
    return this.currencyPipe.transform(value, 'USD');
  }

  getFormattedPriceInterest(): string | null {
    const value = this.pawnForm.get('price_interest')?.value;
    return this.currencyPipe.transform(value, 'USD');
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
          this.cdr.detectChanges();
        };

        reader.readAsDataURL(this.currentFile);
        this.pawnForm.get('file')?.setValue(file);
      }
    }
  }

  imagePreview: string[] = [];

  onImageUpload(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  selectItem(item: any) {
    if (item) {
      this.seleted.set(item);
      const weightControl = this.pawnForm.get('gold_weight');
      const typePhoneIdControl = this.pawnForm.get('type_phone_id');

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
  }

  displayGender = (item: any) => {
    return item?.text;
  };

  displayItem = (item: any) => {
    return item?.text;
  };

  displayWeightOfGold = (item: any) => {
    return item?.text;
  }

  clearPreviews() {
    this.imagePreview = [];
  }

  clearForm() {
    this.pawnForm.reset();
  }

  ShowDialogDeleteForm(data: any) {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: {
        title: 'លុបទិន្នន័យ!',
        description: 'តើអ្នកពិតជាចង់លុបទិន្នន័យមួយនេះ?',
      },

      role: 'dialog',
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store
          .deleteCustomer(data?.key)
          // .then(() => {
          //  this.router.navigate(['home/active/listing']);
          // })
          .catch((error) => {
            console.error('លុបទិន្នន័យបានបរាជ័យ:', error);
          });
      }
    });
  }

  endPawn(data: any): void {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: {
        title: 'បញ្ចប់ការបញ្ចាំ!',
        description: 'តើអ្នកពិតជាចង់បញ្ចប់ការបញ្ចាំមួយនេះ?',
      },
      role: 'dialog',
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && data?.key) {
        try {
          await this.store.endPawn(data?.key);
          this.snackBar.open(`បញ្ចប់ការបញ្ចាំបានជោគជ័យ`, 'ជោគជ័យ', {
            duration: 6000,
          });
          // this.router.navigate(['home/inactive/listing']);
        } catch (error) {
          console.error('Error ending pawn:', error);
          this.snackBar.open(`បញ្ចប់ការបញ្ចាំបានបរាជ័យ.`, 'បរាជ័យ', {
            duration: 6000,
          });
        }
      }
    });
  }

  restorePawn(data: any): void {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: {
        title: 'ទាញយកឯកសារបញ្ចាំទៅវិញ!',
        description: 'តើអ្នកពិតជាចង់ទាញយកឯកសារបញ្ចាំមួយនេះទៅវិញ?',
      },
      role: 'dialog',
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && data?.key) {
        try {
          await this.store.restorePawn(data?.key);
          this.snackBar.open(`ទាញយកឯកសារបញ្ចាំវិញបានជោគជ័យ`, 'ជោគជ័យ', {
            duration: 6000,
          });
          // this.router.navigate(['home/active/listing']);
        } catch (error) {
          console.error('Error ending pawn:', error);
          this.snackBar.open(`ទាញយកឯកសារបញ្ចាំវិញបរាជ័យ`, 'បរាជ័យ', {
            duration: 6000,
          });
        }
      }
    });
  }

  updatePawnData(updatedData: any): void {
    console.log('Updating pawn data:', updatedData);
    
  }

  PrinForm() {
    window.print();
  }
  
  async onSubmit() {
    if (this.pawnForm.invalid) {
      alert('សូមបញ្ចូលព័ត៍មាន');
      return
    }

    this.loading.set(true);
    let photo = null;
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      photo = await this.storage.uploadSelectedFile(
        this.selectedFiles[0],
        'image-thumnail'
      );
    } else if (this.data()?.photo) {
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
      created_at,
      date_expired,

    } = this.pawnForm.getRawValue();
    const toDay = new Date();
    let key = this.ds.createKey();

    const info_customer: any = {
      key: this.ds.createKey(),
      created_at: serverTimestamp(),
      created_by: mapUser(this.auth?.profile),
      updated_at: serverTimestamp(),
      updated_by: mapUser(this.auth?.profile),
      date_key: toDateKey(toDay),
      status: STATUS_OBJ.ACTIVE,
      keywords: generateKeywords([full_name]),
      isDeleted: false,

      full_name: full_name,
      phone_number: phone_number,
      gender: gender,
      id_card: id_card,
      address: address,

      pawnKey: arrayUnion(key),
    };

    const data: any = {
      key: this.data()?.key || key,

      created_at: serverTimestamp(),
      created_by: mapUser(this.auth?.profile),
      updated_at: serverTimestamp(),
      updated_by: mapUser(this.auth?.profile),
      date_key: toDateKey(toDay),
      status: STATUS_OBJ.ACTIVE,
      keywords: generateKeywords([full_name]),
      isDeleted: false,

      full_name: full_name,
      phone_number: phone_number,
      gender: gender,
      id_card: id_card,
      address: address,

      pawn_type: pawn_type,
      price_pawn: price_pawn,
      price_interest: price_interest,
      description: description,

      date_expired: date_expired,
      photo: photo,
      pawn_item_key: info_customer?.key,

      ...(this.seleted()?.key == 0 && {
        plate_number: plate_number,
        brand_name: brand_name,
      }),

      ...(this.seleted()?.key == 1 && {
        type_phone_id: type_phone_id,
        brand_name: brand_name,
      }),

      ...(this.seleted()?.key == 2 && {
        plate_number: plate_number,
        brand_name: brand_name,
      }),

      ...(this.seleted()?.key == 3 && {
        type_jewelry_name: type_jewelry_name,
        gold_weight: gold_weight,
      }),

      ...(this.seleted()?.key == 4 && {
        others: others,
      }),
    };

    const info_update: any = {
      key: this.datainfo()?.key,
      updated_at: serverTimestamp(),
      updated_by: mapUser(this.auth?.profile),

      pawnKey: arrayUnion(data?.key)

    }
    this.router.navigate(['home/active/listing']);

    // console.log(data, 'data');
    // console.log(info_customer, 'info');
    if (this.param() == 'na') {
      try {
        await this.store.createCustomer(data, info_customer);
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានជោគជ័យ`, 'ជោគជ័យ', {
          duration: 3000,
        });
        this.loading.set(false);
      } catch (e) {
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានបរាជ័យ`, 'ជោគជ័យ', {
          duration: 3000,
        });
        this.loading.set(false);
      }
    } else if (this.datainfo()?.pawnKey) {
      try {
        await this.store.createCustomerinfoNews(data, info_update);
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានជោគជ័យ`, 'ជោគជ័យ', {
          duration: 3000,
        });
        this.loading.set(false);
      } catch (e) {
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានបរាជ័យ`, 'ជោគជ័យ', {
          duration: 3000,
        });
        this.loading.set(false);
      }
    } else {
      try {
        await this.store.createCustomerEdit(data);
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានជោគជ័យ`, 'ជោគជ័យ', {
          duration: 3000,
        });
        this.loading.set(false);
      } catch (e) {
        this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានបរាជ័យ`, 'ជោគជ័យ', {
          duration: 3000,
        });
        this.loading.set(false);
      }
    }

  }

  printForm() {
    this.currentTitle = this.printTitle;

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        this.currentTitle = this.originalTitle;
      }, 500);
    }, 100);
  }
}

