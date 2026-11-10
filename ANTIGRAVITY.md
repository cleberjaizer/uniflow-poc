@AGENTS.md

# Antigravity Mode - UniFlow

Project instructions live in `AGENTS.md` (shared by all AI coding agents). Add Antigravity-specific notes below this line.

## Environment & Shell Guidelines

- **Operating System**: Windows (PowerShell shell).
- **Working Directory**: `d:\uniflow-poc`.
- **Node/NPM**: Run commands natively in Windows PowerShell; do not run `npm install` from a WSL/Linux shell to avoid platform-specific `node_modules` corruption.
- **Git Identity**: All commits in this repository must use local identity:
  `Cleber Jaizer <cleberjaizer@gmail.com>`.

## Antigravity Workflows & Slash Commands

- **/plan**: Recommend when designing new features (e.g. backend synchronization, export/import, barcode label printing) before writing code.
- **/browser**: Recommend for testing web app workflows, camera barcode scanner, and PWA installation locally.
- **/goal**: Recommend when running multi-step batch tasks or refactoring passes.
- **/compact**: Recommend to reduce context window usage in long sessions.

## Project Architectural Conventions

- **Angular 22 & Signals**: Use signals (`signal()`, `computed()`), modern signal inputs/outputs (`input()`, `output()`), and control flow (`@if`, `@for`, `@empty`). Avoid legacy RxJS `BehaviorSubject` in component state where signals fit naturally.
- **i18n Discipline**: Every visible string MUST be added to all three translation bundles in `public/assets/i18n/` (`pt-BR.json`, `en.json`, `es.json`). The default locale is `pt-BR`.
- **Barcode Invariants**: Plain text barcodes, compared case-insensitively, strictly unique across both materials and co-workers.
- **Static Hosting Friendly**: Maintain hash-based routing (`withHashLocation`) and relative asset paths for GitHub Pages compatibility.
