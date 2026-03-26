import { useState, useRef, useCallback } from 'react';
import { AutoTokenizer, AutoModelForCausalLM, env } from '@huggingface/transformers';
import ThemeToggle from './ThemeToggle';
import NietzscheSprite from './NietzscheSprite';
import type { NietzscheExpression } from './NietzscheSprite';

env.allowRemoteModels = true;

const MODEL_ID = 'Invic7us/nietzsche-gpt';
const MAX_NEW_CHARS = 200;

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function GPTPlayground({ onBack }: { onBack: () => void }) {
  const [status, setStatus]       = useState<Status>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [loadPct, setLoadPct]     = useState(0);
  const [loadFile, setLoadFile]   = useState('');
  const [input, setInput]         = useState('The will to power is');
  const [output, setOutput]       = useState('');
  const [generating, setGenerating] = useState(false);
  const [expression, setExpression] = useState<NietzscheExpression>('idle');
  const stopRef  = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokRef   = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modRef   = useRef<any>(null);

  const loadModel = async () => {
    setStatus('loading');
    setLoadPct(0);
    setErrorMsg('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressCb = (info: any) => {
      if (info?.status === 'progress' && info.total > 0) {
        setLoadFile(info.file ?? '');
        setLoadPct(Math.round((info.loaded / info.total) * 100));
      }
    };
    try {
      tokRef.current = await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback: progressCb });
      modRef.current = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
        dtype: 'fp32',
        progress_callback: progressCb,
      });
      setStatus('ready');
      setExpression('idle');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  };

  const generate = useCallback(async () => {
    if (!tokRef.current || !modRef.current) return;
    stopRef.current = false;
    setGenerating(true);
    setOutput('');
    setExpression('speaking');

    try {
      let generated = '';

      for (let i = 0; i < MAX_NEW_CHARS; i++) {
        if (stopRef.current) break;

        // Re-tokenize full context each step — avoids past_key_values entirely as the ONNX export doesn't have it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inputs: any = (tokRef.current as any)(input + generated, { return_tensors: 'pt' });

        // Direct single forward pass (not model.generate)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { logits } = await (modRef.current as any)(inputs);

        // logits: [1, seqLen, vocabSize] — pick last token
        const vocabSize: number = logits.dims[2];
        const seqLen: number    = logits.dims[1];
        const offset = (seqLen - 1) * vocabSize;

        // Softmax and multinomial sampling (matching original python PyTorch code)
        const logitsArray = new Float32Array(vocabSize);
        let maxLogit = -Infinity;
        for (let j = 0; j < vocabSize; j++) {
          const v = logits.data[offset + j] as number;
          logitsArray[j] = v;
          if (v > maxLogit) maxLogit = v; // Temperature stability
        }

        let sumExp = 0;
        for (let j = 0; j < vocabSize; j++) {
          const expVal = Math.exp(logitsArray[j] - maxLogit);
          logitsArray[j] = expVal;
          sumExp += expVal;
        }

        let r = Math.random() * sumExp;
        let cumulative = 0;
        let bestIdx = vocabSize - 1;
        for (let j = 0; j < vocabSize; j++) {
          cumulative += logitsArray[j];
          if (r <= cumulative) {
            bestIdx = j;
            break;
          }
        }

        // Break if EOS
        if (modRef.current?.config?.eos_token_id !== undefined && bestIdx === modRef.current.config.eos_token_id) {
           break;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded: string = (tokRef.current as any).decode([bestIdx], { skip_special_tokens: true });
        generated += decoded;
        setOutput(generated);

        // Explicitly free WebAssembly tensor memory to prevent the massive memory leak!
        if (inputs.input_ids?.dispose) inputs.input_ids.dispose();
        if (inputs.attention_mask?.dispose) inputs.attention_mask.dispose();
        if (logits?.dispose) logits.dispose();

        // Yield to React so the UI updates between tokens
        await new Promise(r => setTimeout(r, 0));
      }
    } catch (e) {
      console.error(e);
      setExpression('wrong');
      setTimeout(() => setExpression('idle'), 1500);
    }

    setGenerating(false);
    setExpression('right');
    setTimeout(() => setExpression('idle'), 2000);
  }, [input]);

  return (
    <div className="min-h-screen font-mono relative" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={onBack}
          className="text-sm tracking-widest transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          ← BACK
        </button>
        <span style={{ color: 'var(--border2)' }}>|</span>
        <span className="text-sm font-bold tracking-widest" style={{ color: '#06d6a0' }}>THUS SPOKE THE GPU</span>
        <div className="ml-auto"><ThemeToggle /></div>
      </div>

      {/* Nietzsche — fixed to bottom-left, doesn't affect layout */}
      <div className="fixed bottom-10 left-8 z-10 hidden lg:block">
        <NietzscheSprite expression={expression} size={120} />
      </div>

      {/* Centered content */}
      <div className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-8">

        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Thus Spoke the GPU</h1>
          <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>
            You built the transformer. Now run it.<br />
            Type a prompt and let Nietzsche continue it.
          </p>
        </div>

        {/* ── Idle: load button ── */}
        {status === 'idle' && (
          <button
            onClick={loadModel}
            className="px-6 py-3 font-bold tracking-widest text-sm rounded transition-opacity"
            style={{ background: '#06d6a0', color: '#000' }}
          >
            LOAD MODEL →
          </button>
        )}

        {/* ── Loading ── */}
        {status === 'loading' && (
          <div className="flex flex-col gap-3">
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {loadFile ? `Loading ${loadFile.split('/').pop()}…` : 'Initialising…'}
            </div>
            <div className="rounded-full overflow-hidden" style={{ background: 'var(--surface2)', height: 8 }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${loadPct}%`, background: '#06d6a0' }}
              />
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--dim)' }}>{loadPct}%</div>
          </div>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-4" style={{ border: '1px solid #ef4444', background: '#ef444411' }}>
              <div className="text-sm font-bold text-red-400 mb-2">Failed to load model</div>
              <div className="text-xs font-mono break-all" style={{ color: 'var(--muted)' }}>{errorMsg}</div>
            </div>
            <button onClick={loadModel} className="text-sm tracking-widest" style={{ color: '#06d6a0' }}>
              ↺ RETRY
            </button>
          </div>
        )}

        {/* ── Ready: generate ── */}
        {status === 'ready' && (
          <>
            <div className="flex flex-col gap-3">
              <div className="text-xs tracking-widest font-bold" style={{ color: 'var(--dim)' }}>YOUR PROMPT</div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={3}
                disabled={generating}
                className="w-full rounded-xl px-4 py-3 font-mono text-sm resize-none focus:outline-none disabled:opacity-60"
                style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }}
                placeholder="Type something philosophical…"
              />
              <div className="flex gap-3">
                <button
                  onClick={generate}
                  disabled={generating || !input.trim()}
                  className="flex-1 px-6 py-3 font-bold tracking-widest text-sm rounded disabled:opacity-40"
                  style={{ background: '#06d6a0', color: '#000' }}
                >
                  {generating ? 'SPEAKING…' : 'GENERATE →'}
                </button>
                {generating && (
                  <button
                    onClick={() => { stopRef.current = true; }}
                    className="px-4 py-3 text-sm tracking-widest rounded"
                    style={{ border: '1px solid var(--border2)', color: 'var(--muted)' }}
                  >
                    STOP
                  </button>
                )}
              </div>
            </div>

            {output && (
              <div className="flex flex-col gap-2">
                <div className="text-xs tracking-widest font-bold" style={{ color: 'var(--dim)' }}>
                  {generating ? 'GENERATING…' : 'NIETZSCHE SAYS'}
                </div>
                <div
                  className="rounded-xl p-5 text-sm leading-7 whitespace-pre-wrap font-mono"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
                >
                  <span style={{ color: 'var(--dim)' }}>{input}</span>{output}
                  {generating && <span className="animate-pulse">█</span>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-xs leading-6 mt-4" style={{ color: 'var(--dim)' }}>
          9 levels → 9 chips → 1 transformer block → this model.
        </div>
      </div>
    </div>
  );
}
