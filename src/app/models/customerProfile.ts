import { Gender, UserStatus, UserType } from "./enum";

export interface CustomerProfile {
  account: Account;
  profile: Profile;
  address: Address[];
}

export interface Account {
  userAccountId?: string;
  countryCode?: string;
  phoneNumber?: string;
  referralCode?: string;
  userStatus?: UserStatus;
  userType?: UserType;
}

export interface Profile {
  profileId?: string;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  nationalityNumber?: string;
  passportNumber?: string | null;
  dateOfBirth?: string;
  age?: number;
  email?: string;

  // Match your backend JSON exactly
  photo_profile?: string[];
  photo_object_key?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  addressId?: string;
  line1?: string;
  provinceCode?: string;
  districtCode?: string;
  communeCode?: string;
  villageCode?: string;
  
}






