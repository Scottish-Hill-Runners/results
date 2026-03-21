# Race Results Build Process

## Overview

The `build-race-results.js` script transforms raw race results from CSV files into compressed JSON format that the application uses.

## Directory Structure

Place your raw race data in a `races/` folder at the project root:

```text
project-root/
├── races/
│   ├── TwoBreweries/
│   │   ├── 2024.csv
│   │   ├── 2023.csv
│   │   └── 2022.csv
│   │   └── index.md
│   ├── Marathon/
│   │   ├── 2024.csv
│   │   └── 2023.csv
│   │   └── index.md
│   └── HalfMarathon/
│       └── 2023.csv
│   │   └── index.md
```

The pre-build step generates compressed JSON files.
Each race has a `.info`, and a `.results` file containing all the results for the race.
A set of files `R-0` to `R-99` contain individual results, grouped by a hash of the runner surname.
A `years.json` file gives statistics of the number of runners in each category for each year.
`races.json` contains an entry for each race, with race details and organiser contact information.

```text
├── public/
│   └── results/
│       ├── TwoBreweries-info.json.gz
│       ├── TwoBreweries-results.json.gz
│       ├── Marathon-info.json.gz
│       ├── Marathon-results.json.gz
│       └── HalfMarathon-info.json.gz
│       └── HalfMarathon-results.json.gz
│       └── R-1.json.gz
│       └── R-2.json.gz
│       └── years.json.gz
│       └── races.json.gz
└── ... other project files
```

## CSV Format

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

## Build Process

### Automatic (Recommended)

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

### Manual Run

You can also run the script manually:

```bash
tsx scripts/build-race-results.ts
```

## Output Format

The generated JSON files contain an array of race results:

```json
[
  {
    "id": "TwoBreweries-2024-1",
    "year": 2024,
    "position": 1,
    "name": "John Smith",
    "club": "City Athletic",
    "category": "Men",
    "time": "23:45"
  },
  ...
]
```

Results are sorted by:

1. Year (descending - most recent first)
2. Position (ascending - 1st place first)

## Benefits

- **Compression**: CSV → JSON.GZ typically achieves 70-80% compression
- **Automatic**: Runs automatically during build process
- **Flexible**: Add new races or years by adding CSV files
- **Type-safe**: Output matches the `DataRow` TypeScript interface

## Example Setup

```bash
# Create results directory structure
mkdir -p races/TwoBreweries
mkdir -p races/Marathon

# Add CSV files
# races/TwoBreweries/2024.csv
# races/TwoBreweries/2023.csv
# races/Marathon/2024.csv

# Build the project (automatically runs the script)
npm run build
```

The compressed JSON files will be available at:

- `/public/results/TwoBreweries*.json.gz`
- `/public/results/Marathon*.json.gz`
