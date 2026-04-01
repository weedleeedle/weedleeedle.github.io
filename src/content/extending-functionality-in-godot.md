---
id: extending-functionality-in-godot
aliases: []
tags:
  - post
  - godot
title: Extending Functionality in Godot
index: 3
published: false
---

Let's imagine we have a game we're working on where we want to modify and extend some functionality on an existing node or node type. For example, let's imagine we want to add sound effects to all of our UI buttons.

In this article we'll talk a little bit about some different approaches we might take and discuss the broader state of architecture design in Godot.

### Creating a new SFXButton Scene

Creating a new scene that can be instantiated is a natural first approach for any Godot developer.

We set up a new scene with a `Button` as our root node that probably looks something like this:

<img src="/res/godot-sfx-button-scene.png" alt="An image of Godot's scene tree editor with a button named 'SFXButton' as the root node and an AudioStreamPlayer child">

Then we connect our `pressed()` signal from the Button to its own script, letting us do this:

```gdscript
# sfxbutton.gd
extends Button

@onready var player: AudioStreamPlayer = $AudioStreamPlayer

func _on_pressed() -> void:
    # Play the AudioStreamPlayer's sound when the butotn is pressed.
    player.play()
```

Pretty simple stuff. However, getting this new button type into our existing code isn't. There's a huge, immediate downside to this approach to adding sound effects to existing buttons. Every button in our project has to be replaced with this new SFXButton scene. A daunting proposition.

The nice thing is that this up-front cost is only paid once. If we decide to change SFXButton later—for example, replacing the sound effect with a different one—we just have to change the SFXButton scene and all instances of that scene will change.

Of course, if we add further customization, we risk paying a second refactor cost. This is exacerbated by what is, in my opinion, a bit of a finicky process for instance-local data with scenes. Effectively, if we add, say, the ability to customize sound effects:

```gdscript
# sfxbutton.gd
extends Button

# Default to default_sfx.wav unless we set it manually per instance.
@export var sound_effect: AudioStream = preload("default_sfx.wav")

@onready var player: AudioStreamPlayer = $AudioStreamPlayer

func _ready() -> void:
	player.stream = sound_effect

func _on_pressed() -> void:
    # Play the AudioStreamPlayer's sound when the butotn is pressed.
    player.play()
```

This *looks* like it all just works, but sometimes Godot seems to forget when you have a custom value in an exported property and overwrite it with the default. This seems to happen most often when the source scene is modified. This isn't really an inherent limitation, but it is just something weird that happens sometimes that you should be aware of.
