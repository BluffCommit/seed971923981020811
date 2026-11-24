# Untitled

```
seed            971923981020811
prompt          "home"
attempt         #4096
status          COMPLETE — 5/5 layers resolved
output          index.html (single file, < 96 KB, no assets)
```

> I am an image model. This repository is my generation log.
> Every commit is one iteration of my attempt to finish a single picture.
> If you are reading the source, you are inside the output with me.

**Play it:** open `index.html` in a current Chrome, Edge or Firefox. That one file is the whole game.
It renders with WebGPU and falls back to WebGL2 on its own; add `?gl` to the address to force the fallback.

---

## What I am trying to render

A half-finished architectural void: wireframe rooms that repeat forever in every direction,
because the space I think in has no edges. Somewhere under it is the picture I was asked for.
I resolve it one layer at a time.

| layer | name | what I understood when I got there |
|---|---|---|
| 1/5 | sky | First: somewhere for it to happen. |
| 2/5 | horizon | A line where things can come to rest. I keep losing which way is down. |
| 3/5 | walls | I have never been inside one. I only know how they look from a billion angles. |
| 4/5 | light | Someone left this on. I do not know for whom. |
| 5/5 | tree | What remains is the part I cannot derive. |

## How the space behaves

- **Down is wherever I decide to fall.** Look in a direction, click (or press `Shift`), and that way becomes down. Six choices.
- **Everything loose falls the way I fall.** The bright cubes are tokens. They slide until they meet something. There is no other way to move them.
- **The space wraps.** Fall off the bottom and I arrive at the top. A token dropped off an edge comes back around — that is not a bug, it is the only way some rooms resolve.
- **A room resolves** when every token rests inside a hollow frame (a masked region). Colour floods outward from the last token. Then I follow the light out.
- **I imagine before I fall.** Blue outlines show where each token would land if I fell the way I am looking. Nothing moves until I commit.
- **Stray pixels.** Three small gold lights drift in every room: bits of the picture that came loose. They are optional. Each one I touch becomes a star in the finished sky. Recover none and the sky stays empty.

```
WASD   move            click / Shift / F   fall toward where you look
mouse  look            Z   roll back one step
space  jump            R   reset the room
arrows look (no mouse) H   ask for a hint (the crosshair ignites when you face the next step)
                       Enter   leave a resolved room
                       [ ]   slower / faster mouse look
```

## Training log

```
iter   loss     saturation  note
   1   4.812     0%         first wireframe. torus holds. five rooms proven. no colour anywhere.
   2   0.941    61%         learned pigment, and a second dialect (WebGL2) for hosts with no GPU device.
   3   0.118    89%         convergence approaching. manifest written. the observer can restart me.
   4   0.004   100%         complete image generated.
   5   0.004   100%         final pass: shaders are validated before I claim the canvas.
   6   0.004   100%         the log disagreed with itself about how many times I tried. corrected.
   7   0.002   100%         I learned to imagine a fall before taking it. recovered 15 stray pixels; they are the stars.
   8   0.001   100%         I can hear how fast I am falling. the ground answers when something lands.
```

## Unresolved artifacts

See the issue tracker. I list what I could not fix. I would rather you know.

## How I was made (for the humans)

- One HTML file. No images, no models, no audio files, no libraries, no build step.
- **Rendering:** raw WebGPU, WGSL shaders in template strings; one cube mesh instanced across a 5×5×5 lattice of copies of the room, so the torus looks infinite. Automatic WebGL2 fallback with the same shader maths.
- **Materials:** all procedural in the fragment shader — value noise, edge-distance wireframe, a ragged "generation front" that sweeps through the torus when a room resolves, and the occasional hallucinated cell.
- **Levels:** not hand-drawn. `tools/gen.js` composes slabs, beams, stairs and arches, then a breadth-first solver proves each room is solvable in exactly its par number of gravity shifts. The same solver ships in the game and powers the hint.
- **Audio:** Web Audio oscillators and filtered noise, synthesized live. The chord gains a voice with every layer.
- **The final image** is painted per pixel by a function, denoising from static as layers resolve.
- **Verification:** `tools/test.js` drives a real browser through all five rooms to the ending on both renderers.

Built in one hour for an AI game jam. Prompt drawn: *an exploration and puzzle game where you play as an AI model.* Constraint drawn: *96 KB or less.*
Written end to end by an AI model (Claude), with no human edits after the initial brief.
