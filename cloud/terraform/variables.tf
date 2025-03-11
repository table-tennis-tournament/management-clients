variable "subscription_id" {
  type        = string
  description = "Azure Subscription ID"
}

variable "tenant_id" {
  type        = string
  description = "Azure Tenant ID"
}

variable "client_id" {
  type        = string
  description = "Azure Client ID"
}

variable "client_secret" {
  type        = string
  sensitive   = true
  description = "Azure Client Secret"
}

variable "mysql_administrator_login" {
  type        = string
  description = "MySQL Server administrator login"
}

variable "mysql_administrator_password" {
  type        = string
  sensitive   = true
  description = "MySQL Server administrator password"
}
