import {
  seedEvents,
  seedJackpotsSnapshot,
  seedMenu,
  seedNotifications,
  seedPromotions,
  seedTables,
} from './mockData';
import type {
  AppNotification,
  CasinoEvent,
  GameTable,
  JackpotsSnapshot,
  MenuItem,
  Promotion,
} from '@/types/domain';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/**
 * En producción este módulo llama al backend del casino:
 *   GET /jackpots/current     → JackpotsSnapshot publicado por el admin
 *   GET /promotions           → promociones activas
 *   GET /events               → calendario
 *   GET /menu                 → menú vigente
 *   POST /push/register       → registra el token de Expo Push del dispositivo
 *
 * Para el prototipo simulamos latencia leve y devolvemos los seeds locales.
 * Importante: los jackpots NO se autoincrementan — el admin los actualiza
 * desde el panel cuando publican el snapshot del día.
 */
export const api = {
  async getJackpots(): Promise<JackpotsSnapshot> {
    await delay(380);
    return clone(seedJackpotsSnapshot);
  },
  async getPromotions(): Promise<Promotion[]> {
    await delay(320);
    return clone(seedPromotions);
  },
  async getEvents(): Promise<CasinoEvent[]> {
    await delay(280);
    return clone(seedEvents);
  },
  async getMenu(): Promise<MenuItem[]> {
    await delay(280);
    return clone(seedMenu);
  },
  async getTables(): Promise<GameTable[]> {
    await delay(180);
    return clone(seedTables);
  },
  async getNotifications(): Promise<AppNotification[]> {
    await delay(220);
    return clone(seedNotifications);
  },
  async registerPushToken(token: string): Promise<{ ok: true }> {
    await delay(220);
    if (__DEV__) {
      console.log('[api] push token registered:', token);
    }
    return { ok: true };
  },
};
