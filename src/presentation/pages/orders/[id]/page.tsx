import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>
            Sipariş Detayı - #{id}
          </h1>

          <div className='text-center py-12'>
            <div className='text-gray-500 text-lg'>
              Sipariş detay sayfası geliştiriliyor...
            </div>
            <div className='text-gray-400 text-sm mt-2'>Sipariş ID: {id}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
