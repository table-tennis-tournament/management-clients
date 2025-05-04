package services

import models.AllMatchInfo
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}

import java.io.{ByteArrayInputStream, File, FileOutputStream}
import javax.inject.{Inject, Singleton}
import javax.print.attribute.HashPrintRequestAttributeSet
import javax.print.attribute.standard.{Copies, MediaSizeName, OrientationRequested, PageRanges}
import javax.print.{DocFlavor, PrintService, PrintServiceLookup, SimpleDoc}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

@Singleton
class PrinterService @Inject()(
  pdfService: PDFService,
  config: Configuration,
  env: Environment
)(implicit ec: ExecutionContext) {
  
  private val log = LoggerFactory.getLogger(getClass)
  
  // Get printer configuration from application.conf
  private val printerName = config.getOptional[String]("printer.name").getOrElse("")
  private val printerHost = config.getOptional[String]("printer.host").getOrElse("")
  private val printerPort = config.getOptional[Int]("printer.port").getOrElse(631)
  private val savePDFPath = config.getOptional[String]("printer.save.path").getOrElse("./pdfs")
  private val savePDFEnabled = config.getOptional[Boolean]("printer.save.enabled").getOrElse(false)
  
  // Initialize print attributes
  private val printAttributes = {
    val attrs = new HashPrintRequestAttributeSet
    attrs.add(MediaSizeName.ISO_A6)
    attrs.add(OrientationRequested.LANDSCAPE)
    attrs.add(new PageRanges(1))
    attrs.add(new Copies(1))
    attrs
  }
  
  // Find printer by name
  private def findPrinter(name: String): Option[PrintService] = {
    val services = PrintServiceLookup.lookupPrintServices(null, null)
    services.find(_.getName == name)
  }
  
  // Get all available printers
  def getPrinterList: Seq[String] = {
    PrintServiceLookup.lookupPrintServices(null, null).map(_.getName).toSeq
  }
  
  // Set default printer
  def setPrinter(name: String): Boolean = {
    findPrinter(name).isDefined
  }
  
  // Print PDF to the configured printer
  def printPDF(allMatchInfo: AllMatchInfo): Future[Either[String, String]] = {
    Future {
      pdfService.generatePDF(allMatchInfo) match {
        case Right(pdfData) =>
          // Save PDF if configured to do so
          if (savePDFEnabled) {
            savePDFToFile(pdfData, s"match_${allMatchInfo.ttMatch.id}.pdf")
          }
          
          // Find printer
          findPrinter(printerName) match {
            case Some(printer) =>
              Try {
                val doc = new SimpleDoc(
                  new ByteArrayInputStream(pdfData),
                  DocFlavor.INPUT_STREAM.PDF,
                  null
                )
                val job = printer.createPrintJob()
                job.print(doc, printAttributes)
                "Print job submitted"
              } match {
                case Success(message) => Right(message)
                case Failure(ex) => 
                  log.error("Printing failed", ex)
                  Left(s"Printing failed: ${ex.getMessage}")
              }
              
            case None =>
              Left(s"Printer '$printerName' not found")
          }
          
        case Left(error) => 
          Left(s"Failed to generate PDF: $error")
      }
    }
  }
  
  // Helper method to save PDF to file
  private def savePDFToFile(pdfData: Array[Byte], filename: String): Unit = {
    Try {
      val directory = new File(savePDFPath)
      if (!directory.exists()) {
        directory.mkdirs()
      }
      
      val file = new File(directory, filename)
      val outputStream = new FileOutputStream(file)
      outputStream.write(pdfData)
      outputStream.close()
      
      log.info(s"PDF saved to ${file.getAbsolutePath}")
    }.recover {
      case ex => log.error(s"Failed to save PDF: ${ex.getMessage}", ex)
    }
  }
  
  // Network printer discovery
  def discoverNetworkPrinters(): Seq[String] = {
    // This is a simplified implementation that would need to be expanded
    // with actual network discovery logic for production use
    log.info("Searching for network printers...")
    getPrinterList.filter(_.contains("Brother") || _.contains("network"))
  }
}