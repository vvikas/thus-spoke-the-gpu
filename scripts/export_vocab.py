"""
export_vocab.py — extract character vocabulary from a nanoGPT checkpoint

Usage:
    python scripts/export_vocab.py nietzsche_model.pt

Outputs:
    vocab.json  (upload to huggingface.co/Invic7us/nietzsche-gpt repo root)

The JSON has this shape:
    {
      "chars": ["\\n", " ", "!", ...],   // ordered list of characters
      "stoi": {"\\n": 0, " ": 1, ...},  // char → index
      "vocab_size": 65
    }

Then in your HuggingFace repo:
    - Place vocab.json at the root
    - Place the ONNX model at  onnx/model.onnx
      (transformers.js always fetches from the onnx/ subfolder)
"""

import json
import sys
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/export_vocab.py <path_to_checkpoint.pt>")
        sys.exit(1)

    ckpt_path = sys.argv[1]
    if not os.path.exists(ckpt_path):
        print(f"File not found: {ckpt_path}")
        sys.exit(1)

    try:
        import torch
    except ImportError:
        print("PyTorch not installed. Run: pip install torch")
        sys.exit(1)

    print(f"Loading checkpoint: {ckpt_path}")
    ckpt = torch.load(ckpt_path, map_location="cpu", weights_only=False)

    chars = None

    # Try common places the vocab is stored in nanoGPT checkpoints
    if "config" in ckpt and hasattr(ckpt["config"], "chars"):
        chars = list(ckpt["config"].chars)
    elif "meta" in ckpt and "chars" in ckpt["meta"]:
        chars = list(ckpt["meta"]["chars"])
    elif "chars" in ckpt:
        chars = list(ckpt["chars"])
    elif "model_args" in ckpt:
        args = ckpt["model_args"]
        if "vocab_size" in args:
            # No chars stored — try to reconstruct from training text
            print(f"vocab_size={args['vocab_size']} found but no chars list in checkpoint.")
            print("Looking for data/input.txt or data/nietzsche.txt to rebuild vocab...")
            for candidate in ["data/input.txt", "data/nietzsche.txt", "input.txt"]:
                if os.path.exists(candidate):
                    with open(candidate, "r", encoding="utf-8") as f:
                        text = f.read()
                    chars = sorted(list(set(text)))
                    print(f"  Found {len(chars)} unique chars in {candidate}")
                    break

    if chars is None:
        print("\nCould not find vocab in checkpoint.")
        print("Please provide the training text file and re-run, or manually create vocab.json.")
        print("Expected format:")
        print('  {"chars": ["\\n"," ","!",..."z"], "stoi": {"\\n":0,...}, "vocab_size": N}')
        sys.exit(1)

    stoi = {c: i for i, c in enumerate(chars)}
    vocab = {"chars": chars, "stoi": stoi, "vocab_size": len(chars)}

    out_path = "vocab.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False)

    print(f"\nSaved {out_path}")
    print(f"  vocab_size = {len(chars)}")
    print(f"  first 20 chars: {chars[:20]}")
    print("\nNext steps:")
    print("  1. Upload vocab.json to your HuggingFace repo root")
    print("  2. Place your ONNX model at  onnx/model.onnx  in the repo")
    print("  3. Open the playground and click LOAD MODEL")

if __name__ == "__main__":
    main()
