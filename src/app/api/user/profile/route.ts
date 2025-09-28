import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { findUserById, updateUser } from '@/lib/database';

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

// GET - получить данные профиля
export async function GET(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const user = await findUserById(tokenData.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPasswordHash, created_at, updated_at, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Profile get error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновить данные профиля
export async function PUT(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { name, phone } = await request.json();

    // Валидация данных
    if (name && name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Имя должно содержать минимум 2 символа' },
        { status: 400 }
      );
    }

    if (phone && phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json(
        { error: 'Некорректный формат телефона' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(tokenData.userId, { 
      name: name?.trim(), 
      phone: phone?.trim() 
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPasswordHash, created_at, updated_at, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: 'Профиль обновлен',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}