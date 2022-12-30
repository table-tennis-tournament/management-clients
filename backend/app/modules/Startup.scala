package modules

import dao.Tables
import org.slf4j.LoggerFactory

import javax.inject.Inject
import play.api.Logger

import scala.concurrent.ExecutionContext

class Startup @Inject()(implicit ec: ExecutionContext, table: Tables){
  val log = LoggerFactory.getLogger("startupLogger")
  table.loadAllFromDB map { wasSuccessful =>
    log.debug("loading from db was: " + wasSuccessful)
  }
}
