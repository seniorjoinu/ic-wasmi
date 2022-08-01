## IC WASMI
WASM interpreter for your canister

### What is it?
This is a rust library that allows your canister to execute dynamically uploaded wasm code (like scripts or lambdas) on-chain.

### Current state
See [example](./e2e-tests/canister/src/actor.rs)

This is just a primitive POC. I compiled this [wasm interpreter](https://github.com/yblein/rust-wasm) to wasm and embedded it
into a canister. Don't expect much from it.
