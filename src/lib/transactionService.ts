export interface TransactionItem {
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Transaction {
  id: string;
  cashierId: string;
  items: TransactionItem[];
  subtotal: number;
  overallDiscount: number;
  totalAmount: number;
  cashReceived: number;
  change: number;
  status: 'completed' | 'refunded' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  cashierId: string;
  items: TransactionItem[];
  subtotal: number;
  overallDiscount: number;
  totalAmount: number;
  cashReceived: number;
  change: number;
}

export class TransactionService {
  static async createTransaction(transactionData: CreateTransactionRequest) {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create transaction');
    }

    return result;
  }

  static async getTransactions(cashierId?: string, status?: string, limit?: number) {
    const params = new URLSearchParams();
    if (cashierId) params.append('cashierId', cashierId);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/transactions?${params.toString()}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch transactions');
    }

    return result;
  }
}
