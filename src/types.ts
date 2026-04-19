export interface Equation {
  id: string;
  reactants: string[];
  products: string[];
  conditions: string;
  type: 'combination' | 'decomposition' | 'displacement' | 'double_displacement' | 'double-decomposition' | 'redox' | 'substitution' | 'addition';
  description: string;
}

export interface Level {
  id: string;
  title: string;
  equations: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
}

export type MistakeTag =
  | 'condition_missing'
  | 'condition_wrong'
  | 'symbol_missing_or_wrong'
  | 'products_wrong'
  | 'balance_wrong';

export interface Question {
  type: 'balance' | 'cloze' | 'match' | 'recall' | 'predict_product' | 'match_condition' | 'true_false';
  equationId: string;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  isMultiSelect?: boolean;
  equationView?: {
    reactants: string[];
    products: string[];
    conditions: string;
  };
  balance?: {
    reactants: string[];
    products: string[];
    correctReactantCoefficients: number[];
    correctProductCoefficients: number[];
    conditions: string;
  };
  cloze?: {
    reactants: string[];
    slots: number;
    correctProducts: string[];
    conditions: string;
  };
  match?: {
    leftItems: { id: string; label: string }[];
    rightItems: {
      id: string;
      reactants: string[];
      products: string[];
    }[];
    correctPairs: { leftId: string; rightId: string }[];
  };
  recall?: {
    reactants: string[];
    productSlots: number;
    productOptions: string[];
    correctProducts: string[];
    correctReactantCoefficients: number[];
    correctProductCoefficients: number[];
    correctConditions: string;
  };
}
