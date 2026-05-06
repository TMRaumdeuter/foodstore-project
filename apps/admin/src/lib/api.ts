import { useState, useEffect } from 'react';

export const API_URL = 'http://localhost:4000/api';

export const api = async (endpoint: string, options: RequestInit & { token?: string } = {}) => {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders as Record<string, string>,
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Server error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:4000${url}`;
};

export { useAuth } from '../contexts/AuthContext';
