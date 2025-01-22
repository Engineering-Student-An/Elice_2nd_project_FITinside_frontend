
// import React, { useEffect, useState } from 'react';
// import './AdBanner.css';
// import { useNavigate } from 'react-router-dom'; // useNavigate 훅을 가져옴
//
// const AdBanner = ({ userRole }) => {
//     const [currentAdIndex, setCurrentAdIndex] = useState(0);
//     const ads = [
//         // require('../assets/images/광고1.png'),
//         require('../assets/images/coupon_ad.png'),
//         require('../assets/images/광고2.png'),
//         require('../assets/images/광고3.png'),
//         require('../assets/images/광고4.png'),
//         require('../assets/images/광고5.png')
//     ];
//
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
//         }, 5000);
//         return () => clearInterval(interval);
//     }, [ads.length]);
//
//     const navigate = useNavigate(); // useNavigate 훅 사용
//
//     const handleAdClick = () => {
//         // 현재 광고가 coupon_ad.png일 때만 이동
//         if (ads[currentAdIndex] === require('../assets/images/coupon_ad.png')) {
//             navigate('/coupons/welcome'); // /coupons 경로로 이동
//         }
//     };
//
//     return (
//         <div className="ad-banner">
//             <img src={ads[currentAdIndex]} alt="광고" onClick={handleAdClick} style={{ cursor: 'pointer' }}/>
//             {userRole === 'ROLE_ADMIN' && (
//                 <button className="add-ad-button">광고 수정</button>
//             )}
//         </div>
//     );
// };
//
// export default AdBanner;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './AdBanner.css';
// import { useNavigate } from 'react-router-dom';
//
// const AdBanner = ({ userRole }) => {
//     const [ads, setAds] = useState([]); // 광고 목록
//     const [currentAdIndex, setCurrentAdIndex] = useState(0); // 현재 표시되는 광고 인덱스
//     const [error, setError] = useState(null); // 에러 상태
//     const navigate = useNavigate();
//
//     // 광고를 서버에서 가져오기
//     useEffect(() => {
//         axios.get('http://localhost:8080/api/banners', {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}` // Bearer 토큰 포함
//             }
//         })
//             .then(response => {
//                 setAds(response.data); // 광고 데이터 설정
//             })
//             .catch(error => {
//                 console.error('Error fetching banners:', error);
//                 setError('광고를 불러오는 중 오류가 발생했습니다.');
//             });
//     }, []);
//
//     // 광고가 로드될 때마다 일정 시간 후 광고를 변경
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
//         }, 5000);
//         return () => clearInterval(interval);
//     }, [ads.length]);
//
//     // 광고 클릭 시 처리
//     const handleAdClick = () => {
//         if (ads[currentAdIndex]?.title === '쿠폰 광고') { // 특정 광고일 때만 이동
//             navigate('/coupons/welcome');
//         }
//     };
//
//     if (error) {
//         return <p>{error}</p>;
//     }
//
//     return (
//         <div className="ad-banner">
//             {ads.length > 0 ? (
//                 <>
//                     <img
//                         src={ads[currentAdIndex]?.imageUrl}
//                         alt={ads[currentAdIndex]?.title}
//                         onClick={handleAdClick}
//                         style={{ cursor: 'pointer' }}
//                     />
//                     {userRole === 'ROLE_ADMIN' && (
//                         <button className="add-ad-button">광고 수정</button>
//                     )}
//                 </>
//             ) : (
//                 <p>등록된 광고가 없습니다.</p>
//             )}
//         </div>
//     );
// };
//
// export default AdBanner;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './AdBanner.css';
// import { useNavigate } from 'react-router-dom';
//
// const AdBanner = ({ userRole }) => {
//     const [ads, setAds] = useState([]); // 광고 목록
//     const [currentAdIndex, setCurrentAdIndex] = useState(0); // 현재 표시되는 광고 인덱스
//     const [error, setError] = useState(null); // 에러 상태
//     const navigate = useNavigate();
//
//     // 광고를 서버에서 가져오기
//     useEffect(() => {
//         axios.get('http://localhost:8080/api/banners', {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}` // Bearer 토큰 포함
//             }
//         })
//             .then(response => {
//                 setAds(response.data); // 광고 데이터 설정
//             })
//             .catch(error => {
//                 console.error('Error fetching banners:', error);
//                 setError('광고를 불러오는 중 오류가 발생했습니다.');
//             });
//     }, []);
//
//     // 광고가 로드될 때마다 일정 시간 후 광고를 변경
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
//         }, 5000);
//         return () => clearInterval(interval);
//     }, [ads.length]);
//
//     // 광고 클릭 시 처리 (광고에 URL이 있는 경우 해당 URL로 이동)
//     const handleAdClick = () => {
//         const currentAd = ads[currentAdIndex];
//         if (currentAd?.targetUrl) {
//             window.location.href = currentAd.targetUrl; // 현재 페이지에서 URL로 이동
//         } else if (currentAd?.title === '쿠폰 광고') { // 특정 광고일 때만 navigate 사용
//             navigate('/coupons/welcome');
//         }
//     };
//
//     if (error) {
//         return <p>{error}</p>;
//     }
//
//     return (
//         <div className="ad-banner" style={{marginTop: '90px'}}>
//             {ads.length > 0 ? (
//                 <>
//                     <img
//                         src={ads[currentAdIndex]?.imageUrl}
//                         alt={ads[currentAdIndex]?.title}
//                         onClick={handleAdClick}
//                         style={{cursor: 'pointer'}}
//                     />
//                     {userRole === 'ROLE_ADMIN' && (
//                         <button className="add-ad-button">광고 수정</button>
//                     )}
//                 </>
//             ) : (
//                 <p>등록된 광고가 없습니다.</p>
//             )}
//         </div>
//     );
// };
//
// export default AdBanner;

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
        axios.get('http://localhost:8080/api/banners', {
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
