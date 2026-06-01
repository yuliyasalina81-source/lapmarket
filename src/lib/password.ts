/**
 * Хеширование и проверка паролей через bcrypt (12 раундов).
 */
import bcrypt from "bcryptjs";

const ROUNDS = 12;

/**
 * Хеширует пароль для хранения в БД.
 * @param password Пароль в открытом виде
 * @returns Строка bcrypt-хеша
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

/**
 * Сравнивает пароль с сохранённым хешем.
 * @param password Введённый пароль
 * @param hash Хеш из passwordHash пользователя
 * @returns true, если пароль совпадает
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
