import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getCartItems, addToCart, updateCartItem, clearCart } from '@/lib/database';

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

// GET - получить корзину пользователя
export async function GET(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const cartItems = await getCartItems(tokenData.userId);
    
    return NextResponse.json({ items: cartItems });

  } catch (error) {
    console.error('Cart get error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { id, name, price, image, quantity = 1 } = await request.json();

    if (!id || !name || !price) {
      return NextResponse.json(
        { error: 'Не все данные товара указаны' },
        { status: 400 }
      );
    }

    const cartItem = await addToCart(
      tokenData.userId, 
      String(id), 
      name, 
      Number(price), 
      image || '', 
      quantity
    );
    
    return NextResponse.json({
      message: 'Товар добавлен в корзину',
      item: cartItem
    });

  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновить количество товара в корзине
export async function PUT(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity < 0) {
      return NextResponse.json(
        { error: 'Некорректные данные' },
        { status: 400 }
      );
    }

    const result = await updateCartItem(tokenData.userId, productId, quantity);
    
    return NextResponse.json({
      message: 'Корзина обновлена',
      item: result
    });

  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - очистить корзину
export async function DELETE(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    await clearCart(tokenData.userId);
    
    return NextResponse.json({
      message: 'Корзина очищена'
    });

  } catch (error) {
    console.error('Cart clear error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
