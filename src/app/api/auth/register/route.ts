import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password: userPassword } = await request.json();

    // Валидация данных
    if (!name || !email || !userPassword) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    if (userPassword.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 6 символов' },
        { status: 400 }
      );
    }

    // Проверка валидности email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(userPassword, 12);

    // Создание нового пользователя
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword
    });

    // Возвращаем данные без технических полей
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPasswordHash, created_at, updated_at, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'Пользователь успешно зарегистрирован',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Обработка ошибок базы данных
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value')) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' },
          { status: 409 }
        );
      }
      if (error.message.includes('не задан в переменных окружения')) {
        return NextResponse.json(
          { error: 'Ошибка конфигурации сервера' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
