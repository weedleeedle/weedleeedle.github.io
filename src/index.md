---
layout: base.njk
---

Hi! My name is Eli Stoll, though I commonly go by my handle here on the internet, Weedleeedle.


## Projects

Here are some of my completed or in-progress projects that I'm especially proud of.

[Rust Chess Engine](https://github.com/weedleeedle/rust-chess-engine) is my attempt at
building a terminal-based chess program in Rust. While there's more features I'd like to add,
it has working local multiplayer, remote LAN multiplayer (though lacks UI to actually pick addresses), and 
an AI opponent that doesn't do very good.

[SWADE Pronouns](https://github.com/weedleeedle/swade-pronouns) adds a text box to
[SWADE](https://peginc.com/savage-settings/savage-worlds/) character sheets in the
[Foundry Virtual Tabletop](https://foundryvtt.com/), allowing players to see the pronouns
of their fellow characters.

[Synthesis](https://weedleeedle.itch.io/synthesis) is a game I made in [Godot](https://godotengine.org/)
for [MiniJam #179](https://itch.io/jam/mini-jam-179-energy). It features dynamic, real-time audio processing/generation
for harmonics. The source code can be found on [GitHub](https://github.com/weedleeedle/minijam-179).

I've also contributed to a number of other game jams along with my friends [Max Williams](https://bsky.app/profile/wrenchykenku.bsky.social) and [Izzy King](http://izzyking.com/).
We've made some games, including [Snap To](https://wrenchykenku.itch.io/snap-to), [Desktop Defender](https://wrenchykenku.itch.io/desktop-defender),
and [The Cursed Blade](https://wrenchykenku.itch.io/the-cursed-blade).

This blog! It's built with [11ty](https://www.11ty.dev/docs/), and I keep all the source code public on [GitHub](https://github.com/weedleeedle/weedleeedle.github.io).
I've even developed a plugin for this blog, [eleventy-plugin-graphviz](https://www.npmjs.com/package/eleventy-plugin-graphviz)
which allows me to generate [GraphViz](https://graphviz.org/) graphs from DOT scripts.


## Highlights

Here's a few of the articles, videos, and other resources that I find extremely helpful,
important, or funny. These are what inspired me to contribute to the software development discourse 
like this.

[Study of std::io::Error](https://matklad.github.io/2020/10/15/study-of-std-io-error.html).
This article is a constant reference for me when I'm developing my error types in Rust.

[Logan Smith](https://www.youtube.com/@_noisecode) is an incredible YouTuber. I find myself
constantly rewatching his videos. They're extremely well written and edited, and I appreciate
Logan's deep dives into the fundamentals of languages like Rust and C++.

[Wat](https://www.destroyallsoftware.com/talks/wat). Perhaps a bit educational but mostly just funny,
this iconic talk on the quirks of JavaScript will haunt the language for the rest of its days.

## Posts

Here are some of my various thoughts and musings about software development, technology,
and maybe a few other things here and there.

<ol reversed>
{% for post in collections.sortedPosts %}
<li><a href="posts/{{ post.data.id }}/">{{ post.data.title }}</a></li>
{% endfor %}
</ol>

