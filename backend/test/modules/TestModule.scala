package modules

import org.apache.pekko.actor._
import com.google.inject.AbstractModule
import play.api.libs.concurrent.PekkoGuiceSupport
import dao.Tables
import scheduler.Scheduler

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
    // Override just the actor bindings with test versions that don't need cluster
    bindActor[TestPublisherActor]("publisher_actor", _ => TestPublisherActor.props)
  }
}
