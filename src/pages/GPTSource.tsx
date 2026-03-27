import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../store/progressStore';

interface CodeLine {
  code: string;
  chipId?: string;
  chipLabel?: string;
  chipColor?: string;
  levelId?: number;
  indent?: number;
}

const CODE: CodeLine[] = [
  { code: 'import torch' },
  { code: 'import torch.nn as nn' },
  { code: 'import torch.nn.functional as F' },
  { code: '' },
  { code: '# ─────────────────────────────────────────────' },
  { code: '# One attention head' },
  { code: '# ─────────────────────────────────────────────' },
  { code: 'class Head(nn.Module):' },
  { code: '    def __init__(self, head_size):' },
  { code: '        self.key   = nn.Linear(n_embd, head_size, bias=False)' },
  { code: '        self.query = nn.Linear(n_embd, head_size, bias=False)' },
  { code: '        self.value = nn.Linear(n_embd, head_size, bias=False)' },
  { code: '' },
  { code: '    def forward(self, x):' },
  { code: '        q = self.query(x)   # (B,T,head_size)' },
  { code: '        k = self.key(x)     # (B,T,head_size)' },
  { code: '        v = self.value(x)   # (B,T,head_size)' },
  { code: '' },
  {
    code: '        # scaled dot-product scores',
    chipId: 'scaled_dot', chipLabel: 'SCALED DOT', chipColor: '#4cc9f0', levelId: 3,
  },
  {
    code: '        wei = q @ k.transpose(-2,-1) * k.shape[-1]**-0.5  # (B,T,T)',
    chipId: 'scaled_dot', chipLabel: 'SCALED DOT', chipColor: '#4cc9f0', levelId: 3,
  },
  { code: '' },
  {
    code: '        # softmax → attention weights',
    chipId: 'softmax_vec', chipLabel: 'SOFTMAX', chipColor: '#e07b39', levelId: 2,
  },
  {
    code: '        wei = F.softmax(wei, dim=-1)  # (B,T,T)',
    chipId: 'softmax_vec', chipLabel: 'SOFTMAX', chipColor: '#e07b39', levelId: 2,
  },
  { code: '' },
  {
    code: '        # weighted sum of values → head output',
    chipId: 'attn_head', chipLabel: 'ATTN HEAD', chipColor: '#7209b7', levelId: 5,
  },
  {
    code: '        out = wei @ v  # (B,T,head_size)',
    chipId: 'attn_head', chipLabel: 'ATTN HEAD', chipColor: '#7209b7', levelId: 5,
  },
  { code: '        return out' },
  { code: '' },
  { code: '# ─────────────────────────────────────────────' },
  { code: '# Feed-forward block' },
  { code: '# ─────────────────────────────────────────────' },
  { code: 'class FeedForward(nn.Module):' },
  { code: '    def __init__(self, n_embd):' },
  { code: '        self.net = nn.Sequential(' },
  { code: '            nn.Linear(n_embd, 4 * n_embd),' },
  {
    code: '            nn.ReLU(),   # ← zeros out negatives',
    chipId: 'relu', chipLabel: 'ReLU', chipColor: '#ff6b6b', levelId: 6,
  },
  { code: '            nn.Linear(4 * n_embd, n_embd),' },
  { code: '        )' },
  { code: '' },
  {
    code: '    def forward(self, x):',
    chipId: 'ffn_relu', chipLabel: 'FFN·ReLU', chipColor: '#ef476f', levelId: 7,
  },
  {
    code: '        return self.net(x)',
    chipId: 'ffn_relu', chipLabel: 'FFN·ReLU', chipColor: '#ef476f', levelId: 7,
  },
  { code: '' },
  { code: '# ─────────────────────────────────────────────' },
  { code: '# Transformer block  (repeats N times in GPT)' },
  { code: '# ─────────────────────────────────────────────' },
  { code: 'class Block(nn.Module):' },
  { code: '    def __init__(self, n_embd, n_head):' },
  { code: '        head_size = n_embd // n_head' },
  { code: '        self.sa   = MultiHeadAttention(n_head, head_size)' },
  { code: '        self.ffwd = FeedForward(n_embd)' },
  {
    code: '        self.ln1  = nn.LayerNorm(n_embd)   # before attention',
    chipId: 'layer_norm', chipLabel: 'LAYER NORM', chipColor: '#3a86ff', levelId: 8,
  },
  {
    code: '        self.ln2  = nn.LayerNorm(n_embd)   # before FFN',
    chipId: 'layer_norm', chipLabel: 'LAYER NORM', chipColor: '#3a86ff', levelId: 8,
  },
  { code: '' },
  {
    code: '    def forward(self, x):',
    chipId: 'transformer_block', chipLabel: 'TRANSFORMER BLOCK', chipColor: '#06d6a0', levelId: 9,
  },
  {
    code: '        x = x + self.sa(self.ln1(x))    # attention  + residual',
    chipId: 'transformer_block', chipLabel: 'TRANSFORMER BLOCK', chipColor: '#06d6a0', levelId: 9,
  },
  {
    code: '        x = x + self.ffwd(self.ln2(x))  # FFN        + residual',
    chipId: 'transformer_block', chipLabel: 'TRANSFORMER BLOCK', chipColor: '#06d6a0', levelId: 9,
  },
  {
    code: '        return x',
    chipId: 'transformer_block', chipLabel: 'TRANSFORMER BLOCK', chipColor: '#06d6a0', levelId: 9,
  },
  { code: '' },
  { code: '# ─────────────────────────────────────────────' },
  { code: '# Full GPT model' },
  { code: '# ─────────────────────────────────────────────' },
  { code: 'class GPTLanguageModel(nn.Module):' },
  { code: '    def __init__(self):' },
  { code: '        self.token_embedding_table    = nn.Embedding(vocab_size, n_embd)' },
  { code: '        self.position_embedding_table = nn.Embedding(block_size, n_embd)' },
  { code: '        self.blocks = nn.Sequential(' },
  { code: '            *[Block(n_embd, n_head) for _ in range(n_layer)],' },
  { code: '        )' },
  { code: '        self.ln_f = nn.LayerNorm(n_embd)' },
  { code: '        self.lm_head = nn.Linear(n_embd, vocab_size)' },
  { code: '' },
  { code: '    def forward(self, idx, targets=None):' },
  { code: '        tok_emb = self.token_embedding_table(idx)' },
  { code: '        pos_emb = self.position_embedding_table(...)' },
  { code: '        x = tok_emb + pos_emb' },
  { code: '        x = self.blocks(x)     # all the transformer blocks' },
  { code: '        x = self.ln_f(x)' },
  { code: '        logits = self.lm_head(x)' },
  { code: '        return logits' },
];

// Group consecutive lines with the same chipId into annotation spans
function groupLines(lines: CodeLine[]) {
  const groups: { lines: CodeLine[]; chipId?: string; chipLabel?: string; chipColor?: string; levelId?: number }[] = [];
  for (const line of lines) {
    const last = groups[groups.length - 1];
    if (last && last.chipId && last.chipId === line.chipId) {
      last.lines.push(line);
    } else {
      groups.push({ lines: [line], chipId: line.chipId, chipLabel: line.chipLabel, chipColor: line.chipColor, levelId: line.levelId });
    }
  }
  return groups;
}

export default function GPTSource() {
  const navigate = useNavigate();
  const isCompleted = useProgressStore((s) => s.isCompleted);
  const groups = groupLines(CODE);

  return (
    <div className="min-h-screen font-mono" style={{ background: '#0a0a0a', color: '#c9d1d9' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-[#1e1e1e]" style={{ background: '#0d1117' }}>
        <button
          onClick={() => navigate(-1)}
          className="text-xs tracking-widest hover:text-white transition-colors"
          style={{ color: '#8b949e' }}
        >
          ← BACK
        </button>
        <div className="text-center">
          <div className="text-xs tracking-[0.3em]" style={{ color: '#f5c518' }}>gpt.py · annotated</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>
            every highlighted section is a chip you assembled
          </div>
        </div>
        <div className="w-16" /> {/* spacer */}
      </div>

      {/* Chip legend */}
      <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-[#1e1e1e]" style={{ background: '#0d1117' }}>
        {[
          { label: 'SCALED DOT', color: '#4cc9f0', levelId: 3 },
          { label: 'SOFTMAX', color: '#e07b39', levelId: 2 },
          { label: 'ATTN HEAD', color: '#7209b7', levelId: 5 },
          { label: 'ReLU', color: '#ff6b6b', levelId: 6 },
          { label: 'FFN·ReLU', color: '#ef476f', levelId: 7 },
          { label: 'LAYER NORM', color: '#3a86ff', levelId: 8 },
          { label: 'TRANSFORMER BLOCK', color: '#06d6a0', levelId: 9 },
        ].map(({ label, color, levelId }) => {
          const done = isCompleted(levelId);
          return (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] tracking-wider border"
              style={{
                borderColor: done ? color + '55' : '#2d2d2d',
                color: done ? color : '#484f58',
                background: done ? color + '11' : 'transparent',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 2, background: done ? color : '#2d2d2d', display: 'inline-block' }} />
              {label}
              {!done && <span className="ml-1 opacity-50">L{levelId}</span>}
            </div>
          );
        })}
      </div>

      {/* Code */}
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <pre className="text-sm leading-7 overflow-x-auto">
          {groups.map((group, gi) => {
            if (!group.chipId) {
              return (
                <div key={gi}>
                  {group.lines.map((line, li) => (
                    <div key={li} className="whitespace-pre" style={{ color: line.code.startsWith('#') ? '#484f58' : '#c9d1d9' }}>
                      {line.code || '\u00a0'}
                    </div>
                  ))}
                </div>
              );
            }

            const done = isCompleted(group.levelId!);
            const color = group.chipColor!;

            return (
              <div
                key={gi}
                className="relative my-0.5 rounded-r"
                style={{
                  borderLeft: `3px solid ${done ? color : '#2d2d2d'}`,
                  background: done ? color + '0d' : 'transparent',
                  paddingLeft: 12,
                  paddingRight: 120,
                }}
              >
                {group.lines.map((line, li) => (
                  <div key={li} className="whitespace-pre" style={{ color: done ? '#e6edf3' : '#4a4a4a' }}>
                    {line.code || '\u00a0'}
                  </div>
                ))}
                {/* Badge — only on first line of group */}
                <div
                  className="absolute right-2 top-1 text-[10px] px-2 py-0.5 rounded tracking-wider font-bold"
                  style={{
                    background: done ? color + '22' : '#1a1a1a',
                    color: done ? color : '#333',
                    border: `1px solid ${done ? color + '44' : '#2a2a2a'}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⬡ {group.chipLabel} · L{group.levelId}
                </div>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
