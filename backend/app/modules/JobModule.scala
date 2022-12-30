package modules

import actors.{PrinterActor, Publisher}
import scheduler.Scheduler
import dao.Tables
import com.google.inject.AbstractModule
import play.api.libs.concurrent.AkkaGuiceSupport

/**
  * Created by jonas on 06.11.16.
  */

class JobModule extends AbstractModule with AkkaGuiceSupport {
  override def configure(): Unit = {
    bind(classOf[Scheduler]).asEagerSingleton()
    bind(classOf[Tables]).asEagerSingleton()
    bind(classOf[Startup]).asEagerSingleton()
    bindActor[PrinterActor]("printer_actor")
    bindActor[Publisher]("publisher_actor", _=>Publisher.props)
  }
}
