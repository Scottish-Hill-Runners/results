# SHR result site

This is the build project for the SHR results site. This site builder is distinct from the public result site itself. Here you will find the raw results data for hill races plus some information about the races themselves, together with some program code that converts the raw data into an optimised, static web site.

The entire public site is re-built every time any results are added or updated (i.e., committed to the master branch). Normally, a commit will trigger the re-build steps automatically, but a re-build can be manually performed using the command `npm run pre-build && npm run build`.

## Results

The results for each hill race event are stored in the `races` folder, and there is a sub-folder for each race. The name of the sub-folder is the race id. If you are entering the first results for a new race, just choose the next available race id, keeping to the same format (`RA-nnnn`).

The results for each year are in a file of the form `yyyy.csv`. The columns should be
`RunnerPosition,Surname,Firstname,Club,RunnerCategory,FinishTime` (case-sensitive).
Update: `Name` can be used instead of `Surname,Firstname`, and `FinishPosition` can be used instead of `RunnerPosition`.

If the race was run on a shortened course then you can place an asterisk (`*`) after the year to indicate this. For example, `2017*.csv`.
These years are excluded by default when viewing all the results for a race.

If the race is held twice in the same year, add a suffix to distinguish them; e.g. `2018-s.csv` (for summer) and `2018-w.csv` (for winter).

In addition, a blurb about the race is expected to be found in an `index.md` file. This must start with some required information about the race (`title`, `venue`, `distance`, `climb`), and other optional fields. The file uses CommonMark format (<https://spec.commonmark.org/0.30/>).

The races folder currently contains sample data, extracted from Chris Upson's web site. These results are incomplete, and inaccurate in places (in particular, club membership is always for the runner's latest club, rather than their club on the day of the race). These results need to be updated from the official SHR archives.

## Club information

Club information is yet to be added. It will likely take the form of a directory `clubs` containing a file for each active club (e.g. having a web site or other
contact details). Views will be provided to select results by club.

## Other files

`package.json`, `package-lock.json`, `svelte.config.js`, `tsconfig.js`, `vite.config.ts`, `src/app.html` and `src/error.html` are configuration files for the various build tools.

`pre-build/` contains scripts that translate results data into a form suitable for the rest of the build pipeline.

`routes/+page.svelte` is the landing page for the public site.

`src/lib` contains components used by the site builder.

The `static` folder contains any data that needs to be copied to the final site without further processing, such as image files and icons.
