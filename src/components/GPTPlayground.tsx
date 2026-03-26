import { useState, useRef, useCallback } from 'react';
import { AutoTokenizer, AutoModelForCausalLM, Tensor, env } from '@huggingface/transformers';
import ThemeToggle from './ThemeToggle';

env.allowRemoteModels = true;
// Disable proxy worker — prevents a persistent Web Worker from polling after inference
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.proxy = false;
  env.backends.onnx.wasm.numThreads = 1;
}

const MODEL_ID = 'Invic7us/nietzsche-gpt';
const MAX_NEW_TOKENS = 200;
const CTX_WINDOW = 50;

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function GPTPlayground({ onBack }: { onBack: () => void }) {
  const [status, setStatus]       = useState<Status>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [loadPct, setLoadPct]     = useState(0);
  const [loadFile, setLoadFile]   = useState('');
  const [input, setInput]         = useState('The will to power is');
  const [output, setOutput]       = useState('');
  const [generating, setGenerating] = useState(false);
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

    try {
      let generated = '';

      // Tokenize prompt ONCE — avoids O(n²) re-tokenization on every step
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const encoded: any = (tokRef.current as any)(input, { return_tensors: 'pt' });
      const allIds: bigint[] = Array.from(encoded.input_ids.data as BigInt64Array);
      encoded.input_ids?.dispose?.();
      encoded.attention_mask?.dispose?.();

      for (let i = 0; i < MAX_NEW_TOKENS; i++) {
        if (stopRef.current) break;

        // Slide a context window of CTX_WINDOW tokens — keeps memory flat
        const ctx = allIds.slice(-CTX_WINDOW);
        const seqLen = ctx.length;

        const inputIdsTensor = new Tensor('int64', new BigInt64Array(ctx), [1, seqLen]);
        const attMask        = new Tensor('int64', new BigInt64Array(seqLen).fill(1n), [1, seqLen]);
        const posIds         = new Tensor('int64', new BigInt64Array(Array.from({ length: seqLen }, (_, j) => BigInt(j))), [1, seqLen]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { logits } = await (modRef.current as any)({ input_ids: inputIdsTensor, attention_mask: attMask, position_ids: posIds });

        // logits: [1, seqLen, vocabSize] — pick last token
        const vocabSize: number = logits.dims[2];
        const offset = (seqLen - 1) * vocabSize;

        // Softmax + multinomial sampling (temperature=1)
        const logitsArr = new Float32Array(vocabSize);
        let maxLogit = -Infinity;
        for (let j = 0; j < vocabSize; j++) {
          const v = logits.data[offset + j] as number;
          logitsArr[j] = v;
          if (v > maxLogit) maxLogit = v;
        }
        let sumExp = 0;
        for (let j = 0; j < vocabSize; j++) {
          const e = Math.exp(logitsArr[j] - maxLogit);
          logitsArr[j] = e;
          sumExp += e;
        }

        let rng = Math.random() * sumExp;
        let bestIdx = vocabSize - 1;
        for (let j = 0; j < vocabSize; j++) {
          rng -= logitsArr[j];
          if (rng <= 0) { bestIdx = j; break; }
        }

        allIds.push(BigInt(bestIdx));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded: string = (tokRef.current as any).decode([bestIdx], { skip_special_tokens: true });
        generated += decoded;
        setOutput(generated);

        inputIdsTensor?.dispose?.();
        attMask?.dispose?.();
        posIds?.dispose?.();
        logits?.dispose?.();

        // Yield to React so UI updates between tokens
        await new Promise(r => setTimeout(r, 0));
      }
    } catch (e) {
      console.error(e);
    }

    setGenerating(false);
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

      {/* Centered content */}
      <div className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-8">

        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Thus Spoke the GPU</h1>
          <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>
            You assembled the architecture. Now watch it speak.<br />
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
