import { arrayUnion, serverTimestamp } from '@angular/fire/firestore';
import { CurrencyPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  signal,
  ViewChild,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  GENDER_DATA,
  ITEM_DATA,
  STATUS_OBJ,
  Weight_Of_Gold,
} from '../../shared/dummy/config';
import { DataService } from '../../shared/services/data.service';
import {
  generateKeywords,
  toDateKey,
} from '../../shared/services/convert.service';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import {
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from '@angular/fire/firestore';
import { ICategory } from '../../shared/interfaces/category.interface';

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
    MatProgressSpinnerModule,
    CommonModule,
  ],
  providers: [provideNativeDateAdapter(), CurrencyPipe],
  templateUrl: './pawn-form.component.html',
  styleUrl: './pawn-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PawnFormComponent implements OnInit, OnDestroy {
  currentTitle = 'ទម្រង់បញ្ចាំទ្រព្យ';
  originalTitle = 'ទម្រង់បញ្ចាំទ្រព្យ';
  printTitle = 'វិក័យប័ត្របង្កាន់ដៃ';
  weightOfGold = signal<any>(Weight_Of_Gold);
  genders = signal<any>(GENDER_DATA);
  days_countdown: number | null = null;

  _categories = signal<ICategory[]>([]);
  pawn_type = computed(() => this._categories());

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

  private categoriesUnsubscribe: Unsubscribe | undefined;

  @ViewChild('inputFile') inputFile!: ElementRef;
  isProcessing: any;

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
    private router: Router
  ) {
    this.pawnForm = new FormGroup({
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
      created_at: new FormControl<Date | null>(null),
      date_expired: new FormControl<Date | null>(null, [Validators.required]),

      photo: new FormControl<string | null>(null),
      type_phone: new FormControl<any>(null),
      type_car: new FormControl<any>(null),
      type_phone_id: new FormControl<any>(null),
      type_motor: new FormControl<any>(null),
      type_jewelry_name: new FormControl<any>(null),
      others: new FormControl<any>(null),
      plate_number: new FormControl<any>(null),
      brand_name: new FormControl<any>(null),
      gold_weight: new FormControl<any>(null),
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
  }

  async formatCurrencyPricePawn(event: any) {
    let value = event.target.value;

    if (!value.includes('USD') && !value.includes('KHR')) {
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
  }

  async formatCurrencyPriceInterest(event: any) {
    let value = event.target.value;

    if (!value.includes('USD') && !value.includes('KHR')) {
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
  }

  async getKHRExchangeRate(): Promise<number> {
    const exchangeRate: number = 4000;
    return exchangeRate;
  }

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  pawnForm: FormGroup;

  updateFormValidators() {
    const selectedCategory = this.pawnForm.get('pawn_type')?.value as ICategory;
    const selectedKey = selectedCategory
      ? this.getCategoryKey(selectedCategory.name)
      : null;

    const typePhoneIdControl = this.pawnForm.get('type_phone_id');
    const plateNumberControl = this.pawnForm.get('plate_number');
    const brandNameControl = this.pawnForm.get('brand_name');
    const typeJewelryNameControl = this.pawnForm.get('type_jewelry_name');
    const goldWeightControl = this.pawnForm.get('gold_weight');
    const othersControl = this.pawnForm.get('others');

    typePhoneIdControl?.clearValidators();
    plateNumberControl?.clearValidators();
    brandNameControl?.clearValidators();
    typeJewelryNameControl?.clearValidators();
    goldWeightControl?.clearValidators();
    othersControl?.clearValidators();

    switch (selectedKey) {
      case 0: // Car
      case 2: // Motor
        plateNumberControl?.setValidators(Validators.required);
        brandNameControl?.setValidators(Validators.required);
        break;
      case 1: // Phone
        typePhoneIdControl?.setValidators(Validators.required);
        brandNameControl?.setValidators(Validators.required);
        break;
      case 3: // Jewelry
        typeJewelryNameControl?.setValidators(Validators.required);
        goldWeightControl?.setValidators(Validators.required);
        break;
      case 4: // Others
        othersControl?.setValidators(Validators.required);
        break;
    }

    typePhoneIdControl?.updateValueAndValidity();
    plateNumberControl?.updateValueAndValidity();
    brandNameControl?.updateValueAndValidity();
    typeJewelryNameControl?.updateValueAndValidity();
    goldWeightControl?.updateValueAndValidity();
    othersControl?.updateValueAndValidity();
  }

  ngOnInit() {
    this.listenForCategories();
    this.routeUnSubscribe.set(
      this.route.params.subscribe(async (param) => {
        let paramKey = param['id'];
        this.param.set(paramKey);
        const getData = await this.store.getCustomer(paramKey);

        const getDatainFoCusotmer = await this.store.getCustomerInFo(paramKey);
        this.data.set(getData);
        this.datainfo.set(getDatainFoCusotmer);
        this.checkDisableForm(paramKey);
        if (getData && getDatainFoCusotmer) {
          const pawnTypeCategory = this._categories().find(
            (cat) => cat.name === getData?.pawn_type?.name
          );
          if (pawnTypeCategory) {
            this.selectItem(pawnTypeCategory);
          }

          this.pawnForm.patchValue({
            full_name: getData?.full_name || getDatainFoCusotmer?.full_name,
            phone_number:
              getData?.phone_number || getDatainFoCusotmer?.phone_number,
            gender: getData?.gender || getDatainFoCusotmer?.gender,
            id_card: getData?.id_card || getDatainFoCusotmer?.id_card,
            address: getData?.address || getDatainFoCusotmer?.address,

            pawn_type: pawnTypeCategory,

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
          const currentValidators = this.pawnForm.controls['file'].validator
            ? this.pawnForm.controls['file'].validator({} as AbstractControl)?.[
                'validatorFn'
              ] || []
            : [];
          const filteredValidators = currentValidators.filter(
            (v: any) => v !== Validators.required
          );
          this.pawnForm.controls['file'].setValidators(filteredValidators);
          this.pawnForm.controls['file'].updateValueAndValidity();
        }

        this.preview = this.data()?.photo?.downloadUrl;
        this.image = !!this.preview;
        this.upload = !this.image;
        this.cdr.detectChanges();
      })
    );

    this.pawnForm
      .get('pawn_type')
      ?.valueChanges.subscribe((selectedCategory) => {
        this.seleted.set(
          selectedCategory
            ? { key: this.getCategoryKey(selectedCategory.name) }
            : null
        );
        this.updateFormValidators();
      });
  }

  ngOnDestroy(): void {
    if (this.categoriesUnsubscribe) {
      this.categoriesUnsubscribe();
    }
  }

  listenForCategories() {
    const q = query(this.ds.categoryRef(), orderBy('name'));

    this.categoriesUnsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const categories: ICategory[] = [];
        querySnapshot.forEach((doc) => {
          categories.push({ id: doc.id, ...(doc.data() as ICategory) });
        });
        this._categories.set(categories);
        console.log('Categories loaded for pawn form:', this._categories());
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching categories for pawn form:', error);
      }
    );
  }

  private getCategoryKey(name: string): number | null {
    switch (name.toLowerCase()) {
      case 'car':
        return 0;
      case 'phone':
        return 1;
      case 'motor':
        return 2;
      case 'jewelry':
        return 3;
      // case 'others':
      //   return 4;
      default:
        return null;
    }
  }

  displayItem(category: ICategory): string {
    if (!category) {
      return '';
    }

    if (category.name && category.text) {
      return `${category.name} - ${category.text}`;
    } else if (category.name) {
      return category.name;
    } else if (category.text) {
      return category.text;
    } else {
      return '';
    }
  }

  selectItem(category: ICategory) {
    this.seleted.set({ key: this.getCategoryKey(category.name) });
  }

  displayGender = (item: any) => {
    return item?.text;
  };

  displayWeightOfGold = (item: any) => {
    return item?.text;
  };

  clearPreviews() {
    //
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

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.loading.set(true); // Start loading
        try {
          await this.store.deleteCustomer(data?.key);
          this.snackBar.open(`លុបទិន្នន័យបានជោគជ័យ`, 'ជោគជ័យ', {
            duration: 3000,
          });
          this.router.navigate(['home/active/listing']);
        } catch (error) {
          console.error('លុបទិន្នន័យបានបរាជ័យ:', error);
          this.snackBar.open(`លុបទិន្នន័យបានបរាជ័យ`, 'បរាជ័យ', {
            duration: 6000,
          });
        } finally {
          this.loading.set(false); // End loading regardless of success or failure
        }
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
        this.loading.set(true); // Start loading
        try {
          await this.store.endPawn(data?.key);
          this.snackBar.open(`បញ្ចប់ការបញ្ចាំបានជោគជ័យ`, 'ជោគជ័យ', {
            duration: 6000,
          });
          this.router.navigate(['home/inactive/listing']);
        } catch (error) {
          console.error('Error ending pawn:', error);
          this.snackBar.open(`បញ្ចប់ការបញ្ចាំបានបរាជ័យ.`, 'បរាជ័យ', {
            duration: 6000,
          });
        } finally {
          this.loading.set(false); // End loading
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
        this.loading.set(true); // Start loading
        try {
          await this.store.restorePawn(data?.key);
          this.snackBar.open(`ទាញយកឯកសារបញ្ចាំវិញបានជោគជ័យ`, 'ជោគជ័យ', {
            duration: 6000,
          });
          this.router.navigate(['home/active/listing']);
        } catch (error) {
          console.error('Error ending pawn:', error);
          this.snackBar.open(`ទាញយកឯកសារបញ្ចាំវិញបរាជ័យ`, 'បរាជ័យ', {
            duration: 6000,
          });
        } finally {
          this.loading.set(false); // End loading
        }
      }
    });
  }

  updatePawnData(updatedData: any): void {
    console.log('Updating pawn data:', updatedData);
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

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFiles = files;
      this.previewFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.previewFile(this.selectedFiles[0]);
    }
  }

  previewFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.preview = e.target.result;
      this.image = true;
      this.upload = false;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  closeImage() {
    this.preview = '';
    this.image = false;
    this.upload = true;
    this.selectedFiles = null;
    this.inputFile.nativeElement.value = '';
    this.cdr.detectChanges();
  }

  PrintForm() {
    this.currentTitle = this.printTitle;

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        this.currentTitle = this.originalTitle;
      }, 500);
    }, 100);
  }

  checkDisableForm(paramKey: string): void {
    console.log('checkDisableForm called with paramKey:', paramKey);

    if (paramKey !== 'na') {
      this.pawnForm.disable();
    } else {
      this.pawnForm.enable();
    }
  }

  async onSubmit() {
  if (this.pawnForm.invalid) {
    this.snackBar.open('សូមបញ្ចូលព័ត៍មាន', 'យល់ព្រម', {
      duration: 3000,
    });
    return;
  }

  this.loading.set(true); // Start loading

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
    type_car,
    type_phone_id,
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

    pawnKey: arrayUnion(data?.key),
  };

  try {
    if (this.param() == 'na') {
      await this.store.createCustomer(data, info_customer);
      this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានជោគជ័យ`, 'ជោគជ័យ', {
        duration: 3000,
      });
    } else if (this.datainfo()?.pawnKey) {
      await this.store.createCustomerinfoNews(data, info_update);
      this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានជោគជ័យ`, 'ជោគជ័យ', {
        duration: 3000,
      });
    } else {
      await this.store.createCustomerEdit(data);
      this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានជោគជ័យ`, 'ជោគជ័យ', {
        duration: 3000,
      });
    }
    
    // Navigate to the route and then refresh the page
    this.router.navigate(['home/active/listing']).then(() => {
      window.location.reload();
    });

  } catch (e) {
    console.error(e);
    this.snackBar.open(`ការរក្សាទុកទិន្នន័យបានបរាជ័យ`, 'បរាជ័យ', {
      duration: 3000,
    });
  } finally {
    this.loading.set(false); // End loading
  }
}
}
