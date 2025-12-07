import React from 'react';
import type { OrderReadableDTO } from '../../models/orders/Order';
import { formatCurrency } from '../../utils/formatCurrency';

interface OrderPrintTemplateProps {
  order: OrderReadableDTO;
}

const OrderPrintTemplate: React.FC<OrderPrintTemplateProps> = ({ order }) => {
  const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const subtotal = order.items ? order.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) : 0;

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #000;
      background: #fff;
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
    
    @media print {
      body {
        background: white;
      }
      .print-container {
        max-width: 100%;
        padding: 0;
        margin: 0;
      }
    }
  `;

  return (
    <div id="order-print-template" style={{ display: 'none' }}>
      <style>{styles}</style>
      <div className="print-container">
        <div className="header">
          <h1>ĐƠN HÀNG</h1>
          <p>{order.orderCode}</p>
        </div>

        <div className="company-info">
          <h3>CÔNG TY HTEAM</h3>
          <p>Địa chỉ: 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP.HCM</p>
          <p>Điện thoại: 0123 456 789 | Email: contact@hteam.com</p>
        </div>

        <div className="info-grid">
          <div className="info-section">
            <h4>THÔNG TIN KHÁCH HÀNG</h4>
            <div className="info-row"><strong>Khách hàng:</strong> {order.customerName}</div>
            <div className="info-row"><strong>Người nhận:</strong> {order.receiverName || '—'}</div>
            <div className="info-row"><strong>Điện thoại:</strong> {order.receiverPhoneNumber || '—'}</div>
            <div className="info-row"><strong>Địa chỉ:</strong> {order.shippingAddress || '—'}</div>
          </div>

          <div className="info-section">
            <h4>THÔNG TIN ĐƠN HÀNG</h4>
            <div className="info-row"><strong>Mã đơn:</strong> {order.orderCode}</div>
            <div className="info-row"><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
            <div className="info-row"><strong>Tổng sản phẩm:</strong> {totalItems} cái</div>
            <div className="info-row"><strong>Trạng thái:</strong> {order.status === 'PROCESSING' ? 'Đang xử lý' : order.status}</div>
          </div>
        </div>

        <div className="products-section">
          <h4>CHI TIẾT SẢN PHẨM</h4>
          <table className="products-table">
            <thead>
              <tr>
                <th className="col-stt">STT</th>
                <th>Tên sản phẩm</th>
                <th className="col-qty">SL</th>
                <th className="col-price">Đơn giá</th>
                <th className="col-total">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="col-stt">{idx + 1}</td>
                    <td>
                      <div className="product-name">{item.productName || item.sku}</div>
                      <div className="product-sku">SKU: {item.sku}</div>
                    </td>
                    <td className="col-qty">{item.quantity}</td>
                    <td className="col-price">{formatCurrency(item.price || 0)}</td>
                    <td className="col-total"><strong>{formatCurrency((item.price || 0) * item.quantity)}</strong></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>Không có sản phẩm</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="summary-grid">
          <div></div>
          <div className="summary-box">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            {order.totalDiscount && order.totalDiscount > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá:</span>
                <strong>-{formatCurrency(order.totalDiscount)}</strong>
              </div>
            )}
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <strong>{formatCurrency(0)}</strong>
            </div>
            <div className="summary-row total">
              <span>TỔNG CỘNG:</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <div className="summary-note">(Giá đã bao gồm VAT)</div>
          </div>
        </div>

        <div className="signatures">
          <div className="signature-box">
            <div className="signature-title">Người lập đơn</div>
            <div className="signature-line">(Ký, ghi rõ họ tên)</div>
          </div>
          <div className="signature-box">
            <div className="signature-title">Khách hàng</div>
            <div className="signature-line">(Ký, ghi rõ họ tên)</div>
          </div>
        </div>

        <div className="footer">
          <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
          <p>In lúc: {new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderPrintTemplate;
