package modules

import dao.Tables
import javax.inject.Inject
import play.api.Logger

import scala.concurrent.ExecutionContext

class Startup @Inject()(implicit ec: ExecutionContext, table: Tables){
  table.loadAllFromDB map { wasSuccessful =>
    Logger.debug("loading from db was: " + wasSuccessful)
  }
}
