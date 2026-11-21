#!/bin/sh
set -e

mkdir -p /var/spool/cups-pdf
chown lp:lp /var/spool/cups-pdf

# Start CUPS in the foreground
/usr/sbin/cupsd -f &

# Wait for the scheduler to be ready
for i in $(seq 1 30); do
  if lpstat -r 2>/dev/null | grep -q 'scheduler is running'; then
    break
  fi
  sleep 1
done

# Default "print to file" printer (writes PDFs into the shared volume)
lpadmin -p PDF -E -v topdf:/ -m raw 2>/dev/null || true

# Optional real network printer
if [ -n "${CUPS_PRINTER_URI}" ] && [ -n "${CUPS_PRINTER_NAME}" ]; then
  lpadmin -p "${CUPS_PRINTER_NAME}" -E -v "${CUPS_PRINTER_URI}" -m everywhere 2>/dev/null || true
  lpadmin -d "${CUPS_PRINTER_NAME}" || true
else
  lpadmin -d PDF || true
fi

# Keep the container alive
wait
