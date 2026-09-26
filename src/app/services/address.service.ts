import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { UserListParams } from '../models/user-list-params';
import { Observable } from 'rxjs';
import { Page } from '../models/page';
import { CustomerProfile } from '../models/customerProfile';
import { HttpClient, HttpParams } from '@angular/common/http';
import { buillParams } from '../core/http/utils';

export enum AdminLevel{
  PROVINCE = 'PROVINCE',
  DISTRICT = 'DISTRICT',
  COMMUNE= 'COMMUNE',
  VILLAGE= 'VILLAGE'
}

export interface AdminAreaResponse{
  code: string;
  nameEn: string;
  level: AdminLevel;
  parenCode?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  // api_url
  // request param

  private http = inject(HttpClient);
  private base = `${environment.addressApiUrl}/api/v1/address/slim`;

  // room search pagination
  constructor() {}

  getProvinces() : Observable<AdminAreaResponse[]>{
    const param = new HttpParams().set('level', AdminLevel.PROVINCE);
    return this.http.get<AdminAreaResponse[]>(this.base,{params: param});
  }
  getDistricts(provinceCode: string) : Observable<AdminAreaResponse[]>{
    const param = new HttpParams()
    .set('level', AdminLevel.DISTRICT)
    .set('parentCode', provinceCode);
    return this.http.get<AdminAreaResponse[]>(this.base,{params: param});
  }
  getCommunes(districtCode: string) : Observable<AdminAreaResponse[]>{
    const param = new HttpParams()
    .set('level', AdminLevel.COMMUNE)
    .set('parentCode', districtCode);
    return this.http.get<AdminAreaResponse[]>(this.base,{params: param});
  }
  getVillages(communeCode: string) : Observable<AdminAreaResponse[]>{
    const param = new HttpParams()
    .set('level', AdminLevel.VILLAGE)
    .set('parentCode', communeCode);
    return this.http.get<AdminAreaResponse[]>(this.base,{params: param});
  }

  list(params?: UserListParams) : Observable<Page<CustomerProfile>> {
    return this.http.get<Page<CustomerProfile>>(this.base + '/api/rooms/search/pagination', {
      params: buillParams(params),
    });
  }
}
