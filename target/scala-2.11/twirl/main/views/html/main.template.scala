
package views.html

import play.twirl.api._
import play.twirl.api.TemplateMagic._


     object main_Scope0 {
import models._
import controllers._
import play.api.i18n._
import views.html._
import play.api.templates.PlayMagic._
import play.api.mvc._
import play.api.data._

class main extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template2[String,Html,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(title: String)(content: Html):play.twirl.api.HtmlFormat.Appendable = {
    _display_ {
      {


Seq[Any](format.raw/*1.32*/("""

"""),format.raw/*3.1*/("""<!DOCTYPE html>

<html lang="en">
    <head>
        <title>Angular 2 QuickStart</title>

        <script src=""""),_display_(/*9.23*/routes/*9.29*/.Assets.versioned("javascripts/angular2/bundles/angular2-polyfills.min.js")),format.raw/*9.104*/("""" type="text/javascript"></script>
        <script src=""""),_display_(/*10.23*/routes/*10.29*/.Assets.versioned("javascripts/systemjs/dist/system.src.js")),format.raw/*10.89*/("""" type="text/javascript"></script>
        <script src=""""),_display_(/*11.23*/routes/*11.29*/.Assets.versioned("javascripts/rxjs/bundles/Rx.js")),format.raw/*11.80*/("""" type="text/javascript"></script>
        <script src=""""),_display_(/*12.23*/routes/*12.29*/.Assets.versioned("javascripts/angular2/bundles/angular2.min.js")),format.raw/*12.94*/("""" type="text/javascript"></script>

        <script>
        System.config("""),format.raw/*15.23*/("""{"""),format.raw/*15.24*/("""
          """),format.raw/*16.11*/("""baseURL: 'assets/javascripts',
          defaultJSExtensions: true
        """),format.raw/*18.9*/("""}"""),format.raw/*18.10*/(""");
          System.import('boot')
                .then(null, console.error.bind(console));
        </script>


    </head>
    <body>
        <my-app>Loading...</my-app>
    </body>
</html>
"""))
      }
    }
  }

  def render(title:String,content:Html): play.twirl.api.HtmlFormat.Appendable = apply(title)(content)

  def f:((String) => (Html) => play.twirl.api.HtmlFormat.Appendable) = (title) => (content) => apply(title)(content)

  def ref: this.type = this

}


}

/**/
object main extends main_Scope0.main
              /*
                  -- GENERATED --
                  DATE: Mon Sep 26 11:25:51 CEST 2016
                  SOURCE: C:/Develop/Source/angular2/app/views/main.scala.html
                  HASH: 336c1989eb04ccb4b720a4438beeed8d2af9c9b1
                  MATRIX: 530->1|655->31|685->35|829->153|843->159|939->234|1024->292|1039->298|1120->358|1205->416|1220->422|1292->473|1377->531|1392->537|1478->602|1584->680|1613->681|1653->693|1757->770|1786->771
                  LINES: 20->1|25->1|27->3|33->9|33->9|33->9|34->10|34->10|34->10|35->11|35->11|35->11|36->12|36->12|36->12|39->15|39->15|40->16|42->18|42->18
                  -- GENERATED --
              */
          