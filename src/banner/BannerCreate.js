// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './BannerCreate.css'; // CSS 파일 추가
//
// const BannerCreate = () => {
//     const [title, setTitle] = useState('');
//     const [displayOrder, setDisplayOrder] = useState(0);
//     const [image, setImage] = useState(null);
//     const [targetUrl, setTargetUrl] = useState(''); // targetUrl 필드 추가
//     const navigate = useNavigate();
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formData = new FormData();
//         formData.append('title', title);
//         formData.append('displayOrder', displayOrder);
//         formData.append('image', image);
//
//         // targetUrl이 입력되었을 때만 추가
//         if (targetUrl) {
//             formData.append('targetUrl', targetUrl);
//         }
//
//         try {
//             await axios.post('http://localhost:8080/api/admin/banners', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                     'Authorization': `Bearer ${localStorage.getItem('token')}`
//                 }
//             });
//             navigate('/admin/banners');
//         } catch (error) {
//             console.error('Error creating banner:', error);
//         }
//     };
//
//     return (
//         <div className="form-container">
//             <h1>새 광고 생성</h1>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label>제목</label>
//                     <input
//                         type="text"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>표시 순서</label>
//                     <input
//                         type="number"
//                         value={displayOrder}
//                         onChange={(e) => setDisplayOrder(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>Image</label>
//                     <input
//                         type="file"
//                         onChange={(e) => setImage(e.target.files[0])}
//                         required
//                     />
//                 </div>
//                 <div className="form-group"> {/* targetUrl 입력 필드, 필수가 아님 */}
//                     <label>Target URL (Optional)</label>
//                     <input
//                         type="text"
//                         value={targetUrl}
//                         onChange={(e) => setTargetUrl(e.target.value)}
//                         placeholder="http://example.com"
//                     />
//                 </div>
//                 <div className="form-group">
//                     <button type="submit">광고 생성하기</button>
//                 </div>
//             </form>
//         </div>
//     );
// };
//
// export default BannerCreate;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken"; // Bootstrap CSS 추가

const BannerCreate = () => {
    const [title, setTitle] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기 상태 추가
    const [targetUrl, setTargetUrl] = useState(''); // targetUrl 필드 추가
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);

        // 이미지 미리보기 URL 생성
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('displayOrder', displayOrder);
        formData.append('image', image);

        // displayOrder와 mainDisplayOrder가 1 이상의 값인지 확인
        if (displayOrder < 1) {
            alert('표시 순서는 1 이상의 값이어야 합니다.');
            return;
        }

        // targetUrl이 입력되었을 때만 추가
        if (targetUrl) {
            formData.append('targetUrl', targetUrl);
        }

        try {
            await axios.post('http://localhost:8080/api/admin/banners', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            navigate('/admin/banners');
        } catch (error) {
            try{
                await sendRefreshTokenAndStoreAccessToken();
                await axios.post('http://localhost:8080/api/admin/banners', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                navigate('/admin/banners');
            } catch(error) {
                console.error('Error creating banner:', error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">새 광고 생성</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">제목</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">표시 순서</label>
                    <input
                        type="number"
                        className="form-control"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">이미지</label>
                    <input
                        type="file"
                        className="form-control"
                        onChange={handleImageChange} // 이미지 선택 시 미리보기 핸들러
                        required
                    />
                </div>

                {/* 이미지 미리보기 영역 */}
                {previewImage && (
                    <div className="mb-3">
                        <img
                            src={previewImage}
                            alt="미리보기"
                            className="img-fluid"
                            style={{ maxWidth: '300px', height: 'auto' }}
                        />
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Target URL (Optional)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="http://example.com"
                    />
                </div>
                <div className="mb-3">
                    <button type="submit" className="btn btn-primary">광고 생성하기</button>
                </div>
            </form>
        </div>
    );
};

export default BannerCreate;

