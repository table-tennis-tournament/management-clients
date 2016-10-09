
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
        <title>TurnierManager</title>

        <script src=""""),_display_(/*9.23*/routes/*9.29*/.Assets.versioned("javascripts/angular2/bundles/angular2-polyfills.min.js")),format.raw/*9.104*/("""" type="text/javascript"></script>
        <script src=""""),_display_(/*10.23*/routes/*10.29*/.Assets.versioned("javascripts/systemjs/dist/system.src.js")),format.raw/*10.89*/("""" type="text/javascript"></script>
        <script src=""""),_display_(/*11.23*/routes/*11.29*/.Assets.versioned("javascripts/rxjs/bundles/Rx.js")),format.raw/*11.80*/("""" type="text/javascript"></script>
        <script src=""""),_display_(/*12.23*/routes/*12.29*/.Assets.versioned("javascripts/angular2/bundles/angular2.min.js")),format.raw/*12.94*/("""" type="text/javascript"></script>
        <script src=""""),_display_(/*13.23*/routes/*13.29*/.Assets.versioned("javascripts/bootstrap/dist/js/bootstrap.min.js")),format.raw/*13.96*/("""" type="text/javascript"></script>
        <link rel="stylesheet" type="text/css" href=""""),_display_(/*14.55*/routes/*14.61*/.Assets.versioned("javascripts/bootstrap/dist/css/bootstrap.min.css")),format.raw/*14.130*/("""">
        <link rel="stylesheet" type="text/css" href=""""),_display_(/*15.55*/routes/*15.61*/.Assets.versioned("stylesheets/main.css")),format.raw/*15.102*/("""">


        <script>
        System.config("""),format.raw/*19.23*/("""{"""),format.raw/*19.24*/("""
          """),format.raw/*20.11*/("""baseURL: 'assets/javascripts',
          defaultJSExtensions: true
        """),format.raw/*22.9*/("""}"""),format.raw/*22.10*/(""");
          System.import('boot')
                .then(null, console.error.bind(console));
        </script>


    </head>
    <body>
    <header class="navbar navbar-inverse navbar-fixed-top basics-nav" data-ng-cloak>
        <div class="navbar-more-overlay"></div>
		<nav class="navbar navbar-inverse navbar-fixed-top">
			<div class="container">
				<div class="navbar-header">
				    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
	                        <span class="icon-bar"></span>
	                        <span class="icon-bar"></span>
	                        <span class="icon-bar"></span>
	                </button>
	                <p class="navbar-brand">TurnierManager</p>
				</div>
	            <div class="collapse navbar-collapse">
				<ul class="nav navbar-nav navbar-right mobile-bar">
						<li>
						<a href="#/matches" data-toggle="collapse" data-target=".navbar-collapse.in">
						    Spiele
						</a>
					</li>
				</ul>
				</div>
			</div>
		</nav>
	</header>
	<div class="container" data-ng-cloak>
		<h1>Hello worlds</h1>
    	<my-app>Loading...</my-app>
	</div>
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
                  DATE: Wed Oct 05 23:56:54 CEST 2016
                  SOURCE: /home/jonas/code/TurnierManager/app/views/main.scala.html
                  HASH: 5585462dac5a778230337cf267000f55c71b0e7c
                  MATRIX: 530->1|655->31|683->33|815->139|829->145|925->220|1009->277|1024->283|1105->343|1189->400|1204->406|1276->457|1360->514|1375->520|1461->585|1545->642|1560->648|1648->715|1764->804|1779->810|1870->879|1954->936|1969->942|2032->983|2104->1027|2133->1028|2172->1039|2274->1114|2303->1115
                  LINES: 20->1|25->1|27->3|33->9|33->9|33->9|34->10|34->10|34->10|35->11|35->11|35->11|36->12|36->12|36->12|37->13|37->13|37->13|38->14|38->14|38->14|39->15|39->15|39->15|43->19|43->19|44->20|46->22|46->22
                  -- GENERATED --
              */
          