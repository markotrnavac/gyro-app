import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../constants/api";

export interface Order {
  id: string;
  name: string;
  gyro_type: string;
  size: string;
  sides: string[];
  notes?: string | null;
  created_at: string;
}

export interface OrderInput {
  name: string;
  gyro_type: string;
  size: string;
  sides: string[];
  notes?: string;
}

const STORAGE_KEY = "gyro_orders_v1";
const TIMEOUT_MS  = 4000;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

function persist(orders: Order[]): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders)).catch(() => {});
}

async function readLocal(): Promise<Order[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function useOrders() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced,  setSynced]  = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Order[]>("/orders");
      setOrders(data);
      persist(data);
      setSynced(true);
    } catch {
      const local = await readLocal();
      setOrders(local);
      setSynced(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const submitOrder = useCallback(async (input: OrderInput): Promise<Order> => {
    try {
      const order = await apiFetch<Order>("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setOrders(prev => {
        const next = [order, ...prev];
        persist(next);
        return next;
      });
      return order;
    } catch {
      const order: Order = {
        id: Math.random().toString(36).slice(2, 10),
        ...input,
        notes: input.notes ?? null,
        created_at: new Date().toISOString(),
      };
      setOrders(prev => {
        const next = [order, ...prev];
        persist(next);
        return next;
      });
      return order;
    }
  }, []);

  const updateOrder = useCallback(async (id: string, input: OrderInput): Promise<Order> => {
    try {
      const order = await apiFetch<Order>(`/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setOrders(prev => {
        const next = prev.map(o => o.id === id ? order : o);
        persist(next);
        return next;
      });
      return order;
    } catch (err) {
      // Network/timeout errors → update locally as offline fallback
      // Server errors (404, 422) → rethrow so caller can create a new order
      const isNetworkError = err instanceof TypeError || (err instanceof Error && err.name === "AbortError");
      if (!isNetworkError) throw err;

      setOrders(prev => {
        const existing = prev.find(o => o.id === id);
        const updated: Order = {
          ...(existing ?? { id, created_at: new Date().toISOString() }),
          ...input,
          notes: input.notes ?? null,
        };
        const next = prev.map(o => o.id === id ? updated : o);
        persist(next);
        return next;
      });
      return { id, ...input, notes: input.notes ?? null, created_at: new Date().toISOString() };
    }
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    setOrders(prev => {
      const next = prev.filter(o => o.id !== id);
      persist(next);
      return next;
    });
    try {
      await apiFetch(`/orders/${id}`, { method: "DELETE" });
    } catch {}
  }, []);

  const clearAll = useCallback(async () => {
    setOrders([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    try {
      await apiFetch("/orders", { method: "DELETE" });
    } catch {}
  }, []);

  return { orders, loading, synced, submitOrder, updateOrder, deleteOrder, clearAll, refresh };
}
