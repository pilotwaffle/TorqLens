/**
 * TorqLens Pro — StoreKit subscription (product torqlens_pro_monthly, $5.99/mo).
 * Native iOS uses cordova-plugin-purchase. Web shows the paywall without billing.
 */
import { Capacitor } from "@capacitor/core";

export const PRODUCT_ID = "torqlens_pro_monthly";
export const PRICE_LABEL = "$5.99";
export const TERMS_URL =
  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
export const PRIVACY_URL = "https://torqlens.vercel.app/privacy";

const PRO_CACHE_KEY = "torqlens_pro_entitled";

declare global {
  interface Window {
    CdvPurchase?: {
      store: any;
      ProductType: { PAID_SUBSCRIPTION: string };
      Platform: { APPLE_APPSTORE: string };
      LogLevel: { INFO: number };
    };
  }
}

export type SubscriptionSnapshot = {
  isPro: boolean;
  isNative: boolean;
  isReady: boolean;
  priceLabel: string;
  error: string | null;
};

type Listener = (snap: SubscriptionSnapshot) => void;

let ready = false;
let initPromise: Promise<void> | null = null;
let lastError: string | null = null;
const listeners = new Set<Listener>();

export function isNativeBilling(): boolean {
  return Capacitor.isNativePlatform();
}

function readCachedPro(): boolean {
  try {
    return localStorage.getItem(PRO_CACHE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCachedPro(isPro: boolean) {
  try {
    localStorage.setItem(PRO_CACHE_KEY, isPro ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function getStore(): any | null {
  return window.CdvPurchase?.store ?? null;
}

function computeIsPro(): boolean {
  const store = getStore();
  if (store) {
    try {
      if (store.owned?.(PRODUCT_ID) || store.get?.(PRODUCT_ID)?.owned) {
        writeCachedPro(true);
        return true;
      }
    } catch {
      /* fall through */
    }
  }
  return readCachedPro();
}

function priceLabel(): string {
  const store = getStore();
  try {
    const product = store?.get?.(PRODUCT_ID);
    const offer =
      product?.pricing?.price || product?.offers?.[0]?.pricing?.price;
    if (offer) return String(offer);
  } catch {
    /* ignore */
  }
  return `${PRICE_LABEL}/month`;
}

function snapshot(): SubscriptionSnapshot {
  return {
    isPro: computeIsPro(),
    isNative: Capacitor.isNativePlatform(),
    isReady: ready || !Capacitor.isNativePlatform(),
    priceLabel: priceLabel(),
    error: lastError,
  };
}

function emit() {
  const snap = snapshot();
  listeners.forEach((fn) => fn(snap));
}

export function subscribeToSubscription(listener: Listener): () => void {
  listeners.add(listener);
  listener(snapshot());
  return () => {
    listeners.delete(listener);
  };
}

export function getSubscriptionSnapshot(): SubscriptionSnapshot {
  return snapshot();
}

export async function initSubscription(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!Capacitor.isNativePlatform()) {
      ready = true;
      emit();
      return;
    }

    for (let i = 0; i < 40; i++) {
      if (window.CdvPurchase?.store) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    const Cdv = window.CdvPurchase;
    if (!Cdv?.store) {
      lastError = "In-app purchases are not available on this build yet.";
      ready = true;
      emit();
      return;
    }

    const { store, ProductType, Platform, LogLevel } = Cdv;
    try {
      store.verbosity = LogLevel?.INFO ?? 2;
      store.register([
        {
          id: PRODUCT_ID,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.APPLE_APPSTORE,
        },
      ]);
      store
        .when()
        .approved((transaction: any) => {
          transaction.verify();
        })
        .verified((receipt: any) => {
          writeCachedPro(true);
          receipt.finish();
          emit();
        });
      await store.initialize([Platform.APPLE_APPSTORE]);
      ready = true;
      lastError = null;
      emit();
    } catch (err) {
      lastError =
        err instanceof Error ? err.message : "Failed to initialize App Store billing.";
      ready = true;
      emit();
    }
  })();

  return initPromise;
}

export async function purchaseProMonthly(): Promise<void> {
  lastError = null;
  if (!Capacitor.isNativePlatform()) {
    lastError = "Subscriptions are available in the iOS app.";
    emit();
    throw new Error(lastError);
  }
  await initSubscription();
  const store = getStore();
  const Cdv = window.CdvPurchase;
  if (!store || !Cdv) {
    lastError = "App Store billing is not ready. Try again in a moment.";
    emit();
    throw new Error(lastError);
  }
  const product = store.get(PRODUCT_ID);
  if (!product) {
    lastError =
      "Subscription product not found. Use a StoreKit config or sandbox Apple ID in Xcode.";
    emit();
    throw new Error(lastError);
  }
  const offer = product.getOffer?.() || product.offers?.[0];
  if (!offer) {
    lastError = "No subscription offer is available right now.";
    emit();
    throw new Error(lastError);
  }
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Purchase timed out. Please try again."));
    }, 120000);
    store
      .when()
      .verified((receipt: any) => {
        window.clearTimeout(timeout);
        writeCachedPro(true);
        receipt.finish();
        emit();
        resolve();
      })
      .cancelled(() => {
        window.clearTimeout(timeout);
        reject(new Error("Purchase cancelled."));
      });
    offer.order().then((result: any) => {
      if (result?.isError) {
        window.clearTimeout(timeout);
        lastError = result.message || "Purchase failed.";
        emit();
        reject(new Error(lastError));
      }
    });
  });
}

export async function restorePurchases(): Promise<boolean> {
  lastError = null;
  if (!Capacitor.isNativePlatform()) {
    lastError = "Restore is only available in the iOS app.";
    emit();
    return false;
  }
  await initSubscription();
  const store = getStore();
  if (!store) {
    lastError = "App Store billing is not ready.";
    emit();
    return false;
  }
  try {
    await store.restorePurchases();
    await new Promise((r) => setTimeout(r, 800));
    const isPro = computeIsPro();
    writeCachedPro(isPro);
    emit();
    return isPro;
  } catch (err) {
    lastError = err instanceof Error ? err.message : "Restore failed.";
    emit();
    return false;
  }
}
