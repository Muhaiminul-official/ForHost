export interface Donor {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department?: string;
  batch?: string;
  dob?: string;
  bloodGroup: string;
  phone?: string;
  division?: string;
  district?: string;
  upazila?: string;
  address?: string;
  medicalConditions?: string;
  lastDonation?: string;
  status: string;
  role: string;
  createdAt: string;
}
