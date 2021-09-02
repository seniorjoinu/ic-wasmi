use ic_cdk::export::candid::export_service;
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use rust_wasm::values::Value;
use rust_wasm::*;
use std::io::Cursor;

#[derive(Default)]
pub struct State {
    pub current_module: Vec<u8>,
}

#[update]
fn set_module(module: Vec<u8>) {
    get_state().current_module = module;
}

#[update]
fn execute(args: Vec<i32>) -> Vec<i32> {
    let mut store = init_store();

    let current_module = get_state().current_module.clone();
    let cursor = Cursor::new(current_module.as_slice());

    let module = decode_module(cursor).unwrap();
    let module_instance = instantiate_module(&mut store, module, &[]).unwrap();

    if let ExternVal::Func(main_addr) = get_export(&module_instance, "fn").unwrap() {
        let res = invoke_func(
            &mut store,
            main_addr,
            args.into_iter().map(Value::from_i32).collect(),
        );

        let r = res.unwrap();

        union_utils::log(format!("{:?}", r).as_str());

        r.into_iter()
            .map(|it| match it {
                Value::I32(v) => v as i32,
                Value::F32(_) => trap("Bad output: f32"),
                Value::I64(_) => trap("Bad output: i64"),
                Value::F64(_) => trap("Bad output: f64"),
            })
            .collect()
    } else {
        vec![]
    }
}

// ------------------ STATE ----------------------

export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}

static mut STATE: Option<State> = None;

pub fn get_state() -> &'static mut State {
    unsafe {
        match STATE.as_mut() {
            None => {
                STATE = Some(State::default());
                get_state()
            }
            Some(s) => s,
        }
    }
}
