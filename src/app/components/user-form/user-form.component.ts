import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AddressService, AdminAreaResponse } from '../../services/address.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UserMediaApiService } from '../../services/user-media.service';
import { Location } from '@angular/common';
import { formatPhone } from '../../core/http/utils';
import { Gender, ReferralCode, UserType } from '../../models/enum';


@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);
  private destroyRef = inject(DestroyRef); // good to have
  private router = inject(Router);
  private mediaApi = inject(UserMediaApiService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  phoneFormatter = formatPhone;

  // Signals (Angular 19)
  mode = input<'create' | 'update'>('create');
  value = input<any | null>(null); 
  create = output<any>();
  update = output<{ id: string; body: any }>();

  // dropdown data
  gender: Gender[] = [Gender.MALE, Gender.FEMALE, Gender.NO_REFERENCE];
  referralCodes: ReferralCode[] = [ReferralCode.TEAM_A, ReferralCode.TEAM_B, ReferralCode.UNKNOWN];
  userTypes: UserType[] = [UserType.MEMBER, UserType.TEAM_LEADER, UserType.OWNER, UserType.EMPLOYEE, UserType.ADMIN];

  // address reference lists (bound in template with @for)
  provinces: Array<{ code: string; nameEn: string }> = [];
  districts: Array<{ code: string; nameEn: string }> = [];
  communes: Array<{ code: string; nameEn: string }> = [];
  //villages: Array<{ code: string; nameEn: string }> = [];
  villages: AdminAreaResponse[] = [];
  submitted = false;

   // ---------- Image Upload State ----------
  uploading = false;
  uploadError: string | null = null;

  selectedFiles: File[] = [];
  selectedPreviews: string[] = [];

  // URLs returned from backend (MinIO / S3)
  photoUrlsView: string[] = [];

  // --- Reactive Form (ALL fields) ---
  form: FormGroup = this.fb.group({
  id: [{ value: '', disabled: true }],
  profileId: [{ value: '', disabled: true }],

  firstName: ['', Validators.required],
  lastName: ['', Validators.required],
  gender: ['NO_PREFERENCE' as Gender, Validators.required],
  nationalityNumber: ['', Validators.required],
  passportNumber: [''],
  dateOfBirth: ['', Validators.required],
  age: [{value: null, disabled: true}],

  countryCode: ['', Validators.required],
  phoneNumber: ['', Validators.required],
  email: ['', Validators.email],

  referralCode: ['UNKNOWN' as ReferralCode],
  userStatus: [{value: 'PENDING', disabled: true}],
  userType: ['MEMBER' as UserType],
  

  photo_profile: [''],
  photo_object_key: [''],

  createdAt: [''],
  updatedAt: [''],

  address: this.fb.group({
    provinceCode: [''],
    districtCode: [{ value: '', disabled: true }],
    communeCode: [{ value: '', disabled: true }],
    villageCode: [{ value: '', disabled: true }],
    line1: ['']
})
});

  // Convenience getters
  get addr(): FormGroup { return this.form.get('address') as FormGroup; }
  
  // ---------- lifecycle ----------
  ngOnInit() {
  // 1) Load provinces once
  this.addressService.getProvinces()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(list => this.provinces = list);

  // 2) deposit toggle
  this.form.get('depositRequired')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((req: boolean) => {
      const amt = this.form.get('depositAmount');
      if (req) {
        amt?.enable();
      } else {
        amt?.disable();
        amt?.setValue(null);
      }
    });

  // grab address controls once
  const provinceCtrl = this.addr.get('provinceCode') as FormControl<string | null>;
  const districtCtrl = this.addr.get('districtCode') as FormControl<string | null>;
  const communeCtrl  = this.addr.get('communeCode')  as FormControl<string | null>;
  const villageCtrl  = this.addr.get('villageCode')  as FormControl<string | null>;

  // 3) province → districts
  provinceCtrl.valueChanges
    .pipe(
      startWith(provinceCtrl.value ?? ''),
      tap((code) => {
        districtCtrl.enable();
        communeCtrl.disable();
        villageCtrl.disable();

        districtCtrl.setValue('',{ emitEvent: false });
        communeCtrl.setValue('', { emitEvent: false });
        villageCtrl.setValue('', { emitEvent: false });

        this.communes = [];
        this.villages = [];

        // set provinceName from provinces list
        const selected = this.provinces.find(p => p.code === code);
        this.addr.patchValue(
          { provinceName: selected?.nameEn ?? '' },
          { emitEvent: false }
        );
      }),
      switchMap(code => code ? this.addressService.getDistricts(code) : of([])),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(list => this.districts = list);

  // 4) district → communes
  districtCtrl.valueChanges
    .pipe(
      startWith(districtCtrl.value ?? ''),
      tap((code) => {
        communeCtrl.enable();
        villageCtrl.disable();

        communeCtrl.setValue('', { emitEvent: false });
        villageCtrl.setValue('', { emitEvent: false });

        this.villages = [];

        // set districtName from current districts list
        const selected = this.districts.find(d => d.code === code);
        this.addr.patchValue(
          { districtName: selected?.nameEn ?? '' },
          { emitEvent: false }
        );

      }),
      switchMap(code => code ? this.addressService.getCommunes(code) : of([])),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(list => this.communes = list);

  // 5) commune → villages
  communeCtrl.valueChanges
    .pipe(
      startWith(communeCtrl.value ?? ''),
      tap((code) => {
        villageCtrl.enable();
        villageCtrl.setValue('', { emitEvent: false });

        // set communeName from current communes list
        const selected = this.communes.find(c => c.code === code);
        this.addr.patchValue(
          { communeName: selected?.nameEn ?? '' },
          { emitEvent: false }
        );

      }),
      switchMap(code => code ? this.addressService.getVillages(code) : of([])),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(list => this.villages = list);

  // 6) village → set villageName
  villageCtrl.valueChanges
    .pipe(
      startWith(villageCtrl.value ?? ''),
      tap(code => {
        const selected = this.villages.find(v => v.code === code);
        this.addr.patchValue(
          { villageName: selected?.nameEn ?? '' },
          { emitEvent: false }
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe();    
  

  // 7) patch if update mode
  if (this.mode() === 'update' && this.value()) {
    this.patchAll(this.value()!);
    this.photoUrlsView = (this.value()!.photoUrls ?? []).slice();
  }
}

  patchAll(customerProfile: any) {

  const address = customerProfile.address?.[0];

  this.addr.patchValue({
    provinceCode: address?.provinceCode ?? '',
    districtCode: address?.districtCode ?? '',
    communeCode: address?.communeCode ?? '',
    villageCode: address?.villageCode ?? '',
    line1: address?.line1 ?? address?.lin1 ?? ''
  });

  this.form.patchValue({

    id: customerProfile.account?.userAccountId,
    profileId: customerProfile.profile?.profileId,

    firstName: customerProfile.profile?.firstName,
    lastName: customerProfile.profile?.lastName,
    gender: customerProfile.profile?.gender,
    nationalityNumber: customerProfile.profile?.nationalityNumber,
    passportNumber: customerProfile.profile?.passportNumber,
    dateOfBirth: customerProfile.profile?.dateOfBirth,
    age: customerProfile.profile?.age,
    email: customerProfile.profile?.email,

    countryCode: customerProfile.account?.countryCode,
    phoneNumber: this.phoneFormatter(customerProfile.account?.phoneNumber),
    referralCode: customerProfile.account?.referralCode,
    userStatus: customerProfile.account?.userStatus,
    userType: customerProfile.account?.userType,

    photo_profile: customerProfile.profile?.photo_profile,
    photo_object_key: customerProfile.profile?.photo_object_key,

    createdAt: customerProfile.profile?.createdAt,
    updatedAt: customerProfile.profile?.updatedAt

  });
}

isInvalid(path: string): boolean {
  const ctrl = this.form.get(path);
  return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
}

goBack(): void {
  this.location.back();
}

submit() {

  this.submitted = true;

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const raw = this.form.getRawValue();

  const body = {

    account: {
      countryCode: raw.countryCode,
      phoneNumber: raw.phoneNumber,
      referralCode: raw.referralCode,
      userStatus: raw.userStatus,
      userType: raw.userType
    },

    profile: {
      profileId: raw.profileId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      gender: raw.gender,
      nationalityNumber: raw.nationalityNumber,
      passportNumber: raw.passportNumber,
      dateOfBirth: raw.dateOfBirth,
      age: raw.age,
      email: raw.email,
      photo_profile: raw.photo_profile,
      photo_object_key: raw.photo_object_key
    },

    address: [
      {
        customerProfileId: raw.profileId,
        line1: raw.address.line1,
        provinceCode: raw.address.provinceCode,
        districtCode: raw.address.districtCode,
        communeCode: raw.address.communeCode,
        villageCode: raw.address.villageCode
      }
    ]
  };

  //console.log(JSON.stringify(body, null, 2));

  if (this.mode() === 'create') {
    this.create.emit(body);
  } else {
    this.update.emit({
      id: raw.id,
      body
    });
  }
}

onFilesSelected(event: Event) {
  this.uploadError = null;

  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  this.clearPreviews();

  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const maxBytes = 5_000_000;

  const valid: File[] = [];
  for (const f of files) {
    if (!allowed.has(f.type)) {
      this.uploadError = 'Only JPG, PNG, WEBP are allowed.';
      continue;
    }
    if (f.size > maxBytes) {
      this.uploadError = 'File too large (max 5MB).';
      continue;
    }
    valid.push(f);
  }

  this.selectedFiles = valid;
  this.selectedPreviews = valid.map(f => URL.createObjectURL(f));
}

uploadSelected() {
  const UserId = this.value()?.id ?? this.form.getRawValue()?.id;
  const CustomerId = this.value()?.profileId ?? this.form.getRawValue()?.profileId;
  if (!UserId) {
    this.uploadError = 'Create the User first, then upload photos.';
    return;
  }
  if (!CustomerId) {
    this.uploadError = 'Create the Customer first, then upload photos.';
    return;
  }
  if (this.selectedFiles.length === 0) {
    this.uploadError = 'Please select at least one image.';
    return;
  }

  this.uploading = true;
  this.uploadError = null;

  this.mediaApi.uploadPhotos(UserId, CustomerId, this.selectedFiles)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (resp) => {
        this.photoUrlsView = (resp.photoUrls ?? []).slice();
        this.clearSelectedFiles();
        this.uploading = false;
      },
      error: (err) => {
        this.uploadError = err?.error?.detail ?? err?.message ?? 'Upload failed.';
        this.uploading = false;
      }
    });
}

deletePhotoByUrl(url: string) {
  const UserId = this.value()?.id ?? this.form.getRawValue()?.id;
  if (!UserId) {
    return;
  }

  const objectKey = this.extractObjectKey(url);
  if (!objectKey) {
    this.uploadError = 'Cannot delete photo.';
    return;
  }

  this.uploading = true;
  this.uploadError = null;

  this.mediaApi.deletePhoto(UserId, objectKey)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (resp) => {
        this.photoUrlsView = (resp.photoUrls ?? []).slice();
        this.uploading = false;
      },
      error: (err) => {
        this.uploadError = err?.error?.detail ?? err?.message ?? 'Delete failed.';
        this.uploading = false;
      }
    });
}

private extractObjectKey(url: string): string | null {
  const marker = '/user-media/';
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.substring(idx + marker.length);
}

private clearSelectedFiles() {
  this.clearPreviews();
  this.selectedFiles = [];
}

private clearPreviews() {
  for (const p of this.selectedPreviews) {
    try { URL.revokeObjectURL(p); } catch {}
  }
  this.selectedPreviews = [];
}

get UserId(): string | null {
    const v = this.value();
    if (v?.id) {
      return String(v.id);
    }

    const raw = this.form.getRawValue();
    return raw?.id ? String(raw.id) : null;
  }
}






