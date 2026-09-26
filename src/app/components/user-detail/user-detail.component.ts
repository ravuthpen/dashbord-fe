import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerProfile } from '../../models/customerProfile';
import { UserService } from '../../services/user.service';
import {
  AddressService,
  AdminAreaResponse
} from '../../services/address.service';
import { formatPhone } from '../../core/http/utils';
import { environment } from '../../../environment/environment';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {

  private userService = inject(UserService);
  private addressService = inject(AddressService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  phoneFormatter = formatPhone;

  customerProfile = signal<CustomerProfile | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  skeletonRows = Array.from({ length: 8 });

  provinces: AdminAreaResponse[] = [];
  districts: AdminAreaResponse[] = [];
  communes: AdminAreaResponse[] = [];
  villages: AdminAreaResponse[] = [];


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Missing User id.');
      this.loading.set(false);
      return;
    }

    this.load(id);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getById(id).subscribe({
      next: (cp) => {
        this.customerProfile.set(cp);

        const addr = cp.address?.[0];

        if (!addr) {
          this.loading.set(false);
          return;
        }
        if (addr.provinceCode) {
          this.addressService.getDistricts(addr.provinceCode)
            .subscribe(list => this.districts = list);
        }

        if (addr.districtCode) {
          this.addressService.getCommunes(addr.districtCode)
            .subscribe(list => this.communes = list);
        }

        if (addr.communeCode) {
          this.addressService.getVillages(addr.communeCode)
            .subscribe(list => this.villages = list);
        }
        
        
        this.addressService.getProvinces().subscribe(list => {
          this.provinces = list;
        });

        this.addressService.getDistricts(addr.provinceCode ?? '').subscribe(list => {
          this.districts = list;
        });

        this.addressService.getCommunes(addr.districtCode ?? '').subscribe(list => {
          this.communes = list;
        });

        this.addressService.getVillages(addr.communeCode ?? '').subscribe(list => {
          this.villages = list;
          this.loading.set(false);
        });
      },
      error: err => {
        console.error(err);
        this.error.set('Unable to load customer profile.');
        this.loading.set(false);
      }
    });
  }

  getProfileImageUrl(objectKey: string): string {
    const cleanKey = objectKey.replace(/[{}]/g, '');
    return `${environment.mediaUrl}/user-media/${encodeURIComponent(cleanKey)}`;
  }
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getProvinceName(code?: string): string {
    return this.provinces.find(x => x.code === code)?.nameEn ?? code ?? '—';
  }

  getDistrictName(code?: string): string {
    return this.districts.find(x => x.code === code)?.nameEn ?? code ?? '—';
  }

  getCommuneName(code?: string): string {
    return this.communes.find(x => x.code === code)?.nameEn ?? code ?? '—';
  }

  getVillageName(code?: string): string {
    return this.villages.find(x => x.code === code)?.nameEn ?? code ?? '—';
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  edit(): void {
    const cp = this.customerProfile();

    if (cp?.account?.userAccountId) {
      this.router.navigate(['/users', cp.account.userAccountId, 'edit']);
    }
  }
  
}