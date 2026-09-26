import { HttpParams } from "@angular/common/http";

export function buillParams<T extends object>(input?: T): HttpParams {

    let params = new HttpParams();

    if(!input){
        return params;
    }

    for(const [key,value] of Object.entries(input)){

        if(value == null || value === ''){
            continue;
        }
        if(Array.isArray(input)){
            for(const item of value){
                params = params.append(key, String(item));
            }
        }else{
            params = params.set(key, String(value));
        }
    }
    return params;



}

export function formatPhone(
  phoneNumber?: string
): string {

  if (!phoneNumber) {
    return '';
  }

  const phone = phoneNumber.replace(/\D/g, '');

  return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
}