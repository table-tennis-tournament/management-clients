package modules

import javax.inject.Inject
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import dao.Tables
import play.api.Logger

class Startup @Inject()(table: Tables){
  table.updateTTTables flatMap { a =>
    table.updateDoublesSeq flatMap { b =>
      table.updateMatches flatMap { c =>
        table.updateClubList flatMap { d =>
          table.updateMatchTypeList flatMap { e =>
            table.updateTypesList flatMap { f =>
              table.updateGroupsSeq flatMap { g =>
                table.updatePlayerList map { i =>
                  val x = a && b && c && d && e && f && g && i
                  Logger.debug(x.toString)
                }
              }
            }
          }
        }
      }
    }
  }
}
