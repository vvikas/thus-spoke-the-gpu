export interface Quote {
  text: string;
  isReal: boolean;
  attribution?: string;
}

export const QUIZ_QUOTES: Quote[] = [
  {
    text: 'God is dead. God remains dead. And we have killed him.',
    isReal: true,
    attribution: 'The Gay Science, §125',
  },
  {
    text: 'God is not dead. He simply ran out of compute.',
    isReal: false,
  },
  {
    text: 'Without music, life would be a mistake.',
    isReal: true,
    attribution: 'Twilight of the Idols',
  },
  {
    text: 'The will to power is just dropout with a better PR team.',
    isReal: false,
  },
  {
    text: 'That which does not kill me, makes me stronger.',
    isReal: true,
    attribution: 'Twilight of the Idols',
  },
  {
    text: 'That which does not kill your gradient makes it stronger.',
    isReal: false,
  },
  {
    text: 'One must still have chaos in oneself to be able to give birth to a dancing star.',
    isReal: true,
    attribution: 'Thus Spoke Zarathustra',
  },
  {
    text: 'One must have chaos within oneself to give birth to a dancing embedding.',
    isReal: false,
  },
  {
    text: 'In every transformer, there is an Übermensch waiting to emerge from the attention weights.',
    isReal: false,
  },
  {
    text: 'To live is to suffer, to survive is to find some meaning in the suffering.',
    isReal: true,
    attribution: 'Attributed',
  },
];

export const PHILOSOPHIZE_QUOTES = [
  'God is not dead. He simply ran out of compute.',
  'The will to power is just dropout with a better PR team.',
  'That which does not kill your gradient makes it stronger.',
  'In every transformer, there is an Übermensch waiting to emerge.',
  'One must have chaos within oneself to give birth to a dancing embedding.',
  'To suffer through backpropagation — that is the human condition.',
  'What is great in man is that he is a bridge to the next token.',
  'Without overfitting, life would be a mistake.',
  'I am not a man. I am dynamite. I am also 124M parameters.',
  'He who has a why to train can bear almost any loss curve.',
];
