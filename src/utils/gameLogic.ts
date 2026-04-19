import { Equation, Question } from '../types';

export function generateQuestions(equations: Equation[]): Question[] {
  const questions: Question[] = [];

  const allPossibleDistractors = [
    'CO₂', 'CO₂↑', 'H₂O', 'O₂', 'O₂↑', 'H₂', 'H₂↑', 'NaCl', 'KCl', 'MnO₂', 
    'K₂MnO₄', 'ZnSO₄', 'NaOH', 'HCl', 'CaCO₃', 'CaCO₃↓', 'SO₂', 'P₂O₅', 'Fe₃O₄', 'MgO', 
    'CaCl₂', 'CO', 'Cu', 'Fe', 'MgCl₂', 'FeCl₂', 'FeSO₄', 'Na₂CO₃', 'CuSO₄', 'AgCl↓', 
    'NaNO₃', 'BaSO₄↓',
    // 高中干扰项
    'HClO', 'NaClO', 'FeCl₃', 'SO₂↑', 'SO₃', 'NH₃', 'Cu(NO₃)₂', 'NO↑', 'NO₂↑', 'NaAlO₂'
  ];

  equations.forEach((eq) => {
    const balanceParsed = parseEquationTerms(eq.reactants, eq.products);
    if (balanceParsed) {
      questions.push({
        type: 'balance',
        equationId: eq.id,
        prompt: '配平下列化学方程式：',
        correctAnswer: buildFullEquationText(eq.reactants, eq.products),
        isMultiSelect: false,
        balance: {
          reactants: balanceParsed.reactants,
          products: balanceParsed.products,
          correctReactantCoefficients: balanceParsed.reactantCoefficients,
          correctProductCoefficients: balanceParsed.productCoefficients,
          conditions: eq.conditions || '',
        },
      });
    }

    const parsedProducts = parseEquationTerms(eq.reactants, eq.products)?.products || eq.products;

    if (eq.products.length > 0 && eq.products.length <= 3) {
      const distractors = allPossibleDistractors.filter(d => !parsedProducts.includes(d) && !eq.products.includes(d));
      const optionsCount = Math.max(6, eq.products.length + 3);
      const options = shuffle([...eq.products, ...shuffle(distractors).slice(0, optionsCount - eq.products.length)]);

      questions.push({
        type: 'cloze',
        equationId: eq.id,
        prompt: '补全生成物（按空位填入，不需要键盘输入）：',
        options,
        correctAnswer: eq.products.join(' + '),
        isMultiSelect: false,
        cloze: {
          reactants: eq.reactants,
          slots: eq.products.length,
          correctProducts: eq.products,
          conditions: eq.conditions || '',
        },
      });
    }

    const recallParsed = parseEquationTerms(eq.reactants, eq.products);
    if (recallParsed) {
      const distractors = allPossibleDistractors
        .filter((d) => !recallParsed.products.includes(d))
        .filter((d) => !!d.trim());
      const productOptions = shuffle([
        ...recallParsed.products,
        ...recallParsed.products.map((p) => p.replace(/[↑↓]/g, '')).filter((p) => !recallParsed.products.includes(p)),
        ...shuffle(distractors).slice(0, 6),
      ]);

      questions.push({
        type: 'recall',
        equationId: eq.id,
        prompt: '结构化默写：补全生成物、反应条件，并填写系数（不需要键盘输入下标/条件/↑↓）：',
        options: productOptions,
        correctAnswer: buildFullEquationText(eq.reactants, eq.products),
        isMultiSelect: false,
        recall: {
          reactants: recallParsed.reactants,
          productSlots: recallParsed.products.length,
          productOptions,
          correctProducts: recallParsed.products,
          correctReactantCoefficients: recallParsed.reactantCoefficients,
          correctProductCoefficients: recallParsed.productCoefficients,
          correctConditions: eq.conditions || '',
        },
      });
    }

    // 1. predict product (multi-select supported)
    const predictDistractors = allPossibleDistractors.filter(d => !parsedProducts.includes(d) && !eq.products.includes(d));
    const isMulti = eq.products.length > 1;
    const optionsCount = Math.max(4, eq.products.length + 2);
    
    questions.push({
      type: 'predict_product',
      equationId: eq.id,
      prompt: `选择该反应的${isMulti ? '所有' : ''}生成物${isMulti ? '（多选，注意气体/沉淀符号）' : ''}：`,
      options: shuffle([...eq.products, ...shuffle(predictDistractors).slice(0, optionsCount - eq.products.length)]),
      correctAnswer: isMulti ? eq.products : eq.products[0],
      isMultiSelect: isMulti,
      equationView: {
        reactants: eq.reactants,
        products: ['?'],
        conditions: eq.conditions || '',
      },
    });

    // 2. match condition
    if (eq.conditions) {
      questions.push({
        type: 'match_condition',
        equationId: eq.id,
        prompt: '选择该反应的正确条件：',
        options: shuffle(['点燃', '加热', '催化剂', '高温', '光照', '无条件'].filter(c => c !== eq.conditions).slice(0, 3).concat(eq.conditions)),
        correctAnswer: eq.conditions,
        isMultiSelect: false,
        equationView: {
          reactants: eq.reactants,
          products: eq.products,
          conditions: '____',
        },
      });
    }

    // 3. true false (Correct with conditions & symbols)
    questions.push({
      type: 'true_false',
      equationId: eq.id,
      prompt: '判断下列反应方程式是否完全正确（含条件及符号）：',
      options: ['正确', '错误'],
      correctAnswer: '正确',
      isMultiSelect: false,
      equationView: {
        reactants: eq.reactants,
        products: eq.products,
        conditions: eq.conditions || '',
      },
    });


    // 4. true false (Wrong condition)
    if (eq.conditions) {
      const wrongCondition = eq.conditions === '点燃' ? '加热' : (eq.conditions === '加热' ? '点燃' : '无');
      questions.push({
        type: 'true_false',
        equationId: eq.id,
        prompt: '判断下列反应方程式是否完全正确（含条件及符号）：',
        options: ['正确', '错误'],
        correctAnswer: '错误',
        isMultiSelect: false,
        equationView: {
          reactants: eq.reactants,
          products: eq.products,
          conditions: wrongCondition === '无' ? '' : wrongCondition,
        },
      });
    }

    // 5. true false (Missing gas/precipitate symbol)
    const hasSymbol = eq.products.some(p => p.includes('↑') || p.includes('↓'));
    if (hasSymbol) {
      const wrongProducts = eq.products.map(p => p.replace('↑', '').replace('↓', ''));
      questions.push({
        type: 'true_false',
        equationId: eq.id,
        prompt: '判断下列反应方程式是否完全正确（含条件及符号）：',
        options: ['正确', '错误'],
        correctAnswer: '错误',
        isMultiSelect: false,
        equationView: {
          reactants: eq.reactants,
          products: wrongProducts,
          conditions: eq.conditions || '',
        },
      });
    }
  });

  const matchCandidates = equations.filter((e) => e.conditions && e.conditions.trim());
  if (matchCandidates.length >= 3) {
    const picked = shuffle(matchCandidates);
    const groupCount = Math.min(2, Math.floor(picked.length / 3));

    for (let g = 0; g < groupCount; g++) {
      const group = picked.slice(g * 3, g * 3 + 3);
      questions.push({
        type: 'match',
        equationId: group[0].id,
        prompt: '匹配：将反应条件与对应的反应方程式连起来：',
        correctAnswer: 'match',
        isMultiSelect: false,
        match: {
          leftItems: shuffle(group.map((p) => ({ id: `c-${p.id}`, label: p.conditions }))),
          rightItems: shuffle(group.map((p) => ({ id: `e-${p.id}`, reactants: p.reactants, products: p.products }))),
          correctPairs: group.map((p) => ({ leftId: `c-${p.id}`, rightId: `e-${p.id}` })),
        },
      });
    }
  }

  return shuffle(questions);
}

function parseEquationTerms(reactants: string[], products: string[]) {
  const parsedReactants = reactants.map(parseTerm);
  const parsedProducts = products.map(parseTerm);

  if (parsedReactants.some((t) => !t) || parsedProducts.some((t) => !t)) return null;

  return {
    reactants: parsedReactants.map((t) => t.species),
    products: parsedProducts.map((t) => t.species),
    reactantCoefficients: parsedReactants.map((t) => t.coefficient),
    productCoefficients: parsedProducts.map((t) => t.coefficient),
  };
}

function parseTerm(term: string) {
  const t = term.trim();
  const m = t.match(/^(\d+)(.+)$/);
  if (!m) return { coefficient: 1, species: t };
  const coefficient = Number(m[1]);
  if (!Number.isFinite(coefficient) || coefficient <= 0) return null;
  return { coefficient, species: m[2].trim() };
}

function buildFullEquationText(reactants: string[], products: string[]) {
  return `${reactants.join(' + ')} → ${products.join(' + ')}`;
}

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}
