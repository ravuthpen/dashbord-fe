import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environment/environment';
import { CustomerProfile } from '../../models/customerProfile';

// ======================================================
// Update Profile Request
// ======================================================

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  photoObjectKey: string | null;
}

// ======================================================
// Change Password Request
// ======================================================

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ======================================================
// Service
// ======================================================

const STORAGE_KEY = 'adminProfile';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private http = inject(HttpClient);

  private apiUrl =
    `${environment.apiUrl}/api/v1/customer-profile`;

  // ====================================================
  // Cached profile
  // ====================================================

  profile = signal<CustomerProfile | null>(
    this.readCache()
  );

  // ====================================================
  // Read cache
  // ====================================================

  private readCache(): CustomerProfile | null {

    try {

      const raw =
        localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const profile =
        JSON.parse(raw) as CustomerProfile;

      // console.log(
      //   'Cached profile:',
      //   profile
      // );

      // console.log(
      //   'Cached address:',
      //   profile.address
      // );

      return profile;

    } catch (error) {

      console.error(
        'Failed to read profile cache:',
        error
      );

      localStorage.removeItem(STORAGE_KEY);

      return null;
    }
  }

  // ====================================================
  // Write cache
  // ====================================================

  private writeCache(
    profile: CustomerProfile
  ): void {

    // console.log(
    //   'Writing profile cache:',
    //   profile
    // );

    // console.log(
    //   'Writing address cache:',
    //   profile.address
    // );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(profile)
    );

    this.profile.set(profile);
  }

  // ====================================================
  // Get current logged-in profile
  // ====================================================

  getProfile(): Observable<CustomerProfile> {

    return this.http
    .get<CustomerProfile>(
      `${this.apiUrl}/my-profile`
    )
    .pipe(

      tap(response => {

        // console.log(
        //   '========== PROFILE API =========='
        // );

        // console.log(
        //   'FULL RESPONSE:',
        //   response
        // );

        // console.log(
        //   'ADDRESS:',
        //   response.address
        // );

        // console.log(
        //   'ADDRESS LENGTH:',
        //   response.address?.length
        // );

        // console.log(
        //   '================================='
        // );

        this.writeCache(response);
      })

    );
  }

  // ====================================================
  // Update profile
  // ====================================================

  updateProfile(
    body: UpdateProfileRequest
  ): Observable<CustomerProfile> {

    return this.http
      .put<CustomerProfile>(
        `${this.apiUrl}/my-profile`,
        body
      )
      .pipe(

        tap(response => {

          // console.log(
          //   'UPDATE PROFILE RESPONSE:',
          //   response
          // );

          // console.log(
          //   'UPDATE PROFILE ADDRESS:',
          //   response.address
          // );

          this.writeCache(response);
        })

      );
  }

  // ====================================================
  // Change password
  // ====================================================

  changePassword(
    body: ChangePasswordRequest
  ): Observable<void> {

    return this.http.post<void>(
      `${this.apiUrl}/change-password`,
      body
    );
  }

  // ====================================================
  // Clear cached profile
  // ====================================================

  clearProfile(): void {

    localStorage.removeItem(
      STORAGE_KEY
    );

    this.profile.set(null);
  }
}