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
      Future.failed(new Exception("No printer host configured"))
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
        
        val responseBody = response.body
        val readableBody = parseIPPResponse(responseBody)
        val fullResponse = s"Status: ${response.status}, StatusText: ${response.statusText}, Body: ${readableBody}, OriginalBody: ${responseBody}"
        
        if (response.status == 200) {
          // Check if the job was actually successful or aborted
          if (responseBody.contains("aborted-by-system")) {
            log.error(s"IPP job was aborted by printer: ${responseBody}")
            Left(fullResponse)
          } else if (responseBody.contains("job-state-reasons")) {
            log.error(s"IPP job has issues: ${responseBody}")
            Left(fullResponse)
          } else {
            log.info("IPP print job submitted successfully")
            Right(fullResponse)
          }
        } else {
          log.error(s"IPP printing failed with status ${response.status}: ${response.statusText}")
          log.error(s"IPP error response body: ${response.body}")
          Left(fullResponse)
        }
      }
      .recover {
        case ex => 
          log.error(s"IPP printing error: ${ex.getMessage}", ex)
          Left(ex.getMessage)
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
    val operationId = Array[Byte](0, 2) // Print-Job operation (0x0002)
    val requestId = Array[Byte](0, 0, 0, 1) // Request ID
    
    // Operation attributes tag
    val operationAttributesTag = Array[Byte](1)
    
    // Required attributes for Print-Job (minimal set)
    val charsetAttr = createIPPAttribute(0x47.toByte, "attributes-charset", "utf-8")
    val languageAttr = createIPPAttribute(0x48.toByte, "attributes-natural-language", "en")
    val printerUriAttr = createIPPAttribute(0x45.toByte, "printer-uri", s"ipp://$printerHost:$printerPort/ipp/print")
    val requestingUserAttr = createIPPAttribute(0x42.toByte, "requesting-user-name", "anonymous")
    val jobNameAttr = createIPPAttribute(0x42.toByte, "job-name", "TTMatch")
    val documentFormatAttr = createIPPAttribute(0x49.toByte, "document-format", "application/octet-stream")
    
    // Job attributes tag
    val jobAttributesTag = Array[Byte](2)
    
    // Simplified job attributes - more compatible
    val copiesAttr = createIPPIntegerAttribute(0x21.toByte, "copies", 1)
    val sidesAttr = createIPPAttribute(0x44.toByte, "sides", "one-sided")
    val mediaAttr = createIPPAttribute(0x44.toByte, "media", "iso_a6_105x148mm")
    val printQualityAttr = createIPPIntegerAttribute(0x23.toByte, "print-quality", 4) // normal quality
    val orientationAttr = createIPPIntegerAttribute(0x23.toByte, "orientation-requested", 4) // landscape
    
    // End of attributes tag
    val endOfAttributes = Array[Byte](3)
    
    // Combine all parts
    val ippRequest = ippVersion ++ operationId ++ requestId ++ 
                    operationAttributesTag ++ charsetAttr ++ languageAttr ++ 
                    printerUriAttr ++ requestingUserAttr ++ jobNameAttr ++ documentFormatAttr ++
                    jobAttributesTag ++ copiesAttr ++ sidesAttr ++ mediaAttr ++ 
                    printQualityAttr ++ orientationAttr ++
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

  // Helper method to create IPP integer attribute
  private def createIPPIntegerAttribute(valueTag: Byte, name: String, value: Int): Array[Byte] = {
    val nameBytes = name.getBytes("UTF-8")
    val valueBytes = Array[Byte](
      (value >> 24).toByte,
      (value >> 16).toByte,
      (value >> 8).toByte,
      value.toByte
    )
    
    Array(valueTag) ++ 
    Array((nameBytes.length >> 8).toByte, nameBytes.length.toByte) ++ nameBytes ++
    Array[Byte](0, 4) ++ valueBytes // Integer values are always 4 bytes
  }

  // Parse IPP response to extract readable information
  private def parseIPPResponse(responseBody: String): String = {
    try {
      // Extract readable strings from the IPP response
      val attributes = scala.collection.mutable.Map[String, String]()
      
      // Look for common IPP attributes in the response
      val patterns = Map(
        "job-uri" -> "job-uri",
        "job-id" -> "job-id", 
        "job-state" -> "job-state",
        "job-state-reasons" -> "job-state-reasons",
        "attributes-charset" -> "attributes-charset",
        "attributes-natural-language" -> "attributes-natural-language"
      )
      
      patterns.foreach { case (key, displayName) =>
        val index = responseBody.indexOf(key)
        if (index != -1) {
          // Try to extract the value after the attribute name
          val afterKey = responseBody.substring(index + key.length)
          val valueStart = afterKey.indexWhere(c => c.isLetterOrDigit || c == '/' || c == ':' || c == '-')
          if (valueStart != -1) {
            val valueEnd = afterKey.substring(valueStart).indexWhere(c => c < 32 && c != ' ')
            val value = if (valueEnd != -1) {
              afterKey.substring(valueStart, valueStart + valueEnd)
            } else {
              afterKey.substring(valueStart).take(50) // Limit length
            }
            if (value.nonEmpty) {
              attributes(displayName) = value
            }
          }
        }
      }
      
      // Format the attributes as readable text
      if (attributes.nonEmpty) {
        attributes.map { case (key, value) => s"$key: $value" }.mkString(", ")
      } else {
        "IPP response (binary data)"
      }
    } catch {
      case ex: Exception =>
        log.warn(s"Failed to parse IPP response: ${ex.getMessage}")
        "IPP response (parsing failed)"
    }
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

        if (printerHost.nonEmpty) {
          log.info(s"Using IPP printing to $printerHost")
          // Use IPP printing only, no fallback
          printViaIPP(pdfData)
        } else {
          log.error("Printer host is empty - cannot print")
          Future.failed(new IllegalStateException("Printer host is not configured"))
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