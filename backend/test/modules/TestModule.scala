package modules

import org.apache.pekko.actor._
import com.google.inject.AbstractModule
import play.api.libs.concurrent.PekkoGuiceSupport
import dao.Tables
import scheduler.Scheduler
import javax.inject.Singleton

class TestPrinterActor extends Actor {
  def receive: PartialFunction[Any, Unit] = {
    case _ => // Do nothing in tests
  }
}

class TestPublisherActor extends Actor {
  def receive: PartialFunction[Any, Unit] = {
    case _ => // Do nothing in tests
  }
}

object TestPublisherActor {
  def props: Props = Props[TestPublisherActor]()
}

class TestModule extends AbstractModule with PekkoGuiceSupport {
  override def configure(): Unit = {
    // Provide test versions of components that JobModule would have provided
    // but without requiring cluster configuration
    bind(classOf[Scheduler]).asEagerSingleton()
    bind(classOf[Tables]).asEagerSingleton()

    // Bind test actors that don't need cluster
    bindActor[TestPrinterActor]("printer_actor")
    bindActor[TestPublisherActor]("publisher_actor", _ => TestPublisherActor.props)
  }
}
