export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  internal: boolean;
  createdAt: string;
}

export interface TransactionDetail extends Transaction {
  notes: string | null;
  paymentMethod: string;
  merchant: string | null;
  referenceNumber: string;
}

