import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserOrders, createOrder } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Функция для проверки токена
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

// GET - получить заказы пользователя
export async function GET(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Получаем заказы пользователя
    const userOrders = await getUserOrders(tokenData.userId);
    
    // Преобразуем формат для совместимости с фронтендом
    const formattedOrders = userOrders.map(order => ({
      id: order.order_number,
      date: order.created_at.toISOString().split('T')[0],
      status: order.status === 'processing' ? 'Обрабатывается' : 
              order.status === 'shipped' ? 'В пути' :
              order.status === 'delivered' ? 'Доставлен' :
              order.status,
      total: Number(order.total_amount),
      items: order.items?.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: Number(item.price)
      })) || []
    }));
    
    return NextResponse.json({ orders: formattedOrders });

  } catch (error) {
    console.error('Orders get error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - создать новый заказ
export async function POST(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { items, total } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Товары обязательны' },
        { status: 400 }
      );
    }

    // Валидация товаров
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Некорректные данные товара' },
          { status: 400 }
        );
      }
    }

    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = total || calculatedTotal;

    const newOrder = await createOrder({
      userId: tokenData.userId,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: finalTotal
    });

    // Преобразуем формат для совместимости с фронтендом
    const formattedOrder = {
      id: newOrder.order_number,
      date: newOrder.created_at.toISOString().split('T')[0],
      status: 'Обрабатывается',
      total: Number(newOrder.total_amount),
      items: newOrder.items?.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: Number(item.price)
      })) || []
    };

    return NextResponse.json({
      message: 'Заказ создан',
      order: formattedOrder
    }, { status: 201 });

  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
