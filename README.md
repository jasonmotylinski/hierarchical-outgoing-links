# Hierarchical Outgoing Links

## Overview
Displays outgoing links for the active file as a hierarchy based on the folder structure of the references.

## Motivation
In the age old folders vs tags debate I tend to lean heavier on physically structuring notes into high level categories. The tag hierarchy display provides a nice overview of tags and how they relate to each other and I wanted something similar that leveraged the folder structure to display outgoing links as a tree.

## Example
Here's a comparison of the core plugin vs the hierarchical outgoing links plugin in action.

This is how the out-of-the-box core outgoing links plugin displays links:
![image](docs/core.png)

This is how this plugin displays links:
 ![image](docs/plugin.png)

## Features
- Collapsable tree structure allows you to easily focus on what what is most important
- Clickable links to references
- List of unresolved links indicating any dangling references which you might want to create.

## Commands
The following commands are available in the Obsidian Command Palett:

| Command | Description |
|---------|-------------|
| Show hierarchical outgoing links | Displays the panel in the event it was closed |

## Development

### Setup
```bash
npm install
```

### Running
```bash
npm run dev
```
