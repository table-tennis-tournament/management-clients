output "mysql_administrator_login" {
  value     = azurerm_mysql_flexible_server.db.administrator_login
  sensitive = true
}

output "mysql_administrator_password" {
  value     = azurerm_mysql_flexible_server.db.administrator_password
  sensitive = true
}
