resource "azurerm_resource_group" "rg" {
  name     = "turniermanager-rg"
  location = "North Europe"
}

resource "azurerm_service_plan" "app_plan" {
  name                = "turniermanager-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"  # Change to "P1v2" for production
}

resource "azurerm_linux_web_app" "backend" {
  name                = "turniermanager-backend"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.app_plan.id

  site_config {
    always_on = true
    application_stack {
      docker_image_name = "holzleube/turniermanager:5.5"
      docker_registry_url = "https://index.docker.io"
    }
  }

  app_settings = {
    "MYSQL_JDBC" = "jdbc:mysql://${azurerm_mysql_flexible_server.db.fqdn}:3306/tournamentManager"
    "MYSQL_USER" = "${azurerm_mysql_flexible_server.db.administrator_login}"
    "MYSQL_PW"   = "${azurerm_mysql_flexible_server.db.administrator_password}"
  }
}

resource "azurerm_linux_web_app" "frontend" {
  name                = "turniermanager-admin"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.app_plan.id

  site_config {
    always_on = true
    application_stack {
      docker_image_name = "holzleube/ttt-clients:5.3.0-sunday"
      docker_registry_url = "https://index.docker.io"
    }
  }
}

resource "azurerm_mysql_flexible_server" "db" {
  name                   = "turniermanager-mysql"
  location              = azurerm_resource_group.rg.location
  resource_group_name   = azurerm_resource_group.rg.name
  sku_name              = "B_Standard_B1ms"
  version               = "8.0.21"
  
  administrator_login    = var.mysql_administrator_login
  administrator_password = var.mysql_administrator_password

  storage {
    size_gb = 20
  }
}

resource "azurerm_mysql_flexible_server_firewall_rule" "allow_azure_services" {
  name                = "allow-azure-services"
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_mysql_flexible_server.db.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

resource "azurerm_mysql_flexible_database" "database" {
  name                = "tournamentManager"
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_mysql_flexible_server.db.name
  charset             = "utf8mb4"
  collation           = "utf8mb4_unicode_ci"
}
