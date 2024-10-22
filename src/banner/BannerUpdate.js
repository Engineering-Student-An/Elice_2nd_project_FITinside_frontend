// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate, useParams } from 'react-router-dom';
// import './BannerCreate.css'; // CSS 파일 추가
//
// const BannerUpdate = () => {
//     const [title, setTitle] = useState(''); // 배너 제목
//     const [displayOrder, setDisplayOrder] = useState(''); // 배너 표시 순서
//     const [image, setImage] = useState(null); // 배너 이미지
//     const [targetUrl, setTargetUrl] = useState(''); // URL 필드 추가
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//
//     const { id } = useParams();
//     const navigate = useNavigate();
//
//     // 배너 정보 가져오기
//     useEffect(() => {
//         axios.get(`http://localhost:8080/api/banners/${id}`, {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             }
//         })
//             .then(response => {
//                 const banner = response.data;
//                 setTitle(banner.title);
//                 setDisplayOrder(banner.displayOrder);
//                 setImage(banner.imageUrl || null);
//                 setTargetUrl(banner.targetUrl || ''); // URL 값도 함께 설정
//                 setLoading(false);
//             })
//             .catch(error => {
//                 console.error('Error fetching banner data:', error);
//                 setError('배너 정보를 불러오는 중 오류가 발생했습니다.');
//                 if (error.response && error.response.status === 401) {
//                     alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//                 }
//                 setLoading(false);
//             });
//     }, [id]);
//
//     const handleImageChange = (e) => {
//         setImage(e.target.files[0]); // 파일을 선택한 경우 이미지로 설정
//     };
//
//     const handleSubmit = (e) => {
//         e.preventDefault();
//
//         const formData = new FormData();
//         formData.append('title', title);
//         formData.append('displayOrder', displayOrder ? Number(displayOrder) : null);
//
//         // 새로운 이미지가 선택된 경우에만 파일 추가, 아니면 기존 이미지 URL 추가
//         if (image instanceof File) {
//             formData.append('image', image);
//         } else if (image) {
//             formData.append('imageUrl', image); // 기존 이미지 URL을 전송
//         }
//
//         formData.append('targetUrl', targetUrl); // URL 필드 추가
//
//         axios.put(`http://localhost:8080/api/admin/banners/${id}`, formData, {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`,
//                 'Content-Type': 'multipart/form-data'
//             }
//         })
//             .then(response => {
//                 console.log('Banner updated:', response.data);
//                 alert('배너가 성공적으로 수정되었습니다.');
//                 navigate('/admin/banners');
//             })
//             .catch(error => {
//                 console.error('Error updating banner:', error);
//                 alert('배너 수정 중 오류가 발생했습니다.');
//                 if (error.response && error.response.status === 401) {
//                     alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
//                 }
//             });
//     };
//
//     if (loading) {
//         return <p>로딩 중...</p>;
//     }
//
//     if (error) {
//         return <p>{error}</p>;
//     }
//
//     return (
//         <div className="form-container">
//             <h2>배너 수정</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label>제목:</label>
//                     <input
//                         type="text"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>표시 순서:</label>
//                     <input
//                         type="number"
//                         value={displayOrder}
//                         onChange={(e) => setDisplayOrder(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>배너 이미지:</label>
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                     />
//                     {image && !(image instanceof File) && (
//                         <img src={image} alt="current banner" width="100" />
//                     )}
//                 </div>
//                 <div className="form-group">
//                     <label>타겟 URL:</label> {/* URL 입력 필드 추가 */}
//                     <input
//                         type="text"
//                         value={targetUrl}
//                         onChange={(e) => setTargetUrl(e.target.value)}
//                         placeholder="http://example.com"
//                     />
//                 </div>
//                 <button type="submit" className="submit-button">배너 수정</button>
//             </form>
//         </div>
//     );
// };
//
// export default BannerUpdate;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken"; // Bootstrap CSS 추가

const BannerUpdate = () => {
    const [title, setTitle] = useState(''); // 배너 제목
    const [displayOrder, setDisplayOrder] = useState(''); // 배너 표시 순서
    const [image, setImage] = useState(null); // 배너 이미지
    const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기 상태 추가
    const [targetUrl, setTargetUrl] = useState(''); // URL 필드 추가
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();

    // 배너 정보 가져오기
    useEffect(() => {
        axios.get(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/banners/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                const banner = response.data;
                setTitle(banner.title);
                setDisplayOrder(banner.displayOrder);
                setImage(banner.imageUrl || null);
                setPreviewImage(banner.imageUrl || null); // 기존 이미지 미리보기 설정
                setTargetUrl(banner.targetUrl || ''); // URL 값도 함께 설정
                setLoading(false);
            })
            .catch(async error => {
                try {
                    await sendRefreshTokenAndStoreAccessToken();
                    axios.get(`http://localhost:8080/api/banners/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                        .then(response => {
                            const banner = response.data;
                            setTitle(banner.title);
                            setDisplayOrder(banner.displayOrder);
                            setImage(banner.imageUrl || null);
                            setPreviewImage(banner.imageUrl || null); // 기존 이미지 미리보기 설정
                            setTargetUrl(banner.targetUrl || ''); // URL 값도 함께 설정
                            setLoading(false);
                        })
                } catch(error) {
                    console.error('Error fetching banner data:', error);
                    setError('배너 정보를 불러오는 중 오류가 발생했습니다.');
                    if (error.response && error.response.status === 401) {
                        alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                    }
                    setLoading(false);
                }
            });
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreviewImage(URL.createObjectURL(file)); // 파일이 선택되면 미리보기 이미지 업데이트
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // displayOrder와 mainDisplayOrder가 1 이상의 값인지 확인
        if (displayOrder < 1) {
            alert('표시 순서는 1 이상의 값이어야 합니다.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('displayOrder', displayOrder ? Number(displayOrder) : null);

        // 새로운 이미지가 선택된 경우에만 파일 추가, 아니면 기존 이미지 URL 추가
        if (image instanceof File) {
            formData.append('image', image);
        } else if (image) {
            formData.append('imageUrl', image); // 기존 이미지 URL을 전송
        }

        formData.append('targetUrl', targetUrl); // URL 필드 추가

        axios.put(`https://zaswdsrcjxykrnsf.tunnel-pt.elice.io/api/admin/banners/${id}`, formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log('Banner updated:', response.data);
                alert('배너가 성공적으로 수정되었습니다.');
                navigate('/admin/banners');
            })
            .catch(error => {
                console.error('Error updating banner:', error);
                alert('배너 수정 중 오류가 발생했습니다.');
                if (error.response && error.response.status === 401) {
                    alert("인증이 필요합니다. 로그인 상태를 확인하세요.");
                }
            });
    };

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">배너 수정</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">제목:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">표시 순서:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">배너 이미지:</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {/* 이미지 미리보기 영역 */}
                    {previewImage && (
                        <div className="mt-3">
                            <img src={previewImage} alt="미리보기" className="img-fluid" style={{ maxWidth: '300px' }} />
                        </div>
                    )}
                </div>
                <div className="mb-3">
                    <label className="form-label">타겟 URL:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="http://example.com"
                    />
                </div>
                <button type="submit" className="btn btn-primary">배너 수정</button>
            </form>
        </div>
    );
};

export default BannerUpdate;
