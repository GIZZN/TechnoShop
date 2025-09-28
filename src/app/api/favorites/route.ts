import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getFavorites, addToFavorites, removeFromFavorites } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET - получить избранные товары
export async function GET(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const favorites = await getFavorites(tokenData.userId);

    return NextResponse.json({ favorites });

  } catch (error) {
    console.error('Favorites get error:', error);
    
    if (error instanceof Error && error.message.includes('не задан в переменных окружения')) {
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - добавить товар в избранное
export async function POST(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { id, name, price, image, category } = await request.json();

    if (!id || !name || !price || !category) {
      return NextResponse.json(
        { error: 'Не все данные товара указаны' },
        { status: 400 }
      );
    }

    const favoriteItem = await addToFavorites(
      tokenData.userId, 
      String(id), 
      name, 
      Number(price), 
      image || '', 
      category
    );

    return NextResponse.json({
      message: 'Товар добавлен в избранное',
      item: favoriteItem
    });

  } catch (error) {
    console.error('Favorites add error:', error);
    
    if (error instanceof Error && error.message.includes('не задан в переменных окружения')) {
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - удалить товар из избранного  
export async function DELETE(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Не указан ID товара' },
        { status: 400 }
      );
    }

    const success = await removeFromFavorites(tokenData.userId, productId);

    if (success) {
      return NextResponse.json({
        message: 'Товар удален из избранного'
      });
    } else {
      return NextResponse.json(
        { error: 'Товар не найден в избранном' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Favorites remove error:', error);
    
    if (error instanceof Error && error.message.includes('не задан в переменных окружения')) {
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
