import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import sendRefreshTokenAndStoreAccessToken from "../auth/RefreshAccessToken";
import axios from "axios";
 // Bootstrap CSS 추가

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
            alert('정렬 순서는 1 이상의 값이어야 합니다.');
            return;
        }

        // targetUrl이 입력되었을 때만 추가
        if (targetUrl) {
            formData.append('targetUrl', targetUrl);
        }

        try {
            await axios.post(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/admin/banners`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            navigate('/admin/banners');
        } catch (error) {
            try{
                await sendRefreshTokenAndStoreAccessToken();
                await axios.post(`https://obpedvusnf.execute-api.ap-northeast-2.amazonaws.com/api/admin/banners`, formData, {
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
            <h1 className="mb-4">새 배너 생성</h1>
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
                    <label className="form-label">정렬 순서</label>
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

