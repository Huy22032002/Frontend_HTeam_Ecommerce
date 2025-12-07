/**
 * Print utilities - Open print templates in new window
 */

const printStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    font-family: 'Arial', sans-serif;
    font-size: 12px;
    line-height: 1.6;
    color: #000;
    background: #fff;
    width: 100%;
    height: 100%;
  }
  
  .print-container {
    max-width: 210mm;
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    background: white;
  }
  
  .header {
    text-align: center;
    margin-bottom: 25px;
    border-bottom: 2px solid #000;
    padding-bottom: 15px;
  }
  
  .header h1 {
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 10px 0;
    letter-spacing: 1px;
  }
  
  .header p {
    font-size: 16px;
    margin: 0;
    color: #333;
    font-weight: 500;
  }
  
  .company-info {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .company-info h3 {
    font-size: 14px;
    font-weight: bold;
    margin: 0 0 5px 0;
  }
  
  .company-info p {
    font-size: 11px;
    margin: 3px 0;
    color: #666;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .info-section h4 {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .info-row {
    font-size: 11px;
    margin: 4px 0;
  }
  
  .info-row strong {
    display: inline-block;
    min-width: 80px;
  }
  
  .products-section {
    margin-bottom: 20px;
  }
  
  .products-section h4 {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .products-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }
  
  .products-table thead {
    background-color: #f0f0f0;
  }
  
  .products-table th,
  .products-table td {
    border: 1px solid #333;
    padding: 8px;
    text-align: left;
    font-size: 11px;
  }
  
  .products-table th {
    font-weight: bold;
    text-align: center;
  }
  
  .products-table .col-stt {
    width: 40px;
    text-align: center;
  }
  
  .products-table .col-qty {
    width: 60px;
    text-align: center;
  }
  
  .products-table .col-price,
  .products-table .col-total {
    width: 100px;
    text-align: right;
  }
  
  .product-name {
    font-weight: bold;
  }
  
  .product-sku {
    font-size: 10px;
    color: #666;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 10px;
    margin-bottom: 30px;
  }
  
  .summary-box {
    border: 2px solid #333;
    padding: 12px;
    font-size: 11px;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  .summary-row strong {
    font-weight: bold;
  }
  
  .summary-row.discount {
    color: #d32f2f;
  }
  
  .summary-row.total {
    border-top: 1px solid #333;
    padding-top: 6px;
    font-weight: bold;
    font-size: 12px;
  }
  
  .summary-note {
    font-size: 9px;
    margin-top: 5px;
    color: #666;
    font-style: italic;
  }
  
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 40px 0;
  }
  
  .signature-box {
    text-align: center;
  }
  
  .signature-title {
    font-size: 11px;
    font-weight: bold;
    margin-bottom: 30px;
  }
  
  .signature-line {
    border-top: 1px solid #333;
    min-height: 30px;
    font-size: 10px;
    padding-top: 5px;
  }
  
  .footer {
    text-align: center;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #ccc;
    font-size: 10px;
    color: #666;
  }
  
  .footer p {
    margin: 3px 0;
  }
  
  @page {
    size: A4;
    margin: 0;
  }
  
  @media print {
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-container {
      max-width: 100%;
      padding: 0;
      margin: 0;
    }
  }
`;

export function printOrderDetail(orderHTML: string) {
  const printWindow = window.open('', '', 'height=900,width=1200');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>In Đơn Hàng</title>
        <style>${printStyles}</style>
      </head>
      <body>
        ${orderHTML}
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 1000);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function printInvoiceDetail(invoiceHTML: string) {
  const printWindow = window.open('', '', 'height=900,width=1200');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>In Hoá Đơn</title>
        <style>${printStyles}</style>
      </head>
      <body>
        ${invoiceHTML}
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 1000);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

