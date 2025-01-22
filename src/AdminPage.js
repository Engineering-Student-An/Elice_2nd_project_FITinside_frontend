import React from 'react';
import { Link } from 'react-router-dom'; // Link 컴포넌트를 사용하여 페이지 이동

const AdminPage = () => {
    return (
        <div style={{ padding: '86px 20px 20px 20px' }}>
            <div style={{ position: 'fixed', backgroundColor: 'white', width: '100%', padding: '0 0 0 20px'}}>
                <h2>관리자 페이지</h2>
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center" style={{marginTop: '100px'}}>
                <Link to='/admin/member' className="btn btn-light text-dark mb-4" style={{ border: '1px solid #ced4da', width: '30%' }}>
                    회원 관리
                </Link>
                <Link to='/admin/coupons' className="btn btn-light text-dark mb-4" style={{ border: '1px solid #ced4da', width: '30%' }}>
                    쿠폰 관리
                </Link>
                <Link to='/admin/categories' className="btn btn-light text-dark mb-4" style={{ border: '1px solid #ced4da', width: '30%' }}>
                    카테고리 관리
                </Link>
                <Link to='/admin/banners' className="btn btn-light text-dark mb-4" style={{ border: '1px solid #ced4da', width: '30%' }}>
                    메인 화면 광고 관리
                </Link>
                <Link to='/admin/orders' className="btn btn-light text-dark mb-4" style={{ border: '1px solid #ced4da', width: '30%' }}>
                    주문 관리
                </Link>
                <Link to='/admin/products' className="btn btn-light text-dark mb-4" style={{ border: '1px solid #ced4da', width: '30%' }}>
                    상품 관리
                </Link>
            </div>
        </div>
    );
};
export default AdminPage;
