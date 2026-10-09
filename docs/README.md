# Documentation

This directory contains the architecture documentation for the Table Tennis Tournament Management System.

## arc42

The `arc42` folder contains comprehensive architecture documentation following the arc42 template. 

### What is arc42?

arc42 is a template for architecture communication and documentation. It provides a structured approach to document software and system architectures in a consistent and comprehensive way.

**Key benefits:**
- Standardized structure for architecture documentation
- Supports both technical and non-technical stakeholders
- Covers all important aspects of software architecture
- Language and tool agnostic
- Widely adopted in the software industry

**Structure:**
The arc42 template consists of 12 sections that cover:
1. Introduction and Goals
2. Architecture Constraints
3. System Scope and Context
4. Solution Strategy
5. Building Block View
6. Runtime View
7. Deployment View
8. Cross-cutting Concepts
9. Design Decisions
10. Quality Requirements
11. Risks and Technical Debts
12. Glossary

### Contents

- `architecture.adoc` - Master document; includes the chapters below.
- `chapters/` - One AsciiDoc file per arc42 chapter.
- `diagrams/` - C4-PlantUML sources for the context, container, component and dynamic diagrams.
- `C4/` - Vendored C4-PlantUML library (used at build time).

The canonical domain glossary lives at the repository root in `GLOSSARY.md` and is included into chapter 12.

### Viewing the Documentation

The documentation is written in AsciiDoc format (.adoc files). You can:
- View directly in most code editors with AsciiDoc plugins
- Convert to HTML/PDF using AsciiDoc tools
- View on platforms that support AsciiDoc rendering (like GitHub)

For more information about arc42, visit: https://arc42.org/