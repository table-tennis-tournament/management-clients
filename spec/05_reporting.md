# Reporting and Document Printing

This document specifies the functionality for generating and printing tournament documents.

## Referee Sheets (Schiedsrichterzettel)
For each match, a referee sheet is generated for use at the table.
- **Content**: Discipline name, group or match type, round, table number, player names.
- **Scoring Area**: Tables for recording set-by-set results (1st to 5th set).
- **QR Code**: A QR code with the match id is printed on the sheet; the admin view's scanner reads it to open the match.
- **Format**: PDF, printed on A6 (Flying Saucer, ADR 0004).

## Winning Documents (Urkunden)
*Not provided by this system.* Certificates are printed with mktt. The intended behaviour:
Upon completion of a discipline, certificates are generated for the top-placed players.
- **Content**: Tournament name, date, discipline name, rank (1st, 2nd, 3rd), player names, and club.
- **Printing**: Often printed in German ("Urkunde") on pre-designed certificate templates.
- **Triggers**: Can be printed individually or in batches after a discipline is finished.

## Discipline Reports
*Not provided by this system* (see mktt). Summary documents listing the final rankings and results for a discipline.
- **Rankings**: 1st, 2nd, and 3rd place finishers.
- **Full Results**: A complete list of all matches and scores for the discipline.

## Printing Workflow
- **Printer Configuration**: Administrators can select from a list of available system printers.
- **Print on Assign**: Option (on by default) to automatically print the referee sheet when a match is assigned to a table.
- **Manual Print**: Any referee sheet can be printed again.
- Printing goes through `lpr` to the CUPS server of the Docker Compose stack. The selected printer and the print-on-assign option are kept in memory and reset when the backend restarts.

## API Endpoints

All paths are relative to the backend's `/api/v2` prefix (for example `GET /api/v2/players/all`). Commands answer
`{"success": true}`, or a 400 with `{"success": false, "message": ...}` when they are rejected. The OpenAPI description
is served by the backend itself (port 8080, not through nginx) at `/v3/api-docs`, with a Swagger UI at `/api-docs-ui`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/printer/all` | The printers the server knows. |
| `POST` | `/printer/set/{name}` | Select a printer; 400 if it is unknown. |
| `DELETE` | `/printer/set` | Go back to the default printer (`DEFAULT_PRINTER`, default `PDF`). |
| `POST` | `/printer/setprintonstart/{true\|false}` | Print referee sheets when a match is assigned. |
| `POST` | `/printer/print/{matchId}` | Print the referee sheet of a match. |
| `POST` | `/printer/printAll` | Print several referee sheets. Body: `[matchId, ...]`. |
| `GET` | `/printer/printpdf/{matchId}` | The referee sheet as PDF; 404 for an unknown match. |
| `GET` | `/printer/getQrCode/{content}` | A QR code PNG of `{content}`. |
| `GET` | `/settings/all` | The runtime settings: `printerName`, `alwaysPrint` (print on assign), `autoStart`. |
