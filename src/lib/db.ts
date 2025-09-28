import { Pool, PoolClient, QueryResult } from 'pg';

// Поддержка разных вариантов имен переменных окружения
const getEnvVar = (names: string[]): string | undefined => {
  for (const name of names) {
    if (process.env[name]) {
      return process.env[name];
    }
  }
  return undefined;
};

const POSTGRES_USER = getEnvVar(['POSTGRES_USER', 'DB_USER']);
const POSTGRES_PASSWORD = getEnvVar(['POSTGRES_PASSWORD', 'DB_PASSWORD']);
const POSTGRES_DATABASE = getEnvVar(['POSTGRES_DATABASE', 'DB_NAME']);
const POSTGRES_HOST = getEnvVar(['POSTGRES_HOST', 'DB_HOST']);
const POSTGRES_PORT = getEnvVar(['POSTGRES_PORT', 'DB_PORT']);

// Проверка обязательных переменных окружения
if (!POSTGRES_USER) {
  throw new Error('POSTGRES_USER (или DB_USER) не задан в переменных окружения');
}
if (!POSTGRES_PASSWORD) {
  throw new Error('POSTGRES_PASSWORD (или DB_PASSWORD) не задан в переменных окружения');
}
if (!POSTGRES_DATABASE) {
  throw new Error('POSTGRES_DATABASE (или DB_NAME) не задан в переменных окружения');
}
if (!POSTGRES_HOST) {
  throw new Error('POSTGRES_HOST (или DB_HOST) не задан в переменных окружения');
}
if (!POSTGRES_PORT) {
  throw new Error('POSTGRES_PORT (или DB_PORT) не задан в переменных окружения');
}

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
  port: parseInt(POSTGRES_PORT),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Настройки пула соединений
  max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '2000'),
});

// Обработка ошибок пула
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Функция для выполнения запросов
export async function query(text: string, params?: unknown[]): Promise<unknown> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    // Более понятные сообщения об ошибках подключения
    if (error instanceof Error && 'code' in error && error.code === '28P01') {
      console.error('❌ PostgreSQL Authentication Error: Неверный пользователь или пароль');
      console.error('💡 Проверьте настройки в .env.local:');
      console.error(`   Пользователь: ${POSTGRES_USER}`);
      console.error('   Пароль: ***');
    } else if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
      console.error('❌ PostgreSQL Connection Refused: PostgreSQL не запущен');
      console.error(`💡 Проверьте что PostgreSQL работает на ${POSTGRES_HOST}:${POSTGRES_PORT}`);
    } else if (error instanceof Error && 'code' in error && error .code === '3D000') {
      console.error('❌ Database does not exist: База данных не найдена');
      console.error(`💡 Создайте базу данных: CREATE DATABASE ${POSTGRES_DATABASE};`);
    }
    throw error;
  }
}

// Функция для выполнения транзакций
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Функция для получения клиента (для сложных операций)
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Функция для тестирования соединения
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connected successfully:', (result as QueryResult).rows[0]);
    return true;
  } catch (error) {// eslint-disable-line @typescript-eslint/no-unused-vars
    console.error('❌ Database connection failed');
    return false;
  } 
}

// Проверка подключения при инициализации (только в development)
if (process.env.NODE_ENV === 'development') {
  testConnection().then((connected) => {
    if (!connected) {
      console.error('\n🔥 БАЗА ДАННЫХ НЕ ПОДКЛЮЧЕНА! 🔥');
      console.error('📖 Читайте инструкции в DATABASE_SETUP.md');
      console.error('🔧 Проверьте файл .env.local\n');
    }
  });
}

// Функция для закрытия пула соединений (для graceful shutdown)
export async function closePool(): Promise<void> {
  await pool.end();
}

// Экспорт пула для прямого использования при необходимости
export { pool };

export default pool;
