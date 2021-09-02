## We should switch our focus from proposing countless token standards to finding better canister integration techniques

Yes, this might look like an unreasonable statement, but I hope in this series of posts I'll be able to change your mind.

---

Hello everyone. After creating the thread (---link---) a couple of months ago I worked a lot on
my understanding of what tokens really are and how to use this concept for a better good on the IC.
Also, I did invest some of my free time to develop a couple of token implementations as well as some
general architecture patterns for the IC.
Here I want to present these token implementations and also to share some thoughts about tokens and
tokenization in general.

### 1. Why do they need token standards on Ethereum?

I believe, there is a single reason, and it's purely technical - they can't upgrade their tokens once
deployed. Everything else is a consequence of this limitation. Once tokens are minted and have some
market value, this value is trapped inside an implementation that would never evolve.

* Programmers figured out some cool new cost optimization algorithms? The token is unable to use it.
* A new exchange is out, which uses very convenient and performant, but non-standard APIs? The token
can't be listed there.

How do you handle such a situation? Plan your APIs in advance - declare a new standard - exactly what they have to do. 
But on the IC we're blessed with canister upgrades, so our **token canister can be upgraded**, once there are new 
requirements to them, without losing its value.

While on the IC, you could simply implement new features (optimizations or integrations) on-demand, 
when your community needs it. So, there is no point in constraining token implementation with some
standard. Once a new feature is requested, you just implement it and upgrade your canister. Once a 
new DEX is out, you just integrate with it. No loses.

They can't do this on Ethereum, but we can. And we should use this advantage to focus on more important things.

> Q: But how could I keep this feature, after I blackholed the controller of my token canister?
> I can't upgrade it anymore, and this is very reasonable thing to do with a token - to let go the
> control over it.

> A: This is by design. Once blackholed, canister can't be upgraded and can't evolve, so don't blackhole
> your token, if you want it to continue evolving. Instead, you can hand over the control over it to
> its own token holders with the help of some powerful DAO (which is not implemented yet, but one day...)

### 2. Term "token" considered harmful

The next thing I want to talk about is how the word "token" messing with our brain interfering our understanding
of this concept.

> I'm not saying that this word should never be used again. I'm saying we should understand what's going on
> under the hood using it.

When you think about the word "token", what do you imagine? Something physical, like a coin, right? Something
you can __hand over__ to another person or lay down on a table in front of you. But this is not how
it works. In reality, when we say "I have a token" it just means that our address is listed in some
__registry__. 

Correct words build correct abstractions. And this is a very important thing for us to always remember - 
while it is considered bad and inconsistent to have many-many different tokens, each serving its purpose; 
it is absolutely fine to have many registries.

But why don't we call them __registries__ in that case? Because tokens have a unique feature - access control.
It is only __you__ who can transfer your currency. It is only __you__ who can participate in a voting.
It is only __you__ who could sell that house.

This brings us to a conclusion - it is a token __only__ when it treats its users differently (only when
it cares, what principal did make a call). And this is actually what web2.0's `authorization token` is -
just a record in a database that says "the user with this email has this set of permissions".

If you keep thinking this way, you may find yourself in a very interesting place - where every fact of
access rights checking could be expressed as a token. 

> Example. Some of you already deployed their canisters to the mainnet. If you also did, you know that you're
> now a "canister controller" - only you decide whether to upgrade or to turn off your canister. So, one
> might interpret this fact as "I have a canister controller token".
> 
> Fun fact: since you can transfer ownership of this token, you could sell it on some auction...

And this is all very interesting. I believe, this is the main reason why everyone unconsciously wants to 
make a "universal" token standard, that would fit every need. Because the core idea is so tiny and concise.
But such a "universal" token would be very dumb and would provide almost no abstraction.

So, I believe, instead of that we should do the opposite - to build many different tokens tailored
to solve their exact tasks. 

### 3. The world of great tokens
And saying the word "different" I mean it. Should we use the same token to represent both: currency and shares?
Well, we could, but it would be much better to implement separate tokens for them, which may share some common
functions. For example, you can mint, transfer and burn both of them, but you can only participate in votings
with the shares token.

Should we use the same token standard to represent a painting and a house? Or a house and a car? Or... hell no!
The only common thing between all these tokens is that they are tokens - there is some kind of access control
going on. But everything else is different. You can rent a house, but you can't rent a painting the same way.
You can unlock the car (letting somebody in), but it is not the same as to unlock a house's door.

> This is the problem with current NFTs, as I see it. Nobody understands what the kind of magic are they, so prices just skyrocket.

Everytime it seems like these entities have common interface it is so only if they are the same kind of entities.
All the other times there are nuances which would affect the implementation.

So, I propose, we should embrace it. 

You want to tokenize cars? Okay, no problem. Hire some lawyers and make a token
that would be very convenient to use in real world.

You want to tokenize voting power? Okay, study some math, politics and democracy theory and create a token that can
easily handle any possible voting use-case.

Etc. Don't generalize tokens. **Specialize them instead**. Make them powerful, slick and easy to use. Incorporate
beautiful custom frontends for them to make your users happy.

And another important thing - make them integrable. Integration is the thing you really want to generalize.
The easier it is to integrate your canister, the better the Open Internet could be. The easier it is for us
to collaborate, the more we could achieve together.

### 4. Currency token

I want to start from myself and present you a token, I've been working on for some time now, that (at least in
my opinion) should represent a __currency__ really well. 

https://github.com/seniorjoinu/tokens/tree/master/currency-token

Take a look at it and let me know what you think! I see this repository as a library of different tokens which you 
could clone, modify and use in your projects.

Here I'm going to tease some of its core features and new concepts.

#### Overview
```
service : (InitRequest) -> {
    "mint" : (TransferRequest) -> ();
    "transfer" : (TransferRequest) -> ();
    "burn" : (BurnRequest) -> ();
    "get_balance_of" : (GetBalanceOfRequest) -> (GetBalanceOfResponse) query;
    "get_total_supply" : () -> (GetTotalSupplyResponse) query;
    "get_info" : () -> (GetInfoResponse) query;
    "update_info" : (UpdateInfoRequest) -> (UpdateInfoResponse);

    "get_controllers" : () -> (GetControllersResponse) query;
    "update_info_controller" : (UpdateControllersRequest) -> (UpdateControllersResponse);
    "update_mint_controller" : (UpdateControllersRequest) -> (UpdateControllersResponse);

    "dequeue_recurrent_transfer_tasks" : (DequeueRecurrentTaskRequest) -> (DequeueRecurrentTaskResponse);
    "get_recurrent_transfer_tasks" : (GetRecurrentTransferTasksRequest) -> (GetRecurrentTransferTasksResponse) query;
    "dequeue_recurrent_mint_tasks" : (DequeueRecurrentTaskRequest) -> (DequeueRecurrentTaskResponse);
    "get_recurrent_mint_tasks" : () -> (GetRecurrentMintTasksResponse) query;
}
```

The main signature of this actor is based on what we've seen in almost any fungible token before. We have same `mint`,
`transfer`, `burn`, `balance_of` and `total_supply` functions and their core idea stayed the same - these are a basic
functions which any developer should find familiar themselves with.

The only difference here is that instead of separate `name`, `symbol` and `decimals` fields, we have a single field
`info` that incorporates all this data inside it. This is done for encapsulation purposes. Fewer details, more could fit 
inside.

#### Batches
As you might notice, all basic functions now have a single argument instead of their traditional signature. The one 
reason for that is the same old encapsulation, and the other is that each `update` method now supports batch requests.
This means that if you need to perform multiple `transfer`s, you could to them all at once, during a single function
invocation. The same goes for `mint`s. This would help with cost efficiency of this token.

`query` methods do not support batches right now, but I believe they should, since one day queries will also charge
cycles, so it is reasonable to optimize them as well.

#### Granular control
Other thing you might see in the candid above is several "controller"-related methods. Yes, a canister has a controller,
but what are these methods for?

A token itself has several permissions. A token could be minted - this is a permission not everyone should have. So, 
there is a list of principals which should. In the candid this list is referred as `mint_controllers`. Only principals
from this list are able to mint this token. If the list is empty - no one could mint it anymore.

Current controllers are able to modify their controllers list. So, if you're a `mint_controller` of this token, you can
also add your friend to it, so you both could mint tokens for everybody else. This is done via `update_mint_controller`
function. Or you could pass an empty vec to this method, letting go the control over minting the token.

The same goes to token info - there is an `info_controllers` field also. Yes, `name`, `symbol` and `decimals` can also
be changed at runtime, if there is a need for such a thing.

Why do we need such a thing? As the title says, it lets you (and potentially, your token holders) to control your token
with better granularity. For example, the `info` could be controlled by some trusted person, while minting could be performed
via third party canister.

> Fun fact: being in the `mint_controllers` list you could say "I have a mint controller token of this token"

#### Recurrent payments with ic-cron

https://github.com/seniorjoinu/ic-cron

Yes, honest authorized on-chain recurrent payments. You can set a recurrent transfer task, that would transfer funds
on your behalf, for example, each week. Just add a special argument to your `transfer` call, and you're good to go.
Tasks could be listed and unscheduled using functions at the end of mentioned candid interface. 

Recurrent mints are also supported.

#### Integration through events with ic-event-hub

https://github.com/seniorjoinu/ic-event-hub

Each time a transfer, a mint or a burn occurs, the following event is emitted to every event listener:

```rust
#[derive(Event, CandidType, Deserialize)]
pub struct TokenMoveEvent {
    #[topic]
    pub from: Option<Principal>,
    #[topic]
    pub to: Option<Principal>,
    pub qty: u64,
    pub event_payload: Payload,
}
```
which is enough to integrate this token with almost any other canister.

For example, let's imagine you're building a transaction ledger for one of these tokens. All your ledger need to do
is to listen for all of these events and to simply log them formatting the data the way you need it.

> Moreover, one could implement a ledger canister, supporting Rosetta API and ic-event-hub. Such a ledger will automatically
> work with every token, which can emit such events, automatically making them exchange-ready.

Another example: you're implementing a DEX and you want to integrate such tokens, so your users could exchange them.
All you need to do is to listen for events which have your DEX's principal in their `to` field. That way the DEX canister
can be sure, that someone sent some tokens to it, and then use `event_payload` to determine what exactly did sender wanted 
to do (sell or buy).

Events are a very convenient way to integrate canisters. They let your canister tell it's going through something to
"the world", not knowing who will receive this data. Moreover, once the `heartbeat` mechanism is ready to use, `ic-event-hub`
will be updated to use `ic-cron` (so events could be sent in batches). This will optimize "hot" integrations (with lots 
of events flying each block), making this kind of integrations not only more convenient, but also more cost-effective.

#### Rust client and membership token
There is also a rust canister client - a struct that wraps `ic_cdk::call` invocations into type-safe operations for ease
of use from another canisters.

In a sibling directory you'll find another token implementation - a much more permissioned `membership-token`. Which could
be used by organizations to, for example, reflect their employees in form of token.

#### Final overview
With all these features, I think it is fair to claim, that this currency token is the most advanced one presented to this day.
And I believe we could make it much better together. 

### Key takeaways
* we don't need token standards, we need better tokens, which solve their tasks
* we don't need to generalize tokens, we need to generalize integration