package services

import models.AllMatchInfo
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}
import play.api.libs.ws.WSClient

import java.io.{ByteArrayInputStream, File, FileOutputStream}
import java.net.{InetAddress, Socket}
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
  env: Environment,
  wsClient: WSClient
)(implicit ec: ExecutionContext) {
  
  private val log = LoggerFactory.getLogger(getClass)
  
  // Get printer configuration from application.conf
  private val printerName = config.getOptional[String]("printer.name").getOrElse("")
  private val printerHost = config.getOptional[String]("printer.host").getOrElse("")
  private val printerPort = config.getOptional[Int]("printer.port").getOrElse(631)
  private val printerRawPort = config.getOptional[Int]("printer.raw.port").getOrElse(9100)
  private val savePDFPath = config.getOptional[String]("printer.save.path").getOrElse("./pdfs")
  private val savePDFEnabled = config.getOptional[Boolean]("printer.save.enabled").getOrElse(false)
  private val useNetworkPrinting = config.getOptional[Boolean]("printer.network.enabled").getOrElse(true)
  
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
  
  // Print PDF to the configured printer (now with network support)
  def printPDF(allMatchInfo: AllMatchInfo): Future[Either[String, String]] = {
    printPDFNetwork(allMatchInfo)
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
  def discoverNetworkPrinters(): Future[Seq[String]] = {
    log.info("Searching for network printers...")
    if (printerHost.nonEmpty) {
      // Test if configured printer is reachable
      testPrinterConnection(printerHost, printerPort).map { isReachable =>
        if (isReachable) {
          Seq(s"Brother-Network-$printerHost")
        } else {
          Seq.empty
        }
      }
    } else {
      // Fallback to local printer discovery
      Future.successful(getPrinterList.filter(name => name.contains("Brother") || name.contains("network")))
    }
  }

  // Test printer connection
  private def testPrinterConnection(host: String, port: Int): Future[Boolean] = {
    Future {
      Try {
        val socket = new Socket(host, port)
        socket.close()
        true
      }.getOrElse(false)
    }
  }

  // Print via IPP protocol
  private def printViaIPP(pdfData: Array[Byte]): Future[Either[String, String]] = {
    val ippUrl = s"http://$printerHost:$printerPort/ipp/print"
    log.info(s"Printing via IPP to $ippUrl")
    log.debug(s"PDF data size: ${pdfData.length} bytes")

    wsClient.url(ippUrl)
      .withHttpHeaders(
        "Content-Type" -> "application/ipp",
        "Accept" -> "application/ipp"
      )
      .post(createIPPRequest(pdfData))
      .map { response =>
        log.debug(s"IPP Response Status: ${response.status}")
        log.debug(s"IPP Response Status Text: ${response.statusText}")
        log.debug(s"IPP Response Headers: ${response.headers}")
        log.debug(s"IPP Response Body: ${response.body}")
        log.debug(s"IPP Response Body Bytes: ${response.bodyAsBytes.toArray.mkString(",")}")
        
        if (response.status == 200) {
          // Check if the job was actually successful or aborted
          val responseBody = response.body
          if (responseBody.contains("aborted-by-system") || responseBody.contains("job-state-reasons")) {
            log.error(s"IPP job was aborted by printer: ${responseBody}")
            Left(s"IPP job aborted by printer. Reason: ${responseBody}")
          } else {
            log.info("IPP print job submitted successfully")
            Right(s"IPP print job submitted successfully. Response: ${responseBody}")
          }
        } else {
          log.error(s"IPP printing failed with status ${response.status}: ${response.statusText}")
          log.error(s"IPP error response body: ${response.body}")
          Left(s"IPP printing failed: ${response.status} - ${response.statusText} - Body: ${response.body}")
        }
      }
      .recover {
        case ex => 
          log.error(s"IPP printing error: ${ex.getMessage}", ex)
          Left(s"IPP printing error: ${ex.getMessage}")
      }
  }

  // Print via raw TCP (port 9100)
  private def printViaRawTCP(pdfData: Array[Byte]): Future[Either[String, String]] = {
    Future {
      Try {
        log.info(s"Printing via raw TCP to $printerHost:$printerRawPort")
        log.debug(s"PDF data size for raw TCP: ${pdfData.length} bytes")
        val socket = new Socket(printerHost, printerRawPort)
        val outputStream = socket.getOutputStream
        outputStream.write(pdfData)
        outputStream.flush()
        outputStream.close()
        socket.close()
        log.info("Raw TCP print job sent successfully")
        "Raw TCP print job sent successfully"
      } match {
        case Success(message) => Right(message)
        case Failure(ex) => 
          log.error(s"Raw TCP printing failed", ex)
          Left(s"Raw TCP printing failed: ${ex.getMessage}")
      }
    }
  }

  // Create IPP request payload
  private def createIPPRequest(pdfData: Array[Byte]): Array[Byte] = {
    // IPP request structure
    val ippVersion = Array[Byte](1, 1) // IPP version 1.1
    val operationId = Array[Byte](0, 2) // Print-Job operation  
    val requestId = Array[Byte](0, 0, 0, 1) // Request ID
    
    // Operation attributes tag
    val operationAttributesTag = Array[Byte](1)
    
    // Required attributes for Print-Job
    val charsetAttr = createIPPAttribute(0x47.toByte, "attributes-charset", "utf-8")
    val languageAttr = createIPPAttribute(0x48.toByte, "attributes-natural-language", "en")
    val printerUriAttr = createIPPAttribute(0x45.toByte, "printer-uri", s"ipp://$printerHost:$printerPort/ipp/print")
    val documentFormatAttr = createIPPAttribute(0x49.toByte, "document-format", "application/pdf")
    val jobNameAttr = createIPPAttribute(0x42.toByte, "job-name", "Table Tennis Match")
    
    // End of attributes tag
    val endOfAttributes = Array[Byte](3)
    
    // Combine all parts
    val ippRequest = ippVersion ++ operationId ++ requestId ++ 
                    operationAttributesTag ++ charsetAttr ++ languageAttr ++ 
                    printerUriAttr ++ documentFormatAttr ++ jobNameAttr ++
                    endOfAttributes ++ pdfData
    
    log.debug(s"IPP request created - total size: ${ippRequest.length} bytes")
    log.debug(s"IPP header: ${(ippVersion ++ operationId ++ requestId).mkString(",")}")
    
    ippRequest
  }
  
  // Helper method to create IPP attribute
  private def createIPPAttribute(valueTag: Byte, name: String, value: String): Array[Byte] = {
    val nameBytes = name.getBytes("UTF-8")
    val valueBytes = value.getBytes("UTF-8")
    
    Array(valueTag) ++ 
    Array((nameBytes.length >> 8).toByte, nameBytes.length.toByte) ++ nameBytes ++
    Array((valueBytes.length >> 8).toByte, valueBytes.length.toByte) ++ valueBytes
  }

  // Enhanced print method with network printing support
  def printPDFNetwork(allMatchInfo: AllMatchInfo): Future[Either[String, String]] = {
    log.info(s"Starting print job for match ${allMatchInfo.ttMatch.id}")
    log.debug(s"Printer config - host: $printerHost, port: $printerPort, rawPort: $printerRawPort")
    log.debug(s"Network printing enabled: $useNetworkPrinting, Save PDF enabled: $savePDFEnabled")
    
    pdfService.generatePDF(allMatchInfo) match {
      case Right(pdfData) =>
        log.info(s"PDF generated successfully, size: ${pdfData.length} bytes")
        
        // Save PDF if configured
        if (savePDFEnabled) {
          savePDFToFile(pdfData, s"match_${allMatchInfo.ttMatch.id}.pdf")
        }

        if (useNetworkPrinting && printerHost.nonEmpty) {
          log.info(s"Using network printing to $printerHost")
          // Try Raw TCP first (more reliable for PDF), fallback to IPP
          printViaRawTCP(pdfData).flatMap {
            case Right(message) => 
              log.info(s"Raw TCP printing succeeded: $message")
              Future.successful(Right(message))
            case Left(rawError) =>
              log.warn(s"Raw TCP printing failed: $rawError, trying IPP")
              printViaIPP(pdfData)
          }
        } else {
          log.info("Using local printing")
          // Fallback to local printing
          Future.successful(printPDFLocal(allMatchInfo))
        }
        
      case Left(error) => 
        log.error(s"Failed to generate PDF: $error")
        Future.successful(Left(s"Failed to generate PDF: $error"))
    }
  }

  // Original local printing method (renamed for clarity)
  private def printPDFLocal(allMatchInfo: AllMatchInfo): Either[String, String] = {
    findPrinter(printerName) match {
      case Some(printer) =>
        pdfService.generatePDF(allMatchInfo) match {
          case Right(pdfData) =>
            Try {
              val doc = new SimpleDoc(
                new ByteArrayInputStream(pdfData),
                DocFlavor.INPUT_STREAM.PDF,
                null
              )
              val job = printer.createPrintJob()
              job.print(doc, printAttributes)
              "Local print job submitted"
            } match {
              case Success(message) => Right(message)
              case Failure(ex) => 
                log.error("Local printing failed", ex)
                Left(s"Local printing failed: ${ex.getMessage}")
            }
          case Left(error) => Left(s"Failed to generate PDF: $error")
        }
      case None =>
        Left(s"Local printer '$printerName' not found")
    }
  }
}