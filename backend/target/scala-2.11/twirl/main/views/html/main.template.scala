
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
                  DATE: Thu Sep 29 14:32:06 CEST 2016
                  SOURCE: /home/jonas/code/TurnierManager/app/views/main.scala.html
                  HASH: 86425efaa91a49c48d542ed0d783077e66d62527
                  MATRIX: 530->1|655->31|683->33|821->145|835->151|931->226|1015->283|1030->289|1111->349|1195->406|1210->412|1282->463|1366->520|1381->526|1467->591|1570->666|1599->667|1638->678|1740->753|1769->754
                  LINES: 20->1|25->1|27->3|33->9|33->9|33->9|34->10|34->10|34->10|35->11|35->11|35->11|36->12|36->12|36->12|39->15|39->15|40->16|42->18|42->18
                  -- GENERATED --
              */
          