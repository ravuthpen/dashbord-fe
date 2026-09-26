import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';

import { AccountService } from '../../auth/services/account.service';

import {
  AddressService,
  AdminAreaResponse
} from '../../services/address.service';

import { formatPhone } from '../../core/http/utils';
import { CustomerProfile } from '../../models/customerProfile';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {

  // ==================================================
  // Services
  // ==================================================

  private accountService = inject(AccountService);
  private addressService = inject(AddressService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  phoneFormatter = formatPhone;
  customerProfile = signal<CustomerProfile | null>(null);

  // ==================================================
  // Profile
  // ==================================================

  fullName = '';
  email = '';
  countryCode = '';
  phoneNumber = '';
  gender = '';
  age = '';
  nationalId = '';
  passportNumber = '';

  // ==================================================
  // Address
  // ==================================================

  line1 = '';

  // Codes from API
  province = '';
  district = '';
  commune = '';
  village = '';

  // Lookup data
  provinces: AdminAreaResponse[] = [];
  districts: AdminAreaResponse[] = [];
  communes: AdminAreaResponse[] = [];
  villages: AdminAreaResponse[] = [];

  // ==================================================
  // Avatar
  // ==================================================

  avatarPreview: string | null = null;

  // ==================================================
  // Profile state
  // ==================================================

  loading = signal(true);

  savingProfile = signal(false);

  profileMessage = signal<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ==================================================
  // Password
  // ==================================================

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  savingPassword = signal(false);

  passwordMessage = signal<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ==================================================
  // Constructor
  // ==================================================

  constructor() {
    this.loadProfile();
  }

  // ==================================================
  // Load Profile
  // ==================================================

  private loadProfile(): void {
    this.accountService.getProfile().subscribe({
      next: response => {

        // Store the complete profile
        this.customerProfile.set(response);

        // Populate the component fields
        this.setProfileData(response);

        this.loading.set(false);
      },

      error: err => {

        console.error(
          'Failed to load profile:',
          err
        );

        this.loading.set(false);

        this.profileMessage.set({
          type: 'error',
          text: 'Could not load your profile.'
        });
      }
    });
  }

  // ==================================================
  // Set Profile Data
  // ==================================================

  private setProfileData(
    response: CustomerProfile
  ): void {

    // ==================================================
    // Name
    // ==================================================

    const firstName =
      response.profile?.firstName?.trim() ?? '';

    const lastName =
      response.profile?.lastName?.trim() ?? '';

    this.fullName =
      `${firstName} ${lastName}`.trim();

    // ==================================================
    // Profile
    // ==================================================

    this.email =
      response.profile?.email ?? '';

    this.gender =
      response.profile?.gender ?? '';

    this.age =
      response.profile?.age?.toString() ?? '';

    this.nationalId =
      response.profile?.nationalityNumber ?? '';

    this.passportNumber =
      response.profile?.passportNumber ?? '';

    // ==================================================
    // Account
    // ==================================================

    this.countryCode =
      response.account?.countryCode ?? '';

    const phone =
      response.account?.phoneNumber ?? '';

    this.phoneNumber =
      formatPhone(phone);

    // ==================================================
    // Address
    // ==================================================

    const addresses =
      response.address ?? [];

    // console.log(
    //   'Address array:',
    //   addresses
    // );

    if (addresses.length > 0) {

      const address =
        addresses[0];

      // console.log(
      //   'Selected address:',
      //   address
      // );

      this.line1 =
        address.line1 ?? '';

      this.province =
        String(address.provinceCode ?? '');

      this.district =
        String(address.districtCode ?? '');

      this.commune =
        String(address.communeCode ?? '');

      this.village =
        String(address.villageCode ?? '');

      this.loadAddressNames(address);

    } else {

      console.warn(
        'No customer address found.'
      );

      this.clearAddress();
    }

    // ==================================================
    // Avatar
    // ==================================================

    // this.avatarPreview =
    //   response.profile?.photo_object_key?.[0] ?? null;
  const objectKey = response.profile?.photo_object_key?.at(-1) ?? null;

  this.avatarPreview = objectKey
    ? `${environment.mediaUrl}/user-media/${encodeURIComponent(
      objectKey.replace(/[{}]/g, '')
    )}`
    : null;      
  }

  // ==================================================
  // Clear Address
  // ==================================================

  private clearAddress(): void {

    this.line1 = '';

    this.province = '';
    this.district = '';
    this.commune = '';
    this.village = '';

    this.provinces = [];
    this.districts = [];
    this.communes = [];
    this.villages = [];
  }

  // ==================================================
  // Load Address Names
  // ==================================================

  private loadAddressNames(
    address: NonNullable<CustomerProfile['address']>[number]
  ): void {

    // ------------------------------------------------
    // Provinces
    // ------------------------------------------------

    this.addressService
      .getProvinces()
      .subscribe({

        next: list => {

          this.provinces = list;

          // console.log(
          //   'Provinces loaded:',
          //   list
          // );
        },

        error: err => {

          console.error(
            'Failed to load provinces:',
            err
          );
        }
      });

    // ------------------------------------------------
    // Districts
    // ------------------------------------------------

    if (address.provinceCode) {

      this.addressService
        .getDistricts(
          String(address.provinceCode)
        )
        .subscribe({

          next: list => {

            this.districts = list;

            // console.log(
            //   'Districts loaded:',
            //   list
            // );
          },

          error: err => {

            console.error(
              'Failed to load districts:',
              err
            );
          }
        });
    }

    // ------------------------------------------------
    // Communes
    // ------------------------------------------------

    if (address.districtCode) {

      this.addressService
        .getCommunes(
          String(address.districtCode)
        )
        .subscribe({

          next: list => {

            this.communes = list;

            // console.log(
            //   'Communes loaded:',
            //   list
            // );
          },

          error: err => {

            console.error(
              'Failed to load communes:',
              err
            );
          }
        });
    }

    // ------------------------------------------------
    // Villages
    // ------------------------------------------------

    if (address.communeCode) {

      this.addressService
        .getVillages(
          String(address.communeCode)
        )
        .subscribe({

          next: list => {

            this.villages = list;

            // console.log(
            //   'Villages loaded:',
            //   list
            // );
          },

          error: err => {

            console.error(
              'Failed to load villages:',
              err
            );
          }
        });
    }
  }

  // ==================================================
  // Address Name Helpers
  // ==================================================

  getProvinceName(
    code?: string
  ): string {

    if (!code) {
      return '—';
    }

    const found =
      this.provinces.find(
        item =>
          String(item.code) === String(code)
      );

    return found?.nameEn ?? code;
  }

  getDistrictName(
    code?: string
  ): string {

    if (!code) {
      return '—';
    }

    const found =
      this.districts.find(
        item =>
          String(item.code) === String(code)
      );

    return found?.nameEn ?? code;
  }

  getCommuneName(
    code?: string
  ): string {

    if (!code) {
      return '—';
    }

    const found =
      this.communes.find(
        item =>
          String(item.code) === String(code)
      );

    return found?.nameEn ?? code;
  }

  getVillageName(
    code?: string
  ): string {

    if (!code) {
      return '—';
    }

    const found =
      this.villages.find(
        item =>
          String(item.code) === String(code)
      );

    return found?.nameEn ?? code;
  }

  // ==================================================
  // Initials
  // ==================================================

  get initials(): string {

    const profile =
      this.accountService.profile();

    const firstName =
      profile
        ?.profile
        ?.firstName
        ?.trim() ?? '';

    const lastName =
      profile
        ?.profile
        ?.lastName
        ?.trim() ?? '';

    if (!firstName && !lastName) {
      return 'A';
    }

    return (
      firstName.charAt(0) +
      lastName.charAt(0)
    ).toUpperCase();
  }

  // ==================================================
  // Avatar Selected
  // ==================================================

  onAvatarSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    // ------------------------------------------------
    // File type
    // ------------------------------------------------

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {

      this.profileMessage.set({
        type: 'error',
        text:
          'Only JPG, PNG or WEBP images are allowed.'
      });

      input.value = '';

      return;
    }

    // ------------------------------------------------
    // File size
    // ------------------------------------------------

    if (file.size > 3_000_000) {

      this.profileMessage.set({
        type: 'error',
        text:
          'Image is too large (max 3MB).'
      });

      input.value = '';

      return;
    }

    // ------------------------------------------------
    // Preview
    // ------------------------------------------------

    const reader =
      new FileReader();

    reader.onload = () => {

      this.avatarPreview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // ==================================================
  // Remove Avatar
  // ==================================================

  removeAvatar(): void {

    this.avatarPreview = null;
  }

  // ==================================================
  // Password Checks
  // ==================================================

  get pinChecks() {

    const password = this.newPassword;

    return {
      length: /^\d{4}$/.test(password),

      number: /^\d+$/.test(password),

      match:
        password.length > 0 &&
        password === this.confirmPassword
    };
  }

  // ==================================================
  // Change Password
  // ==================================================

  changePassword(): void {

    this.passwordMessage.set(null);

    const checks =
      this.pinChecks;

    // ------------------------------------------------
    // Current password
    // ------------------------------------------------

    if (!this.currentPassword) {

      this.passwordMessage.set({
        type: 'error',
        text:
          'Enter your current password.'
      });

      return;
    }

    // ------------------------------------------------
    // New password
    // ------------------------------------------------

    if (
      !checks.length ||
      // !checks.upperLower ||
      !checks.number
    ) {

      this.passwordMessage.set({
        type: 'error',
        text:
          'New password does not meet the requirements below.'
      });

      return;
    }

    // ------------------------------------------------
    // Confirm password
    // ------------------------------------------------

    if (!checks.match) {

      this.passwordMessage.set({
        type: 'error',
        text:
          'Passwords do not match.'
      });

      return;
    }

    // ------------------------------------------------
    // Change password
    // ------------------------------------------------

    this.savingPassword.set(true);

    this.accountService
      .changePassword({

        currentPassword:
          this.currentPassword,

        newPassword:
          this.newPassword

      })
      .subscribe({

        next: () => {

          this.savingPassword.set(false);

          this.passwordMessage.set({
            type: 'success',
            text:
              'Password changed successfully.'
          });

          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },

        error: err => {

          this.savingPassword.set(false);

          console.error(
            'Change password failed:',
            err
          );

          this.passwordMessage.set({
            type: 'error',
            text:
              err?.error?.message ??
              'Could not change your password. Please check your current password and try again.'
          });
        }
      });
  }

  edit(): void {
    const cp = this.customerProfile();

    const userAccountId = cp?.account?.userAccountId;

    if (!userAccountId) {
      console.warn('User account ID is missing');
      return;
    }

    this.router.navigate([
      '/users',
      userAccountId,
      'edit'
    ]);
  }
  
}
