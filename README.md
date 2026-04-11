# Race results build process

## External content repository workflow

This project can build from content stored in another repository.

- `CONTENT_ROOT` controls where content folders are read from.
- Supported content folders are `clubs`, `info`, `long-distance`, `news`, `championships`, and `races`.

Example workflow using a separate repository:

```sh
CONTENT_REPO=Scottish-Hill-Runners/contents
CONTENT_REF=main
npm run content:sync
npm run content:build
```

Validation against synced content:

```sh
npm run validate:results:content
```

## Overview

The `build-race-results.js` script transforms raw race results from CSV files into compressed JSON format that the application uses.

## Directory structure

Place your raw race data in a `races/` folder at the project root:

```text
project-root/
├── races/
│   ├── ArrocharAlps/
│   │   └── 2023.csv
│   │   └── index.md
│   ├── BeinnResipol/
│   │   └── 2023.csv
│   │   ├── 2024.csv
│   │   └── index.md
│   ├── TwoBreweries/
│   │   └── 2022.csv
│   │   ├── 2023.csv
│   │   ├── 2024.csv
│   │   └── index.md
```

The pre-build step generates compressed JSON files.

- Each race has a `.json` file containing the extracted contents of `index.md` and all the results for the race.
- A set of files `R-0` to `R-99` contain individual results, grouped by a hash of the runner surname.
- A `years.json` file gives statistics of the number of runners in each category for each year.
- `races.json` contains an entry for each race, with race details and organiser contact information.
- `championships.json` contains an entry for each championship series.

```text
├── public/
│   └── results/
│       └── ArrocharAlps.json.gz
│       ├── BeinnResipol.json.gz
│       ├── TwoBreweries.json.gz
│       ├── ....json.gz
│       └── R-0.json.gz
│       └── R-1.json.gz
│       └── R-....json.gz
│       └── years.json.gz
│       └── races.json.gz
│       └── championships.json.gz
└── ... other project files
```

## CSV format

Each CSV file should contain race results with the following columns:

```csv
RunnerPosition,Surname,Firstname,Club,RunnerCategory,FinishTime
1,John,Smith,City Athletic,M,23:45
2,Mary,Johnson,Town Runners,F40,26:12
...
```

**Important:**

- The CSV filename (without `.csv` extension) is used as the **year** field
- Required: Include a header row
- Columns: `RunnerPosition`, `Surname`, `Firstname`, `RunnerCategory`, `FinishTime`

## Build process

The script runs automatically before each build:

```bash
npm run build
```

This executes the `prebuild` script which:

1. Reads all race folders in `results/`
2. For each race folder, processes all `.csv` files
3. Extracts the year from each filename
4. Parses the CSV data
5. Creates a JSON object with year field added
6. Compresses to `.json.gz` format
7. Outputs to `public/results/...`
