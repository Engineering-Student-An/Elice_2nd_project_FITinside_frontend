import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdBanner.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap 추가

const AdBanner = ({ userRole }) => {
    const [ads, setAds] = useState([]); // 광고 목록
    const [error, setError] = useState(null); // 에러 상태
    const navigate = useNavigate();

    // 광고를 서버에서 가져오기
    useEffect(() => {
        axios.get('https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/banners', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Bearer 토큰 포함
            }
        })
            .then(response => {
                setAds(response.data); // 광고 데이터 설정
            })
            .catch(error => {
                console.error('Error fetching banners:', error);
                setError('광고를 불러오는 중 오류가 발생했습니다.');
            });
    }, []);

    // 광고 클릭 시 처리 (광고에 URL이 있는 경우 해당 URL로 이동)
    const handleAdClick = (ad) => {
        if (ad?.targetUrl) {
            window.location.href = ad.targetUrl; // 현재 페이지에서 URL로 이동
        } else if (ad?.title === '쿠폰 광고') { // 특정 광고일 때만 navigate 사용
            navigate('/coupons/welcome');
        }
    };

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="container mt-4">
            <div id="adCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {ads.length > 0 ? (
                        ads.map((ad, index) => (
                            <div
                                key={ad.id}
                                className={`carousel-item ${index === 0 ? 'active' : ''}`}
                                onClick={() => handleAdClick(ad)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    className="ad-banner"
                                />
                            </div>
                        ))
                    ) : (
                        <p>등록된 광고가 없습니다.</p>
                    )}
                </div>
                {/* 이전 버튼 */}
                <button className="carousel-control-prev" type="button" data-bs-target="#adCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">이전</span>
                </button>
                {/* 다음 버튼 */}
                <button className="carousel-control-next" type="button" data-bs-target="#adCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">다음</span>
                </button>
            </div>
            {userRole === 'ROLE_ADMIN' && (
                <button className="btn btn-primary mt-3">광고 수정</button>
            )}
        </div>
    );
};

export default AdBanner;
