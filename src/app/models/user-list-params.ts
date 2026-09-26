export interface UserListParams {

    page?: number;
    size?: number;
    sort?: string;
    UserType?:string;
    price?: number;

    priceMin: number | null;
    priceMax: number | null;

    provinceCode?: string | null;
    districtCode?: string | null;
    communeCode?: string | null;
    villageCode?: string | null;
}
