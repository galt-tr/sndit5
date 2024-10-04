export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id?: string;
  name: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  address: string;
}

export interface Invoice {
  id?: string;
  customer_id: string;
  customer?: Customer;
  date: string;
  dueDate: string;
  total: number;
  status: 'paid' | 'unpaid';
  taxPercentage: number;
}

export interface User {
  id: string;
  email: string;
}