import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/lib/transaction';
import Product from '@/lib/product';

export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB();
    
    if (!dbConnection) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { cashierId, items, subtotal, overallDiscount, totalAmount, cashReceived, change } = body;

    console.log('Received transaction request:', {
      cashierId,
      itemsCount: items?.length,
      subtotal,
      overallDiscount,
      totalAmount,
      cashReceived,
      change
    });

    if (!cashierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (subtotal === undefined || totalAmount === undefined || cashReceived === undefined || change === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing payment calculation fields' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.productName || !item.productSku || !item.category ||
          !item.quantity || !item.price || item.discount === undefined || !item.total) {
        return NextResponse.json(
          { success: false, error: 'Invalid item data - missing required fields' },
          { status: 400 }
        );
      }
    }

    // Create transaction
    const transaction = new Transaction({
      cashierId,
      items,
      subtotal,
      overallDiscount: overallDiscount || 0,
      totalAmount,
      cashReceived,
      change,
      status: 'completed'
    });

    await transaction.save();

    console.log('Transaction saved successfully:', {
      id: transaction.id,
      cashierId: transaction.cashierId,
      itemsCount: transaction.items.length,
      totalAmount: transaction.totalAmount
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        cashierId: transaction.cashierId,
        items: transaction.items,
        subtotal: transaction.subtotal,
        overallDiscount: transaction.overallDiscount,
        totalAmount: transaction.totalAmount,
        cashReceived: transaction.cashReceived,
        change: transaction.change,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }
    });

  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const cashierId = searchParams.get('cashierId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = {};
    if (cashierId) query.cashierId = cashierId;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedTransactions = transactions.map((transaction: any) => ({
      id: transaction._id.toString(),
      cashierId: transaction.cashierId,
      items: transaction.items,
      subtotal: transaction.subtotal,
      overallDiscount: transaction.overallDiscount,
      totalAmount: transaction.totalAmount,
      cashReceived: transaction.cashReceived,
      change: transaction.change,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions
    });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
