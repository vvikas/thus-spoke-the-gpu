// ─── Pre-computed values for "God is dead" ───────────────────────────────────
// Sample forward-pass outputs from a tiny character-level GPT.

export const EXAMPLE_TEXT = 'God is dead';
export const WORDS = ['God', 'is', 'dead'] as const;

// ─── Level 1 · Tokenizer ─────────────────────────────────────────────────────
// Full vocab (our sentence + distractors so the table looks real)
export const VOCAB = [
  { word: 'God',   id: 0 },
  { word: 'is',    id: 1 },
  { word: 'dead',  id: 2 },
  { word: 'Thus',  id: 3 },
  { word: 'spoke', id: 4 },
  { word: 'will',  id: 5 },
];

export const TOKEN_IDS = [0, 1, 2];

// ─── Level 2 · Embedding table  6 words × 8 dims ─────────────────────────────
export const EMBEDDING_TABLE: number[][] = [
  //  0      1      2      3      4      5      6      7
  [ 0.32, -0.14,  0.87,  0.21, -0.55,  0.43,  0.11, -0.29], // 0: God
  [ 0.11,  0.76, -0.23,  0.54,  0.19, -0.67,  0.88,  0.02], // 1: is
  [-0.45,  0.33,  0.91, -0.12,  0.76,  0.14, -0.38,  0.55], // 2: dead
  [ 0.67, -0.82,  0.14,  0.39, -0.21,  0.93,  0.07, -0.44], // 3: Thus
  [-0.18,  0.45, -0.63,  0.77,  0.28, -0.15,  0.52,  0.84], // 4: spoke
  [ 0.91,  0.12, -0.47, -0.36,  0.83,  0.26, -0.71,  0.38], // 5: will
];

// The 3 rows that get looked up: rows 0, 1, 2
export const EMBEDDED_OUTPUT = TOKEN_IDS.map(id => EMBEDDING_TABLE[id]);

// ─── Karpathy code snippets (verbatim from the video) ────────────────────────
export const CODE = {
  tokenizer: `# Build vocabulary from raw text
with open('input.txt', 'r') as f:
    text = f.read()

chars = sorted(set(text))
vocab_size = len(chars)

# Character ↔ integer mappings
stoi = { ch:i for i,ch in enumerate(chars) }
itos = { i:ch for i,ch in enumerate(chars) }

encode = lambda s: [stoi[c] for c in s]
decode = lambda l: ''.join([itos[i] for i in l])

# Encode the whole dataset
data = torch.tensor(encode(text), dtype=torch.long)`,

  embedding: `class BigramLanguageModel(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        # Each token ID maps to a learned vector of size n_embd
        self.token_embedding_table = nn.Embedding(vocab_size, n_embd)

    def forward(self, idx, targets=None):
        # idx:    (B, T)  — batch of token ID sequences
        # tok_emb:(B, T, C) — each ID replaced by its embedding vector
        tok_emb = self.token_embedding_table(idx)
        return tok_emb`,
} as const;
