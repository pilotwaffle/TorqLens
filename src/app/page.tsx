"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Onboarding } from "@/components/screens/Onboarding";
import { Home } from "@/components/screens/Home";
import { Analyzing } from "@/components/screens/Analyzing";
import { Result } from "@/components/screens/Result";
import { Guidance } from "@/components/screens/Guidance";
import { HistoryList } from "@/components/screens/HistoryList";
import { About } from "@/components/screens/About";
import { SafetySheet } from "@/components/screens/SafetySheet";
import { AppHeader, TabBar, type Tab } from "@/components/screens/chrome";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { capturePhoto, shareResult, tapHaptic, successHaptic, hideSplash, setStatusBar, isNative } from "@/lib/native";
import { compressImage, makeThumbnail } from "@/lib/image";
import { identifyPlant, fetchGuidance, ApiError } from "@/lib/api";
import {
  getHistory,
  addScan,
  removeScan,
  toggleFavorite as toggleFav,
  clearHistory,
  hasOnboarded,
  setOnboarded,
} from "@/lib/storage";
import type {
  IdentifyResult,
  GuidanceAction,
  GuidanceResult,
  ScanRecord,
  PlantCandidate,
} from "@/lib/types";

type View =
  | "onboarding"
  | "home"
  | "analyzing"
  | "result"
  | "guidance"
  | "history"
  | "saved"
  | "about"
  | "error";

export default function App() {
  const [view, setView] = useState<View>("onboarding");
  const [tab, setTab] = useState<Tab>("home");

  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);

  const [safetyOpen, setSafetyOpen] = useState(false);
  const [guidanceAction, setGuidanceAction] = useState<GuidanceAction>("grow");
  const [guidance, setGuidance] = useState<GuidanceResult | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);

  // ── Boot: load history, decide first screen, hide splash ──────────
  useEffect(() => {
    let alive = true;
    (async () => {
      const [h, onboarded] = await Promise.all([getHistory(), hasOnboarded()]);
      if (!alive) return;
      setHistory(h);
      setView(onboarded ? "home" : "onboarding");
      void setStatusBar("light");
      void hideSplash();
    })();
    return () => {
      alive = false;
    };
  }, []);

  const activeCandidate: PlantCandidate | null = useMemo(
    () => result?.candidates[activeIndex] ?? result?.primary ?? null,
    [result, activeIndex]
  );

  const currentRecord = useMemo(
    () => history.find((r) => r.id === currentScanId) ?? null,
    [history, currentScanId]
  );

  // ── Capture → compress → identify → persist → result ──────────────
  const runScan = useCallback(async (source: "camera" | "library") => {
    void tapHaptic();
    const raw = await capturePhoto(source);
    if (!raw) return; // cancelled
    let compressed: string;
    try {
      const c = await compressImage(raw);
      compressed = c.dataUrl;
    } catch {
      compressed = raw;
    }
    setImage(compressed);
    setResult(null);
    setActiveIndex(0);
    setScanError(null);
    setView("analyzing");

    try {
      const res = await identifyPlant(compressed);
      setResult(res);
      setActiveIndex(0);
      setView("result");
      void successHaptic();
      void setStatusBar("dark");

      if (res.isPlant && res.primary) {
        // Persist on-device (thumbnail only, local).
        const seed = Date.now();
        let thumb = "";
        try {
          thumb = await makeThumbnail(compressed);
        } catch {
          thumb = "";
        }
        const record: ScanRecord = {
          id: `scan_${seed.toString(36)}`,
          createdAt: seed,
          thumbnail: thumb,
          primary: res.primary,
          candidates: res.candidates,
          favorite: false,
        };
        const next = await addScan(record);
        setHistory(next);
        setCurrentScanId(record.id);
      } else {
        setCurrentScanId(null);
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "We couldn't analyze that photo. Please try again.";
      setScanError(msg);
      setView("error");
      void setStatusBar("dark");
    }
  }, []);

  // ── Open a saved scan from history/favorites ──────────────────────
  const openRecord = useCallback((r: ScanRecord) => {
    setImage(r.thumbnail || null);
    setResult({
      identified: true,
      isPlant: true,
      primary: r.primary,
      candidates: r.candidates,
    });
    setActiveIndex(0);
    setCurrentScanId(r.id);
    setScanError(null);
    setView("result");
    void setStatusBar("dark");
  }, []);

  // ── Guidance: grow shows immediately; remove gates on safety sheet ─
  const loadGuidance = useCallback(
    async (action: GuidanceAction) => {
      const cand = activeCandidate;
      if (!cand) return;
      setGuidanceAction(action);
      setGuidance(null);
      setGuidanceError(null);
      setGuidanceLoading(true);
      setView("guidance");
      try {
        const g = await fetchGuidance({
          action,
          commonName: cand.commonName,
          scientificName: cand.scientificName,
          category: cand.category,
          shortDescription: cand.shortDescription,
        });
        setGuidance(g);
      } catch (err) {
        setGuidanceError(
          err instanceof ApiError
            ? err.message
            : "We couldn't load guidance. Please try again."
        );
      } finally {
        setGuidanceLoading(false);
      }
    },
    [activeCandidate]
  );

  const onGrow = useCallback(() => void loadGuidance("grow"), [loadGuidance]);

  // "Remove safely" ALWAYS opens the safety sheet first.
  const onRemove = useCallback(() => {
    void tapHaptic();
    setSafetyOpen(true);
  }, []);
  const onSafetyConfirm = useCallback(() => {
    setSafetyOpen(false);
    void loadGuidance("remove");
  }, [loadGuidance]);

  // ── Favorites / delete / share ────────────────────────────────────
  const onToggleFavorite = useCallback(async (r: ScanRecord) => {
    void tapHaptic();
    setHistory(await toggleFav(r.id));
  }, []);
  const onToggleCurrentFavorite = useCallback(async () => {
    if (!currentScanId) return;
    void tapHaptic();
    setHistory(await toggleFav(currentScanId));
  }, [currentScanId]);
  const onDelete = useCallback(async (r: ScanRecord) => {
    setHistory(await removeScan(r.id));
  }, []);
  const onClear = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  const onShare = useCallback(() => {
    const c = activeCandidate;
    if (!c) return;
    const sci = c.scientificName ? ` (${c.scientificName})` : "";
    void shareResult({
      title: `TorqLens — ${c.commonName}`,
      text: `I identified ${c.commonName}${sci} with TorqLens — ${c.matchPercent}% match. Always verify before acting.`,
    });
  }, [activeCandidate]);

  const goHome = useCallback(() => {
    setTab("home");
    setView("home");
    void setStatusBar("light");
  }, []);

  const startScanFromTab = useCallback(() => {
    goHome();
  }, [goHome]);

  // ── Tab switching ─────────────────────────────────────────────────
  const onTab = useCallback(
    (t: Tab) => {
      setTab(t);
      void tapHaptic();
      if (t === "home") {
        setView("home");
        void setStatusBar("light");
      } else if (t === "history") {
        setView("history");
        void setStatusBar("dark");
      } else if (t === "saved") {
        setView("saved");
        void setStatusBar("dark");
      } else {
        setView("about");
        void setStatusBar("dark");
      }
    },
    []
  );

  const favorites = useMemo(() => history.filter((r) => r.favorite), [history]);
  const currentIsFavorite = currentRecord?.favorite ?? false;

  // Tab bar visible only on the primary tab destinations.
  const showTabBar =
    view === "home" ||
    view === "history" ||
    view === "saved" ||
    view === "about";

  // ── Render ────────────────────────────────────────────────────────
  if (view === "onboarding") {
    return (
      <Onboarding
        onStart={() => {
          void setOnboarded();
          goHome();
        }}
      />
    );
  }

  if (view === "analyzing" && image) {
    return <Analyzing image={image} />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header: contextual */}
      {view === "result" && (
        <AppHeader title="Identification" onBack={goHome} />
      )}
      {view === "guidance" && (
        <AppHeader
          title={guidanceAction === "grow" ? "Grow guide" : "Remove safely"}
          onBack={() => setView("result")}
        />
      )}
      {view === "error" && <AppHeader title="TorqLens" onBack={goHome} />}

      <main className="flex-1 overflow-y-auto">
        {view === "home" && (
          <>
            <AppHeader />
            <Home
              recent={history}
              onCapture={() => void runScan("camera")}
              onPick={() => void runScan("library")}
              onOpenScan={openRecord}
              onSeeAll={() => onTab("history")}
            />
          </>
        )}

        {view === "result" && image && result && (
          <Result
            image={image}
            result={result}
            activeIndex={activeIndex}
            favorite={currentIsFavorite}
            onSelectCandidate={setActiveIndex}
            onGrow={onGrow}
            onRemove={onRemove}
            onShare={onShare}
            onToggleFavorite={onToggleCurrentFavorite}
            onNewScan={goHome}
          />
        )}

        {view === "guidance" && activeCandidate && (
          <Guidance
            action={guidanceAction}
            candidate={activeCandidate}
            loading={guidanceLoading}
            error={guidanceError}
            result={guidance}
            onRetry={() => void loadGuidance(guidanceAction)}
          />
        )}

        {view === "history" && (
          <>
            <AppHeader title="History" />
            <HistoryList
              variant="history"
              records={history}
              onOpen={openRecord}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
              onClear={onClear}
              onScan={startScanFromTab}
            />
          </>
        )}

        {view === "saved" && (
          <>
            <AppHeader title="Saved" />
            <HistoryList
              variant="saved"
              records={favorites}
              onOpen={openRecord}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
              onScan={startScanFromTab}
            />
          </>
        )}

        {view === "about" && (
          <>
            <AppHeader title="About" />
            <About />
          </>
        )}

        {view === "error" && (
          <div className="px-5 pb-10 pt-4">
            <Card className="px-5 py-8 text-center">
              <h1 className="text-xl font-bold text-foreground">
                Couldn&apos;t analyze that photo
              </h1>
              <p className="mx-auto mt-2 max-w-xs text-[14px] text-muted-foreground">
                {scanError}
              </p>
              <Button className="mt-5 w-full" size="lg" onClick={goHome}>
                Try another photo
              </Button>
            </Card>
          </div>
        )}
      </main>

      {showTabBar && <TabBar active={tab} onChange={onTab} />}

      {/* Safety gate before any removal guidance */}
      <SafetySheet
        open={safetyOpen}
        onConfirm={onSafetyConfirm}
        onCancel={() => setSafetyOpen(false)}
      />

      {/* Mark native so any platform-only CSS hooks could apply */}
      {isNative() ? null : null}
    </div>
  );
}
