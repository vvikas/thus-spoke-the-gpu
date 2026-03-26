export type Value = number | number[];

export interface BlockDef {
  label: string;
  category: 'primitive' | 'output';
  inputs: string[];
  description: string;
  code: string;
  color: string;
  compute: (inputs: Record<string, Value>) => Value | null;
}

export interface ChipDef {
  id: string;
  label: string;
  inputs: string[];
  description: string;
  code: string;
  color: string;
  unlockedByLevel: number;
  compute: (inputs: Record<string, Value>) => Value | null;
}

export interface TestCase {
  label: string;
  /** Maps input node ID to override value for this test case */
  inputs: Record<string, Value>;
  expected: Value;
}

export interface LevelDef {
  id: number;
  title: string;
  concept: string;
  hook: string;
  unlockMessage: string;
  color: string;
  producesChip: string;
  description: string;
  math: string;
  gptCode: string;
  availablePrimitives: string[];
  testCases: TestCase[];
  initialNodes: InitialNodeSpec[];
}

export interface InitialNodeSpec {
  id: string;
  type: 'inputNode' | 'outputNode';
  position: { x: number; y: number };
  data: {
    label?: string;
    fixedValue?: Value;
    blockType?: string;
    target?: Value;
    computedValue?: Value | null;
  };
}
