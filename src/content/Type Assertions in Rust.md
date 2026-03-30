---
id: type-assertions-in-rust
aliases: []
tags:
  - post
  - rust
title: Type Assertions in Rust
index: 1
---

In software development and computer science, an invariant or invariance refers to an assertion that can be made about a property of our code. It can be a single property or a relationship between multiple. For example, in a video game a player character may have the invariant that their health is always greater than or equal to 0. In C, a common invariant is that:

> A string always ends in a terminating null byte.

In C, strings aren't special objects (nothing in C is really a special object). They're just a raw pointer to a buffer that can be modified by anything. Importantly, strings don't carry information about the length of their contents, hence the need for a sentinel value to mark when functions that operate on strings should stop. For basically every function in the C library, that sentinel value is a byte consisting of all 0s. For example, here's the man page for `strlen`:

```
DESCRIPTION
    The strlen() function calculates the length of the string pointed to by s, excluding the terminating null byte ('\0').
```

The problem with this is that *any* function that operates on a string or character array more or less has to pinky-promise-cross-my-heart-and-hope-to-die I won't forget to include the \0.

This is one of the major issues with C that object oriented languages fix. Object oriented languages encourage *encapsulation*, where modifications to internal state are gated behind specific operations. The developer(s) responsible for that specific class can ensure that their class's invariants are maintained at all times. If you look at the [API for C++ strings](https://en.cppreference.com/w/cpp/string/basic_string), there are many operations we can perform on strings. But not only do we not know what the contents of the string are, the exact structure and implementation can actually vary between different compilers and libraries. We are freed from the burden of promising to maintain the invariants of a string because all of the methods that operate on strings and the people who wrote those operations ensure it for us.

However, you don't need object oriented programming to have encapsulation, as demonstrated by Rust, and in this article I want to take a deep dive into how Rust allows us to encapsulate our data, make strong assertions about the invariants of our programs, and how we can build our types and functions around our invariants.

Let's imagine we want to write a library to implement fractions in Rust. The implementation of this is easy:

```rust
pub struct Fraction
{
    numerator: i64,
    denominator: i64,
}
```

Right off the bat, before we even begin to work on implementing methods that can operate on our new fractions, Rust's type system is working to ensure that we can be confident that our type is always in a *valid* state. By default, struct members are private and can only be modified by code within the same module, what we might call "internal" or "authorized" functions. Instead of exposing the internal state or data to be modified by anyone, it's best practice to control access via getters and setters or other methods where you can do validation, etc.

> [!note] Note
> As mentioned, Rust does not use object oriented principles. This struct is *not* a class or an object. It's just a struct. But we can still leverage visibility modifiers, member methods, and associated functions just as we can in most object oriented languages.

```rust
// fractions.rs
pub struct Fraction {..};

impl Fraction
{
    pub fn as_float(&self) -> f64
    {
        //as_float has access to the internal data of Fraction.
        ..
    }
    pub fn numerator(&self) -> i64
    {
        // This will return our numerator, but that's okay.
        // i64 implements Copy, so we'll return a *copy* of our numerator.
        // If the outside world changes the result, it won't actually affect our internal state.
        self.numerator
    }
}
// outside of fractions.rs

// This won't work
fraction.numerator = 3;
// Neither will this
fraction.numerator() = 3;
// but this will work
let mut numerator = fraction.numerator();
// This won't change the fraction.
numerator = 5;
```

One thing that Rust has that object oriented languages *don't* have is a lack of constructors.

In languages like C++ and C#, all objects have to have a constructor. If one isn't specified, you get a default constructor.

```csharp
class AClass
{
    public AClass() 
    {
        // Constructor here
    }

    public AClass(int a, string b)
    {
        // Constructor with arguments!
    }
}
```

Importantly, this constructor *mandates* that this function has a signature that returns an `AClass`. If you want the constructor to fail, you *must* throw an exception. There's a lot more wackiness with constructors in general. If you want to learn more, I highly recommend [this video](https://www.youtube.com/watch?v=KWB-gDVuy_I) by YouTuber Logan Smith.

In Rust, you have no such restrictions. A "constructor" is just any function that returns an object of the desired type. This can be via an associated function of that type, or even a function of a completely different type! And in fact, you don't even have to return the type itself as in an object oriented language. You can return `T`, `Option<T>`, `Result<T>`, `Vec<T>` or anything you want.

With all this in mind, let's figure out how we want to create Fractions.

> [!info] Info
> Convention dictates that, all else being equal, we call our constructor method `new()`. You should actually use a better name if one applies, however.
> While `new()` is more or less standard practice and users often expect it, I think that if a different method name is more descriptive than `new()`
> you should use it. The gain from being clear about what your function does is greater than the cost of having to (*gasp*) read documentation.

### Option 1: Return a `Fraction`

```rust
pub fn new(numerator: i64, denominator: i64) -> Self
{
    Self
    {
        numerator,
        denominator,
    }
}
```

The problem with this is that this method *can't* fail if our invariants are violated. What invariants? Well, we have just one. Our denominator can't equal 0. But it can't fail, It's forced to return a `Fraction`, whether or not that makes sense or not. Here, having a denominator of 0 is totally fine, but when we try to call, say, `as_float()` which requires dividing by the denominator, it will panic. So instead, let's update this function to use an *assertion*. If the assertion fails, the function should panic and the program should halt. Thus instead of panicking unexpectedly when we *use* our Fraction, we panic when we *create* an invalid one.

```rust
pub fn new(numerator: i64, denominator: i64) -> Self
{
    assert!(denominator != 0);
    Self
    {
        numerator,
        denominator,
    }
}
```

**Pros:**
This function is super easy to use as a developer. I don't have to worry about handling or unwrapping any `Option`s or `Result`s. It *does* do what we want. We know that if we end up holding a `Fraction`, that fraction *cannot* have a denominator of 0.

**Cons:**
This function does not fail gracefully. This function doesn't leverage Rust's type system to enforce handling the error case by the caller. This is basically the same as throwing an exception, the exact thing we want to avoid. It's actually worse because we can't even handle it.

### Option 2: Use an `Option`

The obvious solution is to wrap the return value in an `Option`. We'll use `Option` here instead of `Result` since this function has one and only one failure case; when the denominator is a 0.

```rust
pub fn new(numerator: i64, denominator: i64) -> Option<Self>
{
    match denominator
    {
        0 => None,
        x => Some(Self
        {
            numerator,
            denominator: x,
        })
    }
}
```

**Pros:**
Errors-as-values comes in clutch yet again. We never receive a `Fraction` object unless the operation was successful. If the numerator is a 0, we don't get a fraction, just a `None.`

The type system enforces this check. While you are *allowed* to pass in a 0 as a denominator, you still have to handle the `Option`.

The type system clearly *describes* the problem. Even if someone came across this function signature and didn't know *how* this function could fail, they know that it can. Supplementing this with documentation to describe the failure case helps a lot.

**Cons:**
Nobody *likes* handling `Options`. What if I pretty-please-pretty-promise that my denominator isn't 0? I still have to go through all this work (calling `fraction.unwrap()`, God forbid) to get at the underlying value.

Furthermore, this check happens only at runtime. What if I *know* the values I'm passing into the fraction at compile time, and want to have the check occur then? Maybe the runtime case where I'm passing 0 as a denominator happens in a very specific branch of code, and so I won't encounter the `None` when testing/running my system normally.

```rust
if(functionThatReturnsTrueOneInAMillionTimes())
{
    Fraction::new(1,??).unwrap();
}
```

Do you trust this code? Would you use it in your own code base? Granted, this is a terrible way of designing code if you're going to test it, but still, wouldn't it be nice if the compiler just peeked inside that function and tested it before we even got to executing it?

### Option 3: Use `NonZero`

Another thing we could try is to move the invariant outside of our class.

The Rust standard library happens to have exactly what we need: [NonZero](https://doc.rust-lang.org/std/num/struct.NonZero.html), which, as you might expect, guarantees that the stored value is *not* zero.

This makes our function look like this:

```rust
pub fn new(numerator: i64, denominator: NonZeroI64) -> Self
{
    Self
    {
        numerator,
        // We could also just make our internal denomminator field
        // a NonZeroI64 too.
        denominator: denominator.get()
    }
}
```

**Pros:**
As "type-y" as it gets. Since we've successfully guaranteed that the invariance of all of our inputs are maintained, we don't have to do any error checks at all.

This means we don't have to handle `Option`s, but we still have all of the safety of option 2.

**Cons:**
The problem arises as soon as we step outside of our own code. Okay, we've simplified the process of constructing a `Fraction`, but what does it look like to construct a `NonZeroI64`?

The answer is something like this:

```rust
let denominator = NonZeroI64::new(5).unwrap();
let fraction = Fraction::new(numerator, denominator);
```

We've just kicked the can down the road! We have to do the *exact* same runtime checks that we would've had to do with `Fraction`, but now we have this extra type, construction, and line of code floating around in our code base.

The other problem is that we got lucky here with `NonZero` representing exactly the invariant we wanted. But what if we had a different problem domain with different restrictions? What if we wanted a denominator that only represented a number between 1 and 9? We wouldn't just be writing extra code to *use* our `BetweenOneAndNineI64` type, we'd be writing a bunch of code to *implement* it, for a type that is likely only used exclusively as an input for our `Fraction` class and—again, requires all the same checks that creating a Fraction would've before.

At the end of the day, you're going to have untrusted input *somewhere*, and it's more or less up to you as a developer where you're going to draw the line.

## Conclusion

So what do I recommend? While I don't think there's really a one-size-fits all solution or metric to apply to every possible Rust codebase, I think these are some handy guidelines for how to build better constructors and enforce valid states while also making it easy for yourself and others

### 1: Enforce Invariance in Your Most Basic Types, but no Further.

Every type in Rust that isn't a primitive is a composite type made up of one or more primitive types or other composite types. And just as composite types are made up of one or more other types, the invariance of a composite type is the sum of the invariance of its member types.

A valid database should be made of valid tables and valid tables should be made up of valid entries. Valid entries should be made up of valid usernames, emails, passwords, etc. But past that? It doesn't really make sense to break things up any further. Could you have a `Password` that is constructed out of arguments like `UppercaseSymbol`, `SpecialCharacter`, etc? Sure, but why? Those types don't serve any purpose outside of `Password`, so why bother creating them?

The important thing to remember is that when you want your system to be "type-safe", `Option` and `Result` *already* make your system type safe! As cool as things like the typestate pattern are and having validated wrapper types passed into functions, at the end of the day, `Option` and `Result` are *types* and must be handled by and with the type system.

I'd argue a good rule of thumb is that if you have types that are exclusively used for one other type—*especially* if they're exclusively used as input arguments for one type—you may be digging too deep.

### 2: Use `const` for Compile-time Invariance Checks

This keyword is actually quite new to me. Remember how I said that it would be really cool if we could ask the compiler to check if our invariants are maintained at compile time? In other words, if we have some static literal like a number, why can't we also have the entire object be a sort of static literal computed at compile time? It turns out we can!

Rust allows you to specify entire functions as `const` which allows them to run at both [compile time and runtime](https://doc.rust-lang.org/reference/const_eval.html). There's a few restrictions on what you can do inside a `const` function: for one, every function called within a `const` function must also be `const`. Fortunately, `Option` does implement `const` on many of its functions, and it's good practice to do the same on your own data types. Constructor/`new()` type functions are especially great candidates to add `const` onto, there's essentially no reason not to add it everywhere you can unless doing so conflicts with the aforementioned restrictions. As an example, while `Option` *does* have `const unwrap()` and `const expect()`, `Result` does not for some reason. I expect it might have something to do with the fact that `Result`'s `Err` type is generic while `Option`'s `None` is not, or maybe just no one has gotten around to making it `const` yet.

*Using* a const function is unfortunately not quite as seamless as it could be. You have to call it inside a `const` block, just like you do with `unsafe` functions.

This would look something like this for our `Fraction`:

```rust
let fraction = const { Fraction::new(5,3).expect("I pinky promise this won't fail") }
```

While I used `expect` here for comedic effect, unfortunately since this is a *compile* time error, the only helpful thing Rust actually does is point us to this function. It's a lot of boilerplate, and it's also not exactly well known that Rust can even *do* this. Even if you mark your function as `const`, there's no guarantee that someone will call it within a  `const` block, even if it's a "hardcoded" type, like we have here. I sort of wish that Rust would try to evaluate "literals" like this automatically, though I understand that there's probably a great deal of implementation issues in making that happen. It's nice that it's opt-in, but I think I'd much rather have this behavior by default and have it be opt-out.

The other thing is that we *still* have to handle the `Option`, even though we know *100%* that our `Fraction` is valid. That's not a huge deal, this is *exactly* what `unwrap()` and `expect()` are for: they're a shortcut, a promise between you and a function that you *know* that your input was valid and you don't need to handle the error case. To violate an `unwrap()` or `expect()` is a logical error: a bug in *your* understanding of your own code. But still, since this is all happening at compile time, it feels like Rust should be able to just know that our code will succeed. And this actually brings me to point 3:

### 3: Expose `_unchecked` Variations of Constructors when it Makes Sense

If you look at types like `NonZero`, they'll typically have two functions whose signatures look something like this:

```rust
pub const fn new(n: i64) -> Option<NonZeroI64> { ... }

pub const unsafe fn new_unchecked(n: i64) -> NonZeroI64 { ... }
```

where the `_unchecked` version of a function will return just a `Self`, with no `Option` or anything wrapped around it. The nice thing about this is that this *is* our opportunity to say "I pretty please pinky promise that I'm constructing a valid instance of this type, you can trust me bro".

In your implementations, your `_unchecked` function should probably look like what our final version of Option 1 ended up being: We return a `Self` but we have an `assert!` to forcibly panic if the caller violated our invariance despite their promise not to. You shouldn't just trust that they didn't violate it. The simple way to do this is to just use `expect()` .

```rust
pub const fn new_unchecked(numerator: i64, denominator: i64) -> Self
{
    Self::new(numerator, denominator).expect("Attempted to create a fraction with a denominator of 0!");
}
```

Really this just ends up being a shorthand for `expect()`, but we have a nice, descriptive error message that now we don't have to rewrite every time we want to do this.

The other thing is that you'll notice that `_unchecked` functions are *normally* marked `unsafe`, but you should **absolutely** not reach for `unsafe` to mark functions that can potentially violate invariance: unless doing so *also* causes **undefined behavior.**

[Rust is *very* specific about what constitutes "unsafe behavior"](https://doc.rust-lang.org/reference/behavior-not-considered-unsafe.html), and logical errors do not count.

These standard library functions that are `_unchecked` and also marked `unsafe` are typically marked so because they take advantage of compiler optimization shortcuts by *assuming* that invariance is maintained. If it isn't, it is actually real, legit, undefined behavior because the compiler has completely optimized away the code branches that handle failure. Even if it isn't a type that's obviously dealing with pointers or other obvious `unsafe`-esque behavior.

The implementation of `new_unchecked` for `NonZero` looks like this:

```rust
#[stable(feature = "nonzero", since = "1.28.0")]
#[rustc_const_stable(feature = "nonzero", since = "1.28.0")]
#[must_use]
#[inline]
pub const unsafe fn new_unchecked(n: T) -> Self {
    match Self::new(n) {
        Some(n) => n,
        None => {
            // SAFETY: The caller guarantees that `n` is non-zero, so this is unreachable.
            unsafe {
                ub_checks::assert_unsafe_precondition!(
                    check_language_ub,
                    "NonZero::new_unchecked requires the argument to be non-zero",
                    () => false,
                );
                intrinsics::unreachable()
            }
        }
    }
}
```

Which is frankly scary black magic to me and actually uses a bunch of nightly or otherwise experimental stuff that I don't encourage adopting into your own codebase. If you *must* mark code unreachable, the standard library offers [unreachable_unchecked](https://doc.rust-lang.org/std/hint/fn.unreachable_unchecked.html), with the following note:

> Use this function sparingly. Consider using the `unreachable!` macro, which may prevent some optimizations but will safely panic in case it is actually reached at runtime. Benchmark your code to find out if using `unreachable_unchecked()` comes with a performance benefit.

So yeah, I don't recommend making your code `unsafe` when it doesn't have to be. `unreachable!`, `panic!`, or an `assert!` are probably more than sufficient.

To reiterate, logic errors are not considered unsafe, so don't default to marking them as `unsafe` unless you are specifically using experimental features that could lead to undefined behavior. `_unchecked` is more than sufficient on its own to indicate that while violating its invariants won't cause undefined behavior, it is also a logical error that will crash your program. Supplementing that with good documentation explaining when and how panics happen is good practice too.

As mentioned above, a good `new_unchecked` function is probably nothing more than a wrapper around what the caller would be doing anyways: i.e `Self::new().unwrap()`. (Or `expect` with a suitable error message 😉)
