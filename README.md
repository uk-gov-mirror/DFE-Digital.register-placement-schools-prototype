# Register of placement schools prototype

The ‘Register of placement schools’ is a proof of concept for DfE and, more specifically, the Schools Group to provide a canonical list of placement schools held in the ‘Register trainee teachers’ service.

This prototype is based on the:

- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/docs/)

You can read more about this register on the [design history website](https://becoming-a-teacher.design-history.education.gov.uk/register-of-placement-schools/).

## Requirements

- Node.js - version 22.x.x

## Installation

- Clone this repository to a folder on your computer
- Open Terminal
- In Terminal, change the path to the repository
- Type `npm install` to install the dependencies

## Working locally

- In Terminal, change the path to the repository
- Type `npm run dev`  and start the application

## Generating data

TBC

## Environment variables

The prototype uses environment variables to help configure the application. These include:

| Variable | Type | Description |
| --- | --- | --- |
| `ORDNANCE_SURVEY_API_KEY` | string | The API key needed to access the Ordnance Survey Places API |
| `ORDNANCE_SURVEY_API_SECRET` | string | The API secret needed to access the Ordnance Survey Places API |
| `GOOGLE_MAPS_API_KEY` | string | The API key needed to access the Google Maps API |
| `SESSION_SECRET` | string | A random secret used in user authentication |
| `USE_SIGN_IN_FORM` | string | Use to turn on/off username and password login. If set to `false`, the login screen displays a list of test personas. Values: `true` or `false` |

## Tools

If you’re using [Visual Studio (VS) Code](https://code.visualstudio.com/) for prototyping, we recommend you install the following extensions:

- [GOV.UK Design System snippets](https://marketplace.visualstudio.com/items?itemName=simonwhatley.govuk-design-system-snippets)
- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [Nunjucks for VS Code](https://marketplace.visualstudio.com/items?itemName=ronnidc.nunjucks)
- [Nunjucks snippets](https://marketplace.visualstudio.com/items?itemName=luwenjiechn.nunjucks-vscode-snippets)

We also recommend you update your VS Code settings to make sure you’re trimming whitespace: `Files: Trim Trailing Whitespace`.
