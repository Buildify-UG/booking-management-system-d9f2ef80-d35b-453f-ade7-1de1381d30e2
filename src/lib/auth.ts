import bcryptjs from 'bcryptjs';
import { supabase } from './supabase';
import type { User } from '@/types';

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function login(username: string, password: string) {
  try {
    const { data: user, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      throw new Error('مستخدم غير موجود');
    }

    if (!user.is_active) {
      throw new Error('الحساب معطل');
    }

    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      throw new Error('كلمة السر غير صحيحة');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
    } as User;
  } catch (error) {
    throw error;
  }
}

export async function createUser(username: string, password: string, role: string) {
  const passwordHash = await hashPassword(password);
  
  const { data, error } = await supabase
    .from('app_users')
    .insert([
      {
        username,
        password_hash: passwordHash,
        role,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('app_users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
