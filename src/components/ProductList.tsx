import React from 'react';
import { useProducts } from '../hooks/useProducts';

const ProductList: React.FC = () => {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>Lỗi: {String(error)}</div>;

  return (
    <div>
      <h2>Danh sách sản phẩm</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #eee', padding: 16, width: 220 }}>
            <h4>{product.productName}</h4>
            <div>Loại: {product.productType}</div>
            <div>Đánh giá: {product.productReviewAvg ?? 0} ({product.productReviewCount ?? 0} đánh giá)</div>
            <div>Còn hàng: {product.available ? 'Có' : 'Hết'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
