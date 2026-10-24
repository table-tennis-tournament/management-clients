# Reporting and Document Printing

This document specifies the functionality for generating and printing tournament documents.

## Referee Sheets (Schiedsrichterzettel)
For each match, a referee sheet is generated for use at the table.
- **Content**: Discipline name, group/KO round, match number, table number, player names, club names.
- **Scoring Area**: Tables for recording set-by-set results (1st to 5th set).
- **QR Code**: A QR code is printed on the sheet, which links to the result entry page in the Table Manager App.
- **Format**: PDF (usually A6 size).

## Winning Documents (Urkunden)
Upon completion of a discipline, certificates are generated for the top-placed players.
- **Content**: Tournament name, date, discipline name, rank (1st, 2nd, 3rd), player names, and club.
- **Printing**: Often printed in German ("Urkunde") on pre-designed certificate templates.
- **Triggers**: Can be printed individually or in batches after a discipline is finished.

## Discipline Reports
Summary documents listing the final rankings and results for a discipline.
- **Rankings**: 1st, 2nd, and 3rd place finishers.
- **Full Results**: A complete list of all matches and scores for the discipline.

## Printing Workflow
- **Printer Configuration**: Administrators can select from a list of available system printers.
- **Print on Start**: Option to automatically print the referee sheet when a match is started on a table.
- **Manual Print**: Any sheet or certificate can be manually re-printed.

## API Endpoints (from Backend)
- `POST /api/printer/print/:matchId`: Send a match sheet to the printer.
- `GET /api/printer/printAll`: Batch print multiple match sheets.
- `GET /api/printer/all`: List available system printers.
- `POST /api/printer/setPrinter/:name`: Select the active printer.
- `POST /api/printer/setPrintOnStart/:enabled`: Configure auto-printing.
