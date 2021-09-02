#!/usr/bin/env bash

cargo build --target wasm32-unknown-unknown --release --package on-chain-wasm-interpreter && \
 ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/on_chain_wasm_interpreter.wasm -o ./target/wasm32-unknown-unknown/release/on-chain-wasm-interpreter-opt.wasm
