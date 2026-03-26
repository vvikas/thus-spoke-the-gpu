export interface LevelMeta {
  id: number;
  title: string;
  concept: string;
  hook: string;
  unlockMessage: string;
  color: string;
}

export const LEVELS: LevelMeta[] = [
  {
    id: 1,
    title: 'Dot Product',
    concept: 'multiply + sum',
    hook: 'Before attention exists, similarity must be measured.',
    unlockMessage: 'You have taught the machine to measure closeness.',
    color: '#f5c518',
  },
  {
    id: 2,
    title: 'Softmax',
    concept: 'exp ÷ sum(exp)',
    hook: 'Raw scores mean nothing. Probabilities mean everything.',
    unlockMessage: 'The machine now knows how to choose.',
    color: '#e07b39',
  },
  {
    id: 3,
    title: 'Scaled Score',
    concept: 'q · k / √d',
    hook: 'Raw attention is chaos. Scale it, and clarity emerges.',
    unlockMessage: 'You have tamed the explosion of similarity.',
    color: '#4cc9f0',
  },
  {
    id: 4,
    title: 'Weighted Sum',
    concept: 'Σ wᵢ × vᵢ',
    hook: 'Attention is not just looking — it is combining.',
    unlockMessage: 'The machine now blends meaning by importance.',
    color: '#f72585',
  },
  {
    id: 5,
    title: 'ReLU',
    concept: 'max(0, x)',
    hook: 'Negativity serves no purpose. Cast it out.',
    unlockMessage: 'The machine has learned to ignore the void.',
    color: '#7209b7',
  },
  {
    id: 6,
    title: 'Layer Norm',
    concept: '(x − μ) / σ',
    hook: 'Before attention speaks, the chaos must be stilled.',
    unlockMessage: 'You have brought order to the signal.',
    color: '#3a86ff',
  },
  {
    id: 7,
    title: 'Residual',
    concept: 'x + sublayer(x)',
    hook: 'The self that survives transformation — that is strength.',
    unlockMessage: 'Gradients now flow unimpeded to the first layer.',
    color: '#06d6a0',
  },
  {
    id: 8,
    title: 'Cross Entropy',
    concept: '−log(p_correct)',
    hook: 'All learning begins with knowing how wrong you are.',
    unlockMessage: 'THE GPU HAS SPOKEN.',
    color: '#ef476f',
  },
];
