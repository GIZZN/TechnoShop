import { query, transaction } from './db';
import { PoolClient } from 'pg';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: Date;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    ) as { rows: User[] };
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    ) as { rows: User[] };
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by id:', error);
    throw error;
  }
};

export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<User> => {
  try {
    const result = await query(
      `INSERT INTO users (name, email, password, phone) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userData.name, userData.email, userData.password, userData.phone]
    ) as { rows: User[] };
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (
  id: string, 
  updates: { name?: string; phone?: string }
): Promise<User | null> => {
  try {
    const setParts: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      setParts.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }

    if (setParts.length === 0) {
      // Если нет обновлений, просто возвращаем текущего пользователя
      return await findUserById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    ) as { rows: User[] };
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const result = await query(`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'created_at', oi.created_at
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.user_id, o.order_number, o.status, o.total_amount, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `, [userId]) as { rows: Array<Order & { items: unknown[] }> };

    return result.rows.map((row: Order & { items: unknown[] }) => ({
      ...row,
      items: row.items && Array.isArray(row.items) && row.items[0] && typeof row.items[0] === 'object' && row.items[0] !== null && 'id' in row.items[0] ? row.items : []
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  userId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
}): Promise<Order> => {
  try {
    return await transaction(async (client: PoolClient) => {
      // Генерируем номер заказа
      const orderNumberResult = await client.query('SELECT generate_order_number() as order_number');
      const orderNumber = orderNumberResult.rows[0].order_number;

      // Создаем заказ
      const orderResult = await client.query(`
        INSERT INTO orders (user_id, order_number, total_amount, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [orderData.userId, orderNumber, orderData.totalAmount, 'processing']);

      const order = orderResult.rows[0];

      // Добавляем товары в заказ
      for (const item of orderData.items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_name, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.name, item.quantity, item.price]);
      }

      // Получаем полный заказ с товарами
      const fullOrderResult = await client.query(`
        SELECT 
          o.*,
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_name', oi.product_name,
              'quantity', oi.quantity,
              'price', oi.price,
              'created_at', oi.created_at
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        GROUP BY o.id, o.user_id, o.order_number, o.status, o.total_amount, o.created_at, o.updated_at
      `, [order.id]);

      return fullOrderResult.rows[0];
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export interface FavoriteItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
  created_at: Date;
}

export const getFavorites = async (userId: string): Promise<FavoriteItem[]> => {
  try {
    const result = await query(`
      SELECT *
      FROM favorites
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]) as { rows: FavoriteItem[] };
    
    return result.rows.map((row: FavoriteItem) => ({
      ...row,
      product_price: Number(row.product_price)
    }));
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

export const addToFavorites = async (
  userId: string, 
  productId: string, 
  productName: string,
  productPrice: number,
  productImage: string,
  productCategory: string
): Promise<FavoriteItem> => {
  try {
    const result = await query(`
      INSERT INTO favorites (user_id, product_id, product_name, product_price, product_image, product_category)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `, [userId, productId, productName, productPrice, productImage, productCategory]) as { rows: FavoriteItem[] };
    
    const row = result.rows[0];
    return {
      ...row,
      product_price: Number(row.product_price)
    };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const result = await query(`
      DELETE FROM favorites 
      WHERE user_id = $1 AND product_id = $2
    `, [userId, productId]) as { rowCount: number };
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const isFavorite = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const result = await query(`
      SELECT 1 FROM favorites 
      WHERE user_id = $1 AND product_id = $2
    `, [userId, productId]) as { rows: unknown[] };
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
  total_price: number;
  created_at: Date;
  updated_at: Date;
}

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const result = await query(`
      SELECT 
        *,
        (quantity * product_price)::NUMERIC as total_price
      FROM cart_items
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]) as { rows: CartItem[] };
    
    return result.rows.map((row: CartItem) => ({
      ...row,
      product_price: Number(row.product_price),
      total_price: Number(row.total_price)
    }));
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error;
  }
};

export const addToCart = async (
  userId: string, 
  productId: string, 
  productName: string,
  productPrice: number,
  productImage: string,
  quantity: number = 1
): Promise<CartItem> => {
  try {
    const result = await query(`
      INSERT INTO cart_items (user_id, product_id, product_name, product_price, product_image, quantity)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET 
        quantity = cart_items.quantity + $6, 
        updated_at = CURRENT_TIMESTAMP
      RETURNING *, (quantity * product_price)::NUMERIC as total_price
    `, [userId, productId, productName, productPrice, productImage, quantity]) as { rows: CartItem[] };
    
    const row = result.rows[0];
    return {
      ...row,
      product_price: Number(row.product_price),
      total_price: Number(row.total_price)
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (userId: string, productId: string, quantity: number): Promise<CartItem | boolean> => {
  try {
    if (quantity <= 0) {
      return await removeFromCart(userId, productId);
    }
    
    const result = await query(`
      UPDATE cart_items 
      SET quantity = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND product_id = $2
      RETURNING *, (quantity * product_price)::NUMERIC as total_price
    `, [userId, productId, quantity]) as { rows: CartItem[] };
    
    const row = result.rows[0];
    return {
      ...row,
      product_price: Number(row.product_price),
      total_price: Number(row.total_price)
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const result = await query(`
      DELETE FROM cart_items 
      WHERE user_id = $1 AND product_id = $2
    `, [userId, productId]) as { rowCount: number };
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (userId: string): Promise<boolean> => {
  try {
    const result = await query(`
      DELETE FROM cart_items WHERE user_id = $1
    `, [userId]) as { rowCount: number };
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
