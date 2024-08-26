# Welcome to the new SHR results site

## A bit of history and context

SHR has been collecting race results for many years, but their web site has never been particularly easy to browse. Its deficiencies led Chris Upson to develop a more integrated result site, Scottish Hill Racing, back in 2005. This became everyone’s go-to result site until it eventually fell into disrepair in 2019.

Feeling the loss of Chris’ site, a new, comprehensive results archive is currently being developed by SHR. This new site is designed around a principle of open access – anyone (and that includes _you_) can upload or correct results, amend race descriptions, add new races, and even contribute to the site’s functionality. All the results are reliably, permanently stored in a publicly accessible repository - <https://github.com/Scottish-Hill-Runners/results>.

The repository currently contains most results since 2005, and we hope it will eventually expand to include all known earlier results as well.

The repository keeps a record of who uploaded or changed any result, along with when the change was made and a brief note; for example, historic results are expected to describe where they were obtained from, and corrections should explain why the correction was made and who authorised it.

Anyone can upload results or corrections. You first need to [create an account on GitHub](https://github.com/signup), and authenticate your email address. GitHub is completely free; it makes money from commercial businesses, but does not charge small organisations or charities.

Changes are initially entered as proposals (also termed “pull requests”), which become incorporated in the live site after approval by members of the SHR committee or other repository managers.

In addition to the result files, the repository contains code to transform the results into a “static” web site - currently hosted at <https://shr.surge.sh>. The web site allows results to be organised for display in multiple ways. For example, all the results for a race can be displayed in a single table, along with statistics such as how many runners in each category ran each year. Over time, we expect to include more classifications and statistics, such as viewing results by club, year, or series (such as the SHR championships, long classics, and bog’n’burn).

You will see “Edit on GitHub” buttons on many pages. Clicking on the button will take you to an appropriate repository page where you can edit the data and submit a change proposal.

## Race organisers

Results for each race are stored in a folder containing the results for each year together with a file containing information about the race. As an organiser, you should feel free to update this race information and add new results as they come available.

Race information is stored in an `index.md` file. This file must start with some required information about the race (`title`, `venue`, `distance`, `climb`), and other optional fields (such as the race records). The file uses [CommonMark format](<https://spec.commonmark.org/0.30/>).

Results need to be in a plain CSV format (if you use a spreadsheet, save the file with a `.csv` extension), and include columns `RunnerPosition,Surname,Firstname,Club,RunnerCategory,FinishTime` (these are all case-sensitive). If you don't have separate first and last names, then you can use a single `Name` column instead.

Name the file using the year, e.g. `2024.csv`. If the race is held twice in the same year, add a suffix to distinguish them; e.g. `2018-s.csv` (for summer) and `2018-w.csv` (for winter). If the race was run on a shortened course then you can place an asterisk (`*`) after the year to indicate this. For example, `2017*.csv`. These years are (by default) excluded when viewing all the results for a race.

Remember that the web site will display all the results for a race in a single table, so if you have a junior race then a separate race folder should be used (e.g. `BenLomondJunior`).

## Runners

Did the race organiser mis-spell your name or club, or put you down in the wrong category? Feel free to correct these mistakes yourself by submitting a pull request directly on the repository site. The “Edit on GitHub” button will take you to the appropriate place to get started.

If you think the organiser got your time wrong then you should contact them and discuss the matter - a change approval will need more than your word for it in cases that affect the race outcome.

## Club historians

Results from races prior to 2005 are generally fairly patchy, incomplete, often use runner's initials rather than full names, etc. They may even be (scans of) printed results rather than in a spreadsheet format. All this makes the work of entering historic results quite labour intensive. Attempting to generate perfect data is exhausting, and so the recommended approach is to get an initial cut of the data entered and then encourage corrections by the running community. Runners are quite capable of correcting a result they come across while browsing.

## Software developers

Do Svelte, typescript and tailwind mean anything to you? Feel free to get in touch, as there are plenty of features wanting development work.
