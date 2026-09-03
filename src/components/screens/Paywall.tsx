"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import {
  initSubscription,
  purchaseProMonthly,
  restorePurchases,
  subscribeToSubscription,
  PRICE_LABEL,
  TERMS_URL,
  PRIVACY_URL,
  type SubscriptionSnapshot,
} from "@/lib/subscription";

export function Paywall({ onBack }: { onBack: () => void }) {
  const [snap, setSnap] = React.useState<SubscriptionSnapshot>(() => ({
    isPro: false,
    isNative: false,
    isReady: false,
    priceLabel: PRICE_LABEL + "/month",
    error: null,
  }));
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const unsub = subscribeToSubscription(setSnap);
    void initSubscription();
    return unsub;
  }, []);

  const onBuy = async () => {
    setBusy(true);
    try {
      await purchaseProMonthly();
    } catch {
      /* error lands on snap.error */
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      await restorePurchases();
    } finally {
      setBusy(false);
    }
  };

  if (snap.isPro) {
    return (
      <div className="px-5 pb-10 pt-2">
        <Button variant="ghost" size="sm" className="-ml-2 mb-3" onClick={onBack}>
          Back
        </Button>
        <Card className="px-5 py-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-leafdeep" />
          <h1 className="mt-3 text-[22px] font-extrabold">TorqLens Pro</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            You are subscribed. Thank you.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-5 pb-10 pt-2">
      <Button variant="ghost" size="sm" className="-ml-2 mb-3" onClick={onBack}>
        Back
      </Button>
      <div className="text-center">
        <h1 className="text-[24px] font-extrabold tracking-tight">TorqLens Pro</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Unlimited scans and priority identification on every plant in your yard.
        </p>
      </div>
      <Card className="mt-6 px-5 py-6">
        <p className="text-center text-3xl font-extrabold text-foreground">
          {snap.priceLabel}
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Auto-renewing monthly subscription. Cancel anytime in Settings, Apple ID, Subscriptions.
        </p>
        {snap.error ? (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            {snap.error}
          </p>
        ) : null}
        <Button
          size="md"
          className="mt-5 w-full"
          disabled={busy}
          onClick={() => void onBuy()}
        >
          {busy ? "Processing" : "Continue with " + PRICE_LABEL + "/month"}
        </Button>
        <button
          type="button"
          className="mt-3 w-full text-center text-sm font-medium text-muted-foreground underline"
          disabled={busy}
          onClick={() => void onRestore()}
        >
          Restore Purchases
        </button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline">
            Privacy Policy
          </a>
          {" · "}
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline">
            Terms of Use
          </a>
        </p>
      </Card>
    </div>
  );
}
