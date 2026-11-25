/** The status body the backend answers to commands, e.g. `{"success": true}` or `{"success": false, "message": "..."}`. */
export interface StatusDto {
  success?: boolean;
  message?: string;
}
