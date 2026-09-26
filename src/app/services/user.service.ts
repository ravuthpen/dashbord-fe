import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { UserListParams } from '../models/user-list-params';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { CustomerProfile } from '../models/customerProfile';
import { HttpClient, HttpParams } from '@angular/common/http';
import { buillParams } from '../core/http/utils';
import { UploadSummary } from '../models/upload-summary';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // api_url
  // request param

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/customer-profile`;

  // room search pagination

  constructor() {}

  list(params?: UserListParams) : Observable<Page<CustomerProfile>> {
    return this.http.get<Page<CustomerProfile>>(this.base, {
      params: buillParams(params),
    });
  }

  create(body: any) : Observable<CustomerProfile>{
    return this.http.post<CustomerProfile>(this.base, body)
  }
   //** PATCH /rooms/{id}/edit */
  update(id: string, body: any): Observable<string> {
  return this.http.patch<string>(
    `${this.base}/${id}/update-profile`,
    body,
    {
      responseType: 'text' as 'json'
    }
  );
}

  //** GET /rooms/{id} */
  getById(id: string): Observable<CustomerProfile>{
    return this.http.get<CustomerProfile>(`${this.base}/${id}`)
  }

  // upload summary
    uploadExcel(file: File, dryRun: boolean): Observable<UploadSummary> {
    const formData = new FormData();
    formData.append('file', file);

    const params = new HttpParams().set('dryRun', String(dryRun));

    return this.http.post<UploadSummary>(
      `${this.base}/upload-excel`,
      formData,
      { params }
    );
  }

  

 
}
