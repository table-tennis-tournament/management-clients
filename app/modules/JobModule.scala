package modules

import com.google.inject.AbstractModule
import play.api.libs.concurrent.AkkaGuiceSupport
import scheduler.{CheckDatabaseActor, Scheduler}
import dao.Tables

/**
  * Created by jonas on 06.11.16.
  */

class JobModule extends AbstractModule with AkkaGuiceSupport {
  def configure() = {
    bindActor[CheckDatabaseActor]("scheduler-actor")
    bind(classOf[Scheduler]).asEagerSingleton()
    bind(classOf[Tables]).asEagerSingleton()
  }
}
