# Blog Writing Rulebook

Working note. Use this before turning research into prose.

## Principle

Consume like a scientist. Create like an artist.

Research is allowed to be messy, wide, and paranoid. The post is not. The post should feel inevitable.

## The Job

Do not summarize the research.

Find the one pressure point that makes the research matter.

Good technical writing usually starts with a problem:

- Where does bandwidth fall off?
- Where does software accidentally cross a slow boundary?
- Who really builds an XPU if the logo company is only one layer?

The reader should know the question before they see the facts.

## The Shape

1. Start with the false mental model.
2. Replace it with a better one.
3. Use one concrete example as the microscope.
4. Walk layer by layer.
5. Repeat the same test at every layer: what is the bottleneck, who controls it, and what happens when it slips?
6. End with the simplest sentence that could only have come after the whole essay.

## Feynman-Karpathy Structure

Use this when a technical post needs to feel like a human story, not a cleaned-up lab report.

1. Cold open: one paragraph that states the paradigm shift or the core problem. No throat clearing.
2. Old way / pain: explain what the reader probably believes, and where that model breaks.
3. Core mechanism: use numbered sections. Each section should state the concept, explain the physical mechanism, then explain why it matters.
4. Reality check: say where the idea breaks, what trade-off it accepts, and what gets brittle.
5. Bold TL;DR: end with the physical truth of the post, not a fluffy conclusion.

Code, diagrams, or concrete pipelines should appear where prose would otherwise become vibes.

## Voice

Write like Feynman and Karpathy are sitting behind you asking:

- What is the actual object?
- What has to be true for it to work?
- Where can it fail silently?
- Can a good engineer draw the system after reading this?

Rules:

- Use confident humility: "I think", "my read", "the better model is", when the world is shifting.
- Ground abstractions in physical reality. If you say compiler, say kernel, HBM, queues, tensor units, host sync, or collectives.
- Show the friction. A post becomes a story when something breaks: a pipeline bubble, a bad collective, a package yield issue, a brittle kernel, a cooling constraint.
- Use parentheticals for human asides, but only when they add texture or precision.
- Vary rhythm. A long technical sentence can be followed by a short one. Like this.
- Use concrete nouns: HBM, interposer, NIC, substation, compiler, kernel, rack.
- Prefer short sentences when making a claim.
- Use longer sentences only when connecting ideas.
- Cut throat-clearing.
- Cut generic adjectives: massive, groundbreaking, innovative, seamless, robust, transformative.
- Do not say "it is important to note." Just say the important thing.
- Do not use "delve", "landscape", "unlock", "leverage", "game changer", or "at scale" unless the phrase is doing real work.
- If a paragraph could fit in any AI infrastructure post, delete it.

## Titles

A title is not decoration. It is the first abstraction.

Good titles:

- Name the actual object early.
- Create useful tension.
- Make sense without the subtitle.
- Avoid puns unless the pun is clearer than the plain version.
- Do not overpromise.

Working examples:

- How Bits Move in a Cluster
- How Code Runs in a Cluster
- Who Really Builds an XPU?
- You Don't Beat NVIDIA With a "Better" GPU

The title should make the reader ask the right next question.

## Structure For Web Readers

Readers scan before they read.

Use:

- meaningful headings,
- one idea per paragraph,
- small diagrams,
- numbers when they anchor a claim,
- links where credibility matters,
- a conclusion-first paragraph near the top.

The reader should be able to skim the headings and still recover the argument.

## Persuasion

Influence is not hype. Influence is reducing confusion.

Use the SUCCESs test from Made to Stick:

- Simple: what is the core?
- Unexpected: what assumption breaks?
- Concrete: what can the reader picture?
- Credible: what evidence proves this is not hand-waving?
- Emotional: why should a smart reader care?
- Story: what changes from beginning to end?

For technical posts, "emotional" usually means the reader feels the cost of being wrong: idle GPUs, missed tapeout, stranded racks, wasted capex, or code falling off the fast path.

## Visual Detail

Visuals should carry structure, not decoration.

Use diagrams when:

- a sequence matters,
- a boundary matters,
- a bottleneck moves,
- multiple companies own different layers.

Use brand color sparingly when the brand is part of the mental map. Example: NVIDIA green, AMD black, Google colors, AWS orange, TSMC red, ASML blue. The point is orientation, not fan art.

## Source Discipline

Separate research notes from publishable prose.

In the research note:

- keep raw links,
- keep numbers,
- keep caveats,
- keep competing claims.

In the post:

- cite only the claims that carry the argument,
- do not dump every source,
- distinguish vendor claims from observed constraints,
- avoid pretending precision where the public data is partial.

## Editing Pass

Read the draft once for each question:

1. What is the central question?
2. What is the surprising claim?
3. Where did the argument become a list?
4. Which sentence sounds like AI filler?
5. Which paragraph would an expert skip?
6. Which paragraph would a smart beginner not understand?
7. Can the final sentence survive alone?
8. Where is the blood on the keyboard?
9. Did the draft explain why the hard thing is physically hard?
10. Did it include the software path if the hardware only becomes useful through software?

## Sources Behind This Rulebook

- Paul Graham, "Writing, Briefly": https://paulgraham.com/writing44.html
- Nielsen Norman Group, "How Users Read on the Web": https://www.nngroup.com/articles/how-users-read-on-the-web/
- Nielsen Norman Group, "Microcontent": https://www.nngroup.com/articles/microcontent-how-to-write-headlines-page-titles-and-subject-lines/
- Heath Brothers, "Made to Stick: Introduction": https://heathbrothers.com/made-to-stick-introduction/
- Andrej Karpathy, "A Recipe for Training Neural Networks": https://karpathy.github.io/2019/04/25/recipe/
- First Round Review, Tim Urban on explaining complex ideas: https://review.firstround.com/wait-but-whys-tim-urban-on-parsing-and-transmitting-complex-ideas/
