import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  COMARQUES_DATA,
  PROVINCIES_DATA,
  ComarcaFeature,
  MAP_WIDTH,
  MAP_HEIGHT,
  normalizeText,
} from '../utils/cartography';
import { PAISATGE_META } from '../data/comarquesInfo';
import { CataloniaMap } from './CataloniaMap';
import {
  GripHorizontal,
  Trophy,
  RotateCcw,
  Lightbulb,
  Printer,
  CheckCircle2,
  XCircle,
  Sparkles,
  Keyboard,
  ListChecks,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type ActivityMode = 'A' | 'B' | 'C' | 'D';
export type DifficultyLevel = 'facil' | 'mitja' | 'dificil';

interface BlankMapSectionProps {
  bestScore: number;
  onUpdateBestScore: (score: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const BlankMapSection: React.FC<BlankMapSectionProps> = ({
  bestScore,
  onUpdateBestScore,
}) => {
  const [activity, setActivity] = useState<ActivityMode>('A');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('facil');
  const [selectedProvinciaNom, setSelectedProvinciaNom] = useState<string>('Girona');
  const [bInputMode, setBInputMode] = useState<'options' | 'write'>('options');
  const [writtenAnswer, setWrittenAnswer] = useState<string>('');

  // Game state
  const [queue, setQueue] = useState<ComarcaFeature[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [solvedByCodi, setSolvedByCodi] = useState<Record<string, 'first' | 'retry'>>({});
  const [wrongFlashCodi, setWrongFlashCodi] = useState<string | null>(null);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
  }>({
    type: 'info',
    message: 'Tria la resposta correcta al mapa mut!',
  });
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);

  // For Activity C (Drag & Drop or Tap-to-place)
  const [selectedTagCodi, setSelectedTagCodi] = useState<string | null>(null);

  // For A4 Printable Modal
  const [printModalMode, setPrintModalMode] = useState<'none' | 'mut' | 'noms'>('none');

  // Fullscreen state & ref for working comfortably on the blank map
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (containerRef.current && containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isFullscreen]);

  const poolForCurrentSettings = useMemo(() => {
    let base = COMARQUES_DATA;
    if (activity === 'D') {
      base = COMARQUES_DATA.filter(c =>
        c.provincies.some(p => p.nom === selectedProvinciaNom)
      );
    }
    const shuffled = shuffleArray(base);
    if (difficulty === 'facil') {
      return shuffled.slice(0, Math.min(8, shuffled.length));
    }
    if (difficulty === 'mitja') {
      return shuffled.slice(0, Math.min(16, shuffled.length));
    }
    return shuffled;
  }, [activity, difficulty, selectedProvinciaNom]);

  const startNewGame = useCallback(() => {
    const newQueue = poolForCurrentSettings;
    setQueue(newQueue);
    setCurrentIndex(0);
    setSolvedByCodi({});
    setWrongFlashCodi(null);
    setAttemptsOnCurrent(0);
    setScore(0);
    setStreak(0);
    setShowHint(difficulty === 'facil');
    setIsGameFinished(false);
    setWrittenAnswer('');
    if (newQueue.length > 0) {
      setSelectedTagCodi(newQueue[0].codi);
    }
    setFeedback({
      type: 'info',
      message:
        activity === 'A'
          ? '🎯 Fes clic sobre el mapa mut al lloc on es troba la comarca!'
          : activity === 'B'
          ? '👀 Mira la comarca pintada de taronja al mapa. Saps com es diu?'
          : activity === 'C'
          ? '🏷️ Arrossega una etiqueta fins al mapa (o toca l’etiqueta i després el mapa)!'
          : `🏛️ Practiquem les comarques de ${selectedProvinciaNom}! Fes clic al mapa!`,
    });
  }, [poolForCurrentSettings, difficulty, activity, selectedProvinciaNom]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const currentTarget: ComarcaFeature | null =
    !isGameFinished && queue.length > 0 && currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  const multipleChoiceOptions = useMemo(() => {
    if (!currentTarget) return [];
    const count = difficulty === 'facil' ? 3 : difficulty === 'mitja' ? 4 : 6;
    const others = shuffleArray(
      COMARQUES_DATA.filter(c => c.codi !== currentTarget.codi)
    ).slice(0, count - 1);
    return shuffleArray([currentTarget, ...others]);
  }, [currentTarget, difficulty]);

  const provinceFocusBBox = useMemo(() => {
    if (activity !== 'D') return null;
    const prov = PROVINCIES_DATA.find(p => p.nom === selectedProvinciaNom);
    return prov ? prov.bbox : null;
  }, [activity, selectedProvinciaNom]);

  const triggerSuccess = (target: ComarcaFeature, wasFirstTry: boolean) => {
    const gained = wasFirstTry ? 10 : 5;
    const newScore = score + gained;
    const newStreak = wasFirstTry ? streak + 1 : 1;
    setScore(newScore);
    setStreak(newStreak);
    onUpdateBestScore(newScore);

    setSolvedByCodi(prev => {
      const updated = {
        ...prev,
        [target.codi]: (wasFirstTry ? 'first' : 'retry') as 'first' | 'retry',
      };
      if (Object.keys(updated).length >= queue.length) {
        setIsGameFinished(true);
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      return updated;
    });

    setFeedback({
      type: 'success',
      message: `🌟 Súper bé! Has encertat ${target.didactic.article}${target.nom} (capital: ${target.capital}). +${gained} punts!`,
    });
    setAttemptsOnCurrent(0);
    setShowHint(difficulty === 'facil');
    setWrittenAnswer('');

    if (activity !== 'C') {
      if (currentIndex + 1 < queue.length) {
        setCurrentIndex(prev => prev + 1);
      }
    } else {
      const nextUnsolved = queue.find(
        c => c.codi !== target.codi && !solvedByCodi[c.codi]
      );
      setSelectedTagCodi(nextUnsolved ? nextUnsolved.codi : null);
    }
  };

  const triggerMistake = (clickedOrGuessedName: string, target: ComarcaFeature) => {
    const nextAttempts = attemptsOnCurrent + 1;
    setAttemptsOnCurrent(nextAttempts);
    setStreak(0);
    if (difficulty !== 'dificil' && nextAttempts >= 1) {
      setShowHint(true);
    }
    setFeedback({
      type: 'error',
      message: `🙈 Ui! Això és ${clickedOrGuessedName}. Torna-ho a provar! Pista: la seva capital és ${target.capital}.`,
    });
  };

  const handleMapClickComarca = (clickedComarca: ComarcaFeature) => {
    if (isGameFinished) return;

    if (activity === 'A' || activity === 'D') {
      if (!currentTarget) return;
      if (clickedComarca.codi === currentTarget.codi) {
        triggerSuccess(currentTarget, attemptsOnCurrent === 0);
      } else {
        setWrongFlashCodi(clickedComarca.codi);
        setTimeout(() => setWrongFlashCodi(null), 900);
        triggerMistake(clickedComarca.nom, currentTarget);
      }
    } else if (activity === 'C') {
      if (!selectedTagCodi) {
        setFeedback({
          type: 'info',
          message: '🏷️ Primer tria o arrossega una etiqueta de comarca de la llista!',
        });
        return;
      }
      const targetObj = COMARQUES_DATA.find(c => c.codi === selectedTagCodi);
      if (!targetObj) return;
      if (clickedComarca.codi === selectedTagCodi) {
        triggerSuccess(targetObj, attemptsOnCurrent === 0);
      } else {
        setWrongFlashCodi(clickedComarca.codi);
        setTimeout(() => setWrongFlashCodi(null), 900);
        triggerMistake(clickedComarca.nom, targetObj);
      }
    }
  };

  const handleDropOnComarca = (targetComarca: ComarcaFeature, droppedCodi: string) => {
    if (isGameFinished || activity !== 'C') return;
    const droppedObj = COMARQUES_DATA.find(c => c.codi === droppedCodi);
    if (!droppedObj) return;

    if (targetComarca.codi === droppedCodi) {
      triggerSuccess(droppedObj, true);
    } else {
      setWrongFlashCodi(targetComarca.codi);
      setTimeout(() => setWrongFlashCodi(null), 900);
      triggerMistake(targetComarca.nom, droppedObj);
    }
  };

  const handleSelectOptionB = (option: ComarcaFeature) => {
    if (!currentTarget || isGameFinished) return;
    if (option.codi === currentTarget.codi) {
      triggerSuccess(currentTarget, attemptsOnCurrent === 0);
    } else {
      triggerMistake(option.nom, currentTarget);
    }
  };

  const handleSubmitWrittenB = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTarget || isGameFinished || !writtenAnswer.trim()) return;
    const normInput = normalizeText(writtenAnswer);
    const normTarget = normalizeText(currentTarget.nom);

    if (
      normInput === normTarget ||
      (currentTarget.codi === '39' && (normInput === 'aran' || normInput === 'val d aran'))
    ) {
      triggerSuccess(currentTarget, attemptsOnCurrent === 0);
    } else {
      triggerMistake(`«${writtenAnswer}»`, currentTarget);
    }
  };

  const getComarcaFill = (comarca: ComarcaFeature): string => {
    if (wrongFlashCodi === comarca.codi) {
      return '#fca5a5';
    }
    const solvedState = solvedByCodi[comarca.codi];
    if (solvedState === 'first') {
      return '#4ade80';
    }
    if (solvedState === 'retry') {
      return '#fde047';
    }
    if (activity === 'B' && currentTarget?.codi === comarca.codi) {
      return '#f59e0b';
    }
    if (activity === 'D') {
      const inProv = comarca.provincies.some(p => p.nom === selectedProvinciaNom);
      if (!inProv) return '#e2e8f0';
    }
    if (difficulty === 'facil' || (showHint && attemptsOnCurrent >= 2)) {
      const activeObj =
        activity === 'C'
          ? COMARQUES_DATA.find(c => c.codi === selectedTagCodi)
          : currentTarget;
      if (activeObj && activeObj.codi === comarca.codi && attemptsOnCurrent >= 2) {
        return '#fef08a';
      }
      if (difficulty === 'facil' && queue.some(q => q.codi === comarca.codi)) {
        return '#e0f2fe';
      }
    }
    return '#ffffff';
  };

  const customLabelsByCodi = useMemo(() => {
    const out: Record<string, { text: string; status?: 'correct' | 'wrong' | 'neutral' }> = {};
    for (const [codi, status] of Object.entries(solvedByCodi)) {
      const com = COMARQUES_DATA.find(c => c.codi === codi);
      if (com) {
        out[codi] = {
          text: com.nom,
          status: status === 'first' ? 'correct' : 'neutral',
        };
      }
    }
    return out;
  }, [solvedByCodi]);

  const handlePrintA4 = (mode: 'mut' | 'noms') => {
    setPrintModalMode(mode);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const solvedCount = Object.keys(solvedByCodi).length;

  return (
    <div
      ref={containerRef}
      className={`space-y-5 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#fffbeb] overflow-y-auto p-4 sm:p-6'
          : ''
      }`}
    >
      {/* Top Activity & Difficulty Selector Bar */}
      <div className="kid-card bg-white border-amber-400 p-4 sm:p-5 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              🎮 Mapa mut interactiu: Juga i posa’t a prova!
            </h2>
            <p className="text-sm font-semibold text-slate-600">
              Tria un dels 4 jocs i el teu nivell per guanyar estrelles col·locant les comarques!
            </p>
          </div>

          {/* Fullscreen & Printable A4 Map Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`kid-btn px-3.5 py-2 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800'
              }`}
              title={
                isFullscreen
                  ? 'Surt de la pantalla completa'
                  : 'Treballa el mapa mut a pantalla completa'
              }
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Surt de pantalla completa</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>📺 Pantalla completa</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handlePrintA4('mut')}
              className="kid-btn px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border-slate-950 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Imprimeix A4 (Mapa mut)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrintA4('noms')}
              className="kid-btn px-3.5 py-2 bg-sky-500 hover:bg-sky-400 border-sky-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Imprimeix A4 (Amb noms)</span>
            </button>
          </div>
        </div>

        {/* 4 Activity Mode Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActivity('A')}
            className={`kid-btn p-3.5 text-left flex items-start gap-3 cursor-pointer ${
              activity === 'A'
                ? 'bg-sky-500 text-white border-sky-800'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-950 border-sky-300'
            }`}
          >
            <span className="text-2xl shrink-0">🎯</span>
            <div>
              <p className="font-extrabold text-sm">Joc A. Col·loca les comarques</p>
              <p className="text-xs opacity-90 mt-0.5 font-medium">
                Mira el nom i toca on és al mapa mut!
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActivity('B')}
            className={`kid-btn p-3.5 text-left flex items-start gap-3 cursor-pointer ${
              activity === 'B'
                ? 'bg-amber-400 text-slate-950 border-amber-700'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
            }`}
          >
            <span className="text-2xl shrink-0">❓</span>
            <div>
              <p className="font-extrabold text-sm">Joc B. Quina comarca és?</p>
              <p className="text-xs opacity-90 mt-0.5 font-medium">
                Endevina com es diu la comarca pintada!
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActivity('C')}
            className={`kid-btn p-3.5 text-left flex items-start gap-3 cursor-pointer ${
              activity === 'C'
                ? 'bg-emerald-500 text-white border-emerald-800'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
            }`}
          >
            <span className="text-2xl shrink-0">🏷️</span>
            <div>
              <p className="font-extrabold text-sm">Joc C. Arrossega els noms</p>
              <p className="text-xs opacity-90 mt-0.5 font-medium">
                Porta cada etiqueta fins a la seva comarca!
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActivity('D')}
            className={`kid-btn p-3.5 text-left flex items-start gap-3 cursor-pointer ${
              activity === 'D'
                ? 'bg-violet-600 text-white border-violet-900'
                : 'bg-violet-50 hover:bg-violet-100 text-violet-950 border-violet-300'
            }`}
          >
            <span className="text-2xl shrink-0">🏛️</span>
            <div>
              <p className="font-extrabold text-sm">Joc D. Practica per províncies</p>
              <p className="text-xs opacity-90 mt-0.5 font-medium">
                Entrena Barcelona, Girona, Lleida o Tarragona!
              </p>
            </div>
          </button>
        </div>

        {/* Difficulty Selector + Scoreboard Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-amber-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              ⭐ Nivell:
            </span>
            {(
              [
                {
                  id: 'facil',
                  label: '🐣 Fàcil (8 comarques + pistes)',
                },
                {
                  id: 'mitja',
                  label: '🚀 Mitjà (16 comarques)',
                },
                {
                  id: 'dificil',
                  label: '🏆 Difícil (Totes 43, sense pistes!)',
                },
              ] as { id: DifficultyLevel; label: string }[]
            ).map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setDifficulty(lvl.id)}
                className={`kid-btn px-3 py-1.5 text-xs font-extrabold cursor-pointer ${
                  difficulty === lvl.id
                    ? 'bg-amber-400 text-slate-950 border-amber-700'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Live Scoreboard */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs font-extrabold flex items-center gap-1.5">
              <span>✅ Encerts: {solvedCount} / {queue.length}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 text-xs font-extrabold flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>⭐ Punts: {score}</span>
              <span className="text-[10px] opacity-80">(Rècord: {bestScore})</span>
            </div>
            {streak > 1 && (
              <div className="px-3 py-1.5 rounded-2xl bg-orange-200 border-2 border-orange-400 text-orange-950 text-xs font-extrabold animate-bounce">
                🔥 Ratxa x{streak}!
              </div>
            )}
            <button
              type="button"
              onClick={startNewGame}
              className="kid-btn px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nova partida</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch print:hidden">
        {/* Left Control & Question Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {activity === 'D' && (
            <div className="kid-card bg-white border-violet-400 p-4 space-y-2.5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-violet-900">
                🏛️ Tria quina província vols entrenar:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROVINCIES_DATA.map(prov => (
                  <button
                    key={prov.codi}
                    type="button"
                    onClick={() => setSelectedProvinciaNom(prov.nom)}
                    className={`kid-btn py-2 px-3 font-extrabold text-xs cursor-pointer ${
                      selectedProvinciaNom === prov.nom
                        ? 'text-white'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    style={
                      selectedProvinciaNom === prov.nom
                        ? {
                            backgroundColor: prov.didactic.colorHex,
                            borderColor: prov.didactic.colorBorderHex,
                          }
                        : undefined
                    }
                  >
                    {prov.nom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Prompt / Challenge Box */}
          <div className="kid-card bg-white border-sky-400 p-5 flex-1 flex flex-col justify-between space-y-4">
            {isGameFinished ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-amber-200 border-3 border-amber-500 flex items-center justify-center mx-auto text-4xl shadow-md animate-bounce">
                  🏆
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                   Fantàstic! Has superat tot el repte! 🎉
                </h3>
                <p className="text-base font-semibold text-slate-700">
                  Has encertat les <strong>{queue.length} comarques</strong> i has guanyat <strong>{score} punts</strong>! Ets un/a crack de la geografia!
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="kid-btn px-6 py-3 bg-amber-400 hover:bg-amber-300 border-amber-700 text-slate-950 font-extrabold text-base flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>🎮 Juga una altra partida!</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {(activity === 'A' || activity === 'D') && currentTarget && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-sky-100 border-2 border-sky-300 text-sky-950 text-xs font-extrabold">
                        🌟 Comarca {currentIndex + 1} de {queue.length}
                      </span>
                      {difficulty !== 'dificil' && (
                        <button
                          type="button"
                          onClick={() => setShowHint(v => !v)}
                          className="px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-400 text-xs font-extrabold text-amber-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{showHint ? 'Amaga pista' : '💡 Vols una pista?'}</span>
                        </button>
                      )}
                    </div>

                    <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-100 via-cyan-50 to-amber-100 border-3 border-sky-400 text-center space-y-2 shadow-xs">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                        🎯 Busca i toca aquesta comarca al mapa!
                      </p>
                      <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {currentTarget.nom}
                      </h3>
                    </div>

                    {showHint && (
                      <div className="p-3.5 rounded-2xl bg-amber-100/90 border-2 border-amber-400 text-xs sm:text-sm text-amber-950 space-y-1 font-medium">
                        <p className="font-extrabold flex items-center gap-1.5">
                          <span>🕵️‍♂️ Pista súper secreta:</span>
                        </p>
                        <p>
                          • 📍 <strong>Capital:</strong> {currentTarget.capital}
                        </p>
                        <p>
                          • 🏞️ <strong>Paisatge:</strong>{' '}
                          {PAISATGE_META[currentTarget.didactic.paisatgePrincipal].titol} (Província de{' '}
                          {currentTarget.provinciaPrincipal})
                        </p>
                        <p className="text-xs text-amber-900">{currentTarget.didactic.localitzacioText}</p>
                      </div>
                    )}
                  </div>
                )}

                {activity === 'B' && currentTarget && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-200 border-2 border-amber-400 text-amber-950 text-xs font-extrabold">
                        ❓ Pregunta {currentIndex + 1} de {queue.length}
                      </span>

                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border-2 border-slate-200">
                        <button
                          type="button"
                          onClick={() => setBInputMode('options')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                            bInputMode === 'options'
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <ListChecks className="w-3.5 h-3.5" />
                          <span>Opcions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBInputMode('write')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                            bInputMode === 'write'
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <Keyboard className="w-3.5 h-3.5" />
                          <span>Escriu-ho</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-3xl bg-amber-100 border-3 border-amber-400 text-center space-y-1">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                        👀 Mira la comarca pintada de color taronja al mapa!
                      </p>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        Com es diu aquesta comarca?
                      </h3>
                      {showHint && (
                        <p className="text-xs font-bold text-amber-950 pt-1">
                          💡 Pista: La seva capital és <strong>{currentTarget.capital}</strong>!
                        </p>
                      )}
                    </div>

                    {bInputMode === 'options' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {multipleChoiceOptions.map(opt => (
                          <button
                            key={opt.codi}
                            type="button"
                            onClick={() => handleSelectOptionB(opt)}
                            className="kid-btn p-3.5 bg-sky-50 hover:bg-sky-100 border-sky-300 hover:border-sky-500 text-left cursor-pointer"
                          >
                            <p className="font-extrabold text-sm text-slate-900">👉 {opt.nom}</p>
                            {difficulty === 'facil' && (
                              <p className="text-xs font-semibold text-sky-800 pl-5">
                                Cap.: {opt.capital}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitWrittenB} className="space-y-2.5">
                        <input
                          type="text"
                          value={writtenAnswer}
                          onChange={e => setWrittenAnswer(e.target.value)}
                          placeholder="✍️ Escriu aquí el nom de la comarca..."
                          className="w-full px-4 py-3 rounded-2xl border-3 border-sky-300 focus:border-sky-600 focus:outline-none text-base font-extrabold text-slate-900 bg-sky-50/40"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="kid-btn flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white font-extrabold text-sm cursor-pointer"
                          >
                            ✅ Comprova la resposta!
                          </button>
                          {difficulty !== 'dificil' && (
                            <button
                              type="button"
                              onClick={() => setShowHint(true)}
                              className="kid-btn px-3.5 py-2.5 bg-amber-200 border-amber-500 text-amber-950 font-extrabold text-xs cursor-pointer"
                            >
                              💡 Pista
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {activity === 'C' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                        🏷️ Etiquetes per col·locar ({queue.length - solvedCount} pendents)
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Arrossega o toca etiqueta + mapa!
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-3 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200">
                      {queue.map(item => {
                        const isDone = Boolean(solvedByCodi[item.codi]);
                        const isSelectedTag = selectedTagCodi === item.codi;
                        if (isDone) return null;
                        return (
                          <div
                            key={item.codi}
                            draggable
                            onDragStart={e => {
                              e.dataTransfer.setData('text/plain', item.codi);
                              setSelectedTagCodi(item.codi);
                            }}
                            onClick={() => setSelectedTagCodi(item.codi)}
                            className={`kid-btn px-3.5 py-2 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none ${
                              isSelectedTag
                                ? 'bg-amber-300 text-slate-950 border-amber-600 scale-105'
                                : 'bg-white hover:bg-emerald-100 text-slate-800 border-emerald-400'
                            }`}
                          >
                            <GripHorizontal className="w-3.5 h-3.5 opacity-60" />
                            <span>{item.nom}</span>
                          </div>
                        );
                      })}
                    </div>

                    {selectedTagCodi && (
                      <div className="p-3 rounded-2xl bg-amber-100 border-2 border-amber-400 text-xs font-semibold text-amber-950">
                        🏷️ Etiqueta a punt:{' '}
                        <strong>
                          {COMARQUES_DATA.find(c => c.codi === selectedTagCodi)?.nom}
                        </strong>
                        {showHint && (
                          <span>
                            {' '}
                            · 📍 Pista capital:{' '}
                            <strong>
                              {COMARQUES_DATA.find(c => c.codi === selectedTagCodi)?.capital}
                            </strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Immediate Formative Feedback Banner */}
                <div
                  className={`p-4 rounded-2xl border-3 text-sm font-extrabold flex items-start gap-2.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                      : feedback.type === 'error'
                      ? 'bg-rose-100 border-rose-500 text-rose-950'
                      : 'bg-sky-50 border-sky-300 text-sky-950'
                  }`}
                >
                  {feedback.type === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {feedback.type === 'error' && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  {feedback.type === 'info' && (
                    <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Interactive Blank Map (7 cols) */}
        <div
          className={`lg:col-span-7 ${
            isFullscreen
              ? 'h-[620px] lg:h-[calc(100vh-240px)] min-h-[560px]'
              : 'h-[520px] lg:h-[640px]'
          }`}
        >
          <CataloniaMap
            selectedCodi={activity === 'B' ? currentTarget?.codi || null : null}
            highlightedTargetCodi={activity === 'B' ? currentTarget?.codi || null : null}
            onSelectComarca={handleMapClickComarca}
            onDropOnComarca={handleDropOnComarca}
            getComarcaFill={getComarcaFill}
            showComarcaNames={false}
            showCapitalNames={difficulty === 'facil' && showHint}
            showProvinciaBorders={activity === 'D'}
            customLabelsByCodi={customLabelsByCodi}
            externalFocusBBox={provinceFocusBBox}
            legendSlot={
              <button
                type="button"
                onClick={toggleFullscreen}
                className="kid-btn bg-amber-300 hover:bg-amber-200 text-slate-950 border-amber-600 px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                title={
                  isFullscreen
                    ? 'Surt de la pantalla completa'
                    : 'Amplia el mapa mut a pantalla completa'
                }
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4 text-rose-700" />
                    <span>Surt pantalla completa</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-indigo-800" />
                    <span>📺 Pantalla completa</span>
                  </>
                )}
              </button>
            }
          />
        </div>
      </div>

      {/* Printable A4 Sheet Section */}
      <div
        className={`${
          printModalMode !== 'none'
            ? 'fixed inset-0 z-50 bg-slate-900/75 overflow-y-auto flex items-start justify-center p-4 print:static print:bg-white print:p-0'
            : 'hidden print:block'
        }`}
      >
        <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl print:shadow-none print:p-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrintModalMode('mut')}
                className={`kid-btn px-3 py-1.5 text-xs font-extrabold cursor-pointer ${
                  printModalMode === 'mut'
                    ? 'bg-amber-400 text-slate-950 border-amber-700'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                Versió sense noms (Mapa mut)
              </button>
              <button
                type="button"
                onClick={() => setPrintModalMode('noms')}
                className={`kid-btn px-3 py-1.5 text-xs font-extrabold cursor-pointer ${
                  printModalMode === 'noms'
                    ? 'bg-sky-500 text-white border-sky-700'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                Versió amb noms i capitals
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="kid-btn px-4 py-2 bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Imprimeix ara (A4)</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintModalMode('none')}
                className="kid-btn px-3.5 py-2 bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-900 font-extrabold text-xs cursor-pointer"
              >
                Tanca
              </button>
            </div>
          </div>

          <div className="border-2 border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {printModalMode === 'noms'
                    ? 'MAPA DE LES COMARQUES DE CATALUNYA (Amb noms i capitals)'
                    : 'MAPA MUT DE LES COMARQUES DE CATALUNYA'}
                </h2>
                <p className="text-xs text-slate-600">
                  Cartografia oficial ICGC · 42 comarques i l’Aran (inclou el Lluçanès) · 4t de Primària
                </p>
              </div>
              <div className="text-xs text-right space-y-1">
                <p>Nom i cognoms: _____________________________________</p>
                <p>Curs: 4t ____ &nbsp;&nbsp; Data: ____ / ____ / 202___</p>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                className="w-full max-h-[680px] border border-slate-200 rounded-lg bg-white"
              >
                {COMARQUES_DATA.map(com => (
                  <path
                    key={`print-${com.codi}`}
                    d={com.svgPath}
                    fill={printModalMode === 'noms' ? '#f8fafc' : '#ffffff'}
                    stroke="#1e293b"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                ))}
                {printModalMode === 'noms' &&
                  COMARQUES_DATA.map(com => (
                    <g key={`print-lbl-${com.codi}`}>
                      {com.capitals.map(cap => (
                        <circle
                          key={`${com.codi}-${cap.nom}`}
                          cx={cap.x}
                          cy={cap.y}
                          r="2.4"
                          fill="#dc2626"
                        />
                      ))}
                      <text
                        x={com.centroid.x}
                        y={com.centroid.y}
                        textAnchor="middle"
                        fontSize={com.superficieKm2 < 300 ? '7.2' : '8.5'}
                        fontWeight="800"
                        fill="#0f172a"
                        style={{
                          paintOrder: 'stroke',
                          stroke: '#ffffff',
                          strokeWidth: '2.5px',
                        }}
                      >
                        {com.nom}
                      </text>
                    </g>
                  ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
