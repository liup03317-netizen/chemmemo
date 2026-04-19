import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { equations } from '../data/equations';
import { generateQuestions } from '../utils/gameLogic';
import { MistakeTag, Question } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { EquationLine } from '../components/EquationLine';
import { BalanceEquation } from '../components/BalanceEquation';
import { X, Heart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Lesson({
  mode = 'level',
  equationIds,
  onExit,
  onComplete,
}: {
  mode?: 'level' | 'review';
  equationIds?: string[];
  onExit?: () => void;
  onComplete?: () => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { levels, completeLevel, addXp, hearts, loseHeart, refillHearts, recordReviewResult } = useStore();
  const isReview = mode === 'review';
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [balanceReactants, setBalanceReactants] = useState<number[]>([]);
  const [balanceProducts, setBalanceProducts] = useState<number[]>([]);
  const [clozeFilled, setClozeFilled] = useState<string[]>([]);
  const [matchSelectedLeftId, setMatchSelectedLeftId] = useState<string | null>(null);
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [recallFilled, setRecallFilled] = useState<string[]>([]);
  const [recallConditions, setRecallConditions] = useState<string>('');
  const [recallCoefReactants, setRecallCoefReactants] = useState<number[]>([]);
  const [recallCoefProducts, setRecallCoefProducts] = useState<number[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);

  useEffect(() => {
      // If we are in 'level' mode, the URL has /lesson/:id, so we use `id`
      // If we are in 'review' mode or have explicitly passed `equationIds`, we use that instead.
      const targetId = id || (window.location.pathname.includes('/lesson/') ? window.location.pathname.split('/').pop() : undefined);

      if (equationIds && equationIds.length > 0) {
        const levelEquations = equations.filter((eq) => equationIds.includes(eq.id));
        const all = generateQuestions(levelEquations);
        setQuestions(pickSessionQuestions(all, isReview ? 10 : 5));
        setSessionCorrectCount(0);
        setCurrentIndex(0);
        setSelectedOptions([]);
        setIsChecked(false);
        setIsCorrect(false);
        setIsGameOver(false);
        return;
      }

      if (targetId) {
        const level = levels.find((l) => l.id === targetId);
        if (!level) return;

        const levelEquations = equations.filter((eq) =>
          level.equations.includes(eq.id)
        );
        const questionCount = level.id === 'lvl-gaokao' ? 15 : level.id === 'lvl-zhongkao' ? 10 : 5;
        const all = generateQuestions(levelEquations);
        setQuestions(pickSessionQuestions(all, questionCount));
        setSessionCorrectCount(0);
        setCurrentIndex(0);
        setSelectedOptions([]);
        setIsChecked(false);
        setIsCorrect(false);
        setIsGameOver(false);
      }
    }, [equationIds, id, isReview, levels]);

  function pickSessionQuestions(all: Question[], count: number) {
    const pick: Question[] = [];
    const used = new Set<Question>();

    const byType = (t: Question['type']) => all.filter((q) => q.type === t);
    const priority: Question['type'][] = ['balance', 'cloze', 'match', 'recall'];

    priority.forEach((t) => {
      if (pick.length >= count) return;
      const candidate = byType(t).find((q) => !used.has(q));
      if (candidate) {
        pick.push(candidate);
        used.add(candidate);
      }
    });

    for (const q of all) {
      if (pick.length >= count) break;
      if (used.has(q)) continue;
      pick.push(q);
      used.add(q);
    }

    return pick.slice(0, count);
  }

  useEffect(() => {
    const q = questions[currentIndex];
    if (!q) return;
    if (q.type === 'balance' && q.balance) {
      setBalanceReactants(q.balance.reactants.map(() => 1));
      setBalanceProducts(q.balance.products.map(() => 1));
      setClozeFilled([]);
      setMatchSelectedLeftId(null);
      setMatchPairs({});
      setRecallFilled([]);
      setRecallConditions('');
      setRecallCoefReactants([]);
      setRecallCoefProducts([]);
    } else {
      setBalanceReactants([]);
      setBalanceProducts([]);
      if (q.type === 'cloze' && q.cloze) {
        setClozeFilled(Array.from({ length: q.cloze.slots }).map(() => ''));
      } else {
        setClozeFilled([]);
      }

      if (q.type === 'match' && q.match) {
        setMatchSelectedLeftId(null);
        setMatchPairs({});
      } else {
        setMatchSelectedLeftId(null);
        setMatchPairs({});
      }

      if (q.type === 'recall' && q.recall) {
        setRecallFilled(Array.from({ length: q.recall.productSlots }).map(() => ''));
        setRecallConditions(q.recall.correctConditions ? '' : '');
        setRecallCoefReactants(q.recall.reactants.map(() => 1));
        setRecallCoefProducts(Array.from({ length: q.recall.productSlots }).map(() => 1));
      } else {
        setRecallFilled([]);
        setRecallConditions('');
        setRecallCoefReactants([]);
        setRecallCoefProducts([]);
      }
    }
  }, [currentIndex, questions]);

  if (questions.length === 0) return <div>Loading...</div>;

  if (hearts === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <Heart className="w-24 h-24 text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4">生命值耗尽</h1>
        <p className="text-gray-500 mb-8">休息一下，补充生命值后再来挑战吧！</p>
        <Button onClick={() => { refillHearts(); navigate('/'); }} size="lg">
          补充生命值并返回
        </Button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="mb-8"
        >
          <div className="text-8xl">🎉</div>
        </motion.div>
        <h1 className="text-3xl font-extrabold text-[#58CC02] mb-4">{isReview ? '复习完成！' : '太棒了！'}</h1>
        <p className="text-xl text-gray-500 mb-8">
          {isReview ? (
            <>
              今日已完成 {questions.length} 题
              <br />
              正确 {sessionCorrectCount} 题
            </>
          ) : (
            <>
              你完成了本关卡练习！
              <br />
              获得 15 XP
            </>
          )}
        </p>
        <Button
          onClick={() => {
            if (isReview) {
              addXp(10);
              if (onComplete) onComplete();
              else navigate('/review');
              return;
            }
            if (id) completeLevel(id);
            addXp(15);
            if (onComplete) onComplete();
            else navigate('/');
          }}
          size="lg"
          className="w-full max-w-sm"
        >
          {isReview ? '返回' : '继续'}
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;
  
  const currentEq = equations.find((eq) => eq.id === currentQuestion.equationId);

  const toggleOption = (option: string) => {
    if (currentQuestion.isMultiSelect) {
      setSelectedOptions(prev => 
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  const handleCheck = () => {
    if (isChecked) {
      // Move to next question
      if (currentIndex + 1 >= questions.length) {
        setIsGameOver(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setSelectedOptions([]);
        setIsChecked(false);
        setIsCorrect(false);
      }
      return;
    }

    // Check answer
    const isAnsCorrect =
      currentQuestion.type === 'balance' && currentQuestion.balance
        ? balanceReactants.length === currentQuestion.balance.correctReactantCoefficients.length &&
          balanceProducts.length === currentQuestion.balance.correctProductCoefficients.length &&
          currentQuestion.balance.correctReactantCoefficients.every((c, i) => (balanceReactants[i] ?? 1) === c) &&
          currentQuestion.balance.correctProductCoefficients.every((c, i) => (balanceProducts[i] ?? 1) === c)
        : currentQuestion.type === 'cloze' && currentQuestion.cloze
          ? clozeFilled.every((x) => x.trim()) &&
            sameSet(clozeFilled, currentQuestion.cloze.correctProducts)
        : currentQuestion.type === 'match' && currentQuestion.match
          ? currentQuestion.match.leftItems.length > 0 &&
            Object.keys(matchPairs).length === currentQuestion.match.leftItems.length &&
            currentQuestion.match.leftItems.every((leftItem) => {
              const userRightId = matchPairs[leftItem.id];
              const correctLeftId = currentQuestion.match!.correctPairs.find(p => p.rightId === userRightId)?.leftId;
              const requiredCondition = currentQuestion.match!.leftItems.find(l => l.id === correctLeftId)?.label;
              return leftItem.label === requiredCondition;
            })
        : currentQuestion.type === 'recall' && currentQuestion.recall
          ? recallFilled.every((x) => x.trim()) &&
            sameSet(recallFilled, currentQuestion.recall.correctProducts) &&
            currentQuestion.recall.correctReactantCoefficients.every((c, i) => (recallCoefReactants[i] ?? 1) === c) &&
            currentQuestion.recall.correctProducts.every((correctProd, correctIndex) => {
              const userIndex = recallFilled.indexOf(correctProd);
              return userIndex !== -1 && (recallCoefProducts[userIndex] ?? 1) === currentQuestion.recall!.correctProductCoefficients[correctIndex];
            }) &&
            normalizeCond(recallConditions) === normalizeCond(currentQuestion.recall.correctConditions)
        : Array.isArray(currentQuestion.correctAnswer)
          ? selectedOptions.length === currentQuestion.correctAnswer.length &&
            currentQuestion.correctAnswer.every(ans => selectedOptions.includes(ans))
          : selectedOptions[0] === currentQuestion.correctAnswer;

    setIsCorrect(isAnsCorrect);
    setIsChecked(true);

    recordReviewResult({
      equationId: currentQuestion.equationId,
      correct: isAnsCorrect,
      tags: isAnsCorrect ? [] : getMistakeTags(),
      source: isReview ? 'review' : 'practice',
    });

    if (isAnsCorrect) {
      setSessionCorrectCount((c) => c + 1);
    }

    if (!isAnsCorrect) {
      loseHeart();
    }
  };

  const expectedAnswerText =
    currentQuestion.type === 'match' && currentQuestion.match
      ? currentQuestion.match.correctPairs
          .map((p) => {
            const left = currentQuestion.match?.leftItems.find((l) => l.id === p.leftId)?.label ?? '';
            const right = currentQuestion.match?.rightItems.find((r) => r.id === p.rightId);
            return right ? `${left} → ${right.reactants.join(' + ')} → ${right.products.join(' + ')}` : '';
          })
          .filter(Boolean)
          .join('；')
      : Array.isArray(currentQuestion.correctAnswer)
        ? currentQuestion.correctAnswer.join(', ')
        : currentQuestion.correctAnswer;

  function stripMarks(text: string) {
    return text.replace(/[↑↓]/g, '');
  }

  function normalizeCond(text: string) {
    const t = text.trim();
    if (!t || t === '无' || t === '无条件') return '';
    return t;
  }

  function sameSet(a: string[], b: string[]) {
    const aa = [...a].sort();
    const bb = [...b].sort();
    return aa.length === bb.length && aa.every((v, i) => v === bb[i]);
  }

  function getMistakeTags(): MistakeTag[] {
    if (isCorrect) return [];
    const selected = selectedOptions[0] ?? '';

    if (currentQuestion.type === 'balance' && currentQuestion.balance) {
      return ['balance_wrong'];
    }

    if (currentQuestion.type === 'match' && currentQuestion.match) {
      return ['condition_wrong'];
    }

    if (currentQuestion.type === 'match_condition') {
      return ['condition_wrong'];
    }

    if (currentQuestion.type === 'cloze' && currentQuestion.cloze) {
      const correctArr = currentQuestion.cloze.correctProducts;
      const filled = clozeFilled.filter((x) => x.trim());

      const symbolMistakes = filled.some((x) =>
        correctArr.some((c) => stripMarks(c) === stripMarks(x) && c !== x)
      );
      if (symbolMistakes) return ['symbol_missing_or_wrong'];
      return ['products_wrong'];
    }

    if (currentQuestion.type === 'predict_product') {
      if (Array.isArray(currentQuestion.correctAnswer)) {
        const correctArr = currentQuestion.correctAnswer;
        const symbolMistakes = selectedOptions.some((x) =>
          correctArr.some((c) => stripMarks(c) === stripMarks(x) && c !== x)
        );
        if (symbolMistakes) return ['symbol_missing_or_wrong'];
        return ['products_wrong'];
      }

      const correct = currentQuestion.correctAnswer;
      if (stripMarks(selected) === stripMarks(correct) && selected !== correct) {
        return ['symbol_missing_or_wrong'];
      }
      return ['products_wrong'];
    }

    if (currentQuestion.type === 'true_false') {
      const eq = currentEq;
      const view = currentQuestion.equationView;
      if (!eq || !view) return [];

      if (currentQuestion.correctAnswer === '错误' && selected === '正确') {
        const viewCond = normalizeCond(view.conditions);
        const correctCond = normalizeCond(eq.conditions || '');

        if (viewCond !== correctCond) {
          if (!viewCond && correctCond) return ['condition_missing'];
          return ['condition_wrong'];
        }

        const viewProducts = view.products;
        const correctProducts = eq.products;

        if (
          sameSet(viewProducts.map(stripMarks), correctProducts.map(stripMarks)) &&
          !sameSet(viewProducts, correctProducts)
        ) {
          return ['symbol_missing_or_wrong'];
        }

        return ['products_wrong'];
      }
    }

    if (currentQuestion.type === 'recall' && currentQuestion.recall) {
        const correct = currentQuestion.recall;

        const symbolMistakes = recallFilled.some((x) =>
          correct.correctProducts.some((c) => stripMarks(c) === stripMarks(x) && c !== x)
        );
        if (symbolMistakes) return ['symbol_missing_or_wrong'];

        if (!sameSet(recallFilled, correct.correctProducts)) return ['products_wrong'];

        if (normalizeCond(recallConditions) !== normalizeCond(correct.correctConditions)) {
          if (!normalizeCond(recallConditions) && normalizeCond(correct.correctConditions)) return ['condition_missing'];
          return ['condition_wrong'];
        }

        const coefWrong =
          !correct.correctReactantCoefficients.every((c, i) => (recallCoefReactants[i] ?? 1) === c) ||
          !correct.correctProducts.every((c, i) => {
            const userIndex = recallFilled.indexOf(c);
            return userIndex !== -1 && (recallCoefProducts[userIndex] ?? 1) === correct.correctProductCoefficients[i];
          });
        if (coefWrong) return ['balance_wrong'];
      }

    return [];
  }

  function getMistakeReason() {
    if (isCorrect) return '';
    const selected = selectedOptions[0] ?? '';

    if (currentQuestion.type === 'balance' && currentQuestion.balance) {
      const { reactants, products, correctReactantCoefficients, correctProductCoefficients } = currentQuestion.balance;
      for (let i = 0; i < correctReactantCoefficients.length; i++) {
        if ((balanceReactants[i] ?? 1) !== correctReactantCoefficients[i]) {
          return `配平不正确：${reactants[i]} 的系数应为 ${correctReactantCoefficients[i]}。`;
        }
      }
      for (let i = 0; i < correctProductCoefficients.length; i++) {
        if ((balanceProducts[i] ?? 1) !== correctProductCoefficients[i]) {
          return `配平不正确：${products[i]} 的系数应为 ${correctProductCoefficients[i]}。`;
        }
      }
      return '配平不正确，请检查各元素守恒。';
    }

    if (currentQuestion.type === 'cloze' && currentQuestion.cloze) {
      const correctArr = currentQuestion.cloze.correctProducts;
      const filled = clozeFilled.filter((x) => x.trim());

      if (filled.length < currentQuestion.cloze.slots) {
        return '未填满所有空位。';
      }

      const symbolMistakes = filled
        .map((x) => {
          const m = correctArr.find((c) => stripMarks(c) === stripMarks(x) && c !== x);
          return m ? `符号错误：应为“${m}”` : '';
        })
        .filter(Boolean);

      if (symbolMistakes.length) return symbolMistakes.join('；') + '。';

      const missing = correctArr.filter((x) => !filled.includes(x));
      const extra = filled.filter((x) => !correctArr.includes(x));

      if (missing.length) return `生成物漏填：${missing.join('、')}。`;
      if (extra.length) return `生成物填错：${extra.join('、')}。`;
      return '生成物填写不正确。';
    }

    if (currentQuestion.type === 'match' && currentQuestion.match) {
      if (Object.keys(matchPairs).length < currentQuestion.match.leftItems.length) {
        return '还有未完成的匹配。';
      }

      const wrongLeftItem = currentQuestion.match.leftItems.find((leftItem) => {
        const userRightId = matchPairs[leftItem.id];
        const correctLeftId = currentQuestion.match!.correctPairs.find(p => p.rightId === userRightId)?.leftId;
        const requiredCondition = currentQuestion.match!.leftItems.find(l => l.id === correctLeftId)?.label;
        return leftItem.label !== requiredCondition;
      });

      if (wrongLeftItem) {
        const userRightId = matchPairs[wrongLeftItem.id];
        const correctLeftId = currentQuestion.match.correctPairs.find(p => p.rightId === userRightId)?.leftId;
        const requiredCondition = currentQuestion.match.leftItems.find(l => l.id === correctLeftId)?.label;
        const yourRight = currentQuestion.match.rightItems.find((r) => r.id === userRightId);

        if (yourRight) {
          return `条件“${wrongLeftItem.label}”匹配错误，你选的反应方程式“${yourRight.reactants.join(' + ')} → ${yourRight.products.join(' + ')}”实际需要的条件是“${requiredCondition || '无条件'}”。`;
        }
      }
      return '匹配不正确。';
    }

    if (currentQuestion.type === 'recall' && currentQuestion.recall) {
      const correct = currentQuestion.recall;

      if (recallFilled.filter((x) => x.trim()).length < correct.productSlots) {
        return '生成物未填满所有空位。';
      }

      const symbolMistakes = recallFilled
        .map((x) => {
          const m = correct.correctProducts.find((c) => stripMarks(c) === stripMarks(x) && c !== x);
          return m ? `符号错误：应为“${m}”` : '';
        })
        .filter(Boolean);
      if (symbolMistakes.length) return symbolMistakes.join('；') + '。';

      const missing = correct.correctProducts.filter((x) => !recallFilled.includes(x));
      const extra = recallFilled.filter((x) => !correct.correctProducts.includes(x));
      if (missing.length) return `生成物漏填：${missing.join('、')}。`;
      if (extra.length) return `生成物填错：${extra.join('、')}。`;

      if (normalizeCond(recallConditions) !== normalizeCond(correct.correctConditions)) {
        if (!normalizeCond(recallConditions) && normalizeCond(correct.correctConditions)) {
          return `缺少反应条件，应写“${correct.correctConditions}”。`;
        }
        if (normalizeCond(recallConditions) && !normalizeCond(correct.correctConditions)) {
          return '本反应无条件，不应书写反应条件。';
        }
        return `反应条件错误，应为“${correct.correctConditions}”。`;
      }

      for (let i = 0; i < correct.correctReactantCoefficients.length; i++) {
          if ((recallCoefReactants[i] ?? 1) !== correct.correctReactantCoefficients[i]) {
            return `系数错误：${correct.reactants[i]} 的系数应为 ${correct.correctReactantCoefficients[i]}。`;
          }
        }
        for (let i = 0; i < correct.correctProducts.length; i++) {
          const userIndex = recallFilled.indexOf(correct.correctProducts[i]);
          if (userIndex !== -1 && (recallCoefProducts[userIndex] ?? 1) !== correct.correctProductCoefficients[i]) {
            return `系数错误：${correct.correctProducts[i]} 的系数应为 ${correct.correctProductCoefficients[i]}。`;
          }
        }

        return '默写不正确。';
    }

    if (currentQuestion.type === 'match_condition') {
      const correctCond = currentEq?.conditions?.trim() ? currentEq.conditions : '无条件';
      return `反应条件错误，应为“${correctCond}”。`;
    }

    if (currentQuestion.type === 'predict_product') {
      if (Array.isArray(currentQuestion.correctAnswer)) {
        const correctArr = currentQuestion.correctAnswer;
        const missing = correctArr.filter((x) => !selectedOptions.includes(x));
        const extra = selectedOptions.filter((x) => !correctArr.includes(x));

        const symbolMistakes = selectedOptions
          .map((x) => {
            const m = correctArr.find((c) => stripMarks(c) === stripMarks(x) && c !== x);
            return m ? `符号错误：应为“${m}”` : '';
          })
          .filter(Boolean);

        if (symbolMistakes.length) return symbolMistakes.join('；') + '。';
        if (missing.length) return `漏选生成物：${missing.join('、')}。`;
        if (extra.length) return `多选了：${extra.join('、')}。`;
        return '生成物选择不正确。';
      }

      const correct = currentQuestion.correctAnswer;
      if (stripMarks(selected) === stripMarks(correct) && selected !== correct) {
        return `气体/沉淀符号错误，应写“${correct}”。`;
      }
      return `生成物不正确，应为“${correct}”。`;
    }

    if (currentQuestion.type === 'true_false') {
      const eq = currentEq;
      const view = currentQuestion.equationView;

      if (!eq || !view) return '';

      if (currentQuestion.correctAnswer === '错误' && selected === '正确') {
        const viewCond = normalizeCond(view.conditions);
        const correctCond = normalizeCond(eq.conditions || '');

        if (viewCond !== correctCond) {
          if (!viewCond && correctCond) return `缺少反应条件，应写“${eq.conditions}”。`;
          if (viewCond && !correctCond) return '本反应无条件，不应书写反应条件。';
          return `反应条件错误，应为“${eq.conditions}”。`;
        }

        const viewProducts = view.products;
        const correctProducts = eq.products;

        if (sameSet(viewProducts.map(stripMarks), correctProducts.map(stripMarks)) && !sameSet(viewProducts, correctProducts)) {
          return `气体/沉淀符号缺失或错误，应写“${correctProducts.join(' + ')}”。`;
        }

        if (!sameSet(viewProducts, correctProducts)) {
          return `生成物不正确，应为“${correctProducts.join(' + ')}”。`;
        }

        return '该方程式并不完全正确。';
      }

      if (currentQuestion.correctAnswer === '正确' && selected === '错误') {
        return '该方程式完全正确（条件与符号均正确）。';
      }
    }

    return '';
  }

  const eqView = currentQuestion.equationView
    ? currentQuestion.equationView
    : currentEq
      ? { reactants: currentEq.reactants, products: currentEq.products, conditions: currentEq.conditions || '' }
      : null;

  const mistakeReason = getMistakeReason();
  const showOptions =
    currentQuestion.type !== 'balance' &&
    currentQuestion.type !== 'cloze' &&
    currentQuestion.type !== 'match' &&
    currentQuestion.type !== 'recall';
  const isCloze = currentQuestion.type === 'cloze' && !!currentQuestion.cloze;
  const canCheckCloze = isCloze ? clozeFilled.every((x) => x.trim()) : true;
  const isMatch = currentQuestion.type === 'match' && !!currentQuestion.match;
  const canCheckMatch = isMatch
    ? Object.keys(matchPairs).length === (currentQuestion.match?.leftItems.length ?? 0)
    : true;
  const isRecall = currentQuestion.type === 'recall' && !!currentQuestion.recall;
  const canCheckRecall = isRecall ? recallFilled.every((x) => x.trim()) : true;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full p-4 flex items-center space-x-4">
        <button
          onClick={() => {
            if (onExit) onExit();
            else navigate(isReview ? '/review' : '/');
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6 stroke-[3px]" />
        </button>
        <ProgressBar progress={progress} />
        <div className="flex items-center space-x-2 text-[#FF4B4B] font-bold">
          <Heart className="w-6 h-6 fill-current" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-700 whitespace-pre-line">
          {currentQuestion.prompt}
        </h2>

        {currentQuestion.type === 'balance' && currentQuestion.balance ? (
          <div className="mb-6">
            <BalanceEquation
              reactants={currentQuestion.balance.reactants}
              products={currentQuestion.balance.products}
              conditions={currentQuestion.balance.conditions}
              valueReactants={balanceReactants}
              valueProducts={balanceProducts}
              onChange={(nextR, nextP) => {
                setBalanceReactants(nextR);
                setBalanceProducts(nextP);
              }}
            />
          </div>
        ) : isCloze && currentQuestion.cloze ? (
          <div className="mb-6 space-y-4">
            <EquationLine
              reactants={currentQuestion.cloze.reactants}
              products={Array.from({ length: currentQuestion.cloze.slots }).map((_, idx) => clozeFilled[idx]?.trim() ? clozeFilled[idx] : '____')}
              conditions={currentQuestion.cloze.conditions}
            />
            <div className="flex flex-wrap gap-2">
              {clozeFilled.map((x, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => {
                    const next = [...clozeFilled];
                    next[idx] = '';
                    setClozeFilled(next);
                  }}
                  className="px-3 py-2 rounded-2xl border-2 border-b-4 border-gray-200 bg-white font-bold text-gray-600 disabled:opacity-60"
                >
                  {x?.trim() ? x : `空位${idx + 1}`}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options?.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => {
                    const emptyIndex = clozeFilled.findIndex((v) => !v.trim());
                    if (emptyIndex === -1) return;
                    const next = [...clozeFilled];
                    next[emptyIndex] = opt;
                    setClozeFilled(next);
                  }}
                  className="px-3 py-2 rounded-2xl border-2 border-b-4 border-gray-200 bg-white font-bold text-gray-600 hover:bg-gray-50 active:translate-y-1 active:border-b-0 disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : eqView ? (
          <div className="mb-6">
            <EquationLine
              reactants={eqView.reactants}
              products={eqView.products}
              conditions={eqView.conditions}
            />
          </div>
        ) : null}

        {currentQuestion.type === 'match' && currentQuestion.match ? (
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {currentQuestion.match.leftItems.map((l) => {
                const isActive = matchSelectedLeftId === l.id;
                const linked = matchPairs[l.id];
                const linkedText = linked
                  ? (() => {
                      const e = currentQuestion.match?.rightItems.find((r) => r.id === linked);
                      return e ? `${e.reactants.join(' + ')} → ${e.products.join(' + ')}` : '';
                    })()
                  : '';

                return (
                  <button
                    key={l.id}
                    type="button"
                    disabled={isChecked}
                    onClick={() => setMatchSelectedLeftId(isActive ? null : l.id)}
                    className={`px-3 py-2 rounded-2xl border-2 border-b-4 font-bold transition-all ${
                      isActive
                        ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    } ${isChecked ? 'opacity-60' : ''}`}
                  >
                    {l.label}
                    {linkedText ? <span className="ml-2 text-xs font-extrabold text-gray-400">已配对</span> : null}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.match.rightItems.map((r) => {
                const usedBy = Object.entries(matchPairs).find(([, v]) => v === r.id)?.[0] ?? null;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={isChecked}
                    onClick={() => {
                      if (!matchSelectedLeftId) return;
                      setMatchPairs((prev) => ({ ...prev, [matchSelectedLeftId]: r.id }));
                    }}
                    className={`text-left rounded-2xl border-2 border-b-4 px-4 py-3 font-bold transition-all ${
                      usedBy
                        ? 'bg-gray-50 border-gray-200 text-gray-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    } ${matchSelectedLeftId ? '' : 'opacity-60'}`}
                  >
                    {r.reactants.join(' + ')} → {r.products.join(' + ')}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {currentQuestion.type === 'recall' && currentQuestion.recall ? (
          <div className="mb-6 space-y-4">
            <BalanceEquation
              reactants={currentQuestion.recall.reactants}
              products={recallFilled.map((x, idx) => (x?.trim() ? x : `____${idx + 1}`))}
              conditions={recallConditions}
              valueReactants={recallCoefReactants}
              valueProducts={recallCoefProducts}
              onChange={(nextR, nextP) => {
                setRecallCoefReactants(nextR);
                setRecallCoefProducts(nextP);
              }}
            />

            <div className="flex flex-wrap gap-2">
              {['', '点燃', '加热', '催化剂', '高温', '高温高压', '光照'].map((c) => {
                const active = recallConditions === c;
                return (
                  <button
                    key={c || 'none'}
                    type="button"
                    disabled={isChecked}
                    onClick={() => setRecallConditions(c)}
                    className={`px-3 py-2 rounded-2xl border-2 border-b-4 font-bold transition-all ${
                      active
                        ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    } ${isChecked ? 'opacity-60' : ''}`}
                  >
                    {c ? c : '无条件'}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {recallFilled.map((x, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => {
                    const next = [...recallFilled];
                    next[idx] = '';
                    setRecallFilled(next);
                  }}
                  className="px-3 py-2 rounded-2xl border-2 border-b-4 border-gray-200 bg-white font-bold text-gray-600 disabled:opacity-60"
                >
                  {x?.trim() ? x : `空位${idx + 1}`}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {currentQuestion.recall.productOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => {
                    const emptyIndex = recallFilled.findIndex((v) => !v.trim());
                    if (emptyIndex === -1) return;
                    const next = [...recallFilled];
                    next[emptyIndex] = opt;
                    setRecallFilled(next);
                  }}
                  className="px-3 py-2 rounded-2xl border-2 border-b-4 border-gray-200 bg-white font-bold text-gray-600 hover:bg-gray-50 active:translate-y-1 active:border-b-0 disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {showOptions ? (
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options?.map((option, i) => {
              const isSelected = selectedOptions.includes(option);
              let buttonClass = 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
              
              if (isChecked) {
                const isActuallyCorrect = Array.isArray(currentQuestion.correctAnswer)
                  ? currentQuestion.correctAnswer.includes(option)
                  : currentQuestion.correctAnswer === option;
                  
                if (isActuallyCorrect) {
                  buttonClass = 'bg-[#D7FFB8] border-[#58CC02] text-[#58CC02]';
                } else if (isSelected && !isActuallyCorrect) {
                  buttonClass = 'bg-[#FFDFE0] border-[#FF4B4B] text-[#EA2B2B]';
                } else {
                  buttonClass = 'bg-white border-gray-200 text-gray-400 opacity-50';
                }
              } else if (isSelected) {
                buttonClass = 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]';
              }

              return (
                <button
                  key={i}
                  disabled={isChecked}
                  onClick={() => toggleOption(option)}
                  className={`p-4 rounded-2xl border-2 border-b-4 font-bold text-lg text-left transition-all duration-150 ${buttonClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {currentQuestion.isMultiSelect && (
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-current bg-current' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </main>

      {/* Feedback Panel & Footer */}
      <div className="w-full relative mt-auto">
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className={`absolute bottom-full left-0 w-full p-6 border-t-2 ${
                isCorrect ? 'bg-[#D7FFB8] border-[#58CC02]' : 'bg-[#FFDFE0] border-[#FF4B4B]'
              }`}
            >
              <div className="max-w-2xl mx-auto flex flex-col space-y-2">
                <div className={`text-2xl font-extrabold flex items-center space-x-2 ${
                  isCorrect ? 'text-[#58CC02]' : 'text-[#EA2B2B]'
                }`}>
                  {isCorrect ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        ✓
                      </div>
                      <span>答对了！</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xl pb-1">
                        ×
                      </div>
                      <span>正确答案：{expectedAnswerText}</span>
                    </>
                  )}
                </div>
                {!isCorrect && mistakeReason ? (
                  <p className="text-sm font-extrabold text-[#EA2B2B]">
                    错因：{mistakeReason}
                  </p>
                ) : null}
                {isChecked && currentEq && (
                  <p className={`text-sm font-medium mt-2 ${isCorrect ? 'text-[#46A302]' : 'text-[#EA2B2B]'}`}>
                    解析：{currentEq.description}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`p-4 border-t-2 ${isChecked ? (isCorrect ? 'bg-[#D7FFB8] border-[#58CC02]' : 'bg-[#FFDFE0] border-[#FF4B4B]') : 'bg-white border-gray-200'}`}>
          <div className="max-w-2xl mx-auto">
            <Button
              size="lg"
              variant={isChecked ? (isCorrect ? 'success' : 'danger') : 'primary'}
              disabled={
                showOptions
                  ? selectedOptions.length === 0 && !isChecked
                  : isCloze
                    ? !canCheckCloze && !isChecked
                    : isMatch
                      ? !canCheckMatch && !isChecked
                      : isRecall
                        ? !canCheckRecall && !isChecked
                        : false
              }
              onClick={handleCheck}
            >
              {isChecked ? '继续' : '检查'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
