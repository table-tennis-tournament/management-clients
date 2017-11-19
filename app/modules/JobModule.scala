package modules

import com.google.inject.AbstractModule
import play.api.libs.concurrent.AkkaGuiceSupport
import scheduler.Scheduler
import dao.Tables

/**
  * Created by jonas on 06.11.16.
  */

class JobModule extends AbstractModule with AkkaGuiceSupport {
  def configure() = {
    bind(classOf[Scheduler]).asEagerSingleton()
    bind(classOf[Tables]).asEagerSingleton()
    bind(classOf[Startup]).asEagerSingleton()
  }
}
