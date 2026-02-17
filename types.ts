
export enum TransactionType {
  SALE = 'Venda',
  PURCHASE = 'Compra',
  EXPENSE = 'Despesa'
}

export enum Category {
  SERVICE = 'Serviço',
  COMMERCE = 'Comércio',
  INDUSTRY = 'Indústria',
  RENT = 'Aluguel',
  UTILITIES = 'Utilidades',
  GENERAL = 'Geral'
}

export interface Client {
  id: string;
  name: string;
  taxId: string;
  phone: string;
  email: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: 'Produto' | 'Serviço';
  price: number;
  stock: number;
  minStock: number;
  controlStock: boolean;
  category: Category;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  date: string;
  description: string;
  category: Category;
  hasInvoice: boolean;
  clientId?: string;
  productId?: string;
  quantity: number;
  discount?: number;
}

export interface Goal {
  id: string;
  year: number;
  month: number;
  value: number;
}

export interface Config {
  annualLimit: number;
  companyName: string;
  taxId: string;
  security?: {
    pinHash?: string;
    useEncryption: boolean;
    lockOnEntry: boolean;
  };
}

export interface DASPayment {
  month: number;
  year: number;
  paid: boolean;
  dueDate: string;
}
