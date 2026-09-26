import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface UserResponse {
  id: string;
  photoUrls?: string[];
  // add other fields if you want
}

@Injectable({ providedIn: 'root' })
export class UserMediaApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/customers`;

  uploadPhotos(UserId: string, CustomerId: string, files: File[]): Observable<UserResponse> {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f, f.name));
    return this.http.post<UserResponse>(`${this.base}/${CustomerId}/${UserId}/photos`, fd);
  }

  deletePhoto(UserId: string, objectKey: string): Observable<UserResponse> {
    const params = new HttpParams().set('objectKey', objectKey);
    return this.http.delete<UserResponse>(`${this.base}/${UserId}/photos`, { params });
  }

  getPhotos(UserId: string, customerId: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.base}/${customerId}/${UserId}/photos`);
  }
}

//http://localhost:4046/api/v1/customers/e413aebd-5e8e-4fb0-9834-c0e4d1dd2c36/2c6f589a-e05a-476c-a026-8fd71f5ff165/photos
//customerId, userId