# Race Results Build Process

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

* Each race has a `.json.gz` file containing the extracted contents of `index.md` and all the results for the race.
* A set of files `R-0` to `R-99` contain individual results, grouped by a hash of the runner surname.
* A `years.json` file gives statistics of the number of runners in each category for each year.
* `races.json` contains an entry for each race, with race details and organiser contact information.

```text
├── public/
│   └── results/
│       └── ArrocharAlps.json.gz
│       ├── BeinnResipol.json.gz
│       ├── TwoBreweries.json.gz
│       └── R-0.json.gz
│       └── R-1.json.gz
│       └── years.json.gz
│       └── races.json.gz
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

* The CSV filename (without `.csv` extension) is used as the **year** field
* Required: Include a header row
* Columns: `RunnerPosition`, `Surname`, `Firstname`, `RunnerCategory`, `FinishTime`

## Build process

### Automatic (recommended)

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
7. Outputs to `public/results/<race-name>.json.gz`

### Manual run

You can also run the script manually:

```bash
tsx scripts/build-race-results.ts
```
