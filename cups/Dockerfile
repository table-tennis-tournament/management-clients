FROM alpine:3.20

RUN apk add --no-cache cups cups-client cups-filters ghostscript

COPY cupsd.conf /etc/cups/cupsd.conf
COPY backend-topdf /usr/lib/cups/backend/topdf
RUN chmod +x /usr/lib/cups/backend/topdf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 631

VOLUME /var/spool/cups-pdf

ENTRYPOINT ["/entrypoint.sh"]
