// import moment from "moment"
// import html2pdf from "html2pdf.js"

// invoiceIt
//   .create()
//   .getInvoice()
//   .toHtml()
//   .toFile("./invoice.html")

//   await html2pdf()
//     .from(htmlText)
//     .set({ html2canvas: { useCORS: true } })
//     .save("receipt.pdf")

import https from "https"
import fs from "fs"

const generateInvoice = (invoice, filename, success, error) => {
  const postData = JSON.stringify(invoice)
  const options = {
    hostname: "invoice-generator.com",
    port: 443,
    path: "/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  }

  // const file = fs.createWriteStream(filename)

  // const req = https.request(options, function(res) {
  //   res
  //     .on("data", function(chunk) {
  //       file.write(chunk)
  //     })
  //     .on("end", function() {
  //       file.end()

  //       if (typeof success === "function") {
  //         success()
  //       }
  //     })
  // })
  // req.write(postData)
  // req.end()

  // if (typeof error === "function") {
  //   req.on("error", error)
  // }
}

const invoice = {
  logo: "https://i.imgur.com/l4NpIMw.jpg",
  from: "TKD Taekwando\n12 Haig Road\nSingapore 430012\n9625 1640",
  to: "A student",
  currency: "sgd",
  number: "INV-0001",
  payment_terms: "Cash",
  header: "Receipt",
  balance_title: "Amount paid",
  unit_cost_header: "Unit cost",
  items: [
    {
      name: "Some tkd program",
      quantity: 1,
      unit_cost: 50,
    },
  ],
}

generateInvoice(
  invoice,
  "stuff.pdf",
  function() {
    console.log("Saved invoice to invoice.pdf")
  },
  function(error) {
    console.error(error)
  }
)

export default null
