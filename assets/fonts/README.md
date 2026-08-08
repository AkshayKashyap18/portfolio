# Fonts for the OG image

Two static instances of **Bricolage Grotesque**, read at build time by
`app/opengraph-image.tsx`.

## Why these files exist

`ImageResponse` (Satori) cannot use `next/font`. It rasterises on the server with
no browser and no CSS font loading, so it needs the font as a buffer — which means
a real file on disk. Without a `fonts` option it falls back to a single-weight
Noto Sans, and the OG card stops looking like the site.

They must be **committed**, not left as local files. `readFileSync` runs at module
scope during static generation of `/opengraph-image`, so a checkout without them
does not degrade — it fails the build outright:

```
Error: ENOENT: no such file or directory, open '.../assets/fonts/BricolageGrotesque-ExtraBold.ttf'
> Build error occurred
[Error: Failed to collect page data for /opengraph-image]
```

Both weights are needed. Passing `fonts` replaces the default stack entirely, so
any weight not supplied is synthesised from the ones that are, and faux-bold on an
already-heavy display face smears.

## Licence

SIL Open Font License 1.1 — full text in `OFL.txt`, retrieved from the upstream
project. Copyright 2022 The Bricolage Grotesque Project Authors.

Redistribution inside this repository is permitted; the OFL requires the licence
to travel with the font files, which is what `OFL.txt` is for. Source:
<https://github.com/ateliertriay/bricolage>

The site itself loads the same family through `next/font/google` in
`app/layout.tsx` — these files are only for server-side image rendering.
